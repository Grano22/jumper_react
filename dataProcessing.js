export function JSONSafteyParse(inObj, defaultVal=null, onError=null) {
    try {
        let nd = JSON.parse(inObj);
        return nd;
    } catch (objError) {
        if (objError instanceof SyntaxError) {
            console.error(objError.name);
        } else {
            console.error(objError.message);
        }
        if(typeof onError=="function") onError(objError);
        if(defaultVal) return defaultVal;
    }
}

export function replaceAt(str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

export function replaceBetween(str, start, end, replacement) {
    return str.substring(0, start) + replacement + str.substring(end);
};
  

export function changeArrayIndex(arr, oldIndex, newIndex) {
    try {
        if(typeof newIndex=="string") {
            if(newIndex.indexOf("+")==0 || newIndex.indexOf("-")==0) { newIndex = parseInt(oldIndex) + parseInt(newIndex);  }
            //else if(newIndex.indexOf("-")==0) { newIndex = oldIndex - parseInt(newIndex); }
            else if(isFinite(parseInt(newIndex))) newIndex = parseInt(newIndex);
            else throw "Cannot change array index due to non decimal newIndex argument type";
        }
        if(newIndex>arr.length-1) newIndex = arr.length - 1;
        if(newIndex<0) newIndex = 0;
        /*if (newIndex >= arr.length) {
            var k = newIndex - arr.length + 1;
            while (k--) arr.push(undefined);
        }*/
        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    } catch(ArrayOperationError) {
        console.error(ArrayOperationError);
    }
}

export function splitAllWithSeparators(str, sepArr=[]) {
    let outputArr = [], strClud = "";
    for(let charn in str) {
        strClud += str[charn];
        if(sepArr.includes(str[charn])) {
            outputArr.push(strClud);
            strClud = "";
        }
    }
    return outputArr;
}

export function backOccurence(str, target) {
    let strClud = "";
    for(let charn = str.length;charn>0;charn--) {
        strClud += str[charn]
        if(strClud.split("").reverse().join()==target) return charn;
    }
    return -1;
}

export function iterateObjectKeys(tgObj, inputKeys) {
    let lastVal = null, expKeys = inputKeys.slice();
    while(expKeys.length>0) {
        if(typeof tgObj[expKeys[0]]!="undefined") lastVal = tgObj[expKeys[0]];
        expKeys.shift();
    }
    return lastVal;
}

export function format(targetStr, initialObj=null, defaultVal="") {
    try {
        let sequences = [], sequence = "", inVarDeclaration = false, outputStr = "", fParams = [], depth = 0;
        for(let charn in targetStr) {
            if(targetStr.hasOwnProperty(charn)) {
            if(!inVarDeclaration && (typeof targetStr[charn - 1]=="undefined" || targetStr[charn - 1]!="\\") && targetStr[charn]=="%" && targetStr[parseInt(charn) + 1].trim()!="") {
                inVarDeclaration = true;
            } else if(inVarDeclaration && targetStr[charn]=="[") {
                if(depth==0 && !["s", "n", "b", "a", "f", "d"].includes(sequence)) throw "Unknown type given in format "+sequence+" at position "+charn;
                if(depth==0) { fParams.push(sequence);
                sequence = ""; }
                depth++;
            } else if(inVarDeclaration && targetStr[charn]=="]") {
                fParams.push(sequence);
                sequences.push(fParams);
                sequence = "";
                if(targetStr[parseInt(charn) + 1]!="[") {
                    inVarDeclaration = false;
                    fParams = [];
                    depth = 0;
                } else depth++;
            } else if(inVarDeclaration && (targetStr[charn].trim()=="" || targetStr.length - 1<=parseInt(charn))) {
                if(targetStr.length - 1<=parseInt(charn)) sequence += targetStr[charn];
                if(sequence.indexOf("[")>-1) throw "Format proeprty name cannot have a whitespace";
                if(!["s", "n", "b", "a", "f", "d"].includes(sequence)) throw "Unknown type given in format "+sequence+" at position "+charn;
                fParams.push(sequence);
                sequences.push(fParams);
                sequence = "";
                inVarDeclaration = false;
                fParams = [];
            } else if(inVarDeclaration && targetStr[charn]!="[" && targetStr[charn]!="_" && !(targetStr[charn].charCodeAt()>=65 && targetStr[charn].charCodeAt()<=90) && !(targetStr[charn].charCodeAt()>=97 && targetStr[charn].charCodeAt()<=122)) throw "Invaild symbol "+targetStr[charn]+" at position "+charn;
            else if(inVarDeclaration) sequence += targetStr[charn];
            }
        }
        outputStr = targetStr;
        let currItem = null;
        for(let catched in sequences) {
            if(Array.isArray(sequences[catched])) {
                if(sequences[catched].length>0) {
                    //initialObj[sequences[catched][1]]
                    let seqParams = sequences[catched].slice();
                    seqParams.shift();
                    currItem = sequences[catched].length>1 ? iterateObjectKeys(initialObj, seqParams) || defaultVal : initialObj[catched];
                    if(typeof currItem!="undefined" && currItem!=null) {
                    switch(sequences[catched][0]) {
                        case "s":
                            if(typeof currItem!="string") currItem = currItem.toString();
                            //outputStr = outputStr.replace(sequences[catched].length>1 ? "%"+sequences[catched][0]+"["+sequences[catched][1]+"]" : "%"+sequences[catched][0], currItem);
                            outputStr = outputStr.replace("%"+sequences[catched][0]+seqParams.map(v=>"["+v+"]").join(""), currItem);
                        break;
                        case "sr":
                            if(typeof currItem!="string") throw "positional argument "+catched+" requires type string";
                            outputStr = outputStr.replace("%"+sequences[catched][0]+seqParams.map(v=>"["+v+"]").join(""), currItem);
                        break;
                        case "f":
                            if(!(Number(currItem) === currItem && currItem % 1 !== 0)) { currItem = parseFloat(currItem); }
                            outputStr = outputStr.replace("%"+sequences[catched][0]+seqParams.map(v=>"["+v+"]").join(""), currItem);
                        break;
                        case "d":
                            if(!(Number(currItem) === currItem && currItem % 1 === 0)) currItem = parseInt(currItem);
                            outputStr = outputStr.replace("%"+sequences[catched][0]+seqParams.map(v=>"["+v+"]").join(""), currItem);
                        break;
                        case "b":
                            if(typeof currItem!="boolean") currItem = !!currItem;
                            outputStr = outputStr.replace("%"+sequences[catched][0]+seqParams.map(v=>"["+v+"]").join(""), currItem);
                        break;
                    }
                    }
                } else throw "Cannot parse format due to lack of type at index "+catched+" (function format error)";
            } else throw "Cannot parse format due to invaild sequence type at index "+catched+" (function format error)";
            currItem = null;
        }
        return outputStr;
    } catch(FormatingError) {
        console.error(FormatingError);
        return targetStr;
    }
}