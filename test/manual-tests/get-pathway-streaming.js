var highland = require('highland');
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
