var WikipathwaysApiClient = require('../wikipathways-api-client.js');

var wikipathwaysApiClientInstance = new WikipathwaysApiClient({
  //baseIri: 'http://webservice.wikipathways.org/'
  baseIri: 'http://pvjs.wikipathways.org/wpi/webservicetest/'
});

wikipathwaysApiClientInstance.getPathway({
    identifier: 'WP4',
    version: '0',
    fileFormat: 'application/gpml+xml'
  },
  function(err, gpmlString) {
    wikipathwaysApiClientInstance.updatePathway({
        identifier: 'WP4',
        description: 'Test update from wikipathways-api-client-js',
        gpml: gpmlString,
        fileFormat: 'application/gpml+xml'
      },
      function(err, response) {
        console.log('Response:');
        console.log(response);
      });
  });
