/* Jumper | Components Module | Grano22 Dev */
import React, {Component} from 'react';
import { RawHTML } from 'react-dom';
import { format } from './dataProcessing';

//parse HTML string to Native Elements
export function parseHTMLComponent(htmlStr, allowedTags=[], allowed=true) {
    try {
        let parsedElements = [], charMetrices = "", inHTMLChar = 0, lastTag = { attrs:{} }, inAttr = false;
        if(allowedTags.length>0) var completeTags = "";
        for(let htmlChar=0;htmlChar<htmlStr.length;htmlChar++) {
            try {
                if(allowedTags.length>0 && inHTMLChar>0) completeTags += htmlStr[htmlChar];
                if(inHTMLChar<=0 && htmlStr[htmlChar]=="<" && htmlStr[parseInt(htmlChar + 1)].trim()!="") {
                    if(charMetrices!="") parsedElements.push(document.createTextNode(charMetrices));
                    charMetrices = "";
                    inHTMLChar = 1;
                } else if(inHTMLChar==2 && inAttr && htmlStr[htmlChar]=='"') {
                    charMetrices = charMetrices.trimStart().trimLeft();
                    let attrName, attrVal;
                        attrName = charMetrices.split("=");
                        attrVal = attrName[1];
                        attrName = attrName[0];
                        lastTag.attrs[attrName] = attrVal;
                        charMetrices = "";
                        inAttr = false;
                        if(htmlStr[htmlChar]==">") inHTMLChar = 3;
                        else if(htmlStr[htmlChar]=="/") {
                            parsedElements.push(React.createElement(lastTag.tagName, lastTag.attrs, []));
                            inHTMLChar = 0;
                            htmlChar += 2;
                            lastTag = { attrs:{} };
                        }
                } else if(charMetrices.trim()!="" && !inAttr && inHTMLChar==2 && (htmlStr[parseInt(htmlChar)].trim()=="" || htmlStr[htmlChar]==">" || (htmlStr[htmlChar]=="/" && htmlStr[parseInt(htmlChar) + 1]==">")) && htmlStr[parseInt(htmlChar) - 1].trim()!="") {
                    charMetrices = charMetrices.trim();
                    lastTag.attrs[charMetrices] = true;
                    charMetrices = "";
                    if(htmlStr[htmlChar]==">") inHTMLChar = 3;
                    else if(htmlStr[htmlChar]=="/") {
                        let compactEl = document.createElement(lastTag.tagName);
                        for(let attr in lastTag.attrs) compactEl.setAttribute(attr, lastTag.attrs[attr]);
                        parsedElements.push(compactEl);
                        inHTMLChar = 0;
                        htmlChar += 2;
                        lastTag = { attrs:{} };
                    }
                } else if(!inAttr && inHTMLChar==2 && htmlStr[htmlChar]=='"') {
                    if(htmlStr[htmlChar - 1]=="=") inAttr = true; else throw "^Attribute hasn't equaled or enclosed "+charMetrices;
                } else if(inHTMLChar==2 && htmlStr[htmlChar]==">") {
                    inHTMLChar = 3;
                } else if(inHTMLChar==1 && (htmlStr[parseInt(htmlChar)].trim()=="" || htmlStr[htmlChar]==">")) {
                    if(htmlStr[htmlChar]==">") inHTMLChar = 3; else inHTMLChar = 2;
                    lastTag.tagName = charMetrices;
                    charMetrices = "";
                } else if(inHTMLChar==3 && htmlStr[htmlChar]=="<" && htmlStr[parseInt(htmlChar) + 1]=="/" && htmlStr.substr(htmlChar, lastTag.tagName.length + 3)==="</"+lastTag.tagName+">") {
                    lastTag.children = [];
                    lastTag.textContent = charMetrices;
                    if((allowed && (allowedTags.length<=0 || allowedTags.includes(lastTag.tagName))) || (!allowed && (allowedTags.length<=0 || !allowedTags.includes(lastTag.tagName)))) {
                        let compactEl = document.createElement(lastTag.tagName);
                        for(let attr in lastTag.attrs) compactEl.setAttribute(attr, lastTag.attrs[attr]);
                        if(Array.isArray(lastTag.children)) { for(let child in lastTag.children) compactEl.appendChild(lastTag.children[child]); } else if(lastTag.children instanceof HTMLElement || lastTag.children instanceof Text) compactEl.appendChild(lastTag.children); else throw "Tag child must be an array of child or HTMLElement or Text";
                        parsedElements.push(compactEl);
                    } else if((!allowed && (allowedTags.length<=0 || allowedTags.includes(lastTag.tagName))) || allowed) {
                        parsedElements.push(document.createTextNode("<"+completeTags+"/"+lastTag.tagName+">"));
                    }
                    inHTMLChar = 0;
                    htmlChar += lastTag.tagName.length + 2;
                    lastTag = { attrs:{} };
                    charMetrices = "";
                    if(allowedTags.length>0) completeTags = "";
                } else if((inHTMLChar==1 || inHTMLChar==2) && htmlStr[htmlChar]=="/" && htmlStr[parseInt(htmlChar) + 1]==">") {
                    if((allowed && (allowedTags.length<=0 || allowedTags.includes(lastTag.tagName))) || (!allowed && (allowedTags.length<=0 || !allowedTags.includes(lastTag.tagName)))) {
                        let compactEl = document.createElement(lastTag.tagName);
                        for(let attr in lastTag.attrs) compactEl.setAttribute(attr, lastTag.attrs[attr]);
                        parsedElements.push(compactEl);
                    } else if((!allowed && (allowedTags.length<=0 || allowedTags.includes(lastTag.tagName))) || allowed) {
                        parsedElements.push(document.createTextNode("<"+completeTags+">"));
                    }
                    inHTMLChar = 0;
                    htmlChar += 2;
                    lastTag = { attrs:{} };
                } else if(htmlStr.length - 1==parseInt(htmlChar)) {
                    if(inHTMLChar>0) throw "^Tag hasn't closed, please close specified tag "+lastTag.tagName; else if(charMetrices!="") {
                        charMetrices += htmlStr[htmlChar];
                        parsedElements.push(document.createTextNode(charMetrices));
                    }
                } else charMetrices += htmlStr[htmlChar];
            } catch(PartialParseError) {
                if(PartialParseError.indexOf("^")==0) throw PartialParseError;
                console.error(PartialParseError, htmlChar);
            }
        }
        return parsedElements.length>1 ? parsedElements : parsedElements[0];
    } catch(ParseError) {
        if(ParseError.indexOf("^")==0) ParseError = ParseError.replace("^", "");
        console.error(ParseError);
        return document.createTextNode("[Object error]");
    }
}

//Parse HTML string to React Component
export function parseHTMLReactComponent(htmlStr, allowedTags=[], allowed=true) {
    try {
        let parsedElements = [], charMetrices = "", inHTMLChar = 0, lastTag = { attrs:{} }, inAttr = false;
        if(allowedTags.length>0) var completeTags = "";
        for(let htmlChar=0;htmlChar<htmlStr.length;htmlChar++) {
            try {
                if(allowedTags.length>0 && inHTMLChar>0) completeTags += htmlStr[htmlChar];
                if(inHTMLChar<=0 && htmlStr[htmlChar]=="<" && htmlStr[parseInt(htmlChar + 1)].trim()!="") {
                    if(charMetrices!="") parsedElements.push(React.createElement(React.Fragment, {}, [charMetrices]));
                    charMetrices = "";
                    inHTMLChar = 1;
                } else if(inHTMLChar==2 && inAttr && htmlStr[htmlChar]=='"') {
                    charMetrices = charMetrices.trimStart().trimLeft();
                    let attrName, attrVal;
                        attrName = charMetrices.split("=");
                        attrVal = attrName[1];
                        attrName = attrName[0];
                        if(attrName=="style") {
                            let entries = attrVal.split(";"), tempProps = {}, params = [];
                            for(let entry in entries) {
                                params = entries[entry].split(":");
                                while(params[0].indexOf("-")>-1) { if(true || params[0].indexOf("-")>0) { params[0] = params[0].split(""); params[0][params[0].indexOf("-") + 1] = params[0][params[0].indexOf("-") + 1].toUpperCase(); params[0] = params[0].join(""); } params[0] = params[0].replace("-", ""); }
                                tempProps[params[0]] = params[1];
                            }
                            attrVal = tempProps;
                        }
                        lastTag.attrs[attrName] = attrVal;
                        charMetrices = "";
                        inAttr = false;
                        if(htmlStr[htmlChar]==">") inHTMLChar = 3;
                        else if(htmlStr[htmlChar]=="/") {
                            parsedElements.push(React.createElement(lastTag.tagName, lastTag.attrs, []));
                            inHTMLChar = 0;
                            htmlChar += 2;
                            lastTag = { attrs:{} };
                        }
                } else if(charMetrices.trim()!="" && !inAttr && inHTMLChar==2 && (htmlStr[parseInt(htmlChar)].trim()=="" || htmlStr[htmlChar]==">" || (htmlStr[htmlChar]=="/" && htmlStr[parseInt(htmlChar) + 1]==">")) && htmlStr[parseInt(htmlChar) - 1].trim()!="") {
                    charMetrices = charMetrices.trim();
                    lastTag.attrs[charMetrices] = true;
                    charMetrices = "";
                    if(htmlStr[htmlChar]==">") inHTMLChar = 3;
                    else if(htmlStr[htmlChar]=="/") {
                        parsedElements.push(React.createElement(lastTag.tagName, lastTag.attrs, []));
                        inHTMLChar = 0;
                        htmlChar += 2;
                        lastTag = { attrs:{} };
                    }
                } else if(!inAttr && inHTMLChar==2 && htmlStr[htmlChar]=='"') {
                    if(htmlStr[htmlChar - 1]=="=") inAttr = true; else throw "^Attribute hasn't equaled or enclosed "+charMetrices;
                } else if(inHTMLChar==2 && htmlStr[htmlChar]==">") {
                    inHTMLChar = 3;
                } else if(inHTMLChar==1 && (htmlStr[parseInt(htmlChar)].trim()=="" || htmlStr[htmlChar]==">")) {
                    if(htmlStr[htmlChar]==">") inHTMLChar = 3; else inHTMLChar = 2;
                    lastTag.tagName = charMetrices;
                    charMetrices = "";
                } else if(inHTMLChar==3 && htmlStr[htmlChar]=="<" && htmlStr[parseInt(htmlChar) + 1]=="/" && htmlStr.substr(htmlChar, lastTag.tagName.length + 3)==="</"+lastTag.tagName+">") {
                    lastTag.children = [];
                    lastTag.textContent = charMetrices;
                    if((allowed && (allowedTags.length<=0 || allowedTags.includes(lastTag.tagName))) || (!allowed && (allowedTags.length<=0 || !allowedTags.includes(lastTag.tagName)))) {
                        if(charMetrices!="") lastTag.children = parseHTMLReactComponent(lastTag.textContent);
                        parsedElements.push(React.createElement(lastTag.tagName, lastTag.attrs, Array.isArray(lastTag.children) ? lastTag.children : [lastTag.children]));
                    } else if((!allowed && (allowedTags.length<=0 || allowedTags.includes(lastTag.tagName))) || allowed) {
                        parsedElements.push(React.createElement(React.Fragment, {}, ["<"+completeTags+"/"+lastTag.tagName+">"]));
                    }
                    inHTMLChar = 0;
                    htmlChar += lastTag.tagName.length + 2;
                    lastTag = { attrs:{} };
                    charMetrices = "";
                    if(allowedTags.length>0) completeTags = "";
                } else if((inHTMLChar==1 || inHTMLChar==2) && htmlStr[htmlChar]=="/" && htmlStr[parseInt(htmlChar) + 1]==">") {
                    if((allowed && (allowedTags.length<=0 || allowedTags.includes(lastTag.tagName))) || (!allowed && (allowedTags.length<=0 || !allowedTags.includes(lastTag.tagName)))) {
                        parsedElements.push(React.createElement(lastTag.tagName, lastTag.attrs));
                    } else if((!allowed && (allowedTags.length<=0 || allowedTags.includes(lastTag.tagName))) || allowed) {
                        parsedElements.push(React.createElement(React.Fragment, {}, ["<"+completeTags+">"]));
                    }
                    inHTMLChar = 0;
                    htmlChar += 2;
                    lastTag = { attrs:{} };
                } else if(htmlStr.length - 1==parseInt(htmlChar)) {
                    if(inHTMLChar>0) throw "^Tag hasn't closed, please close specified tag "+lastTag.tagName; else if(charMetrices!="") {
                        charMetrices += htmlStr[htmlChar];
                        parsedElements.push(React.createElement(React.Fragment, {}, [charMetrices]));
                    }
                } else charMetrices += htmlStr[htmlChar];
            } catch(PartialParseError) {
                if(PartialParseError.indexOf("^")==0) throw PartialParseError;
                console.error(PartialParseError, htmlChar);
            }
        }
        return parsedElements.length>1 ? parsedElements : parsedElements[0];
    } catch(ParseError) {
        if(ParseError.indexOf("^")==0) ParseError = ParseError.replace("^", "");
        console.error(ParseError);
        return React.createElement(React.Fragment, {}, ["[Object error]"])
    }
}

export var HTMLReactParser = new class {
    constructor() {

    }

    parse() {

    }
}

export default class Widget extends Component {
    structure = "";
    params = "";

    constructor(props, typesPrep) {
        super(props);
        let self = this;
        if(typeof props.structure!="undefined") self.structure = props.structure;
        if(typeof props.childProps!="undefined") self.childProps = props.childProps;
        typesPrep.forEach((propName)=>{
            let propt = propName.split("'")[0], propn = propName.split("'")[1];
            try {
            if(typeof props[propn]!="undefined") {
            switch(propt) {
                case "f":
                    if(typeof props[propn]=="function") this[propn] = props[propn].bind(this); else throw "functon";
                break;
                case "a":
                    if(Array.isArray(props[propn])) this[propn] = props[propn]; else throw "array";
                break;
                case "s":
                    if(typeof props[propn]=="string") this[propn] = props[propn]; else throw "string";
                break;
                case "n":
                    if(typeof props[propn]=="number") this[propn] = props[propn]; else throw "number";
                break;
                case "b":
                    if(typeof props[propn]=="boolean") this[propn] = props[propn]; else throw "boolean";
                break;
                case "o":
                    if(typeof props[propn]=="number") this[propn] = props[propn]; else throw "number";
                break;
                case "c":
                    if(React.isValidElement(self.outputList)) this[propn] = props[propn]; else throw "react.element";
                break;
            }
            }
            } catch(PropertyAssertingError) {
                console.error(`Instance ${self.costructor.name} requires property ${propn} as type ${propt}, actual invaild type is ${typeof props[propn]}`);
            }
        });
    }

    prepareOutput(strHTML, params) {
        return parseHTMLReactComponent(format(strHTML, params));
    }

    prepare() {
        return this.preparedOutput(this.structure || "", this.params || null);
    }

    output() {
        try { 
        let preparedOutput = this.prepare();
        console.log(preparedOutput);
        if(React.isValidElement(preparedOutput)) return preparedOutput;
        else if(Array.isArray(preparedOutput)) {
            let combinedArray = [];
            for(let prepItem in preparedOutput) {
                    if(React.isValidElement(preparedOutput[prepItem])) combinedArray.push(preparedOutput[prepItem]);
                    else if(typeof preparedOutput[prepItem]=="object" && typeof preparedOutput[prepItem].render!="undefined") combinedArray.push(preparedOutput[prepItem].render());
            }
            return preparedOutput;
        } else if(typeof preparedOutput=="object" && typeof preparedOutput.render!="undefined") return preparedOutput.render();
        } catch(OutputPreparationError) {
            console.error(OutputPreparationError);
            return (<></>);
        }
    }
}

export class ListWidget extends Widget {
    constructor(props, typesPrep) {
        super(props, typesPrep);
       
    }


}

/*module.export = {
    parseHTMLComponent:parseHTMLComponent,
    parseHTMLReactComponent:parseHTMLReactComponent,
    Widget:Widget
}*/