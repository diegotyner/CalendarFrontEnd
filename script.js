// require('dotenv').config();
// const endpoint = process.env.API_ENDPOINT
// const { format } = require("util");

const calendar = document.getElementById("calendarWrapper");
const calendarHead = document.getElementById("calendarHead");



const eventDatabase = new Map();
/* Structure of DS:
    eventDatabase (list containing dicts)
    | index by day
    --> daysEvents (list of events)
*/

// Hash by ID. If calendar in this map, then it is shown. If not, do not show.
const shownCalendars = new Set() ;

const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];


const testing_calendarList = [
  {
    username: "Alice",
    calendarList: [
      { id: "cal1", summary: "Work Calendar" },
      { id: "cal2", summary: "Personal Calendar" }
    ]
  },
  {
    username: "Bob",
    calendarList: [
      { id: "cal3", summary: "Work Calendar" },
      { id: "cal4", summary: "Gym Schedule" }
    ]
  }
];

let initialized = false;
window.onload = async function() {
  createCalendar();

  const payload = await getData();
    
  const today = new Date();
  
  console.log(today.toISOString().split('T')[0]);
  console.log(today.toUTCString());

  console.log(payload[1])
  createCalendarCardList(payload[1]);
  for (const user of payload[1]) { // Assuming that this is the calendars
    for (const cal of user.calendarList) { // Going through each user to get calendars
      shownCalendars.add(cal.id)
    }
  }
  console.log(shownCalendars)

  for (let i =0; i<7; i++) {
    const curDay = new Date();
    curDay.setDate(today.getDate() + i);
    const UTC_local = formatLocaleDate(curDay.toLocaleDateString());

    
    console.log(UTC_local);
    const list_dayEvents = payload[0][UTC_local];
    updateCalendar(list_dayEvents, i, UTC_local);
  }    
  initialized = true;
  console.log(eventDatabase);
}

document.getElementById("logInButton").onclick = function () {
  window.open("https://calendar-back-end-snowy.vercel.app/auth/google/");
};

function updateShownCalendars() {
  var counter = 0;
  console.log("------------------------")
  for (let [formatDate, dayEvents] of eventDatabase.entries()) {
    const newDayEvents = []
    for (const e of dayEvents) {
      if (shownCalendars.has(e.calendarID)) {
        newDayEvents.push(e);
        console.log("i shown")
      } else {
        console.log("i am not shown")
      }
    }
    console.log(newDayEvents, formatDate)   
    updateCalendar(newDayEvents, counter, formatDate);
    counter += 1;
  }
}

/* Assuming the cal list will have the following structure:
      list -> users -> cals

  divs have structure: 
      cardList -> userCards -> uernameRow -> calendar Card
*/
const cardList = document.getElementById("calendarCardList");
function createCalendarCardList(calendarList) {
  for (const user of calendarList) {
    let usernameRow = document.createElement("nav");
    usernameRow.classList.add("usernameRow", "navbar-expand-xxl", "navbar-light");

    let toggler = document.createElement("button");
    toggler.classList.add("navbar-toggler")
    toggler.setAttribute("type", "button");
    toggler.setAttribute("data-toggle", "collapse");
    toggler.setAttribute("data-target", "#" + user.username.split(" ")[0] + "_collapse");
    
    let span = document.createElement("span");
    span.classList.add("navbar-toggler-icon");
    toggler.appendChild(span);
    usernameRow.appendChild(toggler);

    let username = document.createElement("span");
    username.innerHTML = user.username.split(" ")[0];
    usernameRow.appendChild(username);

    let burpeeRow = document.createElement("div");
    burpeeRow.classList.add("BurpeeCount")
    let addBurp = document.createElement("button");
    addBurp.addEventListener('click', function() {
      changeBurpees(user.email, 5);
    });
    addBurp.classList.add("BurpButton");
    addBurp.innerHTML = "+";
    let dumbFiller = document.createElement("div");
    let burpCount = document.createElement("span");
    burpCount.innerHTML = "[20]";
    let minusBurp = document.createElement("button");
    minusBurp.addEventListener('click', function() {
      changeBurpees(user.email, -5);
    });
    minusBurp.classList.add("BurpButton");
    minusBurp.innerHTML = "-";
    burpeeRow.appendChild(addBurp);
    burpeeRow.appendChild(burpCount);
    burpeeRow.appendChild(minusBurp);
    usernameRow.appendChild(burpeeRow);
    // dumbFiller.appendChild(burpCount);
    // usernameRow.appendChild(dumbFiller);



    let userCard = document.createElement("div");
    userCard.classList.add("userCard", "collapse", "navbar-expand-xxl");
    userCard.setAttribute("id", user.username.split(" ")[0] + "_collapse");

    for (const cal of user.calendarList) {
      if (cal.id.endsWith("group.v.calendar.google.com")) { // If its this calendar, its an irrelevant Google Calendar (holidays, etc)
        continue
      }
      let calendarCard = document.createElement("div");
      calendarCard.classList.add("calendarCard");
      userCard.appendChild(calendarCard);

      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = cal.id;
      checkbox.checked = true;
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          shownCalendars.add(cal.id)
          updateShownCalendars()
          console.log("------- done -------")
        } else {
          shownCalendars.delete(cal.id);
          updateShownCalendars()
          console.log("------- done -------")
        }
      })
      calendarCard.appendChild(checkbox);
      
      let calName = document.createElement("span");
      calName.innerHTML = cal.summary;
      calendarCard.appendChild(calName);
        // Add click event listener to the calendarCard to toggle the checkbox
      calendarCard.addEventListener('click', function(event) {
        // Check if the click was directly on the checkbox to prevent toggling it twice
        if (event.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change')); // Trigger the 'change' event manually
        }
      });
    }
    cardList.appendChild(usernameRow)
    cardList.appendChild(userCard);
  }
}



function changeBurpees(email, n) {
  console.log(email, n)
}

// 57te2485vd18fuioe4rgogd4doinlhji@import.calendar.google.com
// "57te2485vd18fuioe4rgogd4doinlhji@import.calendar.google.com"

function formatLocaleDate(locale_date) {
  const date_split = locale_date.split('/') // M-D-Y
  date_split[0] = date_split[0].padStart(2, '0');
  date_split[1] = date_split[1].padStart(2, '0');
  return `${date_split[2]}-${date_split[0]}-${date_split[1]}`
}

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
        slot00.classList.add("time-slot");
        slot00.style.gridRow = "span 2";
        slot00.style.display = "flex";
        slot00.style.justifyContent = "center";
        slot00.style.alignItems = "center";
        let span = document.createElement("span")
        // span.innerHTML += (Math.floor((i/10) % 10)).toString() + (i%10).toString() + ":00"; // Military Time
        let timeString = i%12 === 0 ? (12).toString() + ":00" : (i%12).toString() + ":00";
        timeString = i<12 ? timeString + "AM" : timeString + "PM";
        span.innerHTML += timeString;
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




function updateCalendar(event_list, day, formatted_date) {
  console.log('Function before setup:', event_list);

  var STARTTIME = 0,
    ENDTIME = 24,
    HEIGHTOFHOUR = 40,
    h, m, e,
    ts, event, leftindex;
  
  var MINUTESINDAY = (ENDTIME - STARTTIME) * 60;
  
  // Clear existing events from the calendar column
  var calendarColumn = document.getElementById(day);
  while (calendarColumn.firstChild) {
    calendarColumn.removeChild(calendarColumn.firstChild);
  }

  var timeslots = [];
  for (m=0; m<MINUTESINDAY; m++) {
    timeslots.push([]);
  }
  
  // the eventids will probably come from a database and cannot be numeric so we
  // use the EventsById object as a kind of lookup - well use the ids as properties of this
  // object and then get them using array notation.
  var EventsById = {};
  const events = setUpEvents(event_list);
  if (!initialized) {
    eventDatabase.set(formatted_date, events);
  } 
  console.log('Events after setup:', events);


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
      let events;
      if (!initialized) {
        events = event_list.filter(event => event.starttime.split('T').length > 1);
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
      } else {
        events = event_list;
      }

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
      cal_data.innerHTML = "<h4>" + event.name + "</h4>";
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
