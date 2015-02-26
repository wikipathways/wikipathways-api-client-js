var WikipathwaysApiClient = require('../wikipathways-api-client.js');

WikipathwaysApiClient.getPathway({
    identifier: 'WP4',
    version: '0',
    fileFormat: 'application/gpml+xml'
  },
  function(err, gpmlString) {
    WikipathwaysApiClient.updatePathway({
        identifier: 'WP4',
        description: 'Test update',
        gpml: gpmlString,
        fileFormat: 'application/gpml+xml'
      },
      function(err, response) {
        console.log('Response:');
        console.log(response);
      });
  });
