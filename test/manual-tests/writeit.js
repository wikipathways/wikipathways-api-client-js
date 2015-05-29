var Rx = require('rx');
var RxNode = require('rx-node');

var observable = Rx.Observable.range(0, 5);

var stream = process.stdout;

var encoding = 'utf8';

/*
var source = observable.pausableBuffered();

function onDrain() {
  source.resume();
}

stream.addListener('drain', onDrain);

source.subscribe(
  function(x) {
    !stream.write(String(x), encoding) && source.pause();
  },
  function(err) {
    stream.emit('error', err);
  },
  function() {
    // Hack check because STDIO is not closable
    !stream._isStdio && stream.end();
    stream.removeListener('drain', onDrain);
  });

source.resume();
//*/

//*
function writeToStream(observable, stream, encoding) {
  var source = observable.pausableBuffered();

  console.log('source');
  console.log(source);

  function onDrain() {
    console.log('onDrain');
    source.resume();
  }

  stream.addListener('drain', onDrain);

  var disposable = source.subscribe(
    function(x) {
      console.log('x');
      console.log(x);
      !stream.write(String(x), encoding) && source.pause();
    },
    function(err) {
      throw err;
      stream.emit('error', err);
    },
    function() {
      console.log('done');
      // Hack check because STDIO is not closable
      !stream._isStdio && stream.end();
      stream.removeListener('drain', onDrain);
    });

  source.resume();

  return disposable;
}

var disposable = writeToStream(observable, stream, encoding);

console.log('disposable');
console.log(disposable);

function writeToStream(observable, stream, encoding) {
  var source = observable.pausableBuffered();

  function onDrain() {
    source.resume();
  }

  stream.addListener('drain', onDrain);

  var disposable = source.subscribe(
    function(x) {
      !stream.write(String(x), encoding) && source.pause();
    },
    function(err) {
      stream.emit('error', err);
    },
    function() {
      // Hack check because STDIO is not closable
      !stream._isStdio && stream.end();
      stream.removeListener('drain', onDrain);
    });

  source.resume();

  return disposable;
}

//process.stdin.pipe(process.stdout);
//*/
