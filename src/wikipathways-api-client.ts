import * as atob from 'atob';
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
			wikipathwaysUsername: string;
    }
  }
  // Augment Browser `window`
  //interface Window extends NodeJS.Global { }
  // Augment Web Worker `self`
  //interface WorkerGlobalScope extends NodeJS.Global { }
}

if (!global.hasOwnProperty('XMLHttpRequest')) {
	global.XMLHttpRequest = require('xhr2');
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

export const SUPPORTED = mediaTypes.SUPPORTED;

export class WikipathwaysApiClient {
	baseIri: string;
	timeout: number;
	constructor({baseIri, timeout}: {baseIri?: string, timeout?: number} = {baseIri: null, timeout: 10 * 1000}) {
		this.timeout = timeout;

		let isBrowserVisitingWikipathwaysTestServer;

		// TODO should we use the code immediately below or
		// the code further below for setting the baseIRI?
		/*
		if (!document.baseURI.match(/wikipathways\.org/)) {
			throw new Error('Cannot save on a non-WikiPathways server.');
		}

		baseIri = 'http://webservice.wikipathways.org/';
		if (!document.baseURI.match(/http:\/\/(www\.)?wikipathways\.org\//)) {
			// if at a test server like pvjs.wikipathways.org
			baseIri = window.location.origin + '/webservice/';
		}
		//*/

		const isBrowser = (typeof window !== 'undefined' && typeof document !== 'undefined');
		if (isBrowser) {
			var hostnameSplit = window.location.hostname.split('wikipathways.org');
			if (hostnameSplit[0] !== '' &&
					hostnameSplit[0] !== 'www.' &&
					hostnameSplit[hostnameSplit.length - 1] === '') {
				isBrowserVisitingWikipathwaysTestServer = true;
			}
			if (!global.wikipathwaysUsername) {
				console.warn('No wikipathwaysUsername available!');
			}
		}

		if (!baseIri) {
			if (isBrowserVisitingWikipathwaysTestServer) {
				// TODO what should the permanent IRI be for the test servers?
				baseIri = window.location.origin + '/wpi/webservicetest/';
			} else if (isBrowser) {
				baseIri = window.location.origin + '/wpi/webservicetest/';
				//baseIri = 'http://webservice.wikipathways.org/'; //this route will lose authentication
			} else {
				baseIri = 'http://www.wikipathways.org/wpi/webservicetest/';
				//baseIri = 'http://webservice.wikipathways.org/'; //this route will lose authentication
			}
		}

		this.baseIri = baseIri;
	}

  getPathway({identifier, version, fileFormat}: {
			identifier: string,
			version?: string|number,
			fileFormat?: string
	} = {
		identifier: undefined, version: 0, fileFormat: 'application/ld+json'
	}) {
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

  login({username, password}): Observable<{auth: string}> {
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

  updatePathway({description, username, password, identifier, gpml}) {
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
					responseType: 'xml',
					timeout: this.timeout,
					crossDomain: true,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: convertObjectToQueryString({
						pwId: identifier,
						description: description,
						revision: pathwayInfo.version.toString(),
						gpml: prefixedGpml,
						username: username,
						auth: loginResult,
					}),
				};

				return Observable.ajax(ajaxRequest)
					.mergeMap(XMLResponseParsers.updatePathway)
					.map(function(response) {
						const {status, statusText, message} = response;
						let output: any = {
							status: status,
							statusText: statusText,
						};
						if (status === 200) {
							output.version = message;
						} else {
							output.errorDescription = message;
						}
						return output;
					});
			});
  }

// TODO if you want to use this method, you'll need to move this import out of the class
//import * as hyperquest from 'hyperquest';
//  updatePathwayUsingHyperquest({description, username, password, identifier, gpml, version}) {
//		const baseIri = this.baseIri;
//
//		const gpmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
//    const prefixedGpml = (gpml.indexOf(gpmlHeader) === 0 ? '' : gpmlHeader).concat(gpml);
//
//		return Observable.zip(
//			this.login({username: username, password: password}),
//			this.getPathwayInfo(identifier)
//		)
//			.mergeMap(function([loginResult, pathwayInfo]) {
//				var postBody = {
//					pwId: identifier,
//					description: description,
//					revision: (pathwayInfo.version).toString(),
//					gpml: prefixedGpml,
//					username: username,
//					auth: loginResult,
//				};
//
//      var iri = URI(baseIri)
//				.filename('updatePathway');
//
//      var iriString = iri.toString();
//
//      // for an example of making a post request with hyperquest, see
//      // https://github.com/substack/hyperquest/blob/master/test/post_immediate.js
//      var req = hyperquest.post(iriString);
//      req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
//      req.end(convertObjectToQueryString(postBody));
//
//      var data = '';
//      req.on('data', function(buf) {
//				data += buf;
//			});
//			return Observable.bindNodeCallback(function(cb) {
//				req.on('end', function() {
//					cb(null, data);
//				});
//			})();
//		});
//	}

// NOTE: this is only set up to work in the browser with JQuery globally available
// TODO if you want to use this method, you'll need to move this import out of the class
//import 'rxjs/add/observable/bindNodeCallback';
//import 'rxjs/add/observable/fromPromise';
//  updatePathwayUsingJQuery({description, username, password, identifier, gpml, version}) {
//		const baseIri = this.baseIri;
//
//    var prefixedGpml = '<?xml version="1.0" encoding="UTF-8"?>'.concat(gpml);
//    //var prefixedGpml = args.gpml;
//
//		return this.login({username: username, password: password})
//			.mergeMap(function(loginResult) {
//
//				var postBody = {
//					pwId: identifier,
//					description: description,
//					revision: version,
//					gpml: prefixedGpml, //new Buffer(prefixedGpml).toString('base64'),
//					username: username,
//					auth: loginResult,
//					//method: 'updatePathway'
//				};
//
//				var iri = URI(baseIri)
//					.filename('updatePathway');
//
//				var iriString = iri.toString();
//
//				return Observable.from('wow');
//
//				/*
//				// Alternative jQuery approach
//				// return promise to editor.js
//				return Observable.fromPromise(Promise.resolve($.ajax({
//					url:  baseIri + 'updatePathway', //URI(baseIri+'updatePathway').filename('index.php'),
//					type: 'post',
//					format: 'xml',
//					data: postBody
//				})));
//				//*/
//		});
//	}
}
