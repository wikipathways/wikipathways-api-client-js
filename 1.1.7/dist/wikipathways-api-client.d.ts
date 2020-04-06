import * as atobPolyfill from 'atob';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/dom/ajax';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
declare global {
    namespace NodeJS {
        interface Global {
            XMLHttpRequest: XMLHttpRequest;
            atob: atobPolyfill;
        }
    }
}
export interface UpdatePathwayResponseBodyCommon {
    status: number;
    statusText: string;
}
export interface UpdatePathwayResponseBodySuccess extends UpdatePathwayResponseBodyCommon {
    version: number;
}
export interface UpdatePathwayResponseBodyFailure extends UpdatePathwayResponseBodyCommon {
    error: string;
}
export declare type UpdatePathwayResponseBody = UpdatePathwayResponseBodySuccess & UpdatePathwayResponseBodyFailure;
/**
 * WikipathwaysApiClient
 *
 * @param args
 */
export declare class WikipathwaysApiClient {
    baseIri: string;
    timeout: number;
    SUPPORTED: string[];
    constructor({ baseIri, timeout }?: {
        baseIri?: string;
        timeout?: number;
    });
    /**
     * getPathway
       * NOTE: this actually corresponds to the webservice method "getPathwayAs"
     *
     * @param args
     * @return An Observable with the requested data.
     */
    getPathway({ identifier, version, fileFormat }?: {
        identifier: string;
        version?: number;
        fileFormat?: string;
    }): Observable<any>;
    getPathwayInfo(identifier: string): Observable<{
        identifier: any;
        url: any;
        name: any;
        organism: any;
        version: any;
    }>;
    listPathways(): Observable<{
        '@context': (string | {
            '@vocab': string;
        })[];
        '@id': string;
        db: string;
        identifier: any;
        name: any;
        webPage: any;
        version: any;
        organism: any;
    }>;
    /**
     * login
     *
     * @param args If user is visiting a WikiPathways MediaWiki instance via browser and
       * 						 is logged in, username and password are optional, because Nuno is
       * 						 using cookie-based authentication for the webservice for this case.
     * @return An Observable with a token that can be used to make protected requests.
     */
    login({ username, password }: {
        username: string;
        password: string;
    }): Observable<string>;
    updatePathway({ description, username, password, identifier, gpml }: {
        description: any;
        username: any;
        password: any;
        identifier: any;
        gpml: any;
    }): Observable<UpdatePathwayResponseBody>;
}
