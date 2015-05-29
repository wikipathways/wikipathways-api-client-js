var Rx = require('rx');
var RxNode = require('rx-node');

// TODO check whether the docs here are wrong with the toNodeCallback example:
// https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/callbacks.md
Rx.Observable.prototype.toNodeCallback = function(cb) {
  var source = this;
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

// TODO remove this once this pull request is accepted:
// https://github.com/Reactive-Extensions/rx-node/pull/8
RxNode.writeToStream = function(observable, stream, encoding) {
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
};

var utils = {};

function collect(response) {
  return response.toArray().map(function(responseArray) {
    if (responseArray.length === 0) {
      return null;
    } else if (responseArray.length === 1) {
      return responseArray[0];
    } else {
      return responseArray;
    }
  });
}

utils.respondUniversal = function respondUniversal(response, responseType, stream) {
  if (!responseType || responseType === 'promise') {
    return collect(response).toPromise();
  } else if (typeof responseType === 'function') {
    return collect(response).toNodeCallback(responseType);
  } else if (responseType === 'observable') {
    return response;
  } else if (responseType === 'stream') {
    stream = stream || process.stdout;
    var disposable = RxNode.writeToStream(response, stream, 'utf8');
    //disposable.dispose();
    return stream;
  } else {
    throw new Error('Unrecognized responseType "' + responseType + '".');
  }
};

module.exports = utils;
