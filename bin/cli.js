#!/usr/bin/env node

var fs = require('fs');
var Rx = require('rx');
var RxNode = require('rx-node');
var WikipathwaysApiClient = require('../index.js');
var wikipathwaysApiClientInstance = new WikipathwaysApiClient();

var program = require('commander');
var npmPackage = JSON.parse(fs.readFileSync(
      __dirname + '/../package.json', {encoding: 'utf8'}));
program
  .version(npmPackage.version)
  // TODO handle different types, e.g., curated, featured, etc.
  //.option('-i, --get-pathway <items>',
  //  'Get pathway by wikpathways-id[,version]', list)
  .option('-v, --version [version]',
      'Get pathway version [version]', 0)
  .option('-f, --format [type]',
      'Media type (file format, content type) [\'application/ld+json\',' +
          '\'application/vnd.gpml+xml\',\'application/vnd.biopax.rdf+xml\',' +
          '\'text/genelist\',\'text/pwf\']',
      'application/ld+json');

program
  .command('list')
  .description('Get list of pathways available at WikiPathways.')
  .action(function() {
    var pathwayListStream = wikipathwaysApiClientInstance.listPathways({
      fileFormat: program.format
    }, 'observable')
      .map(function(pathwayMetadata) {
        var pathwayMetadataStringified;
        if (program.format === 'application/ld+json') {
          pathwayMetadataStringified = JSON.stringify(pathwayMetadata, null, '\t');
        } else {
          pathwayMetadataStringified = pathwayMetadata;
        }
        return pathwayMetadataStringified;
      });
    var disposable = RxNode.writeToStream(pathwayListStream, process.stdout, 'utf8');
  });

program
  .command('get-pathway <wikipathways-identifier>')
  .description('Get pathway by WikiPathways Identifier(s). ' +
               'If requesting multiple pathways, separate identifiers by commas, e.g., WP4,WP5')
  .action(function(identifiers) {
    var version = program.version || 0;
    var pathwayStream = Rx.Observable.from(identifiers.split(','))
      .map(function(identifier) {
        return {
          identifier: identifier,
          fileFormat: 'application/vnd.gpml+xml',
          version: version
        };
      })
      .flatMap(function(args) {
        return wikipathwaysApiClientInstance.getPathway(args, 'observable');
      })
      .map(function(pathway) {
        if (program.format === 'application/ld+json') {
          pathwayStringified = JSON.stringify(pathway, null, '\t');
        } else {
          pathwayStringified = pathway;
        }
        return pathwayStringified;
      });
    var disposable = RxNode.writeToStream(pathwayStream, process.stdout, 'utf8');
  });

program
  .command('*')
  .description('No command specified.')
  .action(function(env) {
    console.log('No command specified for "%s"', env);
  });

program.parse(process.argv);
