/************ jumper_react | langUtils module *****************/
/********************** Version: 0.1 **************************/
/************************ Grano22 *****************************/

/**
 * Check if given variable is instance (object)
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {return typeof item==='object' && !Array.isArray(item) && typeof item.prototype=="undefined";}

/**
 * Check if given item is class
 * @param item
 * @returns {boolean}
*/
export function isClass(item) {return typeof item==='function' && !Array.isArray(item) && typeof item.prototype!="undefined";}

/**
 * Check if given item is a ES6 class
 * @param item
 * @returns {boolean}
*/
export function isES6Class(varval) {
    const isCtorClass = obj.constructor
      && obj.constructor.toString().substring(0, 5) === 'class';
    if(isCtorClass || obj.prototype === undefined) return isCtorClass
    return isPrototypeCtorClass = obj.prototype.constructor && obj.prototype.constructor.toString && obj.prototype.constructor.toString().substring(0, 5) === 'class';
}

/**
 * Check if given item is old-function class
 * @param {*} item
 * @returns {boolean}
*/
export function isFuncClass(varval) {

}

/**
 * Replace array item position by passing old and new index
 * @param {Array<any>} arr 
 * @param {number} oldIndex 
 * @param {number} newIndex 
 * @returns {Array<any>}
 */
export function changeArrayIndex(arr, oldIndex, newIndex) {
    try {
        if(typeof newIndex=="string") {
            if(newIndex.indexOf("+")==0 || newIndex.indexOf("-")==0) { newIndex = parseInt(oldIndex) + parseInt(newIndex);  }
            else if(isFinite(parseInt(newIndex))) newIndex = parseInt(newIndex);
            else throw "Cannot change array index due to non decimal newIndex argument type";
        }
        if(newIndex>arr.length-1) newIndex = arr.length - 1;
        if(newIndex<0) newIndex = 0;
        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    } catch(ArrayOperationError) {
        console.error(ArrayOperationError);
    }
}

/**
 * Iterate thought object keys
 * @param {*} tgObj 
 * @param {Array<string>} inputKeys
 * @returns {*} 
 */
export function iterateObjectKeys(tgObj, inputKeys) {
    let lastVal = null, expKeys = inputKeys.slice();
    while(expKeys.length>0) {
        if(typeof tgObj[expKeys[0]]!="undefined") lastVal = tgObj[expKeys[0]];
        expKeys.shift();
    }
    return lastVal;
}

/**
 * Multiple Inheritance in class
 * @param {*} ... Classes
 * @returns {class}
 */
export function multiple() {
    let inheritedClasses = [];
    for(let potentialClass of arguments) if(isClass(potentialClass)) inheritedClasses.push(potentialClass);
    let InheritedMultipleClasses = class {
        //__inherited = inheritedClasses;
        constructor() {
            let constructorsParams = Array.prototype.slice.call(arguments);
            for(let inheritedIndex in inheritedClasses) {
                if(typeof constructorsParams[inheritedIndex]=="undefined" || constructorsParams[inheritedIndex]!=null) {
                    if(constructorsParams.length>inheritedIndex) {
                        this.__mergeProto(inheritedClasses[inheritedIndex], constructorsParams[inheritedIndex]);
                    } else this.__mergeProto(inheritedClasses[inheritedIndex]);
                } 
            }
            //this.__inherited = undefined;
            //delete this.__inherited;
            this.__mergeProto = undefined;
            delete this.__mergeProto;
        }

        __mergeProto(classInstance, args=[]) {
            let tgClass = args.length>0 ? new (classInstance(...args)) : new (classInstance);
            for(let propName in tgClass) { console.log(propName); this[propName] = tgClass[propName]; }
        }
    };
    return InheritedMultipleClasses;
}