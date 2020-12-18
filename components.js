/* Jumper | Components Module */
import React, {Component} from 'react';

export default class Widget extends Component {
    constructor(props, typesPrep) {
        super(props);
        let self = this;
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

    prepare() {

    }

    output() {
        try { 
        let preparedOutput = this.prepare();
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