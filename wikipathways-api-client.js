// #!/usr/bin/env node

var http = require('http');
var Gpml = require('gpml2json');
//var Gpml = require('../gpml2json/src/gpml');
var Cheerio = require('cheerio');
var fs = require('fs');
var highland = require('highland');
var JSONStream = require('JSONStream');
// We need this to build our post string
var querystring = require('querystring');
var request = require('request');

// architecture/exporting based on underscore.js code
function WikipathwaysApiClient(args) {

  var baseIri;
  var isBrowserVisitingWikipathwaysTestServer;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    var hostnameSplit = window.location.hostname.split('wikipathways.org');
    if (hostnameSplit[0] !== '' &&
        hostnameSplit[0] !== 'www.' &&
        hostnameSplit[hostnameSplit.length - 1] === '') {
      isBrowserVisitingWikipathwaysTestServer = true;
    }
  }

  if (!!args.baseIri) {
    baseIri = args.baseIri;
  } else if (isBrowserVisitingWikipathwaysTestServer) {
    baseIri = window.location.host + '/wpi/webservicetest/';
  } else {
    baseIri = 'http://webservice.wikipathways.org/';
  }

  console.log('baseIri');
  console.log(baseIri);

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
    'application/vnd.biopax.rdf+xml':'application/vnd.biopax.rdf+xml',
    'application/biopax.rdf+xml':'application/vnd.biopax.rdf+xml',
    'application/biopax+xml':'application/vnd.biopax.rdf+xml',
    'application/rdf+xml':'application/vnd.biopax.rdf+xml',
    'biopax':'application/vnd.biopax.rdf+xml',
    'application/owl+xml':'application/vnd.biopax.rdf+xml',
    'owl':'application/vnd.biopax.rdf+xml',
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

  // convert from standardized format (as specified above) to
  // the format used by the current (2014-06-09) WikiPathways REST API
  var pathwayMediaTypeToWikipathwaysApiFileFormatMappings = {
    'application/vnd.biopax.rdf+xml':'owl',
    'application/gpml+xml':'gpml',
    'application/ld+json':'json',
    'application/pdf':'pdf',
    'image/png':'png',
    'image/svg+xml':'svg',
    'text/genelist':'txt',
    'text/pwf':'pwf'
  };

  // convert from standardized format (as specified above) to
  // the format used in the jQuery ajax dataType setting
  var mediaTypeToJqueryDataTypeMappings = {
    'application/vnd.biopax.rdf+xml':'xml',
    'application/xml':'xml',
    'application/gpml+xml':'xml',
    'application/ld+json':'json',
    'text/genelist':'text',
    'text/pwf':'text'
  };

  return {
    request: function(args, callback) {
      var url = args.url;
      var mediaType = args.mediaType;

      if (typeof(window) === 'undefined') { // if running in node
        /*
        var options = {
          host: 'www.wikipathways.org',
          path: '/wpi/wpi.php?action=downloadFile&type=gpml&pwTitle=Pathway:' +
              wikipathwaysIdentifier,
          port: '80',
          //This is the only line that is new. `headers` is an object with the headers to request
          headers: {'custom': 'Custom Header Demo works'}
        };
        //*/

        var callbackOnGettingPathway = function(response) {
          var str = '';
          response.on('data', function(chunk) {
            str += chunk;
          });

          response.on('end', function() {
            if (mediaTypeToJqueryDataTypeMappings[mediaType] === 'json') {
              callback(null, JSON.parse(str));
            } else if (mediaTypeToJqueryDataTypeMappings[mediaType] === 'xml') {
              $ = Cheerio.load(str, {
                normalizeWhitespace: true,
                xmlMode: true,
                decodeEntities: true,
                lowerCaseTags: false
              });
              var xmlSelection = $.root().children();
              callback(null, xmlSelection);
            } else {
              callback(null, str);
            }
          });
        };

        var req = http.request(url, callbackOnGettingPathway);
        //var req = http.request(options, callback);
        req.end();
      } else { // if running in browser
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

    /* TODO make this work
    createPathway: function(args, callback) {
      var updateParams = {};
      if (args.gpml) {
        updateParams.gpml = args.gpml;
      }
      if (args.username && args.password) {
        updateParams.auth = args.username + '-' + args.password;
      }

      // thanks to
      // http://stackoverflow.com/questions/6158933/how-to-make-an-http-post-request-in-node-js
      // Build the post string from an object
      var postData = querystring.stringify(updateParams);

      // An object of options to indicate where to post to
      var postOptions = {
        url: baseIri + 'createPathway',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
        }
      };

      // Set up the request
      var postReq = http.request(postOptions, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
        });
      });

      // post the data
      postReq.write(postData);
      postReq.end();
    }
    //*/

    getPathway: function(args, callback) {
      var wikipathwaysIdentifier = args.identifier;
      var requestedFileFormat = args.fileFormat || 'application/ld+json';
      var version = args.version || 0;

      console.log('Fetching ' + wikipathwaysIdentifier + '...');

      var mediaType = pathwayRequestedFileFormatToMediaTypeMappings[
        requestedFileFormat.toLowerCase()];

      var request = this.request;
      var urlStub1 =
          'http://www.wikipathways.org/wpi/wpi.php?action=downloadFile&type=';
      var urlStub2 = '&pwTitle=Pathway:';
      var urlStub3 = '&oldid=';
      var url;

      if (!!mediaType) {
        if (mediaType === 'application/ld+json') {
          url = urlStub1 + 'gpml' + urlStub2 +
              wikipathwaysIdentifier + urlStub3 + version;
          request({
            url: url,
            mediaType: 'application/gpml+xml'
            // json not currently available, so we need to request GPML and convert to json
            // when json becomes available, we can just use the line below
            //mediaType: mediaType
          }, function(err, xmlSelection) {
            var pathwayMetadata = {};
            pathwayMetadata.version = version;
            pathwayMetadata.dbName = 'wikipathways';
            pathwayMetadata.dbId = wikipathwaysIdentifier;

            var pvjson = Gpml.toPvjson(
              xmlSelection, pathwayMetadata, function(err, pvjson) {
              callback(null, pvjson);
            });
          });
        } else {
          // the current WikiPathways API does not use content type negotiation,
          // so we need to convert the media type to the string that the current API uses.
          var wikipathwaysApiFileFormat =
              pathwayMediaTypeToWikipathwaysApiFileFormatMappings[mediaType];
          url = urlStub1 + wikipathwaysApiFileFormat + urlStub2 +
              wikipathwaysIdentifier + urlStub3 + version;
          if (mediaType === 'application/vnd.biopax.rdf+xml' ||
              mediaType === 'application/gpml+xml' ||
              mediaType === 'text/genelist' || mediaType === 'text/pwf') {
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

    listPathways: function(args) {
      args = args || {};

      var requestArgs = {
        qs: {},
        withCredentials: false
      };

      requestArgs.url = baseIri + 'listPathways';

      var requestedFileFormat = args.fileFormat || 'application/ld+json';

      var mediaType = genericRequestedFileFormatToMediaTypeMappings[
          requestedFileFormat.toLowerCase()];

      if (mediaType === 'application/ld+json' ||
            mediaType === 'application/json') {
        requestArgs.qs.format = 'json';
      } else {
        throw new Error('Requested file format not recognized or not available.');
      }

      return highland(request(requestArgs))
      .through(JSONStream.parse('pathways.*'))
      .map(function(data) {
        var pathway = {
          '@context': [
            'https://wikipathwayscontexts.firebaseio.com/biopax.json',
            'https://wikipathwayscontexts.firebaseio.com/organism.json',
            {
              '@vocab': 'http://www.biopax.org/release/biopax-level3.owl#'
            }
          ],
          '@id': 'http://identifiers.org/wikipathways/' + data.id,
          db: 'wikipathways',
          identifier: data.id,
          name: data.name,
          webPage: data.url,
          version: data.revision,
          organism: data.species
        };

        return pathway;
      });
    },

    updatePathway: function(args) {
      args = args || {};

      console.log('Updating ' + args.identifier + '...');

      var requestArgs = {
        qs: {},
        withCredentials: false
      };

      requestArgs.url = baseIri + 'updatePathway';

      var updateParams = requestArgs.qs;
      if (!!args.identifier) {
        updateParams.pwId = args.identifier;
      }
      if (!!args.description) {
        updateParams.description = args.description;
      }
      if (!!args.version) {
        updateParams.revision = args.version;
      }
      if (!!args.gpml) {
        updateParams.gpml = args.gpml;
      }
      if (!!args.username) {
        updateParams.username = args.username;
        if (!!args.password) {
          updateParams.auth = args.username + '-' + args.password;
        }
      }

      //request.post(requestArgs, function(err, response) {
      request.put(requestArgs, function(err, response) {
        console.log('err');
        console.log(err);
        if (!!response) {
          console.log('response.body');
          console.log(response.body);
        }
      });
    }
  };

}

function enableCommandLine(WikipathwaysApiClient) {
  function list(val) {
    return val.split(',');
  }

  var program = require('commander');
  var npmPackage = JSON.parse(fs.readFileSync(
        __dirname + '/package.json', {encoding: 'utf8'}));
  program
    .version(npmPackage.version)
    // TODO handle different types, e.g., curated, featured, etc.
    /*
    .option('-i, --get-pathway <items>',
      'Get pathway by wikpathways-id[,version]', list)
    //*/
    .option('-v, --version [version]',
        'Get pathway version [version]', 0)
    .option('-f, --format [type]',
        'Media type (file format, content type) [\'application/ld+json\',' +
            '\'application/gpml+xml\',\'application/vnd.biopax.rdf+xml\',' +
            '\'text/genelist\',\'text/pwf\']',
        'application/ld+json');

  program
     .command('list')
     .description('Get list of pathways available at WikiPathways.')
     .action(function() {
       console.log('Getting list of pathways...');
       WikipathwaysApiClient.listPathways({
         fileFormat: program.format
       },
       function(err, pathwayList) {
         if (err) {
           console.log(err);
           process.exit(1);
         }
         if (program.format === 'application/ld+json') {
           console.log(JSON.stringify(pathwayList, null, '\t'));
         } else {
           console.log(pathwayList);
         }
         process.exit(0);
       });
     });

  program
    .command('get-pathway <wikipathways-identifier>')
    .description('Get pathway by WikiPathways Identifier.')
    .action(function(identifier) {
      var version = program.version || 0;
      console.log('Getting pathway(s) %s', identifier);
      console.log('  version: %s', version || '0 (e.g., latest)');
      console.log('  file format: %s', program.format);

      WikipathwaysApiClient.getPathway({
        identifier: identifier,
        requestedFileFormat: program.format,
        version: version
      },
      function(err, pathway) {
        if (err) {
          console.log(err);
          process.exit(1);
        }
        if (program.format === 'application/ld+json') {
          console.log(JSON.stringify(pathway, null, '\t'));
        } else {
          console.log(pathway);
        }
        process.exit(0);
      });
    });

  program
    .command('*')
    .description('No command specified.')
    .action(function(env) {
      console.log('No command specified for "%s"', env);
    });

  program.parse(process.argv);

  if (program.listPathways) {
    console.log('List of pathways of type %s', program.listPathways);
  }
}

// Establish the root object, `window` in the browser, or `global` on the server.
var root = this;

// Export the WikipathwaysApiClient object for **Node.js**, with
// backwards-compatibility for the old `require()` API.
// If we're in the browser, add `WikipathwaysApiClient` as a global
// object via a string identifier, for Closure Compiler "advanced" mode.
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = WikipathwaysApiClient;
    if (typeof window === 'undefined' && typeof document === 'undefined') {
      enableCommandLine(WikipathwaysApiClient);
    }
  }
  exports.WikipathwaysApiClient = WikipathwaysApiClient;
} else {
  root.WikipathwaysApiClient = WikipathwaysApiClient;
}

/*
var isBrowser = false;

// detect environment: browser vs. Node.js
// I would prefer to use the code from underscore.js or
// lodash.js, but it doesn't appear to work for me,
// possibly because I'm using browserify.js and want to
// detect browser vs. Node.js, whereas
// the other libraries are just trying to detect whether
// we're in CommonJS or not.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  isBrowser = true;
}
//*/
