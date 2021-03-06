import React from 'react';
import ReactDOM from 'react-dom';

//Gloabl throwable and errors
///throw new CriticalError("Something went badly wrong!");
function CriticalError(){ 
    Error.apply(this, arguments);
    this.name = "Critical Error";
}
CriticalError.prototype = Object.create(Error.prototype);

class JumperCriticalError {
    message = "";
    addingDate = new Date();

    constructor(mess="Critical unknown error", selfExecution=true, debugLevel=0) {
        this.message = mess;
        if(selfExecution) this.execute();
    }
    execute() {
        let errCont = document.createElement("div");
        errCont.innerHTML = `<style id="jumper_debuger_styles" type="text/css">
        #jumper_debuger_fullwidth_error {
            position: fixed;
            width: 100%;
            height: 100%;
        }
        #jumper_debuger_message_box {

        }
        </style><div id="jumper_debuger_fullwidth_error"><div id="jumper_debuger_message_box">
            ${this.addingDate.toISOString().slice(0, 19).replace('T', ' ')}
            ${this.message}

        </div></div>`;
        document.body.appendChild(errCont);
    }
}

class JumperConsoleEntry {
    name = "(Unknown Name)";
    description = "(Unknown Description)";
    titledLines = [];
    lines = [];
    label = "";

    addingDate = new Date();

    constructor(lines, description="", name="", selfExecution=false) {
        this.lines = lines;
        this.description = description;
        this.name = name;
        if(selfExecution) this.execute();
    }

    execute() {/* Console Native Code */}

    setLabel(label) { this.label = label; return this; }

    addLine(newLine) { this.lines.push(newLine); }
    deleteLine(lineIndex) { this.lines.splice(lineIndex, 1); }

    valueOf() {
        return this.toString();
    }

    toString() {
        let itemsTitled = [];
        if(this.titledLines) for(let titled in this.titledLines) itemsTitled[titled] = titled+': '+this.titledLines[titled]+'\n';
        return "AddingDate: "+this.addingDate.toISOString().slice(0, 19).replace('T', ' ')+"\n"+(this.name.lenght>0 && "Name: "+this.name+"\n")+(this.description.length>0 && "Description: "+this.description+"\n")+itemsTitled+this.lines.join('\n');
    }
}

class JumperLog extends JumperConsoleEntry {
    name = "(Unknown Name)";
    description = "(Uknown Description)";

    constructor(name="", description="", selfExecution=true) {
        super([], description, name, selfExecution);
    }
    execute() {console.log(`Name:\n\t${this.name}\nDescription:\n\t${this.description}`);}
}

export class JumperError extends JumperConsoleEntry {
    name = "(Unknown Name)";
    description = "(Uknown Description)";
    no = -1;

    constructor(no=-1, name="", description="", selfExecution=true) {
        super([], description, name, selfExecution);
        this.no = no;
    }
    execute() {console.error(`Name:\n\t${this.name}\nDescription:\n\t${this.description}`);}
}

export class JumperWarn extends JumperConsoleEntry {
    name = "(Unknown Name)"; 
    description = "(Uknown Description)";

    constructor(name="", description="", selfExecution=true) {
        super([], description, name, selfExecution);
    }
    execute() {console.warn(`Name:\n\t${this.name}\nDescription:\n\t${this.description}`);}
}

export class JumperInfo extends JumperConsoleEntry {
    description = "(Unknown Description)";

    constructor(description="", selfExecution=true) {
        super([], description, "", selfExecution);
    }
    execute() {console.info(`Name:\n\t${this.name}\nDescription:\n\t${this.description}`);}
}

class JumperLocalStack {
    limit = 20;
    _stack = [];

    constructor(assocOptions={}) {
        for(let assocOption in assocOptions) {
            if(typeof this[assocOption]!="undefined") this[assocOption] = assocOptions[assocOption];
        }
    }

    push(LogEntry) {
        this._stack.push(LogEntry);
    }
}

class JumperConsole {
    _errors = new JumperLocalStack();
    _warns = new JumperLocalStack();
    _infos = new JumperLocalStack();
    _logs = new JumperLocalStack();
    _criticals = new JumperLocalStack();
    _localStacks = {};
    
    //Defines
    _labels = {};
    labelPrefix = Symbol("labelPrefix");
    printByDefault = true;
    ignoreTypes = [];

    constructor(consoleOptions) {
        this.printByDefault = consoleOptions.printConsoleByDefault;
        this.ignoreTypes = consoleOptions.ignoreTypes;
    }

    byLabel(labelName) {return [this.labelPrefix, labelName];}

    defineLabel(name, styles={}) {
        let labelDes = Object.assign({
            styles:{
                log:'',
                warn:'',
                info:'',
                error:''
            }
        }, { styles:styles });
        this._labels[name] = labelDes;
    }

    log(name, description, label="", lines=[], print=true) {
        let entryObj = new JumperLog(lines, description, name, false);
        this._logs.push(entryObj);
        if(print) console.logS(entryObj.toString());
    }

    error(errNo=-1, name, description, label="", lines=[], print=true) {
        let entryObj = new JumperError(lines, description, name, false);
        this._errors.push(entryObj);
        if(print) console.errorS(entryObj.toString());
    }

    warn(name, description, label="", lines=[], print=true) {
        let entryObj = new JumperWarn(lines, description, name, false);
        this._warns.push(entryObj);
        if(print) console.warnS(entryObj.toString());
    }

    info(description, label="", lines=[], print=true) {
        let entryObj = new JumperInfo(lines, description, false);
        this._infos.push(entryObj);
        if(print) console.infoS(entryObj.toString());
    }

    critical() {
        this._criticals.push(new JumperCriticalError());
    }

    print() {

    }

    printLogs(label="") {

    }

    printInfos(label="") {

    }

    printWarns(label="") {
        for(let warnEntry in this._warns) {
            if(label!="") {
                if(this._warns[warnEntry].label==label) this._warns[warnEntry].toString();
            } else console.warnS(this._warns[warnEntry].toString());
        }
    }

    printErrors(label="") {

    }

    traceLocalStack(options) {
        let newLocalStack = new JumperLocalStack(options);
        this._localStacks[Object.keys(this._localStacks).length] = newLocalStack;
        return newLocalStack;
    }

    get lastError() { return this._errors[this._errors.length - 1]; }
}

class JumperBrowser {
    get language() {
        if(typeof window.navigator.languages[0]!="undefined") return window.navigator.languages[0];
        if(typeof window.navigator.language!="undefined") return window.navigator.language;
        else if(typeof window.navigator.userLanguage!="undefined") return window.navigator.userLanguage;
    }
    get hostURL() {
        return window.location.protocol+(window.location.protocol.indexOf("file")>-1 ? "///" : "//")+window.location.host+"/";
    }
    clipboard = (function() {
        var clipboardHistory = [];
        return new class {
            copyText(targetStr) {
                try {
                    if(typeof targetStr!=="string") return false;
                    if(typeof document.execCommand!="undefined") {
                        if(typeof document.queryCommandSupported!="undefined") {
                            if(document.queryCommandSupported('copy')) {
                                var avoidCont = document.createElement("textarea");
                                avoidCont.style = { visibility: "hidden", position:"absolute", left:"-1000px", top: "-1000px" };
                                avoidCont.value = targetStr.toString();
                                document.body.appendChild(avoidCont);
                                avoidCont.select();
                                let res = document.execCommand('copy');
                                document.body.removeChild(avoidCont);
                                console.log(targetStr);
                                return !!res;
                            } else return false;
                        } else {
                            let res = document.execCommand('copy');
                            return !!res;
                        }
                    } else if(typeof window.clipboardData!="undefined") {
                        window.clipboardData.setData('Text', targetStr);
                    } else throw "No Method";
                } catch(clipboardError) {
                    console.error("Jumper.Browser.Clipboard.Error: "+clipboardError.toString());
                }
            }
            async copyTextAwaited(targetStr) {
                try {
                    await navigator.clipboard.writeText(targetStr);
                } catch(clipboardError) {
                    console.error("Jumper.Browser.Clipboard.Error: "+clipboardError.toString());
                }
            }
            copy(copyRes) {
                switch(typeof copyRes) {
                    case "string":
                        this.copyText(copyRes);
                }
            }
            async copyAwiated(copyRes) {
                switch(typeof copyRes) {
                    case "string":
                        await this.copyTextAwaited(copyRes);
                }
            }
        }
    });
    subwindow = (function() {
        var windowsList = [], activeWindow = null;
        return new class {
            async create(component) {
                if(document.getElementById("subwindowContainer")!=null) return false;
                var windowContainer = document.createElement("div"), windowStyles = `#subwindowContainer { position:fixed; left: 0; top: 0; height: 100vh; width: 100%; background: rgba(0, 0, 0, 0.9); display: flex; justify-content: center; align-items: center; }`, stylesContainer = document.createElement("style"), subwindowHolder = document.createElement("div");
                windowContainer.id = "subwindowContainer";
                    stylesContainer.setAttribute("type", "text/css");
                    /* Registered Components Styles */
                    let subwindowComponentCSS = "";
                    console.log(component);
                    if(typeof component.type.styles!="undefined") {
                    for(let styleContName in component.type.styles) {
                        for(let styleContDef in component.type.styles[styleContName]) {
                            subwindowComponentCSS += ` #subwindowContainer ${styleContDef.replace("&", styleContName)} {`;
                            for(let propDef in component.type.styles[styleContName][styleContDef]) {
                                subwindowComponentCSS += `${propDef}:${component.type.styles[styleContName][styleContDef][propDef]};`;
                            }
                            subwindowComponentCSS += '}';
                        }
                    }};
                    /* END Registered Component Styles */
                    stylesContainer.textContent = windowStyles + subwindowComponentCSS;
                    windowContainer.appendChild(stylesContainer);
                    subwindowHolder.id = "subwindowHolder";
                    windowContainer.appendChild(subwindowHolder);
                document.body.appendChild(windowContainer);
                window.subwindow = windowContainer;
                ReactDOM.render(component, subwindowHolder);
            }
            async close(containerHolder) {
                ReactDOM.unmountComponentAtNode(containerHolder);
            }
            async terminate() {

            }
            async terminateAll() {
                if(window.subwindow==null) { console.error("Current subwindow context is inactive"); return false; }
                window.subwindow.remove();
                window.subwindow = null;
            }
        }
    })
    async share(shareData, component=null) {
        try {
            if(typeof navigator.share!="undefined") {
                await navigator.share(shareData);
            } else if(component!=null) {
                await this.shareViaComponent(shareData, component);
            }
        } catch(ShareError) {
            console.error(ShareError);
        }
    }
    async shareViaComponent(shareData, ShareComponent) {
        try {
            const initiationComponent = <ShareComponent terminateWindow={this.closeWindow} {...shareData}/>;
            await this.createWindow(initiationComponent);
        } catch(ShareError) {
            console.error(ShareError);
        }
    }
    
}

class JumperMemoryManager {

    get cookieEnabled() {
        if(navigator.cookieEnabled!==undefined) return navigator.cookieEnabled;
        document.cookie = "checkCookieEnabled=1";
        var ret = document.cookie.indexOf("checkCookieEnabled=") != -1;
        document.cookie = "checkCookieEnabled=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
        return ret;
    }

    dateToCookieFormat(d) {return d.toUTCString();}
    dateFromCookieFormat(dateInput) {return new Date(dateInput+" Z");}

    getAllCookies() {
        var clist = {}, rsplt = document.cookie.split(";");
        for(let cname in rsplt) clist[cname] = decodeURIComponent(rsplt[cname]); 
        return clist;
    }

    getCookie(name) {
        let cookiesEntries = document.cookie, cookiesEntryName = document.cookie.indexOf(name), afterEqualing = "=";
        if(cookiesEntryName<0) return null;
        for(let i = cookiesEntryName + name.lenght;i<cookiesEntries.length;i++) { if(afterEqualing!="=") afterEqualing += cookiesEntries[i]; else if(cookiesEntries[i]=="=") afterEqualing = ""; if(i+1==cookiesEntries.length-1 || cookiesEntries[i + 1]==";") return decodeURIComponent(afterEqualing); }
        return null;
    }

    setCookie(name, value, otherOptions={}) {
        otherOptions = Object.assign({
            expireDate:"Tue, 19 Jan 2038 03:14:07 GMT",
            path:"",
            domain:"",
            secure:undefined, //bool
            maxAge:-1, //miliseconds
            samesite:"" //strict, lax, none 
        }, otherOptions);
        otherOptions.samesite = otherOptions.samesite!="" ? "; samesite = " + otherOptions.samesite : "";
        otherOptions.secure = typeof otherOptions.secure=="boolean" ? "; secure" : ""; 
        otherOptions.maxAge = !isNaN(otherOptions.maxAge) && parseInt(otherOptions.maxAge)>-1 ? "; maxAge = " + otherOptions.maxAge : "";
        otherOptions.domain = otherOptions.domain!="" ? "; domain = " + otherOptions.domain : "";
        otherOptions.expireDate = (otherOptions.expireDate!="" ? "; expires = " + otherOptions.expireDate : "");
        otherOptions.path = otherOptions.path!="" ? "; path = " + otherOptions.path : "";
        document.cookie = encodeURIComponent(name)+" = "+encodeURIComponent(value)+otherOptions.expireDate+otherOptions.path+otherOptions.maxAge+otherOptions.samesite+otherOptions.domain+otherOptions.secure;
    }

    removeCookie(name) {
        document.cookie = name+'=; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    }

    /*removeCookieFromPaths() {

    }

    removeCookiesFromPaths() {

    }*/

    removeAllCookies() {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            let cookie = cookies[i], eqPos = cookie.indexOf("="), name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }

    getItem(itemName, memType="local") {
        switch(memType) {
            case "local":
                return window.localStorage.getItem(itemName);
            case "session":
                return window.sessionStorage.getItem(itemName);
            case "cookies":
                return this.getCookie(itemName);
        }
    }

    setItem(itemName, value, memType="local") {
        switch(memType) {
            case "local":
                window.localStorage.setItem(itemName, value);
            break;
            case "session":
                window.sessionStorage.setItem(itemName, value);
            break;
            case "cookies":
                return this.setCookie(itemName, value);
        }
        return true;
    }

    removeItem(itemName, memType="local") {

    }

    removeAll(memType="local", filter=null) {

    }
}

class JumperFrontEndApi {
    
}

class Jumper {
    API = new JumperFrontEndApi(this);
    Memory = new JumperMemoryManager();
    Browser = new JumperBrowser();
    Console = Object.create(Object.prototype, {
        init:{
            value:function(defaultInjection=true, otherOptions={}) {
                otherOptions = Object.assign({
                    printConsoleByDefault:true,
                    ignoreTypes:[]
                }, otherOptions);
                let consoleContext = new JumperConsole(otherOptions);
                var consoleLog = console.log, consoleInfo = console.info, consoleWarn = console.warn, consoleError = console.error;
                Object.defineProperties(window.console, {
                    logS:{ value:consoleLog },
                    infoS:{ value:consoleInfo },
                    warnS:{ value:consoleWarn },
                    errorS:{ value:consoleError },
                    label:{ value:consoleContext.labelPrefix },
                    jumper:{ value:consoleContext }
                });
                if(defaultInjection) {
                    consoleContext.defineLabel("jumper", {
                        log:'background: #487796;color:#381b26;padding: 12px;width:100%;display:inline-block;border: 2px solid #29151d;',
                        error:'background: #964865;color:#381b26;padding: 12px;width:100%;display:inline-block;border: 2px solid #29151d;',
                        warn:'background: #48966b;color: #1b382f;padding: 12px;width:100%;display:inline-block;border: 2px solid #152922;',
                        info:'background: #965f48;color:#38271b;padding: 12px;width:100%;display:inline-block;border: 2px solid #291e15;'
                    });
                    /*window.onerror = function (msg, url, lineNo, columnNo, error) {
                    }*/
                    let argumentsArr = [];
                    window.console.log = function() {
                        let consoleEntry = null;
                        if(Array.isArray(arguments[0]) && consoleContext.labelPrefix==arguments[0][0] && typeof this._labels[arguments[0][1]]!="undefined") { 
                            //argumentsArr.splice(0, 1);
                            let currLabel = this._labels[arguments[0][1]];
                            for(let argIndex = 1;argIndex<arguments.length;argIndex++) {
                                argumentsArr[argIndex - 1] = "%c"+arguments[argIndex];
                                argumentsArr[argIndex] = currLabel.styles.log;
                            }
                            consoleEntry = new JumperConsoleEntry(Array.from(argumentsArr)).setLabel(arguments[0][1]);
                        } else { argumentsArr = arguments; consoleEntry = new JumperConsoleEntry(Array.from(argumentsArr)); }
                        consoleContext._logs.push(consoleEntry);
                        if(!this.ignoreTypes.includes("log")) consoleLog.apply(consoleContext, argumentsArr);
                    }.bind(consoleContext);
                    window.console.warn = function() {
                        let consoleEntry = null;
                        if(Array.isArray(arguments[0]) && consoleContext.labelPrefix==arguments[0][0] && typeof this._labels[arguments[0][1]]!="undefined") { 
                            //argumentsArr.splice(0, 1);
                            let currLabel = this._labels[arguments[0].replace(consoleContext.labelPrefix, "")];
                            for(let argIndex = 1;argIndex<arguments.length;argIndex++) {
                                argumentsArr[argIndex] = "%c"+arguments[argIndex];
                                argumentsArr[argIndex + 1] =  currLabel.styles.log;
                            }
                            consoleEntry = new JumperConsoleEntry(Array.from(argumentsArr)).setLabel(arguments[0][1]);
                        } else { argumentsArr = arguments; consoleEntry = new JumperConsoleEntry(Array.from(argumentsArr)); }
                        consoleContext._warns.push(consoleEntry);
                        if(!this.ignoreTypes.includes("warn")) consoleWarn.apply(consoleContext, argumentsArr);
                    }.bind(consoleContext);
                    window.console.error = function() {
                        let consoleEntry = null;
                        if(Array.isArray(arguments[0]) && consoleContext.labelPrefix==arguments[0][0] && typeof this._labels[arguments[0][1]]!="undefined") { 
                            //argumentsArr.splice(0, 1);
                            let currLabel = this._labels[arguments[0].replace(consoleContext.labelPrefix, "")];
                            for(let argIndex = 1;argIndex<arguments.length;argIndex++) {
                                argumentsArr[argIndex] = "%c"+arguments[argIndex];
                                argumentsArr[argIndex + 1] =  currLabel.styles.log;
                            }
                            consoleEntry = new JumperConsoleEntry(argumentsArr).setLabel(arguments[0][1]);
                        } else { argumentsArr = arguments; consoleEntry = new JumperConsoleEntry(argumentsArr); }
                        consoleContext._errors.push(consoleEntry);
                        if(!this.ignoreTypes.includes("error")) consoleError.apply(consoleContext, argumentsArr);
                    }.bind(consoleContext);
                    window.console.info = function() {
                        let consoleEntry = null;
                        if(Array.isArray(arguments[0]) && consoleContext.labelPrefix==arguments[0][0] && typeof this._labels[arguments[0][1]]!="undefined") { 
                            //argumentsArr.splice(0, 1);
                            let currLabel = this._labels[arguments[0].replace(consoleContext.labelPrefix, "")];
                            for(let argIndex = 1;argIndex<arguments.length;argIndex++) {
                                argumentsArr[argIndex] = "%c"+arguments[argIndex];
                                argumentsArr[argIndex + 1] =  currLabel.styles.log;
                            }
                            consoleEntry = new JumperConsoleEntry(argumentsArr).setLabel(arguments[0][1]);
                        } else { argumentsArr = arguments; consoleEntry = new JumperConsoleEntry(argumentsArr); }
                        consoleContext._infos.push(consoleEntry);
                        if(!this.ignoreTypes.includes("info")) consoleInfo.apply(consoleContext, argumentsArr);
                    }.bind(consoleContext);
                }
                afterConstruct.Console = consoleContext;
                return consoleContext;
            }
        }
    });

    constructor() {
        Object.defineProperties(this, {
            version: { 
                value:0.3,
                writable:false,
                enumerable:false,
                configurable:false
            }
        });
    }
    configure() {

    }
//Check if given component is a react class component
    isClassComponent(component) {
        return (
            typeof component === 'function' && 
            !!component.prototype.isReactComponent
        )
    }
    isFunctionComponent(component) {
        return (
            typeof component === 'function' && 
            String(component).includes('return React.createElement')
        )
    } 
    isReactComponent(component) {
        return (
            this.isClassComponent(component) || 
            this.isFunctionComponent(component)
        )
    }
    
    isElement(element) {
        return React.isValidElement(element);
    }
    
    isDOMTypeElement(element) {
        return this.isElement(element) && typeof element.type === 'string';
    }
    
    isCompositeTypeElement(element) {
        return this.isElement(element) && typeof element.type === 'function';
    }

    __lastScriptConfig = null;

    get lastScriptConfig() {
        return this.__lastScriptConfig;
    }

    get currentScript() {
        if(typeof document.currentScript!="undefined") return document.currentScript; else {
            var coll = document.getElementsByTagName("script");
            return coll[coll.length - 1];
        }
    }

    getScriptConfiguration(dataType="json", clearConfig=true) {
        let currScript = this.currentScript, getterConf = currScript.innerHTML, outputObj = null;
        switch(dataType) {
            case "yml":

            break;
            case "json":
            default:
                outputObj = JSON.parse(getterConf);
        }
        if(clearConfig) currScript.innerHTML = "";
        return outputObj;
    }
}

/*module.exports = new Jumper();*/
var afterConstruct = new Jumper();
var Console = afterConstruct.Console, Browser = afterConstruct.Browser;
export { Console, Browser };
export default afterConstruct;
//module.exports = afterConstruct;