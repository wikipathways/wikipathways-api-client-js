var _ = require('lodash');
var highland = require('highland');
var WikipathwaysApiClient = require('../../index.js');

var wikipathwaysApiClientInstance = WikipathwaysApiClient({
  baseIri: 'http://webservice.wikipathways.org/'
});

wikipathwaysApiClientInstance.getPathway({
  identifier: 'WP4',
  fileFormat: 'application/vnd.gpml+xml',
  //fileFormat: 'application/ld+json',
  version: 0
})
.each(function(pathway) {
  console.log('**********************************************');
  console.log('Pathway data for WP4');
  console.log('**********************************************');
  console.log(JSON.stringify(pathway, null, '\t'));
});
