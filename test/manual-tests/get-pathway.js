var Rx = require('rx');
var WikipathwaysApiClient = require('../../index.js');

var wikipathwaysApiClientInstance = new WikipathwaysApiClient({
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

//*
wikipathwaysApiClientInstance.getPathway({
  identifier: 'WP4',
  fileFormat: 'application/vnd.gpml+xml',
  version: 0
}, 'observable')
.subscribe(function(pathway) {
  console.log('**********************************************');
  console.log('Pathway data for latest version of WP4');
  console.log('**********************************************');
  console.log(pathway);
}, function(err) {
  throw err;
}, function() {
  console.log('Request completed.');
});
//*/

/*
wikipathwaysApiClientInstance.getPathway({
  identifier: 'WP4',
  fileFormat: 'application/vnd.gpml+xml',
  version: 0
}, function(err, pathway) {
  console.log('**********************************************');
  console.log('Pathway data for WP4');
  console.log('**********************************************');
  console.log(pathway);
});
//*/

/* TODO I don't think this works at present -AR
var args = {
  identifier: 'WP4',
  fileFormat: 'application/vnd.gpml+xml',
  version: 0
};

var observable = Rx.Observable.return(args);

process.stdin
  .pipe(new wikipathwaysApiClientInstance.PathwayStream())
  .pipe(process.stdout);

process.stdin.push(JSON.stringify(args));
//*/

// TODO Change the backend to be able to return JSON
/*
wikipathwaysApiClientInstance.getPathway({
  identifier: 'WP4',
  fileFormat: 'application/ld+json',
  version: 0
}, 'observable')
.subscribe(function(pathway) {
  console.log('**********************************************');
  console.log('Pathway data for WP4');
  console.log('**********************************************');
  console.log(pathway);
});
//*/
