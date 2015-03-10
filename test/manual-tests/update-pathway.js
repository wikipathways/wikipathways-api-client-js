var _ = require('lodash');
var highland = require('highland');
var fs = require('fs');
var WikipathwaysApiClient = require('../../index.js');

var wikipathwaysApiClientInstance = WikipathwaysApiClient({
  baseIri: 'http://webservice.wikipathways.org/'
});

wikipathwaysApiClientInstance.updatePathway({
  identifier: 'WP4',
  //version: 0,
  gpml: fs.readFileSync('../input-data/test.gpml'),
  description: 'Testing update from wikipathways-api-client-js'
})
.each(function(response) {
  console.log('response');
  console.log(response);
});
