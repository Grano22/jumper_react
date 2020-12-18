import React from 'react';
import ReactDOM from 'react-dom';

class JumperConsoleLogEntry {
    name = "";
    description = "";
    titledLines = [];
    lines = [];
    label = "";

    addingDate = new Date();

    constructor(lines, description="", name="") {
        this.lines = lines;
        this.description = description;
        this.name = name;
    }

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

class JumperConsole {
    _errors = [];
    _warns = [];
    _infos = [];
    _logs = [];
    
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
        let entryObj = new JumperConsoleLogEntry(lines, description, name);
        this._logs.push(entryObj);
        if(print) console.logS(entryObj.toString());
    }

    error(errNo=-1, name, description, label="", lines=[], print=true) {
        let entryObj = new JumperConsoleLogEntry(lines, description, name);
        this._errors.push(entryObj);
        if(print) console.errorS(entryObj.toString());
    }

    warn(name, description, label="", lines=[], print=true) {
        let entryObj = new JumperConsoleLogEntry(lines, description, name);
        this._warns.push(entryObj);
        if(print) console.warnS(entryObj.toString());
    }

    info(description, label="", lines=[], print=true) {
        let entryObj = new JumperConsoleLogEntry(lines, description);
        this._infos.push(entryObj);
        if(print) console.infoS(entryObj.toString());
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

    get lastError() { return this._errors[this._errors.length - 1]; }
}

class JumperBrowser {
    get language() {
        if(typeof window.navigator.languages[0]!="undefined") return window.navigator.languages[0];
        if(typeof window.navigator.language!="undefined") return window.navigator.language;
        else if(typeof window.navigator.userLanguage!="undefined") return window.navigator.userLanguage;
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

class Jumper {
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
                            consoleEntry = new JumperConsoleLogEntry(Array.from(argumentsArr)).setLabel(arguments[0][1]);
                        } else { argumentsArr = arguments; consoleEntry = new JumperConsoleLogEntry(Array.from(argumentsArr)); }
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
                            consoleEntry = new JumperConsoleLogEntry(Array.from(argumentsArr)).setLabel(arguments[0][1]);
                        } else { argumentsArr = arguments; consoleEntry = new JumperConsoleLogEntry(Array.from(argumentsArr)); }
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
                            consoleEntry = new JumperConsoleLogEntry(argumentsArr).setLabel(arguments[0][1]);
                        } else { argumentsArr = arguments; consoleEntry = new JumperConsoleLogEntry(argumentsArr); }
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
                            consoleEntry = new JumperConsoleLogEntry(argumentsArr).setLabel(arguments[0][1]);
                        } else { argumentsArr = arguments; consoleEntry = new JumperConsoleLogEntry(argumentsArr); }
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
}

/*module.exports = new Jumper();*/
var afterConstruct = new Jumper();
var Console = afterConstruct.Console, Browser = afterConstruct.Browser;
export { Console, Browser };
export default afterConstruct;