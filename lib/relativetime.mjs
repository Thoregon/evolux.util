/*
 * Copyright (c) 2022. 
 */

/*
 *
 * @author: Martin Neitz
 */


const UNITS = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
}

const INTERVALS = [
    {age: 10      * 1000, interval: 1},      // until 10 seconds
    {age: 60      * 1000, interval: 5},      // until 60 seconds
    {age: 3600    * 1000, interval: 60},     // until 1  hour
    {age: 86400   * 1000, interval: 3600},   // until 1  day
    {age: 2592000 * 1000, interval: 86400},  // until 1  month
]

export default class RelativeTime {
    
    fromNow( datetime ) {
        return this.from ( new Date , datetime )
    }

    from(fromDateTime, toDateTime) {
        let result = {
            direction: 'future',
            fromDate : fromDateTime,
            toDate   : toDateTime
        }

        let delta = 0;

        if (fromDateTime > toDateTime) {
            result['direction'] = "past";
            delta               = fromDateTime - toDateTime.getTime();
        } else {
            result['direction'] = "future";
            delta               = toDateTime - fromDateTime.getTime();
        }
        if ((fromDateTime == toDateTime)) {
            result['direction'] = "now";
            delta               = 0;
        }

        result['delta'] = delta;

        let unitsAndValues = this.resolveDelta( delta );
        return {...result, ...unitsAndValues };
    }
    
    calendar() {}
  
    resolveDelta( delta ) {

        for (let unit in UNITS) {
            if (delta > UNITS[unit] || unit == 'second') {
                return {
                    unit    : unit,
                    value   : delta / UNITS[unit],
                    interval: this.resolveInterval(delta)
                };
            }
        }
    }

    resolveInterval( age ) {

        for (let i = 0; i < INTERVALS.length; ++i) {
            let interval = INTERVALS[i];
            if ( age < interval.age ) { return interval.interval * 1000; }
        }
        return 2592000 * 1000;
    }
}
 