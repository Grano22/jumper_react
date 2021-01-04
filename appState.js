/* Jumper Library by Grano22 | v 1.0 | React */
import { JSONSafteyParse } from './Jumper.dataProcessing';
import { basicHashString, cyrb53 } from './Jumper.cryptography';
import { Console, JumperError } from 'jumper';

export class JumperMemoryLeak extends JumperError {

}

export function splitByParsing(str, occur, escape="/") {
    let arr = [], inStr = false, partStr = "";
    for(let word in str) {
        if(word==str.length - 1) { partStr += str[word]; arr.push(partStr); }
        else if(str[word]=="'") inStr = !inStr;
        else if(!inStr && str[word]==occur) { if(str[word - 1]!=escape) { arr.push(partStr); partStr = ""; } }
        else { partStr += str[word]; }
    }
    return arr;
}

export class ActionError {


    constructor(desc) {
        this.description = desc;
    }

    toString() {

    }
}

export class ActionModule {
    constructor() {}

    static asPointer(actionClass) {
        return {
            pointer: actionClass,
            toString:()=>{

            }
        }
    }
}

export class ActionsStack {
    static version = 1.1;

    component = null;
    operationsHistoryStack = new Array();
    operationsRestoredStack = new Array();

    errorsStack = Console.traceLocalStack() || new Array();

    namespaceRange = new Array();

    lastAction = "";
    stackHistorySize = 20;
    stackRestoredSize = 20;

    _events = {
        "beforeunload":[],
        "visibilitychange":[],
        "beforecomponentunmount":[]
    };
    _lastID = 0;

    //States
    isReady = false;
    
    get isUpdated() {
        let ld = this.getComponentLastSavedData();
        if(ld==null) return false;
        return parseInt(ld[0])==this._lastID;
    }
    
    constructor(component, inArr, options={stackSize:20, debug:false, loadResumeable:true}) {
        let self = this;
        this.component = component;
        if(typeof this.component.state=="undefined") this.component.state = {};
        this.stackSize = options.stackSize;
        this.setOperationsNamespace(inArr);
        if(options.loadResumeable) this.restoreStacksSessions();
        function onBeforePageUnload() {
            this.saveStacksSessions();
        }
        window.addEventListener("beforeunload", onBeforePageUnload.bind(this));
        function onPageVisibilityChange() {
            if (document.visibilityState === 'visible') {
                console.log("Now visible!");
            } else {
                console.log("Now not viisble!");
                //this.saveStacksSessions();
            }
        }
        document.addEventListener("visibilitychange", onPageVisibilityChange.bind(this));
        function onComponentWillUnmount() {}
        if(typeof component.componentWillUnmount!="undefined") {
            let originalEvt = component.componentWillUnmount;
            component.componentWillUnmount = function(props) {
                for(let evtTypeName in self._events["beforecomponentunmount"]) {
                    self._events["beforecomponentunmount"][evtTypeName].call(self);
                }
                originalEvt(props);
            }
        } else {
            component.componentWillUnmount = function(props) {
                for(let evtTypeName in self._events["beforecomponentunmount"]) {
                    self._events["beforecomponentunmount"][evtTypeName].call(self);
                }
            }
        }
        this.isReady = true;
    }
    addError(newErr) {
        this.errorsStack.push(newErr);
        console.error(newErr);
    }
    setOperationsNamespace(inArr) {
        if(!Array.isArray(inArr)) { this.addError(new ActionError("Invaild input, array expected", 0, "")); return this; }
        for(let classAction of inArr) this.namespaceRange.push(classAction); //.prototype.constructor.name .prototype.constructor.name
        return this;
    }
    getOperationByNamespace(name) {
        for(let classOnce of this.namespaceRange) { if(classOnce.prototype.constructor.name==name) return classOnce; }
        return null;
    }
    flush() {
        this.lastAction = "flush";
        while(this.operationsHistoryStack.length>0) { let iOper = this.operationsHistoryStack[this.operationsHistoryStack.length - 1]; iOper.onFlush(this.component, iOper.inputData); this.operationsHistoryStack.pop(); }
        this.operationsRestoredStack = new Array();
        this.component.setState({actionHandler:this.dump()});
    }
    flushTyped(filter, withRestored=false) {
        this.lastAction = "flushTyped("+filter+","+withRestored+")";
        this.operationsHistoryStack = this.operationsHistoryStack.map(filter);
        if(withRestored) this.operationsRestoredStack = this.operationsRestoredStack.map(filter);
        this.component.setState({actionHandler:this.dump()});
    }
    checkOperationIsRegistered(targetOperation) {
        for(let namespaceNm in this.namespaceRange) {
            if(this.namespaceRange[namespaceNm].prototype.constructor.name==targetOperation.constructor.name) return true;
        }
        return false;
    }
    addOperation(newOperation, inputData = {}) {
        try {
            let matchRes = null;
            this.lastAction = "addOperation";
            if(typeof newOperation!="object") throw "Unexpected argument #1 - "+newOperation+", you need to pass a instance of JumperOperation";
            if(!this.checkOperationIsRegistered(newOperation)) throw "Unexpected Action class, use one of registered: "+this.namespaceRange.map(v=>v.prototype.constructor.name).join(",");
            newOperation.id = this._lastID;
            this._lastID++;
            if(typeof inputData=="object" && inputData!=null) {
                newOperation.inputData = inputData;
                newOperation.lastInputData = inputData;
                if(typeof newOperation.name=="string") { matchRes = newOperation.name.match(/\$\{(\w\d?)+\}/g);
                if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.name.replace(matchRes[matchRe], inputData[wd]); } } }
                if(typeof newOperation.description=="string") { matchRes = newOperation.description.match(/\$\{(\w\d?)+\}/g);
                if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.description.replace(matchRes[matchRe], inputData[wd]); } } }
            } else newOperation.inputData = {};
            let outCpt = newOperation.onStore(this.component, newOperation.inputData, this.component.state); // newOperation.outputData
            if(typeof outCpt=="object" && outCpt!=null) {
                if(typeof newOperation.name=="string") { matchRes = newOperation.name.match(/\#\{(\w\d?)+\}/g);
                if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.name.replace(matchRes[matchRe], outCpt[wd]); } } }
                if(typeof newOperation.description=="string") { matchRes = newOperation.description.match(/\#\{(\w\d?)+\}/g);
                if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.description.replace(matchRes[matchRe], outCpt[wd]); } } }
            }
            this.operationsHistoryStack.push(newOperation);
            if(this.operationsHistoryStack.length>=this.stackSize) this.operationsHistoryStack.shift();
            this.component.setState(Object.assign(outCpt, {lastActionDate:new Date(), actionHandler:this.dump()}));
        } catch(e) {
            console.error(e);
        }
    }
    addOperations(newOperations) {
        try {
            let newOperation = null, finalState = {}, matchRes = null;
            this.lastAction = 'addOperations('+newOperations.toString()+')';
            if(Array.isArray(newOperations)) {
                if(newOperations.length>0) {
                    for(let operInd in newOperations) {
                        if(typeof newOperations[operInd]!="object") throw "";
                        if(typeof newOperations[operInd].operation!="object") throw "Unexpected input array item "+operInd+" - in argument 1 , "+newOperation+", you need to pass a instance of JumperOperation";
                        newOperation = newOperations[operInd].operation;
                        if(!this.checkOperationIsRegistered(newOperation)) throw "Unexpected Action class, use one of registered: "+this.namespaceRange.map(v=>v.prototype.constructor.name).join(",");
                        newOperation.id = this._lastID;
                        this._lastID++;
                        if(typeof newOperations[operInd].inputData=="object") {
                            newOperation.inputData = newOperations[operInd].inputData;
                            newOperation.lastInputData = newOperations[operInd].inputData;
                            if(typeof newOperation.name=="string") { matchRes = newOperation.name.match(/\$\{(\w\d?)+\}/g);
                            if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.name.replace(matchRes[matchRe], newOperations[operInd].inputData[wd]); } } }
                            if(typeof newOperation.description=="string") { matchRes = newOperation.description.match(/\$\{(\w\d?)+\}/g);
                            if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.description.replace(matchRes[matchRe], newOperations[operInd].inputData[wd]); } } }
                        } else newOperation.inputData = {};
                        let outCpt = newOperation.onStore(this.component, newOperation.inputData, this.component.state); // newOperation.outputData
                        if(typeof outCpt=="object" && outCpt!=null) {
                            if(typeof newOperation.name=="string") { matchRes = newOperation.name.match(/\#\{(\w\d?)+\}/g);
                            if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.name.replace(matchRes[matchRe], outCpt[wd]); } } }
                            if(typeof newOperation.description=="string") { matchRes = newOperation.description.match(/\#\{(\w\d?)+\}/g);
                            if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.description.replace(matchRes[matchRe], outCpt[wd]); } } }
                        } else outCpt = {};
                        this.operationsHistoryStack.push(newOperation);
                        if(this.operationsHistoryStack.length>=this.stackSize) this.operationsHistoryStack.shift();
                        finalState = Object.assign(finalState, outCpt);
                    }
                    this.component.setState(Object.assign(finalState, {lastActionDate:new Date(), actionHandler:this.dump()}));
                }
            }
        } catch(e) {
            console.error(e);
        }
    }
    invokeEmptyOperation() { this.component.setState(Object.assign(this.component.state || {}, {lastActionDate:new Date()})); }
    restoreLastOperation() {
        this.operationsRestoredStack.push(this.operationsHistoryStack[this.operationsHistoryStack.length - 1]);
        this.operationsHistoryStack.pop();
        let iOper = this.operationsRestoredStack[this.operationsRestoredStack.length - 1];
        iOper.onRestore(this.component, iOper.inputData, iOper.outputData);
    }
    undoRestoring() {
        this.operationsHistoryStack.push(this.operationsRestoredStack[this.operationsRestoredStack.length - 1]);
        this.operationsRestoredStack.pop();
        let iOper = this.operationsHistoryStack[this.operationsHistoryStack.length - 1];
        iOper.onRestore(this.component, iOper.inputData, iOper.outputData);
    }
    restoreOperations(number) {
        for(let i = 0;i<number;i++) this.restoreLastOperation();
    }
    resumeAll() {
        for(let oper in this.operationsHistoryStack) {
            if(this.operationsHistoryStack[oper].type==2) this.operationsHistoryStack[oper].onResume();
        }
    }
    resume(filter, firstOccur=false) {
        for(let oper in this.operationsHistoryStack) {
            let res = filter(this.operationsHistoryStack[oper], oper);
            if(this.operationsHistoryStack[oper].type==2 && res) this.operationsHistoryStack[oper].onResume();
            if(res && firstOccur) break;
        }
    }
    setTypeRange(namespacesInheritedTypes) {

    }
    defineCustomInitialData(valCB) {
        this._customInitialData.push(valCB.bind(this, [this, this.component]));
    }
    saveComponentCustomInitialData() {
        let essentialVal = null;
        for(let valCB in this._customInitialData) {
            essentialVal = this._customInitialData[valCB]();
            if(typeof essentialVal=="object") essentialVal = JSON.stringify(essentialVal);
            window.sessionStorage.setItem("jumper_cs_"+valCB+"_"+this.accessHash, essentialVal);
        }
    }
    restoreComponentCustomInitialData() {
        for(let valCB in this._customInitialData) {
            let essentialVal = window.sessionStorage.getItem("jumper_cs_"+valCB+"_"+this.accessHash);
            if(essentialVal!=null) this.component[valCB] = essentialVal;
        }
    }
    restoreComponentProp(propName) {
        return window.sessionStorage.getItem("jumper_po_"+propName+"_"+this.accessHash);
    }
    saveComponentProp(propName) {
        window.sessionStorage.setItem("jumper_po_"+propName+"_"+this.accessHash, this.component[propName]);
    }
    saveComponentProps() {

    }
    get accessHash() {
        if(typeof this._retrivedHash=="undefined") {
            let ach = this.component.constructor.name+"#"+cyrb53(this.component.constructor.toString());
            this._retrivedHash = ach;
            return ach;
        } else return this._retrivedHash;
    }
    getComponentLastSavedData() { let dt = window.sessionStorage.getItem("jumper_c_"+this.accessHash); return dt!=null ? dt.split(";") : null; }
    saveStacksSessions() {
        window.sessionStorage.setItem("jumper_c_"+this.accessHash, this.toString());
        let hl = "", rl = "";
        for(let ha in this.operationsHistoryStack) { if(this.operationsHistoryStack[ha].type==3) { hl += this.operationsHistoryStack[ha].toString().replace(/\&/g, "\\&"); if(ha!=this.operationsHistoryStack.length - 1) hl += "&"; } }
        window.sessionStorage.setItem("jumper_sh_"+this.accessHash, hl);
        for(let ra in this.operationsRestoredStack) { if(this.operationsHistoryStack[ra].type==3) { rl += this.operationsRestoredStack[ra].toString().replace(/\&/g, "\\&"); if(ra!=this.operationsRestoredStack.length - 1) rl += "&"; } }
        window.sessionStorage.setItem("jumper_sr_"+this.accessHash, rl);
    }
    restoreStacksSessions() {
        let resActions = null;
        if(resActions = window.sessionStorage.getItem("jumper_c_"+this.accessHash)!=null) {
            try {
            this.lastAction = "operationsLoad";
            resActions = splitByParsing(resActions, ";", "/");
            this._lastID = parseInt(resActions[0]);
            let jumperS1 = window.sessionStorage.getItem("jumper_sh_"+this.accessHash);
            if(jumperS1!=null) {
                jumperS1 = splitByParsing(jumperS1, "&", "/");
                console.log(jumperS1);
                let outCpt = {};
                for(let onceRes in jumperS1) {
                    console.log(jumperS1[onceRes]);
                    if(this.stackHistorySize>=this.operationsHistoryStack.length) {
                    let jumperAParams = splitByParsing(jumperS1[onceRes], ";", "/"), jumperA = new (this.getOperationByNamespace(jumperAParams[0]));
                    console.log(jumperAParams);
                    let cd = jumperAParams[1].split(/[- :]/);
                    jumperA.creationDate = new Date(Date.UTC(cd[0], cd[1]-1, cd[2], cd[3], cd[4], cd[5]));
                    let ud = jumperAParams[2].split(/[- :]/);
                    jumperA.updateDate = new Date(Date.UTC(ud[0], ud[1]-1, ud[2], ud[3], ud[4], ud[5]));
                    jumperA.outputData = JSONSafteyParse(jumperAParams[3], {}, (err)=>{});
                    jumperA.lastInputData = JSONSafteyParse(jumperAParams[4], {}, (err)=>{});
                    console.log(jumperA);
                    outCpt = jumperA.onStore(this.component, jumperA.lastInputData, jumperA.outputData) || {};
                    this.operationsHistoryStack.push(jumperA);
                    jumperA.onResume(this.component, jumperA.lastInputData);
                    
                    }
                }
                this.component.setState(Object.assign(outCpt, {actionHandler:this.dump()}));
            }
            let jumperS2 = window.sessionStorage.getItem("jumper_sr_"+this.accessHash);
            if(jumperS2!=null) {
                jumperS2 = splitByParsing(jumperS2, "&", "/");
                let outCpt = {};
                for(let onceRes in jumperS2) {
                    if(this.stackRestoredSize>=this.operationsRestoredStack.length) {
                    let jumperAParams = splitByParsing(jumperS2[onceRes], ";", "/"), jumperA = new (this.getOperationByNamespace(jumperAParams[0]));
                    let cd = jumperAParams[1].split(/[- :]/);
                    jumperA.creationDate = new Date(Date.UTC(cd[0], cd[1]-1, cd[2], cd[3], cd[4], cd[5]));
                    let ud = jumperAParams[2].split(/[- :]/);
                    jumperA.updateDate = new Date(Date.UTC(ud[0], ud[1]-1, ud[2], ud[3], ud[4], ud[5]));
                    jumperA.outputData = JSONSafteyParse(jumperAParams[3], {}, (err)=>{});
                    jumperA.lastInputData = JSONSafteyParse(jumperAParams[4], {}, (err)=>{});
                    outCpt = jumperA.onStore(this.component, jumperA.lastInputData, jumperA.outputData) || {};
                    this.operationsRestoredStack.push(jumperA, jumperA.lastInputData);
                    jumperA.onResume(this.component, jumperA.lastInputData);
                    }
                }
                this.component.setState(Object.assign(outCpt, {actionHandler:this.dump()}));
            }
            } catch(e) {
                console.error(e);
            }
        }
    }
    toString() { return `${this._lastID};${new Date().toISOString().slice(0, 19).replace('T', ' ')};${this.lastAction}`; }
    dump() { return `${this.lastAction}`; }
    /* Events */
    onRestore() {/* Native Code */}
}

export class ActionOperation {
    name = "";
    description = "";
    type = -1;
    mark = "all";
    creationDate = new Date();
    updateDate = new Date();
    lastInputData = {};
    outputData = {};
    constructor(mark="all", name, desc="", type=1) {
        this.mark = mark;
        this.name = name;
        this.description = desc;
        this.type = type;
    }
    onStart(c, i, o) {/* Native Code */}
    onStore(c, i, o) {/* Native Code */}
    onRestore() {/* Native Code */}
    onFlush() {/* Native Code */}
    onUpdate() {/* Native Code */}
    toString() {return `${this.constructor.name};${this.creationDate.toISOString().slice(0, 19).replace('T', ' ')};${this.updateDate.toISOString().slice(0, 19).replace('T', ' ')};${JSON.stringify(this.outputData)};${JSON.stringify(this.lastInputData)}`;}
}

export class ActionEventsOperation extends ActionOperation {
    type = 2;
    events = [];

    constructor(mark="all") {
        super(mark);
    }

    onRestore() {this.restoreEventEntries();}

    addEventEntry(elRef, evName, evFn) {
        this.events.push({element:elRef, eventName:evName, event:evFn});   
    }

    restoreEventEntries() {
        this.events.forEach((val, ind, arr)=>{
            if(typeof val.element=="string") {
                let el = document.querySelector(val.element);
                el.addEventListener(val.eventName, val.event);
            } else {
                val.element.addEventListener(val.eventName, val.event);
            }
        })
    }
}

export class ActionResumeOperation extends ActionOperation {
    type = 3;
    events = [];

    constructor(mark="all") {
        super(mark);
    }
    onBeforeStore(s, i) {return true;}
    onResume(s, i) {/* Native Code */}
}

export default { ActionsStack, ActionOperation, ActionResumeOperation };