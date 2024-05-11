

const calendar = document.getElementById("calendarWrapper");
const calendarHead = document.getElementById("calendarHead");

/* Structure of DS:
    eventDatabase (list containing dicts)
    | index by day
    --> daysEvents (dict leading to list)
       | hash by time
       --> listEvents (list of events at a time)
           | just a list
           --> pointers to events
*/

days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
event_count = 0;
eventDatabase = []
// monday - 0
// tuesday - 1 
// wednesday - 2
// thursday - 3
// fri - 4
// sat - 5
// sun - 6

window.onload = function() {
    createCalendar();
    console.log("This executes")
    addFirstEvent();
    // constructor(id, name, date, description, start, end)
    let event5 = new EventObject("event5", "walk", "We", "woof", 1100, 1230)
    addEventToCalendar(event5.date, event5)

    let event3 = new EventObject("event3", "Walk", "We", "woof", 1200, 1430)
    addEventToCalendar(event3.date, event3)
    
    let event2 = new EventObject("event2", "Jog", "We", "woof", 1000, 1800)
    addEventToCalendar(event2.date, event2)

    let event4 = new EventObject("event4", "Walk", "We", "woof", 1300, 1330)
    addEventToCalendar(event4.date, event4)
    
}


function createCalendar() {

    for (let i = 0; i < 24; i++) {
        let slot00 = document.createElement("div");
        // slot00.id = (Math.floor((i/10) % 10)).toString() + (i%10).toString() + ":00";
        slot00.classList.add("time-slot");
        slot00.style.gridRow = "span 2";
        slot00.style.display = "flex";
        slot00.style.justifyContent = "center";
        slot00.style.alignItems = "center";
        let span = document.createElement("span")
        span.innerHTML += (Math.floor((i/10) % 10)).toString() + (i%10).toString() + ":00";
        slot00.appendChild(span)
        calendar.append(slot00);
        let lightgray = document.createElement("div");
        lightgray.classList.add("lightgray-line");
        lightgray.style.gridArea = (2*i + 2).toString() + " / 2 / " + (2*i + 2).toString() + " / -1";
        calendar.append(lightgray);

        // let slot30 = document.createElement("div");
        // // slot30.id = (Math.floor((i/10) % 10)).toString() + (i%10).toString() + ":30";
        // slot30.classList.add("time-slot");
        // slot30.innerHTML += (Math.floor((i/10) % 10)).toString() + (i%10).toString() + ":30";
        // calendar.append(slot30);
        let gray = document.createElement("div");
        gray.classList.add("gray-line");
        gray.style.gridArea = (2*i + 3).toString() + " / 2 / " + (2*i + 3).toString() + " / -1";
        calendar.append(gray);
    }

    for (let i = 0; i < 7; i++) {
        let day = document.createElement("div");
        day.classList.add("day");
        day.innerHTML = days[i];
        calendarHead.append(day);
        calendar.append(document.createElement("div"))

        let day_column = document.createElement("div");
        day_column.classList.add("day-column");
        day_column.id = days[i];
        day_column.style.position = "relative";
        day_column.style.gridArea = "2 / " + (i+2).toString() + " / -1 / " + (i+2).toString();
        calendar.append(day_column);
    }
}

function addFirstEvent() {
    console.log("This executes too?")
    let day = document.getElementById("Mo");

    let event = document.createElement("div");
    event.classList.add("event");
    event.id = ("event1");
    event.style.position = "absolute";
    event.style.inset = "700px 10px 100px 10px";
    day.appendChild(event)
}


const num_to_day = new Map([
    ["Mo", 0], // Monday
    ["Tu", 1], // Tuesday
    ["We", 2], // Wednesday
    ["Th", 3], // Thursday
    ["Fr", 4], // Friday
    ["Sa", 5], // Saturday
    ["Su", 6]  // Sunday
]);


function addEvent(dayNum, time, event) {
    // Check if the day exists in the database
    if (!eventDatabase[dayNum]) {
        eventDatabase[dayNum] = new Map();
    }

    // Check if the time exists for the day
    if (!eventDatabase[dayNum].has(time)) {
        eventDatabase[dayNum].set(time, []);
    }

    // Add the event to the list of events for that time
    eventDatabase[dayNum].get(time).push(event);
    let next30 = time + 30
    if ((next30%100)/60 >= 1) { next30 += 40 }
    if (next30 <= event.end) {
        addEvent(dayNum, next30, event)
    }     
}

/* Structure of DS:
    eventDatabase (list containing dicts)
    | index by day
    --> daysEvents (dict leading to list)
       | hash by time
       --> listEvents (list of events at a time)
           | just a list
           --> pointers to events
*/
function addEventToCalendar(day, event) {
    // day has to be first 2 letters
    let dayNum = num_to_day.get(day)
    addEvent(dayNum, event.start, event)
    let col = document.getElementById(day)

    let newEvent = document.createElement("div");
    newEvent.classList.add("event");
    newEvent.style.position = "absolute";
    newEvent.id = event.id
    event_count++
    var px_from_top = 40*(Math.floor(event.start / 100) + (event.start%100)/60)
    var px_from_bottom = 960 - 40*(Math.floor(event.end / 100) + (event.end%100)/60)
    var col_width = col.clientWidth
    newEvent.style.inset = 
        px_from_top.toString() + "px 5px " 
        + px_from_bottom.toString() + "px";
    col.appendChild(newEvent)
    
    

    
    // (Math.floor((i/10) % 10)).toString() + (i%10).toString()
    for (let i = 0; i + event.start <= event.end; i += 30) {
        let curTime = i + event.start;
        if ((curTime%100)/60 >= 1) { 
            curTime += 40 
        }
        let events = eventDatabase[dayNum].get(curTime)
        if (!events) { continue }
        for (let j = 1; j < events.length; j++){
            let html_element = document.getElementById(events[j].id)
            var px_from_top = 40*(Math.floor(events[j].start / 100) + (events[j].start%100)/60)
            var px_from_bottom = 960-40*(Math.floor(events[j].end / 100) + (events[j].end%100)/60)
            var col_width = col.clientWidth
            var px_from_left = (j / events.length) * col_width
            var px_from_right = col_width - ((j +1) / events.length)*col_width
            html_element.style.inset = 
                px_from_top.toString() + "px " 
                + px_from_right.toString() + "px " 
                + px_from_bottom.toString() + "px " 
                + px_from_left.toString() + "px";
            html_element.style.zIndex = j;
        }
        
    }

}


function floorTime(time) {
    let minutes = time%15;
    time -= minutes;
    return time;
}

// Maybe add a property for how smushed it is at the moment? 
// ie: 1/3 if first of split in 3. 1/1 if alone. 2/3 if middle. 
class EventObject { 
    constructor(id, name, date, description, start, end) {
        this.id = id
        this.calendar = calendar;
        this.name = name; // Event name (summary)
        this.date = date;
        this.description = description; // The comments/description to event
        this.start = start;
        this.end = end;
    }
}




