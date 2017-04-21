import { AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';
export declare function updatePathway(ajaxResponse: AjaxResponse): Observable<{
    status: number;
    statusText: string;
    message: string;
}>;
