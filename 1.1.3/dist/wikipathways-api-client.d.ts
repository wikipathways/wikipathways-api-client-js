import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/dom/ajax';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
declare global  {
    namespace NodeJS {
        interface Global {
            XMLHttpRequest: XMLHttpRequest;
            wikipathwaysUsername: string;
        }
    }
}
export declare const SUPPORTED: string[];
export declare class WikipathwaysApiClient {
    baseIri: string;
    timeout: number;
    constructor({baseIri, timeout}?: {
        baseIri?: string;
        timeout?: number;
    });
    getPathway({identifier, version, fileFormat}?: {
        identifier: string;
        version?: string | number;
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
    login({username, password}: {
        username: any;
        password: any;
    }): Observable<{
        auth: string;
    }>;
    updatePathway({description, username, password, identifier, gpml}: {
        description: any;
        username: any;
        password: any;
        identifier: any;
        gpml: any;
    }): Observable<any>;
}
