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

export function format(targetStr, initialObj=null) {
    try {
        let sequences = [], sequence = "", inVarDeclaration = false, outputStr = "", fParams = [];
        for(let charn in targetStr) {
            console.log(targetStr[charn], !(targetStr[charn].charCodeAt()>=65 && targetStr[charn].charCodeAt()<=90), !(targetStr[charn].charCodeAt()>=97 && targetStr[charn].charCodeAt()<=122));
            if(!inVarDeclaration && (typeof targetStr[charn - 1]=="undefined" || targetStr[charn - 1]!="\\") && targetStr[charn]=="%" && targetStr[parseInt(charn) + 1]!=" ") {
                inVarDeclaration = true;
            } else if(inVarDeclaration && targetStr[charn]=="[") {
                if(!["s", "n", "b", "a", "f", "d"].includes(sequence)) throw "Unknown type given in format "+sequence+" at position "+charn;
                fParams.push(sequence);
                sequence = "";
            } else if(inVarDeclaration && targetStr[charn]=="]") {
                fParams.push(sequence);
                sequences.push(fParams);
                sequence = "";
                inVarDeclaration = false;
                fParams = [];
            } else if(inVarDeclaration && targetStr[charn]==" ") {
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
        outputStr = targetStr;
        console.log(sequences);
        let currItem = null;
        for(let catched in sequences) {
            if(Array.isArray(sequences[catched])) {
                if(sequences[catched].length>0) {
                    currItem = sequences[catched].length>1 ? initialObj[sequences[catched][1]] : initialObj[catched];
                    switch(sequences[catched][0]) {
                        case "s":
                            if(typeof currItem!="string") currItem = currItem.toString();
                            outputStr = outputStr.replace(sequences[catched].length>1 ? "%"+sequences[catched][0]+"["+sequences[catched][1]+"]" : "%"+sequences[catched][0], currItem);
                        break;
                        case "sr":
                            if(typeof currItem!="string") throw "positional argument "+catched+" requires type string";
                            outputStr = outputStr.replace(sequences[catched].length>1 ? "%"+sequences[catched][0]+"["+sequences[catched][1]+"]" : "%"+sequences[catched][0], currItem);
                        break;
                        case "f":
                            if(Number(currItem) === currItem && currItem % 1 !== 0) currItem = parseFloat(currItem);
                            outputStr = outputStr.replace(sequences[catched].length>1 ? "%"+sequences[catched][0]+"["+sequences[catched][1]+"]" : "%"+sequences[catched][0], currItem);
                        break;
                        case "d":
                            if(Number(currItem) === currItem && currItem % 1 === 0) currItem = parseInt(currItem);
                            outputStr = outputStr.replace(sequences[catched].length>1 ? "%"+sequences[catched][0]+"["+sequences[catched][1]+"]" : "%"+sequences[catched][0], currItem);
                        break;
                        case "b":
                            
                        break;
                    }
                } else throw "Cannot parse format due to lack of type at index "+catched+" (function format error)";
            } else throw "Cannot parse format due to invaild sequence type at index "+catched+" (function format error)";
            currItem = null;
        }
        return outputStr;
    } catch(FormatingError) {
        console.error(FormatingError);
    }
}