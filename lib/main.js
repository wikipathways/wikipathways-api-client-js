// #!/usr/bin/env node

//var gpml2pvjson = require('gpml2pvjson');
//var gpml2pvjson = require('../gpml2pvjson/lib/main.js');
var fs = require('fs');
var Rx = require('rx');
var RxNode = require('rx-node');
var JSONStream = require('JSONStream');
var hyperquest = require('hyperquest');
var URI = require('URIjs');
var utils = require('./utils.js');

function sayHello(name) {
  console.log('Hello, ' + name);
}

var when = function(because) {
  var hey = 1;
};

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
    // TODO what should the permanent IRI be for the test servers?
    // E.g., should it be this: http://pvjs.wikipathways.org/wpi/webservice/
    baseIri = window.location.origin + '/wpi/webservicetest/';
  } else {
    baseIri = 'http://webservice.wikipathways.org/';
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

  // convert from standardized format (as specified above) to
  // the format used by the current (2014-06-09) WikiPathways REST API
  // for the pathway
  var mediaTypeToWikipathwaysApiPathwayFileFormatMappings = {
    'application/vnd.biopax.rdf+xml':'owl',
    'application/vnd.gpml+xml':'gpml',
    'application/ld+json':'json',
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

    var pathway = RxNode.fromReadableStream(
        hyperquest(iri.toString()).pipe(JSONStream.parse('data')))
    .map(function(data) {
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
        //getPathway(args, 'stream', newStream);
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

    var iri = URI(baseIri)
      .filename('updatePathway');

    if (!!args.identifier) {
      iri.setQuery({pwId: args.identifier});
    }
    if (!!args.version) {
      iri.setQuery({revision: args.version});
    }
    if (!!args.username) {
      iri.setQuery({username: args.username});
      if (!!args.password) {
        iri.setQuery({auth: args.username + '-' + args.password});
      }
    }
    if (!!args.description) {
      iri.setQuery({description: args.description});
    }

    var iriString = iri.toString();

    console.log('IRI (URI) string');
    console.log(iriString);

    var body;
    if (!!args.gpml) {
      body = args.gpml;
    }

    // for an example of making a post request with hyperquest, see
    // https://github.com/substack/hyperquest/blob/master/test/post_immediate.js
    var req = hyperquest.post(iriString);
    req.setHeader('Content-Type', 'application/xml');
    req.end(body);

    var data = '';
    req.on('data', function(buf) {data += buf;});
    req.on('end', function() {
      console.log('Did the update work?');
      console.log(data === JSON.stringify(body));
      console.log('data');
      console.log(data);
    });

    return Rx.Observable.fromEvent(req, 'end').toPromise();
  }

  return {
    getPathway: getPathway,
    PathwayStream: PathwayStream,
    listPathways: listPathways,
    PathwayListStream: PathwayListStream,
    updatePathway: updatePathway
  };

}

function enableCommandLine(WikipathwaysApiClient) {
  function list(val) {
    return val.split(',');
  }

  var program = require('commander');
  var npmPackage = JSON.parse(fs.readFileSync(
        __dirname + '/../package.json', {encoding: 'utf8'}));
  program
    .version(npmPackage.version)
    // TODO handle different types, e.g., curated, featured, etc.
    //.option('-i, --get-pathway <items>',
    //  'Get pathway by wikpathways-id[,version]', list)
    .option('-v, --version [version]',
        'Get pathway version [version]', 0)
    .option('-f, --format [type]',
        'Media type (file format, content type) [\'application/ld+json\',' +
            '\'application/vnd.gpml+xml\',\'application/vnd.biopax.rdf+xml\',' +
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

(function() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    //in browser environment
    window.WikipathwaysApiClient = WikipathwaysApiClient;
  }

  if (!!module && !!module.exports) {
    //in node and/or CommonJS environment
    module.exports = WikipathwaysApiClient;

    if (typeof window === 'undefined' && typeof document === 'undefined') {
      enableCommandLine(WikipathwaysApiClient);
    }
  }
})();
