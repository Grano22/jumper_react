import Jumper from 'jumper';
import { assignTypedProps } from 'jumper/models';
//Jumper.import("axios");
//import axios from 'axios';
var axios = undefined;
/* Service Lib | 1.0.0 | Grano22 */

export class JumperHTTPRequest {
    timeout = 4000;

    constructor(metaData={}) {
        assignTypedProps(this, ["d'timeout"], metaData);
    }

    get hostURL() { return Jumper.Browser.hostURL; }

    get(url) {
        try {
            if(typeof axios !== "undefined" && axios !== undefined && axios) {
                return axios.get(url);
            } else return this.getNativeAwaited(url);
        } catch(e) {
            console.error(e);
        }
    }

    post() {

    }

    postNative(url, data, cbs) {
        cbs = Object.assign({
            onCompletion:null,
            onError:null,
            onProgress:null,
            onAbort:null,
            onReadyStateChange:null }, cbs);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onload = function(e) {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                if(cbs.onCompletion!=null) cbs.onCompletion(xhr.responseText, xhr);
              } else if(cbs.onError!=null) cbs.onError(xhr.statusText, xhr.readyState, xhr);
            }
        }
        if(cbs.onError!=null) {
            xhr.onerror = function(e) {
                cbs.onError(xhr.statusText, e, xhr);
            }
        }
        if(cbs.onProgress!=null) xhr.onprogress = cbs.onProgress;
        if(cbs.onAbort!=null) xhr.onAbort = cbs.onAbort;
        if(cbs.onReadyStateChange) xhr.onReadyStateChange = cbs.onReadyStateChange;
        xhr.send(data);
    }

    getNative(url, cbs) {
        cbs = Object.assign({
            onCompletion:null,
            onError:null,
            onProgress:null,
            onAbort:null,
            onReadyStateChange:null }, cbs);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function(e) {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                if(cbs.onCompletion!=null) cbs.onCompletion(xhr.responseText, xhr);
              } else if(cbs.onError!=null) cbs.onError(xhr.statusText, xhr.readyState, xhr);
            }
        }
        if(cbs.onError!=null) {
            xhr.onerror = function(e) {
                cbs.onError(xhr.statusText, e, xhr);
            }
        }
        if(cbs.onProgress!=null) xhr.onprogress = cbs.onProgress;
        if(cbs.onAbort!=null) xhr.onAbort = cbs.onAbort;
        if(cbs.onReadyStateChange) xhr.onReadyStateChange = cbs.onReadyStateChange;
        xhr.send(null);
    }

    async postNativeAwaited(url, data) {
        var p = new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onload = function(e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText, xhr);
                    } else reject(xhr.statusText, xhr.readyState, xhr);
                }
            }
            xhr.onerror = function(e) { reject(xhr.statusText, e, xhr); }
            xhr.onprogress = this.progress;
            xhr.send(data);
        });
        return p;
    }

    async getNativeAwaited(url, cbs={}) {
        cbs = Object.assign({
            onDownloadProgress:null
        }, cbs);
        var p = new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onload = function(e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText, xhr);
                    } else reject(xhr.statusText, xhr.readyState, xhr);
                }
            }
            xhr.onerror = function(e) { reject(xhr.statusText, e, xhr); }
            if(cbs.onDownloadProgress!=null) xhr.onprogress = cbs.onDownloadProgress;
            xhr.send(null);
        });
        return p;
    }
}

export default class JumperService {
    component = null;
    lastErrors = [];
    http = new JumperHTTPRequest();

    constructor() {

    }
}