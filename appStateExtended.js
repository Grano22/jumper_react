import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { JSONSafteyParse } from './dataProcessing';
import { basicHashString, cyrb53 } from './cryptography';
import { Console, JumperError } from 'jumper';
/*  Jumper Diagnostic Extension 
    Version: 0.1

*/
function microtime(getAsFloat) {
    var s, now, multiplier;
    if(typeof performance !== 'undefined' && performance.now) {
        if(typeof performance.timeOrigin!="undefined") now = (performance.now() + parseFloat(performance.timeOrigin)) / 1000; else now = (performance.now() + parseFloat(performance.timing.navigationStart)) / 1000;
        multiplier = 1e6;
    }
    else {
        now = (Date.now ? Date.now() : new Date().getTime()) / 1000;
        multiplier = 1e3;
    }
    if(getAsFloat) return now;
    s = now | 0;
    return (Math.round((now - s) * multiplier ) / multiplier ) + ' ' + s;
}
function sizeOf(obj) {
    let bytes = 0;
    if(obj === null && obj === undefined) return -1; 
        switch(typeof obj) {
            case 'number':
                bytes += 8; break;
            case 'string':
                bytes += obj.length * 2; break;
            case 'boolean':
                bytes += 4; break;
            case 'object':
                var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if(objClass === 'Object' || objClass === 'Array') {
                    for(var key in obj) {
                        if(!obj.hasOwnProperty(key)) continue;
                        bytes += sizeOf(obj[key]);
                    }
                } else bytes += obj.toString().length * 2;
                break;
        }
    return bytes;
}
function formatByteSize(bytes) {
    if(bytes < 1024) return bytes + " bytes";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
    else return(bytes / 1073741824).toFixed(3) + " GiB";
};

export class JumperToolbar extends Component {
    totalMemoryFillment = 0;
    loadingLibraryTime = 0;
    get sessionRestoringDataTime() {return this.currentContext.restoredMemoryTime;}
    totalExectuionActionsTime = 0;
    executionActionsTime = [];

    currentContext = null;

    get registeredActionsNamespaces() {return this.currentContext.namespaceRange.map(v=>(<>{v.prototype.constructor.name},<br/></>))}

    currentStyle = `
    #jumper_toolbar_debuger {
        position: fixed;
        z-index: 99999999;
        bottom: 0; left: 0;
        border-top: 1px solid #fff;
        background: #333333;
        width: 100%;
        height: 78px;
        color: #e0e0e0;
        transition: 0.3s ease-out;
    }
    #jumper_toolbar_debuger.hidden {
        opacity: 0.5;
        transform: translateX(calc(100% - 72px));
        transition: 0.3s ease-in;
    }
    #jumper_toolbar_debuger > span {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        margin-right: 10px;
        padding: 5px;
        cursor: pointer;
    }
    #jumper_toolbar_debuger > span:hover { background: #454545; }
    #jumper_toolbar_debuger > span i {
        font-size: 25px;
        font-style: normal;
    }
    .jumper_shadow_box {
        position: absolute;
        background: #4a4a4a;
        
        padding: 7px 12px;
        bottom: -100%;
        z-index: -1;
        opacity: 0;
        transition: 0.3s ease-out;
    }
    .jumper_shadow_box.visible {
        bottom: 55px;
        opacity: 1;
        transition: 0.3s ease-in;
    }
    .jumper-color { color: #196a36; }
    .react-color { color: #61DBFB;  }
    `;

    constructor(props) {
        super(props);
        this.currentContext = props.context;
        this.loadingLibraryTime = microtime(true) - startTime;
    }

    toggleShadowBox(evt) {
        if(evt.target.tagName=="SPAN") {
        let cont = evt.currentTarget;
        for(let chld of cont.children) {
            if(chld.classList.contains("jumper_shadow_box")) chld.classList.toggle("visible");
        }
        }
    }

    toggle(evt) {
        let currCont = evt.currentTarget.parentElement;
        currCont.classList.toggle("hidden");
    }

    render() {
    return (<><style id="jumper_toolbar_deubger_styles">{this.currentStyle}</style><div id="jumper_toolbar_debuger">
        <span onClick={(ev)=>this.toggle(ev)}>
        <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="64px" height="64px" viewBox="0 0 5120 5120" preserveAspectRatio="xMidYMid meet">
            <g id="layer101" fill="#003b00" stroke="none">
            <path d="M880 4020 l0 -150 475 0 475 0 0 -100 0 -100 -475 0 -475 0 0 -150 0 -150 363 -2 362 -3 -47 -28 c-26 -15 -74 -52 -107 -82 l-59 -55 -256 0 -256 0 0 -150 0 -150 250 0 250 0 41 -45 c23 -25 69 -63 103 -85 l61 -40 -353 0 -352 0 0 -150 0 -150 481 0 c435 0 481 -2 475 -16 -3 -9 -6 -56 -6 -105 l0 -89 -475 0 -475 0 0 -150 0 -150 583 0 c320 0 836 -1 1147 -1 311 0 805 0 1098 0 l532 1 0 150 0 150 -427 0 -428 0 -1 105 -2 105 429 0 429 0 0 150 0 150 -307 0 -306 0 59 39 c32 21 79 59 104 85 l44 46 203 0 203 0 0 150 0 150 -212 0 -213 0 -39 41 c-22 22 -69 59 -104 82 l-63 42 315 3 316 2 0 150 0 150 -425 0 -425 0 0 100 0 100 425 0 425 0 0 150 0 150 -1680 0 -1680 0 0 -150z m1628 -169 c25 -22 27 -34 9 -53 -7 -7 -34 -39 -61 -70 l-48 -58 -233 0 -232 0 -7 31 c-8 42 -8 154 1 162 3 4 128 7 277 7 250 -1 273 -2 294 -19z m776 -12 c8 -40 8 -98 0 -138 l-7 -31 -235 2 -235 3 -60 73 -60 72 23 25 23 25 272 0 273 0 6 -31z m-639 -129 c16 -16 26 -32 23 -35 -3 -4 -31 -5 -62 -3 l-56 3 26 33 c14 17 29 32 33 32 4 0 20 -13 36 -30z m-734 -377 c6 -21 20 -59 30 -85 l19 -48 -208 0 -207 0 30 24 c52 42 275 144 317 146 3 0 12 -17 19 -37z m264 -5 c-14 -24 -36 -62 -48 -86 -32 -64 -54 -55 -88 38 -16 41 -28 78 -28 83 -1 4 42 7 95 7 l95 0 -26 -42z m739 9 c11 -17 32 -56 48 -84 l30 -53 -111 0 c-104 0 -114 2 -152 27 -29 19 -58 28 -100 31 -71 5 -95 0 -143 -33 -36 -24 -44 -25 -150 -23 l-113 3 49 83 49 82 287 0 287 0 19 -33z m296 30 c0 -8 -38 -113 -50 -139 -22 -47 -44 -34 -94 52 -25 44 -46 82 -46 85 0 3 43 5 95 5 52 0 95 -2 95 -3z m205 -32 c75 -28 187 -86 225 -115 l25 -20 -202 0 -202 0 25 68 c14 37 27 73 29 80 6 18 26 15 100 -13z m-1458 -452 c-3 -10 -16 -48 -29 -85 -21 -61 -26 -68 -50 -68 -55 0 -256 90 -323 145 l-30 24 219 1 c203 0 218 -1 213 -17z m151 -5 c6 -13 27 -51 46 -85 l36 -63 -89 0 -89 0 25 68 c14 37 27 75 30 85 7 24 28 21 41 -5z m348 1 c35 -39 89 -59 156 -59 64 0 105 16 154 61 19 17 34 19 128 17 l107 -3 -48 -80 -48 -80 -296 -3 -297 -2 -46 78 c-25 43 -46 82 -46 85 0 4 49 7 108 7 98 0 111 -2 128 -21z m715 -59 c16 -41 29 -78 29 -82 0 -5 -38 -8 -85 -8 -47 0 -85 2 -85 4 0 16 94 166 102 164 6 -2 24 -37 39 -78z m484 55 c-64 -53 -267 -145 -319 -145 -20 0 -27 11 -53 85 l-30 85 216 0 216 -1 -30 -24z m-1192 -526 l69 -81 -23 -24 -23 -24 -275 2 -276 3 -3 30 c-2 17 -1 63 3 103 l7 72 226 0 227 0 68 -81z m208 64 c-5 -10 -21 -29 -35 -43 l-27 -24 -42 42 -42 42 78 0 c71 0 77 -2 68 -17z m603 1 c3 -9 6 -56 6 -105 l0 -89 -274 0 c-271 0 -275 0 -300 23 l-25 22 70 83 70 82 224 0 c194 0 224 -2 229 -16z"/>
            </g>
            <g id="layer102" fill="#196a36" stroke="none">
            <path d="M241 4353 c0 -328 -3 -623 -7 -655 l-7 -58 174 0 c96 0 184 -3 197 -6 l22 -6 0 224 c0 124 3 313 7 421 l6 197 1937 0 1937 0 6 -197 c4 -108 7 -296 7 -417 l0 -221 192 3 c106 2 193 4 193 5 3 10 -17 1285 -20 1295 -4 9 -477 12 -2324 12 l-2320 0 0 -597z"/>
            <path d="M880 4020 l0 -150 474 0 475 0 11 58 c24 115 77 194 155 228 25 11 -62 13 -542 14 l-573 0 0 -150z"/>
            <path d="M2230 4146 c110 -39 228 -111 328 -201 l53 -47 57 50 c117 101 284 200 362 215 14 2 -175 5 -420 5 l-445 2 65 -24z"/>
            <path d="M3220 4154 c19 -8 48 -27 64 -42 37 -35 84 -134 92 -194 l7 -48 428 0 429 0 0 150 0 150 -527 0 c-481 -1 -525 -2 -493 -16z"/>
            <path d="M2040 4063 c-43 -16 -85 -82 -96 -152 l-7 -41 274 0 274 1 -30 25 c-146 123 -332 198 -415 167z"/>
            <path d="M3022 4050 c-67 -24 -127 -59 -215 -124 l-69 -51 268 -3 c147 -1 269 0 271 2 3 3 -3 31 -12 62 -12 40 -29 70 -55 96 -33 34 -43 38 -86 38 -27 -1 -73 -9 -102 -20z"/>
            <path d="M880 3520 l0 -150 365 0 c365 0 366 0 413 24 26 13 84 36 130 52 80 27 83 29 77 53 -4 14 -13 58 -19 96 l-12 70 -477 3 -477 2 0 -150z"/>
            <path d="M1940 3658 c0 -17 29 -150 33 -154 2 -2 55 5 118 16 63 11 130 20 149 20 60 0 77 10 124 71 l46 59 -235 0 c-181 0 -235 -3 -235 -12z"/>
            <path d="M2501 3618 l-40 -53 74 -3 c41 -2 109 -2 151 0 l76 3 -42 53 -42 52 -68 0 -69 0 -40 -52z"/>
            <path d="M2820 3665 c0 -12 74 -106 90 -115 10 -6 33 -10 50 -10 18 0 88 -9 157 -21 68 -12 127 -18 130 -15 6 6 32 128 33 154 0 9 -52 12 -230 12 -126 0 -230 -2 -230 -5z"/>
            <path d="M3386 3658 c-5 -15 -31 -169 -31 -181 0 -5 38 -23 85 -41 47 -18 100 -40 119 -49 30 -15 73 -17 358 -17 l323 0 0 150 0 150 -425 0 c-332 0 -426 -3 -429 -12z"/>
            <path d="M2480 3452 l-105 -3 -22 -34 c-13 -19 -23 -37 -23 -40 0 -3 126 -5 281 -5 l280 0 -18 31 c-10 17 -22 34 -28 38 -12 10 -218 17 -365 13z"/>
            <path d="M2117 3419 c-60 -9 -111 -20 -114 -23 -17 -17 18 -26 102 -26 92 0 94 0 115 29 11 16 17 31 13 34 -5 2 -57 -4 -116 -14z"/>
            <path d="M2996 3401 l19 -32 97 3 c55 2 99 7 101 13 2 11 -80 30 -177 41 l-59 7 19 -32z"/>
            <path d="M880 3050 l0 -150 250 0 250 0 -21 41 c-30 60 -28 146 5 206 15 25 26 47 26 49 0 2 -115 4 -255 4 l-255 0 0 -150z"/>
            <path d="M1523 3185 c-36 -25 -83 -106 -83 -142 0 -42 13 -68 53 -110 l31 -33 220 0 221 0 28 68 c15 38 27 72 27 78 0 5 -14 42 -32 82 l-32 72 -206 0 c-165 0 -210 -3 -227 -15z"/>
            <path d="M2076 3185 c4 -8 10 -12 15 -9 14 8 10 24 -6 24 -9 0 -12 -6 -9 -15z"/>
            <path d="M2180 3120 l-40 -80 36 -70 36 -70 109 0 109 0 -19 33 c-39 69 -37 161 5 223 13 19 24 37 24 39 0 3 -49 5 -110 5 l-110 0 -40 -80z"/>
            <path d="M2797 3158 c24 -37 28 -53 28 -118 0 -55 -5 -83 -17 -103 -10 -14 -18 -29 -18 -32 0 -3 48 -4 107 -3 l107 3 35 67 36 66 -40 81 -39 81 -113 0 -113 0 27 -42z"/>
            <path d="M3110 3196 c0 -2 6 -9 14 -15 10 -9 15 -8 20 4 4 10 -1 15 -14 15 -11 0 -20 -2 -20 -4z"/>
            <path d="M3251 3178 c-5 -13 -20 -49 -34 -80 l-26 -58 31 -70 31 -70 217 0 c236 0 227 -2 275 63 48 65 31 147 -46 212 -31 25 -31 25 -235 25 -203 0 -205 0 -213 -22z"/>
            <path d="M3848 3153 c36 -64 38 -159 5 -215 l-22 -38 204 0 205 0 0 150 0 150 -209 0 -210 0 27 -47z"/>
            <path d="M880 2580 l0 -150 478 0 478 0 12 73 c6 39 14 81 17 92 5 17 -5 24 -75 48 -44 15 -108 41 -142 57 l-62 30 -353 0 -353 0 0 -150z"/>
            <path d="M2006 2714 c-3 -9 -6 -17 -6 -19 0 -5 93 -23 168 -33 34 -5 62 -6 62 -3 0 3 -9 21 -20 39 l-20 32 -89 0 c-72 0 -90 -3 -95 -16z"/>
            <path d="M2320 2725 c0 -3 12 -23 26 -45 33 -50 52 -53 302 -48 210 3 194 -1 237 71 l16 27 -290 0 c-160 0 -291 -2 -291 -5z"/>
            <path d="M3002 2694 c-13 -20 -22 -37 -20 -39 4 -3 100 11 176 26 41 8 52 14 52 30 0 17 -8 19 -92 19 l-93 0 -23 -36z"/>
            <path d="M3570 2705 c-25 -13 -84 -38 -132 -56 -49 -17 -88 -34 -88 -37 0 -8 20 -133 26 -159 l4 -23 430 0 430 0 0 150 0 150 -312 -1 c-307 -1 -314 -2 -358 -24z"/>
            <path d="M1962 2544 c-6 -27 -14 -64 -17 -81 l-7 -33 227 0 c125 0 225 3 223 8 -1 4 -18 28 -37 55 -26 35 -42 47 -60 47 -25 0 -223 31 -287 45 -31 7 -32 6 -42 -41z"/>
            <path d="M3180 2580 c-19 -5 -90 -17 -158 -26 l-122 -18 -41 -53 -40 -53 226 0 225 0 -1 28 c-2 54 -24 127 -39 128 -8 1 -31 -2 -50 -6z"/>
            <path d="M2460 2524 c0 -4 16 -27 36 -50 l35 -44 78 0 78 0 29 38 c53 66 60 62 -105 62 -83 0 -151 -3 -151 -6z"/>
            <path d="M880 2070 l0 -150 568 0 c479 1 562 3 537 14 -68 30 -125 118 -144 221 -6 32 -11 60 -11 62 0 2 -214 3 -475 3 l-475 0 0 -150z"/>
            <path d="M1943 2175 c9 -63 42 -122 79 -141 43 -22 136 -14 209 19 56 25 169 96 224 142 l30 25 -274 0 -274 0 6 -45z"/>
            <path d="M2770 2189 c103 -89 241 -161 330 -174 85 -11 148 48 169 159 l8 46 -271 0 -271 -1 35 -30z"/>
            <path d="M3376 2179 c-18 -111 -71 -205 -135 -239 -36 -19 -33 -19 482 -20 l517 0 0 150 0 150 -429 0 -428 0 -7 -41z"/>
            <path d="M2560 2149 c-103 -93 -231 -173 -335 -210 -49 -17 -45 -18 375 -18 359 0 420 2 390 13 -103 38 -272 149 -344 225 -17 17 -32 31 -35 31 -3 -1 -26 -19 -51 -41z"/>
            <path d="M207 1833 c-3 -4 -8 -67 -12 -140 l-7 -131 43 -6 c24 -3 107 -10 184 -16 159 -11 817 -60 1600 -120 753 -57 1475 -110 1496 -110 24 0 27 14 34 160 l7 125 -463 34 c-255 18 -480 34 -499 36 -19 2 -132 10 -250 19 -214 16 -392 30 -545 42 -120 9 -152 12 -245 18 -47 4 -112 9 -145 11 -131 11 -1035 77 -1112 81 -44 3 -83 2 -86 -3z"/>
            <path d="M3255 1126 c-852 -321 -1550 -587 -1552 -592 -2 -5 19 -67 46 -139 37 -98 53 -129 65 -127 24 4 3110 1163 3118 1171 4 4 -14 65 -41 136 -37 99 -53 130 -67 132 -11 1 -716 -260 -1569 -581z"/>
            </g></svg>
        </span>
        <span onClick={(ev)=>this.toggleShadowBox(ev)}>
            <span className="jumper-color">{ActionsStack.version}</span> | <span className="react-color">{React.version}</span>
            <div className="jumper_shadow_box">
            <strong>Wersja React</strong>: {React.version}<br/>
            <strong>Wersja Jumper.React</strong>: {ActionsStack.version}
            </div>
        </span>
        <span onClick={(ev)=>this.toggleShadowBox(ev)}>
            Komponent: {this.currentContext.component.constructor.name}
            <div className="jumper_shadow_box">
                {this.registeredActionsNamespaces}
            </div>
        </span>
        <span onClick={(ev)=>this.toggleShadowBox(ev)}>
            {this.loadingLibraryTime.toFixed(3)}ms
            <div className="jumper_shadow_box">
                <strong>Czas ładowania biblioteki: </strong> {this.loadingLibraryTime.toFixed(3)}ms<br/>
                <strong>Czas ładowania danych z pamięci sesji: </strong> {this.sessionRestoringDataTime.toFixed(3)}ms
            </div>
        </span>
        <span>
            <i>&#x29D7;</i>
        </span>
        <span>
            <i>&#171;</i>
        </span>
        <span>
            <i>&#187;</i>
        </span>
        <span>
            <i>&#x2608;</i>
        </span>
        <span>
            <i>&#9735;</i>
        </span>
        <span>
            <i>&#9746;</i>
        </span>
        <span>
            <i>&#x26A0;</i>
        </span>
    </div></>);
    }
}

/* END Jumper Diagnostic Extension */

var startTime = microtime(true);

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

    errorsStack = new Array(); //window.globalLogsHandler.traceLocalStack();

    namespaceRange = new Array();

    lastAction = "";
    stackHistorySize = 20;
    stackRestoredSize = 20;
    //options = {};

    //Measuring
    restoredMemoryTime = -1;

    constructor(component, inArr, options={stackSize:20, debug:false, loadResumeable:true}) {
        this.component = component;
        if(typeof this.component.state=="undefined") this.component.state = {};
        this.stackSize = options.stackSize;
        this.setOperationsNamespace(inArr);
        if(options.loadResumeable) this.restoredMemoryTime = this.restoreStacksSessions();
        function onBeforePageUnload() {
            this.saveStacksSessions();
        }
        window.addEventListener("beforeunload", onBeforePageUnload.bind(this));
        //Toolbar
        if(document.getElementById("jumper-debuger-container")==null) {
        let debugContainer = document.createElement("div");
        debugContainer.id = "jumper-debuger-container";
        document.body.appendChild(debugContainer);
        ReactDOM.render(<JumperToolbar context={this}/>, debugContainer);
        if(typeof component.componentWillUnmount!="undefined") { let callback = component.componentWillUnmount.bind(component); component.componentWillUnmount = function() { callback(); debugContainer.remove(); } } else component.componentWillUnmount = function() { /*ReactDOM.unmountComponentAtNode();*/ debugContainer.remove(); }
        }
        //END Toolbar
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
    addOperation(newOperation, inputData = {}) {
        try {
            this.lastAction = "addOperation";
            if(!this.namespaceRange.map(v=>v.prototype.constructor.name).includes(newOperation.constructor.name)) throw "Unexpected Action class, use one of registered: "+this.namespaceRange.map(v=>v.prototype.constructor.name).join(",");
            newOperation.inputData = inputData;
            newOperation.lastInputData = inputData;
            let matchRes = newOperation.name.match(/\$\{(\w\d?)+\}/g);
            if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.name.replace(matchRes[matchRe], inputData[wd]); } }
            let outCpt = newOperation.onStore(this.component, inputData, newOperation.outputData) || {};
            matchRes = newOperation.name.match(/\#\{(\w\d?)+\}/g);
            if(matchRes!=null) { for(let matchRe in matchRes) { let wd = matchRes[matchRe].substring(0, matchRes[matchRe].length - 2).substring(0, 2); newOperation.name.replace(matchRes[matchRe], outCpt[wd]); } }
            this.operationsHistoryStack.push(newOperation);
            if(this.operationsHistoryStack.length>=this.stackSize) this.operationsHistoryStack.shift();
            this.component.setState(Object.assign(outCpt, {actionHandler:this.dump()}));
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
    setTypeRange() {

    }
    defineCustomInitialData() {

    }
    saveComponentProps() {

    }
    saveComponentState() {

    }
    saveStacksSessions() {
        let accessHash = this.component.constructor.name+"#"+cyrb53(this.component.constructor.toString());
        window.sessionStorage.setItem("jumper_c_"+accessHash, this.toString());
        let hl = "", rl = "";
        for(let ha in this.operationsHistoryStack) { if(this.operationsHistoryStack[ha].type==3) { hl += this.operationsHistoryStack[ha].toString().replace(/\&/g, "\\&"); if(ha!=this.operationsHistoryStack.length - 1) hl += "&"; } }
        window.sessionStorage.setItem("jumper_sh_"+accessHash, hl);
        for(let ra in this.operationsRestoredStack) { if(this.operationsHistoryStack[ra].type==3) { rl += this.operationsRestoredStack[ra].toString().replace(/\&/g, "\\&"); if(ra!=this.operationsRestoredStack.length - 1) rl += "&"; } }
        window.sessionStorage.setItem("jumper_sr_"+accessHash, rl);
    }
    restoreStacksSessions() {
        var startActionsRestoringTime = microtime(true);
        let resActions = null, accessHash = this.component.constructor.name+"#"+cyrb53(this.component.constructor.toString());
        if(resActions = window.sessionStorage.getItem("jumper_c_"+accessHash)!=null) {
            try {
            this.lastAction = "operationsLoad";
            resActions = splitByParsing(resActions, ";", "/");
            let jumperS1 = window.sessionStorage.getItem("jumper_sh_"+accessHash);
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
            let jumperS2 = window.sessionStorage.getItem("jumper_sr_"+accessHash);
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
                this.addError(e, 0, "");
            }
            
        }
        return microtime(true) - startActionsRestoringTime;
    }
    toString() { return `${cyrb53(this.component.constructor.toString())}h;${cyrb53(this.component.constructor.toString())}r;${this.lastAction}`; }
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
    requires = [];

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
    toString() {
        return `${this.constructor.name};${this.creationDate.toISOString().slice(0, 19).replace('T', ' ')};${this.updateDate.toISOString().slice(0, 19).replace('T', ' ')};${JSON.stringify(this.outputData)};${JSON.stringify(this.lastInputData)}`;
    }
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

export class TemponaryActionOperation extends ActionOperation {
    type = 4;

    constructor() {

    }
    
    update() {

    }

    updateTo() {

    }

    onReject() {/* Native Code */}
}

export default { ActionsStack, ActionOperation, ActionResumeOperation, TemponaryActionOperation };