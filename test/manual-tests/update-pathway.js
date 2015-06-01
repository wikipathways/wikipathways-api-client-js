var fs = require('fs');
var WikipathwaysApiClient = require('../../index.js');

var wikipathwaysApiClientInstance = new WikipathwaysApiClient({
  baseIri: 'http://webservice.wikipathways.org/'
});

wikipathwaysApiClientInstance.updatePathway({
  identifier: 'WP4',
  version: 0,
  gpml: fs.readFileSync('../input-data/test.gpml').toString(),
  description: 'Testing update from wikipathways-api-client-js'
})
.then(function(response) {
  console.log('response');
  console.log(response);
});
