/* Jumper Library by Grano22 | v 1.0 | React */
import { basicHashString } from './Cryptography';

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

export const ActionsErrors = [
    "memoryLeaks",

];

export class ActionError {


    constructor(desc) {
        this.description = desc;
    }

    toString() {

    }
}

export class ActionsStack {
    component = null;
    operationsHistoryStack = new Array();
    operationsRestoredStack = new Array();

    errorsStack = new Array(); //window.globalLogsHandler.traceLocalStack();

    namespaceRange = new Array();

    lastAction = "";
    stackHistorySize = 20;
    stackRestoredSize = 20;
    //options = {};

    constructor(component, inArr, loadResumeable=true, options={stackSize:20}) {
        this.component = component;
        this.stackSize = options.stackSize;
        this.setOperationsNamespace(inArr);
        let resActions = null, accessHash = this.component.constructor.name+"#"+basicHashString(this.component.constructor.toString());
        if(loadResumeable && (resActions = window.sessionStorage.getItem("jumper_c_"+accessHash)!=null)) {
            try {
            this.lastAction = "operationsLoad";
            resActions = resActions.split(";");
            let jumperS1 = window.sessionStorage.getItem("jumper_sh_"+accessHash);
            if(jumperS1!=null) {
                jumperS1 = splitByParsing(jumperS1, "&", "/");
                let outCpt = {};
                for(let onceRes in jumperS1) {
                    if(this.stackHistorySize>=this.operationsHistoryStack.length) {
                    let jumperAParams = splitByParsing(jumperS1[onceRes], ";", "/"), jumperA = new window[jumperAParams[0]]; 
                    let cd = jumperAParams[1].split(/[- :]/);
                    jumperA.creationDate = new Date(Date.UTC(cd[0], cd[1]-1, cd[2], cd[3], cd[4], cd[5]));
                    let ud = jumperAParams[2].split(/[- :]/);
                    jumperA.updateDate = new Date(Date.UTC(ud[0], ud[1]-1, ud[2], ud[3], ud[4], ud[5]));
                    jumperA.outputData = JSON.parse(jumperAParams[3]) || {};
                    jumperA.lastInputData = JSON.parse(jumperAParams[4]) || {};
                    outCpt = jumperA.onStore(this.component, jumperA.lastInputData, jumperA.outputData) || {};
                    this.operationsHistoryStack.push(jumperA);
                    jumperA.onResume(this.component, jumperA.lastInputData);
                    
                    }
                }
                this.component.setState(Object.assign(outCpt, {actionHandler:this.dump()}));
            }
            let jumperS2 = window.sessionStorage.getItem("jumper_sr_"+accessHash);
            if(jumperS2!=null) {
                jumperS2 = splitByParsing(jumperS2, "&", "/");
                let outCpt = {};
                for(let onceRes in jumperS2) {
                    if(this.stackRestoredSize>=this.operationsRestoredStack.length) {
                    let jumperAParams = splitByParsing(jumperS2[onceRes], ";", "/"), jumperA = new window[jumperAParams[0]];
                    let cd = jumperAParams[1].split(/[- :]/);
                    jumperA.creationDate = new Date(Date.UTC(cd[0], cd[1]-1, cd[2], cd[3], cd[4], cd[5]));
                    let ud = jumperAParams[2].split(/[- :]/);
                    jumperA.updateDate = new Date(Date.UTC(ud[0], ud[1]-1, ud[2], ud[3], ud[4], ud[5]));
                    jumperA.outputData = JSON.parse(jumperAParams[3]) || {};
                    jumperA.lastInputData = JSON.parse(jumperAParams[4]) || {};
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
            function onBeforePageUnload() {
                this.saveStacksSessions();
            }
            window.addEventListener("beforeunload", onBeforePageUnload.bind(this));
        }
    }
    addError(newErr) {
        this.errorsStack.push(newErr);
        console.error(newErr);
    }
    setOperationsNamespace(inArr) {
        if(!Array.isArray(inArr)) { this.addError(new ActionError("Invaild input, array expected", 0, "")); return this; }
        for(let classAction of inArr) this.namespaceRange.push(classAction.prototype.constructor.name); //.prototype.constructor.name
        return this;
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
    addOperation(newOperation, inputData = {}) {
        try {
            this.lastAction = "addOperation";
            if(!this.namespaceRange.includes(newOperation.constructor.name)) throw "Unexpected Action class, use one of registered: "+this.namespaceRange.join(",");
            newOperation.inputData = inputData;
            let outCpt = newOperation.onStore(this.component, inputData, newOperation.outputData) || {};
            this.operationsHistoryStack.push(newOperation);
            if(this.operationsHistoryStack.length>=this.stackSize) this.operationsHistoryStack.shift();
            this.component.setState(Object.assign(outCpt, {actionHandler:this.dump()}));
        } catch(e) {
            console.error(e);
        }
    }
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
    setTypeRange() {

    }
    saveStacksSessions() {
        let accessHash = this.component.constructor.name+"#"+basicHashString(this.component.constructor.toString());
        window.sessionStorage.setItem("jumper_c_"+accessHash, this.toString());
        let hl = "", rl = "";
        for(let ha in this.operationsHistoryStack) { if(this.operationsHistoryStack[ha].type==3) { hl += this.operationsHistoryStack[ha].toString().replace(/\&/g, "\\&"); if(ha!=this.operationsHistoryStack.length - 1) hl += "&"; } }
        window.sessionStorage.setItem("jumper_sh_"+accessHash, hl);
        for(let ra in this.operationsRestoredStack) { if(this.operationsHistoryStack[ra].type==3) { rl += this.operationsRestoredStack[ra].toString().replace(/\&/g, "\\&"); if(ra!=this.operationsRestoredStack.length - 1) rl += "&"; } }
        window.sessionStorage.setItem("jumper_sr_"+accessHash, rl);
    }
    toString() { return `${basicHashString(this.component.constructor.toString())}h;${basicHashString(this.component.constructor.toString())}r;${this.lastAction}`; }
    dump() { return `${this.lastAction}`; }
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
    toString() {return `${this.constructor.name};${this.creationDate.toISOString().slice(0, 19).replace('T', ' ')};${this.updateDate.toISOString().slice(0, 19).replace('T', ' ')};${JSON.stringify(this.outputData)};${JSON.stringify(this.inputData)}`;}
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
    onResume(s, i) {/* Native Code */}
}

export default { ActionsStack, ActionOperation, ActionResumeOperation };