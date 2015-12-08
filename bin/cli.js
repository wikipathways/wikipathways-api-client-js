#!/usr/bin/env node

var colors = require('colors');
var fs = require('fs');
var inquirer = require('inquirer');
var Rx = require('rx');
var RxNode = require('rx-node');
var WikipathwaysApiClient = require('../index.js');
var wikipathwaysApiClientInstance = new WikipathwaysApiClient();

//var defaultMediaType = 'application/ld+json';
var defaultMediaType = 'application/vnd.gpml+xml';
var supportedMediaTypes = wikipathwaysApiClientInstance.supportedMediaTypes;
var supportedMediaTypesString = supportedMediaTypes
  .map(function(mediaType) {
    var mediaTypeString = '    \t\t\t\t\t* "' + mediaType + '"';
    if (mediaType === defaultMediaType) {
      mediaTypeString = colors.green(mediaTypeString + ' (default)');
    }
    return mediaTypeString;
  })
  .join('\n');

var program = require('commander');
var npmPackage = JSON.parse(fs.readFileSync(
      __dirname + '/../package.json', {encoding: 'utf8'}));
program
  // version of this program (NOT a pathway)
  .version(npmPackage.version)
  .option('-f, --format [string]',
      'specify media type (file format/content type):\n' + supportedMediaTypesString,
      defaultMediaType);

program
  .command('list')
  .description('Get list of pathways available at WikiPathways.')
  // TODO optionally limit results to desired pathway collection type(s),
  // e.g., curated, featured, etc.
  //.option('-i, --pathway-type <items>',
  //  'specify pathway type(s)', list)
  .action(function() {
    var pathwayListSource = wikipathwaysApiClientInstance.listPathways({
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
    var disposable = RxNode.writeToStream(pathwayListSource, process.stdout, 'utf8');
  })
  .on('--help', function() {
    console.log('  Example:');
    console.log();
    console.log('    $ ./bin/cli.js list');
    console.log();
  });

program
  .command('get-pathway <wikipathways-identifier(s)>')
  .description('Get pathway by WikiPathways identifier(s). ' +
               'If requesting multiple pathways, separate identifiers by commas, e.g., WP4,WP5')
  .option('-v, --pathway-version [number]',
      'specify pathway version [pathway-version]', 0)
  .action(function(identifiers, options) {
    var fileFormat = program.fileFormat || defaultMediaType;
    var pathwayVersion = options.pathwayVersion || 0;

    var pathwaySource = Rx.Observable.from(identifiers.split(','))
      .map(function(identifier) {
        return {
          identifier: identifier,
          fileFormat: fileFormat,
          version: pathwayVersion
        };
      })
      .flatMap(function(args) {
        return wikipathwaysApiClientInstance.getPathway(args, 'observable');
      });
    var disposable = RxNode.writeToStream(pathwaySource, process.stdout, 'utf8');
  })
  .on('--help', function() {
    console.log('  Example:');
    console.log();
    console.log('    $ ./bin/cli.js get-pathway WP4');
    console.log('    $ ./bin/cli.js get-pathway WP4,WP5');
    console.log('    $ ./bin/cli.js get-pathway WP4 --pathway-version 83650');
    console.log();
  });

program
  .command('update-pathway <wikipathways-identifier> <filepath>')
  .description('Update pathway at WikiPathways.')
  .option('-v, --pathway-version <number>',
      'specify pathway version <pathway-version>')
  .action(function(identifier, filepath, options) {
    var fileFormat = program.fileFormat || defaultMediaType;
    var pathwayVersion = options.pathwayVersion;

    var prompts = [{
      type: 'input',
      name: 'description',
      message: 'Description of changes:'
    }, {
      type: 'input',
      name: 'username',
      message: 'WikiPathways account username:'
    }, {
      type: 'password',
      name: 'password',
      message: 'WikiPathways account password:'
    }];

    var responseSource = Rx.Observable.return({}).concat(
      inquirer.prompt(prompts).process
    )
    .reduce(function(accumulator, response) {
      accumulator[response.name] = response.answer;
      return accumulator;
    })
    .flatMap(function(answers) {
      return wikipathwaysApiClientInstance.updatePathway({
        identifier: identifier,
        version: pathwayVersion,
        gpml: fs.readFileSync(filepath).toString(),
        description: answers.description,
        username: answers.username,
        password: answers.password
      });
    });

    var disposable = RxNode.writeToStream(responseSource, process.stdout, 'utf8');
  })
  .on('--help', function() {
    console.log('  Example:');
    console.log();
    console.log('    $ ./bin/cli.js update-pathway WP4 ./test.gpml --pathway-version 83656');
    console.log();
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}

/* Samples of using commander
program
  .command('do1 <param>')
  .description('command with required param.')
  .action(function(param, options) {
    console.log('param');
    console.log(param);
  })
  .on('--help', function() {
    console.log('  Example:');
    console.log();
    console.log('                       param');
    console.log('    $ ./bin/cli.js do1 somevalue');
    console.log();
  });

program
  .command('do2 [param]')
  .description('command with optional param.')
  .action(function(param, options) {
    console.log('param');
    console.log(param);
  });

program
  .command('do3 <param>')
  .option('-s, --setup-mode [mode]', 'Which setup mode to use')
  .description('command with required param and one optional option.')
  .action(function(param, options) {
    console.log('param');
    console.log(param);
    console.log('options.setupMode');
    console.log(options.setupMode);
  })
  .on('--help', function() {
    console.log('  Example:');
    console.log();
    console.log('                       param     option');
    console.log('    $ ./bin/cli.js do3 somevalue -s');
    console.log();
    console.log('                       param     option       argument');
    console.log('    $ ./bin/cli.js do3 somevalue --setup-mode abc');
    console.log();
  });

program
  .command('do4 [param]')
  .option('-s, --setup-mode <mode>', 'Which setup mode to use')
  .description('command with optional param and one required option.')
  .action(function(param, options) {
    console.log('param');
    console.log(param);
    console.log('options.setupMode');
    console.log(options.setupMode);
  })
  .on('--help', function() {
    console.log('  Example:');
    console.log();
    console.log('    $ ./bin/cli.js');
    console.log();
    console.log('                       param     option       argument');
    console.log('    $ ./bin/cli.js do4 somevalue --setup-mode abc');
    console.log();
  });
//*/
