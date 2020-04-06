import * as atobPolyfill from 'atob';
import * as mediaTypes from './media-types';
import { Observable } from 'rxjs/Observable';
import { AjaxRequest } from  'rxjs/observable/dom/AjaxObservable';
import 'rxjs/add/observable/dom/ajax';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import * as URI from 'urijs';
import * as XMLResponseParsers from './XMLResponseParsers';

declare global {
  // Augment Node.js `global`
  namespace NodeJS {
    interface Global {
      XMLHttpRequest: XMLHttpRequest;
			atob: atobPolyfill;
    }
  }
  // Augment Browser `window`
  //interface Window extends NodeJS.Global { }
  // Augment Web Worker `self`
  //interface WorkerGlobalScope extends NodeJS.Global { }
}

//// NOTE: it would be almost possible to use a discriminated union like this:
//export interface UpdatePathwayResponseBodyCommon {
//	status: number;
//	statusText: string;
//};
//export interface UpdatePathwayResponseBodySuccess extends UpdatePathwayResponseBodyCommon {
//	status: 200|201;
//	version: number;
//};
//export interface UpdatePathwayResponseBodyFailure extends UpdatePathwayResponseBodyCommon {
//	status: 400|500;
//	error: string;
//};
//export type UpdatePathwayResponseBody = UpdatePathwayResponseBodySuccess | UpdatePathwayResponseBodyFailure;
//if (200 <= status && status < 300) {
//	output.version = parseInt(message);
//} else {
//	output.error = message;
//}
//// but the code above doesn't work with discriminated unions.
//// The code below does, but it's not reasonable to specify and
//// check for every possible status code.
//if (output.status == 200 || output.status == 201) {
//	output.version = parseInt(message);
//} else if (output.status == 400 || output.status == 500) {
//	output.error = message;
//}
//// so we're going to keep it simple and just use an intersection
export interface UpdatePathwayResponseBodyCommon {
	status: number;
	statusText: string;
};
export interface UpdatePathwayResponseBodySuccess extends UpdatePathwayResponseBodyCommon {
	version: number;
};
export interface UpdatePathwayResponseBodyFailure extends UpdatePathwayResponseBodyCommon {
	error: string;
};
export type UpdatePathwayResponseBody = UpdatePathwayResponseBodySuccess & UpdatePathwayResponseBodyFailure;

if (!global.hasOwnProperty('XMLHttpRequest')) {
	global.XMLHttpRequest = require('xhr2');
}
if (!global.hasOwnProperty('atob')) {
	global.atob = atobPolyfill;
}

var convertObjectToQueryString = function(inputObject) {
  var str = '';

  for (let key in inputObject) {
    if (!inputObject.hasOwnProperty(key) || typeof inputObject[key] === 'function') { continue; }
    if (typeof inputObject[key] === 'object') {
      str += convertObjectToQueryString(inputObject[key]);
    } else {
      str += key + '=' + encodeURIComponent(inputObject[key]) + '&';
    }
  }

  return str;
};

/**
 * WikipathwaysApiClient
 *
 * @param args
 */
export class WikipathwaysApiClient {
	baseIri: string;
	timeout: number;
	SUPPORTED = mediaTypes.SUPPORTED;
	constructor({baseIri, timeout}: {baseIri?: string, timeout?: number} = {baseIri: null, timeout: 10 * 1000}) {
		this.timeout = timeout;

		if (!baseIri) {
			const isBrowser = (typeof window !== 'undefined' && typeof document !== 'undefined');
			if (isBrowser) {
				var hostnameSplit = window.location.hostname.split('wikipathways.org');
				if (hostnameSplit[hostnameSplit.length - 1] === '') {
					// user is on wikipathways.org or one of its subdomains
					baseIri = window.location.origin + '/wpi/webservicetest/';
					//baseIri = 'https://webservice.wikipathways.org/'; //this route will lose authentication

//					const subdomain = hostnameSplit[0];
//					if (['','www.'].indexOf(subdomain) > -1) {
//						// user is one wikipathways.org main site
//						baseIri = window.location.origin + '/wpi/webservicetest/';
//						//baseIri = 'https://webservice.wikipathways.org/'; //this route will lose authentication
//					} else {
//						// user is on a wikipathways.org subdomain (likely a test server).
//						// TODO what should the permanent IRI be for the test servers?
//						baseIri = window.location.origin + '/wpi/webservicetest/';
//					}
				} else {
					baseIri = 'https://webservice.wikipathways.org/';
				}
			} else {
				baseIri = 'https://webservice.wikipathways.org/';
			}
		}

		this.baseIri = baseIri;
	}

  /**
   * getPathway
	 * NOTE: this actually corresponds to the webservice method "getPathwayAs"
   *
   * @param args
   * @return An Observable with the requested data.
   */
  getPathway({identifier, version, fileFormat}: {
			identifier: string,
			version?: number,
			fileFormat?: string
	} = {
		identifier: undefined, version: 0, fileFormat: 'application/ld+json'
	}): Observable<any> {
		if (!identifier) {
			throw new Error('Please provide identifier');
		}

    const mediaType = mediaTypes.REQUESTED_TO_IANA_FOR_PATHWAYS[fileFormat.toLowerCase()];

    const iri = URI(this.baseIri)
      .filename('getPathwayAs')
      .query({
        pwId: identifier,
        fileType: mediaTypes.IANA_TO_WP_API_BODY[mediaType],
        revision: version || 0,
        format: 'json'
      });

    let pathwayMetadata: any = {};
    pathwayMetadata['@id'] = 'http://identifiers.org/wikipathways/' + identifier;
    pathwayMetadata.version = version;

		const ajaxRequest: AjaxRequest = {
			url: iri.toString(),
			method: 'GET',
			responseType: 'json',
			timeout: this.timeout,
			crossDomain: true,
		};
		return Observable.ajax(ajaxRequest)
			.map((ajaxResponse): {data: any} => ajaxResponse.xhr.response)
			.map(function(response) {
				return atob(response.data).toString();
			});
  }

  getPathwayInfo(identifier: string) {
		if (!identifier) {
			throw new Error('Please provide identifier');
		}

    const iri = URI(this.baseIri)
      .filename('getPathwayInfo')
      .query({
        pwId: identifier,
        format: 'json',
      });

		const ajaxRequest: AjaxRequest = {
			url: iri.toString(),
			method: 'GET',
			responseType: 'json',
			timeout: this.timeout,
			crossDomain: true,
		};
		return Observable.ajax(ajaxRequest)
			.map((ajaxResponse): any => ajaxResponse.xhr.response.pathwayInfo)
			.map(function(pathwayInfo) {
				return {
					identifier: pathwayInfo.id,
					url: pathwayInfo.url,
					name: pathwayInfo.name,
					organism: pathwayInfo.species,
					version: pathwayInfo.revision,
				};
			})
  }

//import 'rx-extra/add/operator/throughNodeStream';
//import 'rx-extra/add/observable/fromNodeReadableStream';
//const JSONStream = require('JSONStream');
//  function listPathways1(args, responseType) {
//    args = args || {};
//
//    var requestedFileFormat = args.fileFormat || 'application/ld+json';
//
//    var mediaType = REQUESTED_TO_IANA[
//        requestedFileFormat.toLowerCase()];
//
//    if (mediaType !== 'application/ld+json' &&
//          mediaType !== 'application/json') {
//      throw new Error('Requested file format not recognized or not available.');
//    }
//
//    var iri = URI(baseIri)
//    .filename('listPathways')
//    .query({
//      format: mediaTypes.IANA_TO_WP_API_ENVELOPE[mediaType]
//    });
//
//		const ajaxRequest: AjaxRequest = {
//			url: iri.toString(),
//			method: 'GET',
//			responseType: 'text',
//			timeout: this.timeout,
//			crossDomain: true,
//		};
//		return Observable.ajax(ajaxRequest)
//		.map((ajaxResponse): string => ajaxResponse.xhr.response)
//    .throughNodeStream(JSONStream.parse('pathways.*'))
//    .map(function(data) {
//      var pathway = {
//        '@context': [
//          'https://wikipathwayscontexts.firebaseio.com/biopax.json',
//          'https://wikipathwayscontexts.firebaseio.com/organism.json',
//          {
//            '@vocab': 'http://www.biopax.org/release/biopax-level3.owl#'
//          }
//        ],
//        '@id': 'http://identifiers.org/wikipathways/' + data.id,
//        db: 'wikipathways',
//        identifier: data.id,
//        name: data.name,
//        webPage: data.url,
//        version: data.revision,
//        organism: data.species
//      };
//
//      return pathway;
//    });
//  }

  listPathways() {
    const iri = URI(this.baseIri)
			.filename('listPathways')
			.query({
				format: 'json'
			});

		const ajaxRequest: AjaxRequest = {
			url: iri.toString(),
			method: 'GET',
			responseType: 'json',
			timeout: this.timeout,
			crossDomain: true,
		};
		return Observable.ajax(ajaxRequest)
			.map((ajaxResponse): {pathways: any[]} => ajaxResponse.xhr.response)
			.mergeMap(function(x) {
				return Observable.from(x.pathways);
			})
			.map(function(data) {
				return {
					'@context': [
						'https://wikipathwayscontexts.firebaseio.com/biopax.json',
						'https://wikipathwayscontexts.firebaseio.com/organism.json',
						{
							'@vocab': 'http://www.biopax.org/release/biopax-level3.owl#'
						}
					],
					'@id': 'http://identifiers.org/wikipathways/' + data.id,
					db: 'wikipathways',
					identifier: data.id,
					name: data.name,
					webPage: data.url,
					version: data.revision,
					organism: data.species
				};
			});
  }

  /**
   * login
   *
   * @param args If user is visiting a WikiPathways MediaWiki instance via browser and
	 * 						 is logged in, username and password are optional, because Nuno is
	 * 						 using cookie-based authentication for the webservice for this case.
   * @return An Observable with a token that can be used to make protected requests.
   */
  login({username, password}: {username: string, password: string}): Observable<string> {
    const iri = URI(this.baseIri)
			.filename('login')
			.query({
				name: username,
				pass: password,
				format: 'json',
			});

		const ajaxRequest: AjaxRequest = {
			url: iri.toString(),
			method: 'GET',
			responseType: 'json',
			timeout: this.timeout,
			crossDomain: true,
		};

		return Observable.ajax(ajaxRequest)
			.map((ajaxResponse): {auth: any} => ajaxResponse.xhr.response)
			.map(function(data) {
				if (!data.hasOwnProperty('auth')) {
					return Observable.throw(new Error('Login problem. No auth property on response body.'));
				} else {
					return data.auth;
				}
			});
  }

  updatePathway({description, username, password, identifier, gpml}): Observable<UpdatePathwayResponseBody> {
		const baseIri = this.baseIri;

		const gpmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const prefixedGpml = (gpml.indexOf(gpmlHeader) === 0 ? '' : gpmlHeader).concat(gpml);

		return Observable.zip(
			this.login({username: username, password: password}),
			this.getPathwayInfo(identifier)
		)
			.mergeMap(function([loginResult, pathwayInfo]) {

				const iri = URI(baseIri)
					.filename('updatePathway');

				const ajaxRequest: AjaxRequest = {
					url: iri.toString(),
					method: 'POST',
					// 'document' appears to work in Chrome
					// and in Node.JS, but
					// RxJS4 doesn't support 'document', and
					// RxJS5 doesn't have good documentation
					// for accepted values here. The value
					// 'xml' also appeared to work, but there
					// was a warning saying it wasn't in the
					// enum of accepted values.
					// TODO be sure 'document' is correct and
					// works cross browser.
					responseType: 'document',
					timeout: this.timeout,
					crossDomain: true,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: convertObjectToQueryString({
						pwId: identifier,
						description: description,
						revision: pathwayInfo.version,
						gpml: prefixedGpml,
						username: username,
						auth: loginResult,
					}),
				};

				return Observable.ajax(ajaxRequest)
					.mergeMap(XMLResponseParsers.updatePathway)
					.map(function(response): UpdatePathwayResponseBody {
						const {status, statusText, message} = response;
						let output = {
							status: status,
							statusText: statusText,
						} as UpdatePathwayResponseBody;
						const outputStatus = output.status;
						if (200 <= outputStatus && outputStatus < 300) {
							output.version = parseInt(message);
						} else {
							output.error = message;
						}
						return output;
					});
			});
  }

}
