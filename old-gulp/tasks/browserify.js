/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   If the watch task is running, this uses watchify instead
   of browserify for faster bundling using caching.
*/

var brfs = require('gulp-brfs');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var bundleLogger = require('../util/bundleLogger');
var fs = require('fs');
var gulp = require('gulp');
var handleErrors = require('../util/handleErrors');
var highland = require('highland');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

gulp.task('browserify', [], function() {

  var bundleMethod = global.isWatching ? watchify : browserify;

  var getBundleName = function() {
    var package = JSON.parse(fs.readFileSync('package.json'));
    var version = package.version;
    var name = package.name;
    if (global.isWatching) {
      return name + '-dev';
    } else {
      return name + '-' + version + '.min';
    }
  };

  var bundler = bundleMethod({
    // Specify the entry point of your app
    entries: ['./index.js']
  });

  var bundle = function() {
    // Log when bundling starts
    bundleLogger.start();

    return bundler
    .bundle({
      insertGlobals : true,
      // Enable source maps!
      debug: true
    })
    // Report compile errors
    .on('error', handleErrors)
    // Use vinyl-source-stream to make the
    // stream gulp compatible. Specify the
    // desired output filename here.
    .pipe(source(getBundleName() + '.js'))
    .pipe(highland.pipeline(function(stream) {
      if (global.isWatching) {
        return stream;
      }

      return stream
        // These steps are only enabled when
        // a watch is not set.
        // They are too slow to enable
        // during development.
        .through(buffer())
        .through(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .through(uglify())
        .through(sourcemaps.write('./'));
    }))
    // Specify the output destination
    .pipe(gulp.dest('./dist/'))
    // Log when bundling completes!
    .on('end', bundleLogger.end);
  };

  if (global.isWatching) {
    // Rebundle with watchify on changes.
    bundler.on('update', bundle);
  }

  return bundle();
});
