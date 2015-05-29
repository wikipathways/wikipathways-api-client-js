var Rx = require('rx');
var RxNode = require('rx-node');

var source = Rx.Observable.range(0, 5);

var subscription = RxNode.writeToStream(source, process.stdout, 'utf8');
console.log('subscription');
console.log(subscription);
subscription.dispose();
