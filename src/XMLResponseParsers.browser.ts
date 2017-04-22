import { Observable } from 'rxjs/Observable';
import { AjaxResponse } from  'rxjs/observable/dom/AjaxObservable';
import 'rxjs/add/observable/of';

export function updatePathway(ajaxResponse: AjaxResponse): Observable<{
		status: number,
		statusText: string,
		message: string
}> {
	const xhr = ajaxResponse.xhr;
	const responseXML = xhr.responseXML;

	// TODO is there a better way to handle namespaces in browser?
	const messageNode = responseXML.querySelector('success') || responseXML.querySelector('ns1\\:success') ||
		responseXML.querySelector('failure') || responseXML.querySelector('ns1\\:failure');
	return Observable.of({
		status: xhr.status,
		statusText: xhr.statusText,
		message: messageNode.textContent,
	});
};
