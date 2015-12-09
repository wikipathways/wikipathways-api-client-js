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
  if (!responseType) {
    return response;
  } else if (typeof responseType === 'function') {
    return collect(response).toNodeCallback(responseType);
  } else if (responseType === 'stream') {
    stream = stream || process.stdout;
    var disposable = RxNode.writeToStream(response, stream, 'utf8');
    return stream;
  } else {
    throw new Error('Unrecognized responseType "' + responseType + '".');
  }
};

module.exports = utils;
