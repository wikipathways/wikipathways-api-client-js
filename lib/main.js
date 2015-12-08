var _ = require('lodash');
var atob = require('atob');
var JSONStream = require('jsonstream');
var hyperquest = require('hyperquest');
var Rx = require('rx');
var RxNode = require('rx-node');
var sax = require('sax');
var URI = require('urijs');
var utils = require('./utils.js');

function WikipathwaysApiClient(args) {

  args = args || {};

  var baseIri;
  var isBrowserVisitingWikipathwaysTestServer;

  // TODO should we use the code immediately below or
  // the code further below for setting the baseIRI?
  /*
  if (!document.baseURI.match(/wikipathways\.org/)) {
    throw new Error('Cannot save on a non-WikiPathways server.');
  }

  var baseIri = 'http://webservice.wikipathways.org/';
  if (!document.baseURI.match(/http:\/\/(www\.)?wikipathways\.org\//)) {
    // if at a test server like pvjs.wikipathways.org
    baseIri = window.location.origin + '/webservice/';
  }
  //*/

  var isBrowser = (typeof window !== 'undefined' && typeof document !== 'undefined');
  if (isBrowser) {
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
    // TODO what should the permanent IRI be for the test servers?
    baseIri = window.location.origin + '/wpi/webservicetest/';
  } else if (isBrowser) {
    baseIri = window.location.origin + '/wpi/webservicetest/';
    //baseIri = 'http://webservice.wikipathways.org/'; //this route will lose authentication
  } else {
    baseIri = 'http://www.wikipathways.org/wpi/webservicetest/';
    //baseIri = 'http://webservice.wikipathways.org/'; //this route will lose authentication
  }

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
    'application/vnd.gpml+xml':'application/vnd.gpml+xml',
    'application/gpml+xml':'application/vnd.gpml+xml',
    'gpml':'application/vnd.gpml+xml',
    'xml':'application/vnd.gpml+xml',
    'application/xml':'application/vnd.gpml+xml',
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

  // or at least types we may eventually support
  var supportedMediaTypes = _.uniq(_.values(
    pathwayRequestedFileFormatToMediaTypeMappings));

  // convert from standardized format (as specified above) to
  // the format used by the current (2014-06-09) WikiPathways REST API
  // for the pathway
  var mediaTypeToWikipathwaysApiPathwayFileFormatMappings = {
    'application/vnd.biopax.rdf+xml':'owl',
    'application/vnd.gpml+xml':'gpml',
    // TODO the WikiPathways API cannot currently return the pathway as JSON,
    // only the pathway metadata.
    //'application/ld+json':'json',
    'application/ld+json':'gpml',
    'application/pdf':'pdf',
    'image/png':'png',
    'image/svg+xml':'svg',
    'text/genelist':'txt',
    'text/pwf':'pwf'
  };

  // convert from standardized format (as specified above) to
  // the format used by the current (2015-04-29) WikiPathways REST API
  // for the response envelope
  var mediaTypeToWikipathwaysApiEnvelopeFileFormatMappings = {
    'application/vnd.biopax.rdf+xml':'xml',
    'application/xml':'xml',
    'application/vnd.gpml+xml':'xml',
    'application/ld+json':'json',
    'text/genelist':'text',
    'text/pwf':'text'
  };

  function getPathway(args, responseType, stream) {
    args = args || {};

    var requestedFileFormat = args.fileFormat || 'application/ld+json';
    var mediaType = pathwayRequestedFileFormatToMediaTypeMappings[
      requestedFileFormat.toLowerCase()];

    var iri = URI(baseIri)
      .filename('getPathwayAs')
      .query({
        pwId: args.identifier,
        fileType: mediaTypeToWikipathwaysApiPathwayFileFormatMappings[mediaType],
        revision: args.version || 0,
        format: 'json'
      });

    var pathwayMetadata = {};
    pathwayMetadata['@id'] = 'http://identifiers.org/wikipathways/' + args.identifier;
    pathwayMetadata.version = args.version;

    var pathway = RxNode.fromReadableStream(
        hyperquest(iri.toString()).pipe(JSONStream.parse()))
    .map(function(response) {
      var data = atob(response.data).toString();
      return data;
    });

    return utils.respondUniversal(pathway, responseType, stream);
  }

  function PathwayStream(inputStream) {
    var outputStream = inputStream || process.stdout;
    inputStream = inputStream || process.stdin;

    RxNode.fromReadableStream(inputStream)
      .subscribe(function(args) {
        var parsedArgs = !Buffer.isBuffer(args) ? args :
            JSON.parse(args.toString());
        getPathway(parsedArgs, 'stream', outputStream);
      });

    return outputStream;
  }

  function listPathways(args, responseType, stream) {
    args = args || {};

    var requestedFileFormat = args.fileFormat || 'application/ld+json';

    var mediaType = genericRequestedFileFormatToMediaTypeMappings[
        requestedFileFormat.toLowerCase()];

    if (mediaType !== 'application/ld+json' &&
          mediaType !== 'application/json') {
      throw new Error('Requested file format not recognized or not available.');
    }

    var iri = URI(baseIri)
      .filename('listPathways')
      .query({
        format: mediaTypeToWikipathwaysApiEnvelopeFileFormatMappings[mediaType]
      });

    var pathwayList = RxNode.fromReadableStream(
        hyperquest(iri.toString()).pipe(JSONStream.parse('pathways.*')))
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

    return utils.respondUniversal(pathwayList, responseType, stream);
  }

  function PathwayListStream(inputStream) {
    var outputStream = inputStream || process.stdout;
    inputStream = inputStream || process.stdin;

    RxNode.fromReadableStream(inputStream)
      .subscribe(function(args) {
        var parsedArgs = !Buffer.isBuffer(args) ? args :
            JSON.parse(args.toString());
        listPathways(parsedArgs, 'stream', outputStream);
      });

    return outputStream;
  }

  function updatePathway(args) {
    args = args || {};

    console.log('Updating ' + args.identifier + '...');

    var prefixedGpml = '<?xml version="1.0" encoding="UTF-8"?>'.concat(args.gpml);

    var postBody = {
      pwId: args.identifier,
      description: args.description,
      revision: args.version,
      gpml: prefixedGpml
      //  method: 'updatePathway'
    };

    /*
    // Alternative jQuery approach
    // return promise to editor.js
    return Promise.resolve($.ajax({
      url:  baseIri + 'updatePathway', //URI(baseIri+'updatePathway').filename('index.php'),
      type: 'post',
      format: 'xml',
      data: postBody
    }));
    //*/

    //*
    // hyperquest approach
    var iri = URI(baseIri)
      .filename('index.php');

    iri.setQuery({method: 'updatePathway'});
    iri.setQuery({pwId: args.identifier});
    iri.setQuery({revision: args.version});
    if (!isBrowser) {
      iri.setQuery({username: args.username});
      iri.setQuery({auth: args.username + '-' + args.password});
      iri.setQuery({description: args.description});
    }

    var iriString = iri.toString();

    // for an example of making a post request with hyperquest, see
    // https://github.com/substack/hyperquest/blob/master/test/post_immediate.js
    var req = hyperquest.post(iriString);
    req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.end(postBody.toString());

    var data = '';
    req.on('data', function(buf) {data += buf;});
    req.on('end', function() {
      console.log('data');
      console.log(data);
    });

    var strict = true;
    var saxStream = sax.createStream(strict, {xmlns: true, encoding: 'utf8'});

    function createSaxStreamEventObservable(eventName) {
      return Rx.Observable.fromEventPattern(
        function addHandler (h) {
          saxStream.on(eventName, h);
        },
        function delHandler () {}
      );
    }

    var responseSource = createSaxStreamEventObservable('opentag').filter(function(node) {
      return node.name === 'ns1:success' || node.name === 'ns1:failure';
    })
    .flatMap(function(node) {
      return createSaxStreamEventObservable('text')
        .takeUntil(createSaxStreamEventObservable('opentag')
          .concat(createSaxStreamEventObservable('closetag').filter(function(node) {
            return node.name === 'ns1:success' || node.name === 'ns1:failure';
          })));
    });

    req.pipe(saxStream);

    return responseSource.toPromise();
    //*/
  }

  return {
    getPathway: getPathway,
    PathwayStream: PathwayStream,
    listPathways: listPathways,
    PathwayListStream: PathwayListStream,
    updatePathway: updatePathway,
    supportedMediaTypes: supportedMediaTypes
  };

}

(function() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    //in browser environment
    window.WikipathwaysApiClient = WikipathwaysApiClient;
  }

  if (!!module && !!module.exports) {
    //in node and/or CommonJS environment
    module.exports = WikipathwaysApiClient;
  }
})();
