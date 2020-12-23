# Jumper package
## Description
Last Version: 0.1.5

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
*%s - String
*%f - float
*%a - any
*%ad - auto detect
*%d - decimal
*%n - science notation
*%f{number} - floating with rounding (experimental)

```javascript
console.log(format("Hello %s exacly! Wow, we make it %d times!", ["World", 14]));
console.log(format("Thats really simple with %s[labelsWord], you can use it in any %s[situationWord]!", {labelsWord:"labels", situationWord:"situation"}));
```

## Examples



Jumper is a NPM package and library with modules, which extends any react apps.

NPM Package URL: https://www.npmjs.com/package/jumper_react
