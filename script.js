// require('dotenv').config();
// const endpoint = process.env.API_ENDPOINT

const calendar = document.getElementById("calendarWrapper");
const calendarHead = document.getElementById("calendarHead");



eventDatabase = []
/* Structure of DS:
    eventDatabase (list containing dicts)
    | index by day
    --> daysEvents (list of events)
*/

const day_to_num = new Map([
    ["Mo", 0], // Monday
    ["Tu", 1], // Tuesday
    ["We", 2], // Wednesday
    ["Th", 3], // Thursday
    ["Fr", 4], // Friday
    ["Sa", 5], // Saturday
    ["Su", 6]  // Sunday
]);
days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
event_count = 0;


window.onload = async function() {
    createCalendar();

    const payload = await getData();
      
    const today = new Date();
    console.log(today)
    for (let i =0; i<7; i++) {
      const curDay = new Date();
      curDay.setDate(today.getDate() + i);
      list_dayEvents = payload[curDay.toISOString().split('T')[0]];
      updateCalendar(list_dayEvents, i);

    }    
}

document.getElementById("logInButton").onclick = function () {
  window.open("https://calendar-back-end-snowy.vercel.app/auth/google/");
};

async function getData() {
  try {
    const response = await axios.get('https://calendar-back-end-snowy.vercel.app/home');
    return response.data; // Return the data to be used in the calling function
  } catch (error) {
      console.error('Error fetching data:', error);
  }
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

        let gray = document.createElement("div");
        gray.classList.add("gray-line");
        gray.style.gridArea = (2*i + 3).toString() + " / 2 / " + (2*i + 3).toString() + " / -1";
        calendar.append(gray);
    }

    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const curDay = new Date();
        curDay.setDate(today.getDate() + i);

        let day = document.createElement("div");
        day.classList.add("day");
        day.innerHTML = days[curDay.getDay()];
        calendarHead.append(day);
        calendar.append(document.createElement("div"))

        let day_column = document.createElement("div");
        day_column.classList.add("day-column");
        day_column.id = i;
        day_column.style.position = "relative";
        day_column.style.gridArea = "2 / " + (i+2).toString() + " / -1 / " + (i+2).toString();
        calendar.append(day_column);
    }
}



function updateCalendar(event_list, day) {
    var STARTTIME = 0,
      ENDTIME = 24,
      HEIGHTOFHOUR = 40,
      h, m, e,
      ts, event, leftindex;
    
    var MINUTESINDAY = (ENDTIME - STARTTIME) * 60;
    
    var timeslots = [];
    for (m=0; m<MINUTESINDAY; m++) {
      timeslots.push([]);
    }
    
    // the eventids will probably come from a database and cannot be numeric so we
    // use the EventsById object as a kind of lookup - well use the ids as properties of this
    // object and then get them using array notation.
    var EventsById = {};
    const events = setUpEvents(event_list);

    // load events into timeslots - events must be sorted by starttime already
    var numEvents = events.length;
    for (e=0; e<numEvents; e++) {
      event = events[e];
      for (m=event.start; m<event.stop; m++) {
        timeslots[m].push(event.id);
      }
    }
    
    // take the timeslots one at a time
    // for each event in the timeslot make sure that it has the right numcolumns (max amount for that event)
    // then check if its leftindex has been set
    // if not then set it.  find the first free space in that timeslot
    for (m=0; m<MINUTESINDAY; m++) {
      ts = timeslots[m];
      for (e=0; e<ts.length; e++) {
        event = EventsById[ ts[e] ];
        var max = ts.length;
        ts.forEach(function(id){
            var evt = EventsById[id];
            max=(evt.numcolumns>max)?evt.numcolumns:max;
          });
      
        if (event.numcolumns <= max) {    
          event.numcolumns = max;
        }
       
        if (event.leftindex == -1) {
          leftindex = 0;
          while (! isFreeSpace(ts, leftindex, event.id)) {
              leftindex++;
          }
          event.leftindex = leftindex;
        }
      }
    }
    // UPDATE CODE AFTER COMMENT
    // fix numcolumns
    for (m=0; m<MINUTESINDAY; m++) {
      ts = timeslots[m];
      for (e=0; e<ts.length; e++) {
        event = EventsById[ ts[e] ];
        var max = ts.length;
        ts.forEach(function(id){
            var evt = EventsById[id];
            max=(evt.numcolumns>max)?evt.numcolumns:max;
          });
      
        if (event.numcolumns <= max) {    
          event.numcolumns = max;
        }
      }
    }
    
    layoutEvents(day);
    
    function isFreeSpace(ts, leftindex, eventid) {
      var tslength = ts.length;
      var event;
      for (var i=0; i<tslength; ++i) {
        // get the event in this timeslot location
        event = EventsById[ts[i]];
        if (event.leftindex == leftindex) {
          if (event.id != eventid) {
            return false; // left index taken
          } else {
            return true; // this event is in this place
          }
        }
      }
      return true;
    }
    
    function setUpEvents(event_list) {
        const events = event_list.filter(event => event.starttime.split('T').length > 1);
        events.forEach(event => {
          event.starttime = event.starttime.split('T')[1]
          event.endtime = event.endtime.split('T')[1]
        })

        events.sort(function(a, b) {
          var posa = a.starttime.indexOf(':');
          var posb = b.starttime.indexOf(':');
        
          var hours_a = parseInt(a.starttime.substr(0, posa), 10);
          var minutes_a = parseInt(a.starttime.substr(posa + 1, 2), 10);
          var hours_b = parseInt(b.starttime.substr(0, posb), 10);
          var minutes_b = parseInt(b.starttime.substr(posb + 1, 2), 10);

          var size_time_a = hours_a + minutes_a / 60;
          var size_time_b = hours_b + minutes_b / 60;
          return size_time_a - size_time_b;
        });

        var numEvents = events.length;
        var event, e, pos, stH, stM, etH, etM, height;

        for (e=0; e<numEvents; e++) {
            event = events[e];
            event.leftindex = -1;
            event.numcolumns = 0;
            pos = event.starttime.indexOf(':');
            stH = parseInt( event.starttime.substr(0, pos), 10);
            stM = parseInt( event.starttime.substr(pos+1), 10) / 60;
            // need its positions top and bottom in minutes
            event.start = ((stH - STARTTIME) * 60) + (stM * 60);
            event.topPos = ((stH - STARTTIME) * HEIGHTOFHOUR) + (stM * HEIGHTOFHOUR);
            
            pos = event.endtime.indexOf(':');
            etH = parseInt( event.endtime.substr(0, pos), 10);
            etM = parseInt( event.endtime.substr(pos+1), 10) / 60;
            // need its positions top and bottom in minutes
            event.stop = ((etH - STARTTIME) * 60) + (etM * 60);
            
            height = (etH - stH) * HEIGHTOFHOUR;
            height -= stM * HEIGHTOFHOUR;
            height += etM * HEIGHTOFHOUR;
            event.height = height;
            EventsById[event.id] = event;
        }  
        return events
    }
    
    function layoutEvents(column_id) {
      var numEvents = events.length;
      var event, e, numx, xfactor, left;
      
      for (e=0; e<numEvents; e++) {
        event = events[e];
        
        numx = event.numcolumns;
        xfactor = 1 / numx;
        left = (event.leftindex * xfactor * 100);
        

        
        // Create a new div element
        var cal_data = document.createElement("div");
        cal_data.className = "cal-data";
        cal_data.id = "cal-data-" + event.id;
        cal_data.innerHTML = "<h4>" + event.starttime + " - " + event.endtime + '#' + numx + "</h4>";
        cal_data.style.top = Math.round(event.topPos) + "px";
        cal_data.style.height = Math.round(event.height) + "px";
        cal_data.style.width = Math.floor(100 * xfactor) + "%";
        cal_data.style.left = left + "%";

        // console.log(event)
        if (event.user == "diegotyner59000@gmail.com") {
          cal_data.classList.add("user1")
        } else {
          cal_data.classList.add("user2")
        }

        document.getElementById(column_id).appendChild(cal_data);

      }
    }
};


class EventObject { 
    constructor(id, user, calendar, name, date, description, start, end) {
        this.id = id;
        this.user = user;
        this.calendar = calendar;
        this.name = name; // Event name (summary)
        this.date = date;
        this.description = description; // The comments/description to event
        this.starttime = start;
        this.endtime = end;
    }
}






// function addEvent(dayNum, time, event) {
//     // Check if the day exists in the database
//     if (!eventDatabase[dayNum]) {
//         eventDatabase[dayNum] = new Map();
//     }

//     // Check if the time exists for the day
//     if (!eventDatabase[dayNum].has(time)) {
//         eventDatabase[dayNum].set(time, []);
//     }

//     // Add the event to the list of events for that time
//     eventDatabase[dayNum].get(time).push(event);
//     let next30 = time + 30
//     if ((next30%100)/60 >= 1) { next30 += 40 }
//     if (next30 <= event.end) {
//         addEvent(dayNum, next30, event)
//     }     
// }

// function addEventToCalendar(day, event) {
//     // day has to be first 2 letters
//     let dayNum = day_to_num.get(day)
//     addEvent(dayNum, floorTime(event.start), event)
//     let col = document.getElementById(day)

//     let newEvent = document.createElement("div");
//     newEvent.classList.add("event");
//     newEvent.style.position = "absolute";
//     newEvent.id = event.id
//     event_count++
//     var px_from_top = 40*(Math.floor(event.start / 100) + (event.start%100)/60)
//     var px_from_bottom = 960 - 40*(Math.floor(event.end / 100) + (event.end%100)/60)
//     var col_width = col.clientWidth
//     newEvent.style.inset = 
//         px_from_top.toString() + "px 5px " 
//         + px_from_bottom.toString() + "px";
//     col.appendChild(newEvent)

//     // (Math.floor((i/10) % 10)).toString() + (i%10).toString()
//     for (let i = 0; i + event.start <= event.end; i += 30) {
//         let curTime = i + event.start;
//         if ((curTime%100)/60 >= 1) { 
//             curTime += 40 
//         }
//         let events = eventDatabase[dayNum].get(curTime)
//         if (!events) { continue }
//         for (let j = 1; j < events.length; j++){
//             let html_element = document.getElementById(events[j].id)
//             var px_from_top = 40*(Math.floor(events[j].start / 100) + (events[j].start%100)/60)
//             var px_from_bottom = 960-40*(Math.floor(events[j].end / 100) + (events[j].end%100)/60)
//             var col_width = col.clientWidth
//             var px_from_left = (j / events.length) * col_width
//             var px_from_right = col_width - ((j +1) / events.length)*col_width
//             html_element.style.inset = 
//                 px_from_top.toString() + "px " 
//                 + px_from_right.toString() + "px " 
//                 + px_from_bottom.toString() + "px " 
//                 + px_from_left.toString() + "px";
//             html_element.style.zIndex = j;
//         }
//     }
// }

// function floorTime(time) {
//     let minutes = time%100;
//     time -= minutes;
//     return time;
// }



