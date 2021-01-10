import Jumper from './jumper_react.js';
import { assignTypedProps } from './models.js';
import {  JSONSafteyParse } from './dataProcessing.js';
//Jumper.import("axios");
//import axios from 'axios';
var axios = undefined;
/* Service Lib | 1.0.0 | Grano22 */
export class JumperServiceDataModel {
    constructor(assocInput=null) {
        if(assocInput!=null) this.assign(assocInput);
    }

    assign(assocInput) {
        if(typeof assocInput=="string") JSONSafteyParse(assocInput, {});
        for(let assocKey in assocInput) {
            if(typeof this[assocKey]!="undefined") this[assocKey] = this.assignPropertyFiltered(assocInput[assocKey]);   
        }
    }

    filterProperties() {/* Native Code */}
    filterToSQLQuery() {/* Native Code */}

    assignPropertyFiltered(objProp) {
        switch(typeof objProp) {
            case "object":
            break;
            case "string":
                if(RegExp(/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9])(?:( [0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?(.[0-9]{1,6})?$/).test(objProp)) return this.dateFromString(objProp);
            break;
        }
        let customFilter = this.filterProperties();
        if(customFilter!=null && customFilter!==undefined) return customFilter; 
        return objProp;
    }

    prepareToSQLQuery() {
        var obj = {};
        for(let objProp in this) {
            switch(typeof objProp) {
                case "object":
                    if(objProp instanceof Date) obj[objProp] = this.dateToString(this[objProp]);
                break;
                default: let customFilter = this.filterToSQLQuery(); if(customFilter!==undefined && customFilter!=null) obj[objProp] = customFilter; else obj[objProp] = this[objProp];
            }
        }
    }

    dateFromString(dateStr) {
        let dateParts = dateStr.split(" ");
        dateParts = dateParts[0].split("-");
        if(dateParts[1].length>0) {
            let timeParts = dateParts[1].split(":");
            return new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2), timeParts[0], timeParts[1], timeParts[2]);
        } else return new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2));
    }

    dateToString(date) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }
}

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