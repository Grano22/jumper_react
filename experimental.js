/************ jumper_react | experimental module **************/
/********************** Version: 0.1 **************************/
/************************ Grano22 *****************************/

/**
 * Merge multiple objects deep
 * @param {*} ... Objects
 * @returns {object}
 */
export function mergeDeep() {
    let mergedObjs = {};
    for(let mergableObj of arguments) {
        for(let prop in mergableObj) {
            if(isObject(mergableObj[prop])) {
                mergedObjs[prop] = mergeDeep(mergableObj[prop]);
            } else mergedObjs[prop] = mergableObj[prop];
        }
    }
    return mergedObjs;
}