var highland = require('highland');
var Rx = require('rx');
var RxNode = require('rx-node');

Rx.Observable.prototype.toNodeCallback = function(cb) {
  var source = this;
  return function() {
    var val;
    var hasVal = false;
    source.subscribe(
      function(x) {
        hasVal = true;
        val = x;
      },
      function(e) {
        return cb(e);
      },
      function() {
        if (hasVal) {
          cb(null, val);
        }
      }
    );
  };
};

// TODO remove this once this pull request is accepted:
// https://github.com/Reactive-Extensions/rx-node/pull/8
RxNode.writeToStream = function(observable, stream, encoding) {
  var source = observable.pausableBuffered();

  function onDrain() {
    source.resume();
  }

  stream.addListener('drain', onDrain);

  console.log('stream38');
  console.log(stream);

  var disposable = source.subscribe(
    function(x) {
      console.log('x40');
      console.log(x);
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
};

var utils = {};

utils.respondUniversal = function respondUniversal(response, responseType, stream) {
  if (!responseType || responseType === 'promise') {
    return response.toPromise();
  } else if (typeof responseType === 'function') {
    return response.toNodeCallback();
  } else if (responseType === 'observable') {
    return response;
  } else if (responseType === 'stream') {
    console.log('responseType');
    console.log(responseType);
    console.log('response');
    console.log(response);
    /*
    response.subscribe(function(value) {
      console.log('value');
      console.log(value);
    });
    //*/
    console.log('stream');
    console.log(stream);
    stream = stream || process.stdout;
    RxNode.writeToStream(response, stream, 'utf8');
    return stream;
  } else {
    return response.toPromise();
  }
};

module.exports = utils;
