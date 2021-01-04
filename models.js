import React from 'react';
export function assignTypedProps(obj, propsArr, tgProps={}, options={}) {
    if(typeof obj!="object" && obj!==null) throw "Current object must be an not empty object";
    if(typeof tgProps!="object" && tgProps!==null) throw "Target properties must be an object";
    options = Object.assign({ firstAssign:false, requireType:true, requireUndefined:false }, options);
    for(let propName of propsArr) {
        let propt = propName.split("'")[0], propn = propName.split("'")[1];
        try {
            if(typeof obj[propn]!="undefined" || !options.firstAssign) {
                if(typeof tgProps[propn]!="undefined") {
                    switch(propt) {
                        case "f":
                            if(typeof tgProps[propn]=="function") obj[propn] = tgProps[propn].bind(obj); else { if(options.requireType) throw "functon"; else obj[propn] = null; }
                        break;
                        case "a":
                            if(Array.isArray(tgProps[propn])) obj[propn] = tgProps[propn]; else { if(options.requireType) throw "array"; else obj[propn] = new Array(); }
                        break;
                        case "s":
                            if(typeof tgProps[propn]=="string") obj[propn] = tgProps[propn]; else { if(options.requireType) throw "string"; else obj[propn] = tgProps[propn].toString(); }
                        break;
                        case "n":
                            if(typeof tgProps[propn]=="number") obj[propn] = tgProps[propn]; else throw "number";
                        break;
                        case "fl":
                            if(Number(tgProps[propn]) === tgProps[propn] && tgProps[propn] % 1 !== 0) obj[propn] = tgProps[propn]; else throw "float";
                        break;
                        case "d":
                            if(Number(tgProps[propn]) === tgProps[propn] && tgProps[propn] % 1 === 0) obj[propn] = tgProps[propn]; else throw "decimal";
                        break;
                        case "b":
                            if(typeof tgProps[propn]=="boolean") obj[propn] = tgProps[propn]; else throw "boolean";
                        break;
                        case "o":
                            if(typeof tgProps[propn]=="number") obj[propn] = tgProps[propn]; else throw "number";
                        break;
                        case "c":
                            if(React.isValidElement(tgProps[propn])) obj[propn] = tgProps[propn]; else throw "react.element";
                        break;
                    }
                } else if(options.requireUndefined) throw "Undefined";
            } else throw "soc";
        } catch(PropertyAssertingError) {
            console.error(`Instance ${obj.constructor.name} requires property ${propn} as type ${propt}, actual invaild type is ${typeof tgProps[propn]}`);
        }
    }
}