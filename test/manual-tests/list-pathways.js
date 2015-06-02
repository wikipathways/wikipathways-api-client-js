var highland = require('highland');
var WikipathwaysApiClient = require('../../index.js');

var wikipathwaysApiClientInstance = new WikipathwaysApiClient({
  baseIri: 'http://webservice.wikipathways.org/'
});

//*
wikipathwaysApiClientInstance.listPathways({
  fileFormat: 'application/ld+json'
})
.then(function(pathwayMetadata) {
  console.log('**********************************************');
  console.log('Pathway Metadata');
  console.log('**********************************************');
  console.log(JSON.stringify(pathwayMetadata, null, '\t'));
});
//*/

//*
wikipathwaysApiClientInstance.listPathways({
  fileFormat: 'application/ld+json'
}, function(err, pathwayMetadata) {
  console.log('**********************************************');
  console.log('Pathway Metadata');
  console.log('**********************************************');
  console.log(JSON.stringify(pathwayMetadata, null, '\t'));
});
//*/

//*
var pathwayMetadataSource = wikipathwaysApiClientInstance.listPathways({
  fileFormat: 'application/ld+json'
}, 'observable');

pathwayMetadataSource.first().subscribe(function(pathwayMetadata) {
  console.log('**********************************************');
  console.log('Pathway Metadata');
  console.log('**********************************************');
});

pathwayMetadataSource.subscribe(function(pathwayMetadata) {
  console.log(JSON.stringify(pathwayMetadata, null, '\t'));
});
//*/
