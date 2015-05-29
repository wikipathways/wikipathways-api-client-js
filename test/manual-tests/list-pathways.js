var _ = require('lodash');
var highland = require('highland');
var WikipathwaysApiClient = require('../../index.js');

var wikipathwaysApiClientInstance = WikipathwaysApiClient({
  baseIri: 'http://webservice.wikipathways.org/'
});

//*
wikipathwaysApiClientInstance.listPathways({
  fileFormat: 'application/ld+json'
})
.then(function(pathway) {
  console.log('**********************************************');
  console.log('Pathways');
  console.log('**********************************************');
  console.log(JSON.stringify(pathway, null, '\t'));
});
//*/

/*
wikipathwaysApiClientInstance.listPathways({
  fileFormat: 'application/ld+json'
}, function(err, pathway) {
  console.log('**********************************************');
  console.log('Pathways');
  console.log('**********************************************');
  console.log(JSON.stringify(pathway, null, '\t'));
});
//*/

/*
wikipathwaysApiClientInstance.listPathways({
  fileFormat: 'application/ld+json'
}, 'observable')
.subscribe(function(pathway) {
  console.log('**********************************************');
  console.log('Pathways');
  console.log('**********************************************');
  console.log(JSON.stringify(pathway, null, '\t'));
});
//*/
