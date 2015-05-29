var highland = require('highland');
var Rx = require('rx');
var RxNode = require('rx-node');
var WikipathwaysApiClient = require('../../index.js');

var wikipathwaysApiClientInstance = WikipathwaysApiClient({
  baseIri: 'http://webservice.wikipathways.org/'
});

/*
wikipathwaysApiClientInstance.getPathway({
  identifier: 'WP4',
  fileFormat: 'application/vnd.gpml+xml',
  version: 0
})
.then(function(pathway) {
  console.log('**********************************************');
  console.log('Pathway data for WP4');
  console.log('**********************************************');
  console.log(pathway);
});
//*/

/*
highland([{
  identifier: 'WP4',
  fileFormat: 'application/vnd.gpml+xml',
  version: 0
}])
//.pipe(new wikipathwaysApiClientInstance.PathwayStream())
.through(wikipathwaysApiClientInstance.PathwayStream)
//.pipe(wikipathwaysApiClientInstance.createGetPathwayStream());
//.pipe(process.stdout);
//*
.each(function(pathway) {
  console.log('**********************************************');
  console.log('Pathway data for WP4');
  console.log('**********************************************');
  console.log(pathway);
});
//*/

//*
var args = {
  identifier: 'WP4',
  fileFormat: 'application/vnd.gpml+xml',
  version: 0
};

var observable = Rx.Observable.return(args);

var observable1 = Rx.Observable.return('hello');

process.stdin
  .pipe(new wikipathwaysApiClientInstance.PathwayStream())
  .pipe(process.stdout);

process.stdin.push(JSON.stringify(args));
//process.stdin.push('why');

//RxNode.writeToStream(value1, process.stdin, 'utf8');

//*/

/* Doesn't work yet
wikipathwaysApiClientInstance.getPathway({
  identifier: 'WP4',
  fileFormat: 'application/ld+json',
  version: 0
})
.each(function(pathway) {
  console.log('**********************************************');
  console.log('Pathway data for WP4');
  console.log('**********************************************');
  console.log(JSON.stringify(pathway, null, '\t'));
});
//*/
