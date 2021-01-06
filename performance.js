/* Performance | grano22 Dev | V.1 */
export function microtime(getAsFloat) {
    var s, now, multiplier;
    if(typeof performance !== 'undefined' && performance.now) {
        if(typeof performance.timeOrigin!="undefined") now = (performance.now() + parseFloat(performance.timeOrigin)) / 1000; else now = (performance.now() + parseFloat(performance.timing.navigationStart)) / 1000;
        multiplier = 1e6;
    }
    else {
        now = (Date.now ? Date.now() : new Date().getTime()) / 1000;
        multiplier = 1e3;
    }
    if(getAsFloat) return now;
    s = now | 0;
    return (Math.round((now - s) * multiplier ) / multiplier ) + ' ' + s;
}

export function sizeOf(obj) {
    let bytes = 0;
    if(obj === null && obj === undefined) return -1;
        switch(typeof obj) {
            case 'number':
                bytes += 8; break;
            case 'string':
                bytes += obj.length * 2; break;
            case 'boolean':
                bytes += 4; break;
            case 'object':
                var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if(objClass === 'Object' || objClass === 'Array') {
                    for(var key in obj) {
                        if(!obj.hasOwnProperty(key)) continue;
                        bytes += sizeOf(obj[key]);
                    }
                } else bytes += obj.toString().length * 2;
                break;
        }
    return bytes;
}

export class DeltaTime {
    history = new Array();
    lastHour = 0;
    lastMinutes = 0;
    lastSeconds = 0;
    lastMiliseconds = 0;
    
    currHour = 0;
    currMinutes = 0;
    currSeconds = 0;
    currMiliseconds = 0;

    currDay = 0;
    currMonth = 0;
    currYear = 0;
    lastDay = 0;

    constructor(hours=0, minutes=0, seconds=0, miliseconds=0) {
        this.currHour = hours;
        this.currMinutes = minutes;
        this.currSeconds = seconds;
        this.currMiliseconds = miliseconds;
    }

    savePoint() {
        this.history.push(this);
        this.lastHour = this.currHour;
        this.lastMinutes = this.currMinutes;
        this.lastSeconds = this.currSeconds;
        this.lastMiliseconds = this.currMiliseconds;
    }

    addMinutes(minutes) {
        this.savePoint();
        this.currMinutes += minutes;
        if(this.currMinutes>60) {
            this.currMinutes = this.currMinutes - 60;
            ++this.currHour;
        }
    }

    diffMinutes(minutes) {
        this.savePoint();
        this.currMinutes -= minutes;
        if(this.currMinutes<0) {
            this.currMinutes = 60 - Math.abs(this.currMinutes);
            --this.currHour;
        }
    }

    getDifference() {

    }

    toDate(year=-1, month=-1, day=-1) {
        if(year==-1) {
            let tempDate = new Date();
            year = tempDate.getFullYear();
            month = tempDate.getMonth();
            day = tempDate.getDay();
        }
        return new Date(year + this.currYear, month + this.currMonth, day + this.currDay, this.currHour, this.currMinutes, this.currSeconds, this.currMiliseconds);
    }
}


class JumperPerformanceEntry {
    creationDate = new Date();
    tag = "";
    comment = "";
    startDateTime = -1;
    endDateTime = -1;
    startTime = -1;
    endTime = -1;
    errors = [];
    warnings = [];

    totalMemory = -1;

    marks = new Array();
    targetCallback = null;

    constructor(cb, tag="", comment="") {
        if(typeof cb=="function") this.targetCallback = cb;
        this.tag = tag;
        this.comment = comment;
    }

    pointMeasure() {
       this.marks.push({ creationDate:new Date(), time:this.getCurrentTime() });
    }

    getCurrentTime() {
        if(typeof window.performance!="undefined") return performance.now();
        else if(typeof console.time!="undefined") return console.time(this.targetCallback.name);
        else return new Date().getTime();
    }

    startMeasure() {
        if(typeof window.performance!="undefined") this.startTime = performance.now();
        else if(typeof console.time!="undefined") this.startTime = console.time(this.targetCallback.name);
        else this.startTime = new Date().getTime();
    }

    endMeasuring() {
        if(typeof window.performance!="undefined") this.endTime = performance.now();
        else if(typeof console.time!="undefined") this.endTime = console.timeEnd(this.targetCallback.name);
        else this.endTime = new Date().getTime();
    }


}

export var JumperPerformance = new class {
    timers = new Array();


    measureExecutionTime(cb) {
        let newEntry = new JumperPerformanceEntry();
        try {
            newEntry.startMeasure();
            newEntry.startDateTime = new Date();
            cb();
            newEntry.endMeasuring();
            newEntry.endDateTime = new Date();
        } catch(err) {
            if(err)
            console.error(err);
        }
        this.timers.push(newEntry);
    }

    measureMultipleExecutionTime(cbs) {
        let newEntry = new JumperPerformanceEntry();
        try {
            newEntry.startMeasure();
            newEntry.startDateTime = new Date();
            for(let cb in cbs) cbs[cb]();
            newEntry.endMeasuring();
            newEntry.endDateTime = new Date();
        } catch(err) {
            if(err)
            console.error(err);
        }
        this.timers.push(newEntry);
    }

    measureIteration(arr) {
        let newEntry = new JumperPerformanceEntry();
        try {
            newEntry.startMeasure();
            newEntry.startDateTime = new Date();
            for(let key in arr) {  }
            newEntry.endMeasuring();
            newEntry.endDateTime = new Date();
            newEntry.totalMemory = sizeOf(arr);
        } catch(err) {
            if(err)
            console.error(err);
        }
        this.timers.push(newEntry);
    }
}

export default Performance;