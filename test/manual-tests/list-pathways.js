var _ = require('lodash');
var highland = require('highland');
var WikipathwaysApiClient = require('../../index.js');

var wikipathwaysApiClientInstance = WikipathwaysApiClient({
  baseIri: 'http://webservice.wikipathways.org/'
});

wikipathwaysApiClientInstance.listPathways({
  fileFormat: 'application/ld+json'
})
.each(function(pathway) {
  console.log('**********************************************');
  console.log('Pathways');
  console.log('**********************************************');
  console.log(JSON.stringify(pathway, null, '\t'));
});
