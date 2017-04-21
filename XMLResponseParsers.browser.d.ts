import { Observable } from 'rxjs/Observable';
import { AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';
import 'rxjs/add/observable/of';
export declare function updatePathway(ajaxResponse: AjaxResponse): Observable<{
    status: number;
    statusText: string;
    message: string;
}>;
