var WikipathwaysApiClient = require('../wikipathways-api-client.js');

WikipathwaysApiClient.getPathway({
    identifier: 'WP4',
    version: '0',
    fileFormat: 'application/gpml+xml'
  },
  function(err, gpmlString) {
    console.log('gpmlString');
    console.log(gpmlString);
  });

/*
WikipathwaysApiClient.getPathway({
    identifier: 'WP4',
    version: '0',
    fileFormat: 'application/ld+json'
  },
  function(err, pvjson) {
    console.log('pvjson');
    console.log(pvjson);
  });
//*/
