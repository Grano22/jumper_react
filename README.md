# Jumper package &middot; [![Github license](https://img.shields.io/badge/license-MIT-blue.svg)](void) &middot; [![npm version](https://img.shields.io/npm/v/react.svg?style=flat)](https://www.npmjs.com/package/jumper_react)
## Description
Last Version: 0.1.12
Modules:
0. jumper_react (Base module)
    * Console
    * Memory (Browser Storage)
    * Browser
1. jumper_react/appState (Module for application state managment)
2. jumper_react/appStateExtended (Module for application state managment - extended with developers tools only recommend during development)
3. jumper_react/components (Components tools)
    * parseHTMLComponent
    * parseHTMLReactComponent
    * HTMLReactParser (OOP of parseHTMLReactComponent, comming soon)
    * Widget
4. jumper_react/cryptography (Crypto algorythms module)
    * basicHashString
    * cyrb53
    * md5
5. jumper_react/dataProcessing (Data tools module)
6. jumper_react/languageDescriptor (Language translation module)
7. jumper_react/models (Models module)
8. jumper_react/service (Services and network tools module)
    * 
9. jumper_react/performance (Performance tools module)
10. jumper_react/strUtils (String utilities module)
    * format
11. jumper_react/langUtils (Javascript language utilities module)
12. jumper_react/experimental (Experimental module)

![Jumper.react Logo](https://imgur.com/5oximLW.png)

## Important classes

### ActionsStack
1. component : React.Component - target Component to initialize
2. inArr : Array<ActionOperation | ...> - operations namespaces
3. options={stackSize:20, debug:false, loadResumeable:true} : any - options to configure

in component file:
```javascript
import React, { Component } from 'react';
import { ActionsStack } from 'jumper_react/appState';

export default class SampleComponent extends Component {
    constructor(props) {
        super(props);
        let self = this;
        this.state = {
            currentMenu:""
        }
        this.actions = new ActionsStack(this, [
            SampleAction1,
            SampleAction2
        ], { loadResumeable:false });
        let lastData = this.actions.restoreComponentProp("exampleData");
        this.actions.addEventListener("beforeunload", function() {
            this.saveComponentProp("exampleData");
        });
    }

    componentDidMount() {
        this.actions.restoreStacksSessions();
    }

    render() {
        return (<>
            <h1>Sample...</h1>
        </>);
    }
}
```
in operations/actions file:
```javascript
import { ActionOperation, ActionResumeOperation, TemponaryActionOperation } from 'jumper_react/appState';

export class SampleTemponaryAction1 extends TemponaryActionOperation {

}

export class SampleAction1 extends ActionOperation {
    onStore(component, inputData) {
        component.currDocument.dimensionX += inputData.count;
        return {  };
    }
}

export class SampleAction2 extends ActionOperation {
    onStore(component, inputData) {
        component.currDocument.dimensionY += inputData.count;
        return {  };
    }
}
```

## Important functions

### parseHTMLReactComponent
1. htmlStr: string - input with sample HTML code to parse
2. allowedTags: Array<string> = [] - Array of allowed or dissalowed tags (string tag name) to parse
3. allowed: boolean - if true all tag names given in argument 2 will be parsed, otherwise ignored.
https://codesandbox.io/s/jumper-module-react-simple-parser-3b8c9

```javascript
import React from "react";
import "./styles.css";
import { parseHTMLReactComponent } from "jumper_react/components";

export default function App() {
  return parseHTMLReactComponent(
    '<h1><i>Hello world!</i></h1> Really? <span  id="me" style="color:green; background-color:#eee; -webkit-transform:translate(-100px,200px)">Yolo</span> <div><h2>I love react!</h2></div> <input type="text"/>',
    ["h1"],
    false
  );
}
```

### parseHTMLComponent
1. htmlStr: string - input with sample HTML code to parse
2. allowedTags: Array<string> = [] - Array of allowed or dissalowed tags (string tag name) to parse
3. allowed: boolean - if true all tag names given in argument 2 will be parsed, otherwise ignored.

```javascript
import { parseHTMLComponent } from "jumper_react/components";
let container = document.createElement("div"), childs = parseHTMLComponent(
    '<h1><i>Hello world!</i></h1> Really? <span  id="me" style="color:green; background-color:#eee; -webkit-transform:translate(-100px,200px)">Yolo</span> <div><h2>I love react!</h2></div> <input type="text"/>',
    ["h1"],
    false
  );
 for(let el of childs) container.appendChild(el);
 console.log(container);
 document.body.innerHTML = "";
 document.body.appendChild(container);
```

### format
1. targetStr: string - input with sample text to parse
2. initialObj: any - can be an Array<string> or Object.prototype. Contains a elements to replace.
  
Types:
* %s - String
* %f - float
* %a - any
* %ad - auto detect
* %d - decimal
* %n - science notation
* %oct - octal number
* %hex - hex number
* %bin - binary number
* %f{number} - floating with rounding (experimental)
* %b - boolean
* %bt - boolean translated (experimental)

```javascript
console.log(format("Hello %s exacly! Wow, we make it %d times!", ["World", 14]));
console.log(format("Thats really simple with %s[labelsWord], you can use it in any %s[situationWord]!", {labelsWord:"labels", situationWord:"situation"}));
```