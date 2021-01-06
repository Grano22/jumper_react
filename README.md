# Jumper package
## Description
Last Version: 0.1.9
Modules:
1. jumper_react/appState (Module for application state managment)
2. jumper_react/appStateExtended (Module for application state managment - extended with developers tools only recommend during development)
3. jumper_react/components (Components tools)
4. jumper_react/cryptography (Crypto algorythms module)
5. jumper_react/dataProcessing (Data tools module)
6. jumper_react/languageDescriptor (Language translation module)
7. jumper_react/models (Models module)
8. jumper_react/service (Services and network tools module)
9. jumper_react/performance (Performance tools module)

![Jumper.react Logo](https://imgur.com/5oximLW.png)

## What's new in 0.1.8?
* fix for package name from jumper to jumper_react
* new performance tools in jumper_react/performance

## What's new in 0.1.7?
* Impoved appState performance
* Added support for services
* Updated App State Jumper module
* assignTypedProps(obj: object, propsArr: Array<string>, tgProps: object = {}, options: object = {}) in "jumper/models"

## What's new in 0.1.5?
* parseHTMLComponent(htmlStr: string, allowedTags: Array<string> = [], allowed: boolean = true) in "jumper/components"
* parseHTMLReactComponent(htmlStr: string, allowedTags: Array<string> = [], allowed: boolean = true) in "jumper/components"

## 0.1.5 examples
### parseHTMLReactComponent
1. htmlStr: string - input with sample HTML code to parse
2. allowedTags: Array<string> = [] - Array of allowed or dissalowed tags (string tag name) to parse
3. allowed: boolean - if true all tag names given in argument 2 will be parsed, otherwise ignored.
https://codesandbox.io/s/jumper-module-react-simple-parser-3b8c9

```javascript
import React from "react";
import "./styles.css";
import { parseHTMLReactComponent } from "jumper/components";

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
let container = document.createElement("div"), childs = parseHTMLReactComponent(
    '<h1><i>Hello world!</i></h1> Really? <span  id="me" style="color:green; background-color:#eee; -webkit-transform:translate(-100px,200px)">Yolo</span> <div><h2>I love react!</h2></div> <input type="text"/>',
    ["h1"],
    false
  );
 for(let el of childs) container.appendChild(el);
 console.log(container);
 document.body.innerHTML = "";
 document.body.appendChild(container);
```

## What's new in 0.1.4?
* function format(targetStr: string, initialObj: any = null)

## 0.1.4 examples
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

## Examples



Jumper is a NPM package and library with modules, which extends any react apps.

NPM Package URL: https://www.npmjs.com/package/jumper_react
