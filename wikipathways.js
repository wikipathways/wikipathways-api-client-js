var http = require('http')
  , Gpml = require('gpml2json')
  , Cheerio = require('cheerio')
  ;

// convert potential file format request value to standardized media type
var genericRequestedFileFormatToMediaTypeMappings = {
  'xml':'application/xml',
  'application/ld+json':'application/ld+json',
  'application/json':'application/ld+json',
  'json':'application/ld+json',
  'jsonld':'application/ld+json'
};

// convert potential file format request value to standardized media type for pathway data
var pathwayRequestedFileFormatToMediaTypeMappings = {
  'application/biopax+xml':'application/biopax+xml',
  'application/rdf+xml':'application/biopax+xml',
  'biopax':'application/biopax+xml',
  'application/owl+xml':'application/biopax+xml',
  'owl':'application/biopax+xml',
  'application/gpml+xml':'application/gpml+xml',
  'gpml':'application/gpml+xml',
  'xml':'application/gpml+xml',
  'application/xml':'application/gpml+xml',
  'application/ld+json':'application/ld+json',
  'application/json':'application/ld+json',
  'json':'application/ld+json',
  'jsonld':'application/ld+json',
  'pvjson':'application/ld+json',
  'application/pdf':'application/pdf',
  'pdf':'application/pdf',
  'image/png':'image/png',
  'png':'image/png',
  'image/svg+xml':'image/svg+xml',
  'application/svg+xml':'image/svg+xml',
  'svg':'image/svg+xml',
  'text/genelist':'text/genelist',
  'text/plain':'text/genelist',
  'genelist':'text/genelist',
  'text/pwf':'text/pwf',
  'text/eugene':'text/pwf',
  'eugene':'text/pwf',
  'pwf':'text/pwf'
};

// convert from standardized format (as specified above) to the format used by the current (2014-06-09) WikiPathways REST API
var pathwayMediaTypeToWikipathwaysApiFileFormatMappings = {
  'application/biopax+xml':'owl',
  'application/gpml+xml':'gpml',
  'application/ld+json':'json',
  'application/pdf':'pdf',
  'image/png':'png',
  'image/svg+xml':'svg',
  'text/genelist':'txt',
  'text/pwf':'pwf'
};

// convert from standardized format (as specified above) to the format used in the jQuery ajax dataType setting
var mediaTypeToJqueryDataTypeMappings = {
  'application/biopax+xml':'xml',
  'application/xml':'xml',
  'application/gpml+xml':'xml',
  'application/ld+json':'json',
  'text/genelist':'text',
  'text/pwf':'text'
};

module.exports = {
  request: function(args, callback) {
    console.log('mediaTypeToJqueryDataTypeMappings');
    console.log(mediaTypeToJqueryDataTypeMappings);
    var url = args.url;
    var mediaType = args.mediaType;

    // if running in node 
    if (typeof(window) === 'undefined') {
      /*
      var options = {
        host: 'www.wikipathways.org',
        path: '/wpi/wpi.php?action=downloadFile&type=gpml&pwTitle=Pathway:' + wikipathwaysId,
        port: '80',
        //This is the only line that is new. `headers` is an object with the headers to request
        headers: {'custom': 'Custom Header Demo works'}
      };
      //*/

      var callbackOnGettingPathway = function(response) {
        var str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });

        response.on('end', function () {
          if (mediaTypeToJqueryDataTypeMappings[mediaType] === 'json') {
            callback(null, JSON.parse(str));
          } else if (mediaTypeToJqueryDataTypeMappings[mediaType] === 'xml') {
            $ = Cheerio.load(str, {
              normalizeWhitespace: true,
              xmlMode: true,
              decodeEntities: true,
              lowerCaseTags: false
            });
            callback(null, $);
          } else {
            callback(null, str);
          }
        });
      };

      var req = http.request(url, callbackOnGettingPathway);
      //var req = http.request(options, callback);
      req.end();
    // if running in browser
    } else {
      $.ajax({
        url: url,
        //data: data,
        success: function(data) {
          callback(null, data);
        },
        dataType: mediaTypeToJqueryDataTypeMappings[mediaType]
      });
    }
  },

  getPathway: function(args, callback) {
    var wikipathwaysId = args.id;
    var requestedFileFormat = args.fileFormat || 'application/ld+json';
    var idVersion = args.idVersion || 0;

    var mediaType = pathwayRequestedFileFormatToMediaTypeMappings[requestedFileFormat.toLowerCase()];
    console.log();

    var request = this.request;
    var urlStub1 = 'http://www.wikipathways.org/wpi/wpi.php?action=downloadFile&type=';
    var urlStub2 = '&pwTitle=Pathway:';
    var url;

    if (!!mediaType) {
      if (mediaType === 'application/ld+json') {
        url = urlStub1 + 'gpml' + urlStub2 + wikipathwaysId;
        request({
          url: url,
          mediaType: 'application/gpml+xml'
          // json not currently available, so we need to request GPML and convert to json
          // when json becomes available, we can just use the line below
          //mediaType: mediaType
        }, function(err, xmlSelection) {
          var pathwayMetadata = {};
          pathwayMetadata.idVersion = idVersion;
          pathwayMetadata.dbName = 'wikipathways';
          pathwayMetadata.dbId = wikipathwaysId;

          var pvjson = Gpml.toPvjson(xmlSelection, pathwayMetadata, function(err, pvjson) {
            callback(null, pvjson);
          });
        });
      } else {
        // the current WikiPathways API does not use content type negotiation, so we need to convert the media type to the string that the current API uses.
        var wikipathwaysApiFileFormat = pathwayMediaTypeToWikipathwaysApiFileFormatMappings[mediaType];
        url = urlStub1 + wikipathwaysApiFileFormat + urlStub2 + wikipathwaysId;
        if (mediaType === 'application/biopax+xml' || mediaType === 'application/gpml+xml' || mediaType === 'text/genelist' || mediaType === 'text/pwf') {
          request({
            url: url
          }, function(err, str) {
            callback(err, str);
          });
        } else {
          // we can't return a PNG image or a PDF, but we can return the URL to it
          callback(null, url);
        }
      }
    } else {
      callback('Requested file format not recognized.');
    }
  },

  listPathways: function(args, callback) {
    var requestedFileFormat = args.fileFormat || 'application/ld+json';

    var mediaType = genericRequestedFileFormatToMediaTypeMappings[requestedFileFormat.toLowerCase()];

    var request = this.request;
    var url = 'http://www.wikipathways.org/wpi/webservice/webservice.php/listPathways';

    if (!!mediaType) {
      if (mediaType === 'application/ld+json') {
        request({
          url: url,
          mediaType: 'application/xml'
          // json not currently available, so we need to request GPML and convert to json
          // when json becomes available, we can just use the line below
          //mediaType: mediaType
        }, function(err, xmlSelection) {
          var json = [];
          //xmlBiopaxSelection.find('bp\\:PublicationXref').each(function() {
          xmlSelection('ns1\\:pathways').each(function() {
            var pathway = {};
            var xmlPathwaySelection = $( this );
            pathway.id = xmlPathwaySelection.find('ns2\\:id').text();
            pathway.name = xmlPathwaySelection.find('ns2\\:name').text();
            pathway.species = xmlPathwaySelection.find('ns2\\:species').text();
            pathway.revision = xmlPathwaySelection.find('ns2\\:revision').text();
            json.push(pathway);
          });
          callback(null, json);
        });
      } else {
        request({
          url: url
        }, function(err, str) {
          callback(err, str);
        });
      }
    } else {
      callback('Requested file format not recognized.');
    }
  }
};
