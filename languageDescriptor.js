/* Language Descriptor | Jumper Module | Grano22 Dev | V1 */
import Jumper from 'jumper_react';

export class LanguageDescriptorCollection {
    collection = [];

    constructor(constructArr, targetLanguage="en") {
        for(let propArr in constructArr) {
            this.collection[propArr] = new LanguageDescriptorItem(constructArr[propArr], targetLanguage);
        }
    }

    map(fn) {
        return Array.prototype.map.apply(this.collection, [fn]);
    }

    forEach(fn) {
        return Array.prototype.forEach.apply(this.collection, [fn]);
    }

    get context() { return Array.prototype.splice.call(this.collection); }
}

class LanguageDescriptorDict {

}

export class LanguageDescriptorItem {
    id = "";
    name = "";
    props = {};
    langs = {};
    targetLanguage = "en";

    constructor(fromObj, targetLanguage="en") {
        this.targetLanguage = targetLanguage;
        for(let fromProp in fromObj) { this[fromProp] = fromObj[fromProp]; }
    }

    get t() {return this.langs[this.targetLanguage] || this.langs["en"] || "[[ Invaild Translation ]]";}
}

export default class LanguageDescriptor {
    defaultLanguage = "en";
    dict = null;

    constructor(importedObj, defLang=Jumper.Browser.language) {
        this.defaultLanguage = defLang;
        this.dict = Object.assign({  }, importedObj.dict);
    }

    getEntry(entryName, entryLang=this.defaultLanguage) {
        for(let dictIndexName in this.dict) {
            if(dictIndexName==entryName) {
                if(typeof this.dict[dictIndexName]["items"]!="undefined") {
                    console.log(this.dict[dictIndexName]["items"]);
                    return new LanguageDescriptorCollection(this.dict[dictIndexName]["items"], entryLang);
                } else { 
                    console.log(dictIndexName);
                    return new LanguageDescriptorItem(this.dict[dictIndexName], entryLang);
                }
            }
        }
    }
}