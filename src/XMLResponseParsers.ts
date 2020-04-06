import { AjaxResponse } from  'rxjs/observable/dom/AjaxObservable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';
import * as sax from 'sax';

export function updatePathway(ajaxResponse: AjaxResponse): Observable<{
		status: number,
		statusText: string,
		message: string
}> {
	const xhr = ajaxResponse.xhr;
	const strict = true;
	const saxStream = sax.createStream(strict, {xmlns: true, encoding: 'utf8'});

	function createSaxStreamEventObservable(eventName) {
		return Observable.fromEventPattern(
			function addHandler(h) {
				saxStream.on(eventName, h);
			},
			function delHandler() {}
		);
	}

	// TODO get the webservice to return JSON so we don't need to parse XML
	const parsedStream = createSaxStreamEventObservable('opentag')
		.filter(function(node: any) {
			return node.name === 'ns1:success' || node.name === 'ns1:failure';
		})
		.mergeMap(function(node) {
			return createSaxStreamEventObservable('text')
				.takeUntil(
						createSaxStreamEventObservable('opentag')
							.concat(
									createSaxStreamEventObservable('closetag')
										.filter(function(node: any) {
											return node.name === 'ns1:success' || node.name === 'ns1:failure';
										})
							)
				);
		})
		// TODO why do I need this filter?
		.filter(x => x !== '\n')
		.map(function(message) {
			return {
				status: xhr.status,
				statusText: xhr.statusText,
				message: message,
			};
		});

	// NOTE: this kludge was added so that the Observable
		// could be observed by its subscriber.
		// It wasn't observed otherwise, probably because
		// it's hot.
	setTimeout(function() {
		saxStream.write(xhr.response);
		saxStream.end();
	}, 20);

	return parsedStream as any;
};
