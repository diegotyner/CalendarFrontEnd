

const calendar = document.getElementById("calendarWrapper");

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
let eventDatabase = []
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
}


function createCalendar() {

    for (let i = 0; i < 24; i++) {
        let slot00 = document.createElement("div");
        // slot00.id = (Math.floor((i/10) % 10)).toString() + (i%10).toString() + ":00";
        slot00.classList.add("time-slot");
        slot00.innerHTML += (Math.floor((i/10) % 10)).toString() + (i%10).toString() + ":00";
        calendar.append(slot00);
        let lightgray = document.createElement("div");
        lightgray.classList.add("lightgray-line");
        lightgray.style.gridArea = (2*i + 2).toString() + " / 2 / " + (2*i + 2).toString() + " / -1";
        calendar.append(lightgray);

        let slot30 = document.createElement("div");
        // slot30.id = (Math.floor((i/10) % 10)).toString() + (i%10).toString() + ":30";
        slot30.classList.add("time-slot");
        slot30.innerHTML += (Math.floor((i/10) % 10)).toString() + (i%10).toString() + ":30";
        calendar.append(slot30);
        let gray = document.createElement("div");
        gray.classList.add("gray-line");
        gray.style.gridArea = (2*i + 3).toString() + " / 2 / " + (2*i + 3).toString() + " / -1";
        calendar.append(gray);
    }

    for (let i = 0; i < 7; i++) {
        let day = document.createElement("div");
        day.classList.add("day");
        day.innerHTML = days[i];
        calendar.append(day);

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
    event.classList.add("event1");
    event.style.position = "absolute";
    event.style.inset = "700px 10px 100px 10px";
    event.id = event_count.toString
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
    if (time + 30 <= event.end) {
        addEvent(dayNum, time+30, event)
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
    dayNum = num_to_day.get(day)
    addEvent(dayNum, event.start, event)

    let col = document.getElementById(day)

    for (let i = 0; i + event.start <= event.end; i += 15) {
        let curTime = i + event.start;
        events = eventDatabase[dayNum].get(curTime)
        for (let j = 0; i < events.length - 1; j++){}

    }

}


function floorTime(time) {
    let minutes = time%15;
    time -= minutes;
    return minutes;
}

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




