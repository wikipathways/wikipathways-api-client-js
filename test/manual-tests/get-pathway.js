var highland = require('highland');
var Rx = require('rx');
var RxNode = require('rx-node');
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
  console.log('Pathway data for WP4');
  console.log('**********************************************');
  console.log(pathway);
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

/*
highland([{
  identifier: 'WP4',
  fileFormat: 'application/vnd.gpml+xml',
  version: 0
}])
.through(wikipathwaysApiClientInstance.PathwayStream)
.each(function(pathway) {
  console.log('**********************************************');
  console.log('Pathway data for WP4');
  console.log('**********************************************');
  console.log(pathway);
});
//*/

/*
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
