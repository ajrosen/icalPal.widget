import {css} from "uebersicht";

export const command = "${GEM_HOME}/bin/icalPal --cf=icalPal.cf";
export const refreshFrequency = 2 * 60 * 1000; // 2 minutes

export const className = {
    // Position
    top: 3,
    left: 120,
    width: 450,
    height: 750,

    // Color
    color: "#FFFFFFFF",		   // Solid white
    background: "#00000000",	   // Transparent black

    // Font
    fontFamily: "Menlo",
    fontSize: "14px",

    // Scrolling
    overflowY: "auto",
    "&::-webkit-scrollbar": { display: "none" }
};

// The list of events to display
let events = undefined;


//////////////////////////////////////////////////
// updateState

export function updateState(event) {
    events = [];

    if (event == undefined) { return(undefined); }
    if (event.output == undefined) { return(undefined); }

    let j = undefined;

    try { j = JSON.parse(event.output); }
    catch { return(undefined); }

    for (let i in j) { events.push(j[i]); }

    return(true);
};


//////////////////////////////////////////////////
// render

export function render() {
    if (! Array.isArray(events)) { return(<div><i>Loading...</i></div>); }
    if (events.length == 0) { return(<div>No events</div>); }

    let sday = 0;

    const retval = [];

    for (let event in events) {
        let e = events[event];

        if (sday != e['sday']) {
            sday = e['sday'];
            retval.push(<DayHeader e={e}/>);
        }

        retval.push(<Event e={e}/>);
    };

    return(retval);
};


const pad = 8;

const dark = shade(.75);
const light = shade(.65);
const fade = shade(.75, 1, 90);

const msecs = 86400000;
const now = new Date();


//////////////////////////////////////////////////
// Day header

const dayTable = {
    border: "2px solid",
    borderRadius: 2,
    fontStyle: "italic",
    marginBottom: 4,
    padding: 2,
};

const date = { paddingLeft: pad };
const relDay = { position: "absolute", right: pad };


//////////////////////////////////////////////////
// Event

const eventTable = {
    borderLeft: "3px solid",
    paddingBottom: 3,
    paddingLeft: pad,
    position: "relative",
};

// Title
const titleRow = { paddingTop: 2, };
const allDay = { background: light, fontStyle: "italic", };

const link = {
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: 0,
    position: "absolute",
    width: 24,
};

const occurence = {
    color: "white",
    fontSize: 16,
    paddingLeft: pad * 4,
};

const title = {
    display: "inline-block",
    position: "relative",
};

const emojiStyle = {
    position: "absolute",
    right: 4,
    top: -1,
};

// Time
const timeRow = { paddingLeft: pad * 4, };
const alarmStyle = { bottom: 0, left: pad + 2, position: "absolute", };
const recurStyle = { bottom: 0, position: "absolute", right: 4, };

// Types of meeting links to look for
// Chime, Google, GotoWebinar, Parcel, Teams, WebEx, Zoom, POTS
const meetings = [
    { type: "C", regex: /(https?:\/\/chime\.aws\/[^\n <>]*)/ },
    { type: "G", regex: /(https?:\/\/meet\.google\.com\/[^\n <>]*)/ },
    { type: "GW", regex: /(https?:\/\/global\.gotowebinar\.com\/join\/[^\n <>]*)/ },
    { type: "P", regex: /(parcel\.app\/[^\n <>]*)/ },
    { type: "T", regex: /(https?:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\n <>]*)/ },
    { type: "W", regex: /(https?:\/\/.*\.webex\.com\/[^\n <>]*)/ },
    { type: "Z", regex: /(https?:\/\/[a-z0-9]{2,20}.zoom.[a-z]{2,3}\/j\/[^\n <>]*)/ },
    { type: "☎", regex: /(tel:.*)/ },
];

// Conference colors
const confCol = {
    "C": "black",
    "G": "red",
    "GW": "blue",
    "P": "#8b5742",
    "T": "green",
    "W": "blue",
    "Z": "magenta",
    "☎": "green",
};

// Availbility (busy, free, tentative)
const avail = [
    { background: dark },
    { background: fade },
    { background: stripe(0, 96, 4, -45) + "," + dark },
];

// Meeting priorities colors (done, soon, running, normal)
const prioColors = [ "white", "yellow", "red", "white", ];

// Lighten, darken, fade
function shade(x, y = x, d = 0) {
    function f(c) { return(`,rgba(${(`${c},`).repeat(3)}`); }

    return(
        "repeating-linear-gradient("
            + `${d}deg ${f(0)}${x}) ${f(0)}${y}))`
            + ", currentcolor"
    );
}

// Angled zebra stripes
function stripe(c1, c2, w, d = 0) {
    function f(c) { return(`,rgba(${(`${c},`).repeat(3)}`); }

    return("repeating-linear-gradient(" + d + "deg"
           + (f(c1) + "1)").repeat(2)
           + w + "px" + (f(c2) + ".25)").repeat(2)
           + (w * 2) + "px)"
          );
}

// Get how soon an event starts
function getUrgency(e) {
    if (e['all_day']) { return 3; }

    let n = Math.floor(now / 1000);
    let sd = e['stime'];
    let ed = e['etime'];

    if (ed < n) { return 0; }
    if (sd <= n && ed >= n) { return 2; }
    if (sd - n < (e['trigger_interval'] * 1000)) { return 1; }

    return 3;
}

// Look for meeting links
function getLink(e) {
    let s = (e.conference_url_detected)? e.conference_url_detected : e.notes;
    try { s = decodeURIComponent(s); }
    catch { return(undefined); };

    for (const i in meetings) {
        const l = meetings[i];
        const w = l.regex.exec(s);

        if (Array.isArray(w) && w.length > 1) {
            return({
                type: l.type,
                url: [...new Set(w)].join("\n"),
            });
        }
    }
}

// JSBC
const tf = Intl.DateTimeFormat(0, { hour: "2-digit", minute: "numeric" });

// Epoch + 31 years
function iCalTime(t) {
    return((t.valueOf() +  978307200) * 1000);
}

// Format D as H:M or Mm
function hm(d) {
    const h = Math.floor(d / 3600);
    const m = String(Math.floor(((d % 3600) / 60))).padStart(2, '0');

    return((h > 0)? (h + ":" + m) : (m + "m"));
}


//////////////////////////////////////////////////
// Format items for output

function Day({d}) {
    return(<span className={css(date)}>{d}</span>);
}

function RelDay({d}) {
    let diff = Math.floor((Date.parse(d) - now) / msecs) + 1;

    let text = diff + " days " + ((diff > 0)? "from now" : "ago");
    relDay.color = "gray";
    
    switch (diff) {
    case -2: text = "day before yesterday"; relDay.color = "#b00000"; break;
    case -1: text = "yesterday"; relDay.color = "#b00000"; break;
    case 0: text = "today"; relDay.color = "#00f000"; break;
    case 1: text = "tomorrow"; relDay.color = "#f0f000"; break;
    case 2: text = "day after tomorrow"; relDay.color = "#f0f000"; break;
    }

    return(<span className={css(relDay)}>{text}</span>);
}

function Conference({l}) {
    if (l == undefined) { return(<span/>); }

    return(
        <a href={l.url} title={l.url}>
	  <button className={css(link)} style={{color: confCol[l.type]}}>
	    {l.type}
	  </button>
	</a>
    );
}

function Occurence({d, o}) {
    return(
        <span className={css(occurence)}>
          {(d <= 86400)? "" : String.fromCharCode(o + 0x0030, 0x20e3, 32)}
        </span>
    );
}

function Title({t}) {
    return(
        <span className={css(title)}>
          {t.substr(0, 43).trimEnd() + ((t.length > 43)? "\u2026" : "")}
        </span>
    );
}

function Emoji({e}) {
    let cp = undefined;
    let cs = undefined;

    if (e == undefined) { return(<span/>); }

    // Birthdays
    else if (e['calendar'] == "Birthdays") { cp = 0x1f382; }

    // Holidays
    else if (e['calendar'].includes("Holiday")) {
        // US
	if (e['title'] == "Earth Day") { cp = 0x1f30e; }
	else if (e['title'] == "Election Day") { cp = 0x1f5f3; }
	else if (e['title'] == "Father’s Day") { cp = 0x1f468; }
	else if (e['title'] == "Flag Day") { cs = '\ud83c\uddfa\ud83c\uddf8'; }
	else if (e['title'] == "Groundhog Day") {cp = 0x1f43f; }
	else if (e['title'] == "Halloween") { cp = 0x1f383; }
	else if (e['title'] == "Independence Day") { cp = 0x1f386; }
	else if (e['title'] == "Kwanzaa") { cp = 0x1f30d; }
	else if (e['title'] == "Labor Day") { cp = 0x1f477; }
	else if (e['title'] == "Memorial Day") { cp = 0x1fa96; }
	else if (e['title'] == "Mother’s Day") { cp = 0x1f469; }
	else if (e['title'] == "Presidents’ Day") { cs = '\ud83c\uddfa\ud83c\uddf8'; }
	else if (e['title'] == "St. Patrick’s Day") { cp = 0x2618; }
	else if (e['title'] == "Tax Day") { cp = 0x1f4b8; }
	else if (e['title'] == "Thanksgiving") { cp = 0x1f983; }
	else if (e['title'] == "Valentine’s Day") { cp = 0x1f49f; }
	else if (e['title'] == "Veterans Day") { cp = 0x1f396; }
        else if (e['title'] == "April Fools’ Day") { cp = 0x1f0cf; }
        else if (e['title'] == "Cinco de Mayo") { cs = '\ud83c\uddf2\ud83c\uddfd'; }
        else if (e['title'] == "Columbus Day") { cp = 0x26d3; }
        else if (e['title'] == "Indigenous Peoples’ Day") { cp = 0x26d3; }
        else if (e['title'] == "Juneteenth") { cp = 0x26d3; }
        else if (e['title'] == "Palm Sunday") { cp = 0x1f334; }
	else if (e['title'].includes("New Year")) { cp = 0x1f973; }
	else if (e['title'].startsWith("Daylight Saving")) { cp = 0x231b; }
        else if (e['title'].startsWith("Martin")) { cs = '\ud83e\uddd1\ud83c\udffe'; }

        // Hindu
	else if (e['title'] == "Diwali") { cp = 0x1f6d5; }
	else if (e['title'] == "Holi") { cp = 0x1f6d5; }

        // Jewish
        else if (e['title'] == "Passover") { cp = 0x2721; }
	else if (e['title'] == "Rosh Hashanah") { cp = 0x1f973; }
        else if (e['title'] == "Yom Kippur") { cp = 0x1f4dc; }
	else if (e['title'].startsWith("Hanukkah")) { cp = 0x1f54e; }

        // Muslim
	else if (e['title'] == "Ashura") { cp = 0x262a; }
	else if (e['title'].includes("Ramadan")) { cp = 0x262a; }
	else if (e['title'].startsWith("Eid al-")) { cp = 0x262a; }

        // Christian
        else if (e['title'] == "Ash Wednesday") { cp = 0x271d; }
        else if (e['title'] == "Good Friday") { cp = 0x271d; }
	else if (e['title'].includes("Easter")) { cp = 0x1f5ff; }
	else if (e['title'].startsWith("Christmas")) { cp = 0x1f384; }
    }

    if (cs || cp) {
        return(
            <span className={css(emojiStyle)}>
              {cs? cs : String.fromCodePoint(cp)}
            </span>
        );
    }

    let spec = e['specifier']
        + ":F" + e['frequency']
        + ":I" + e['interval']
        + ":C" + e['count']
        + ":R" + e['rdate'];

    return(<Recur r={e['has_recurrences']} s={spec}/>);
}

function Alarm({e}) {
    if (e['all_day'] || !e['trigger_interval']) { return(<span/>); }

    return(
        <span className={css(alarmStyle)} title={Math.abs(e['trigger_interval'] / 60) + "m"}>
          {String.fromCodePoint(0x23f0)}
        </span>
    );
}

function Recur({r, s}) {
    if (!r) { return(<span/>); }

    return(
        <span className={css(recurStyle)} title={s}>
          {String.fromCodePoint(0x1f501)}
        </span>
    );
}

//////////////////////////////////////////////////
// Day header

function DayHeader({e}) {
    return(
        <div id={e['sdate']} className={css(dayTable)}>
          <Day d={e['sdate']}/>
          <RelDay d={e['sdate']}/>
        </div>
    );
}


//////////////////////////////////////////////////
// Format an event

function TitleRow({e}) {
    if (e['invitation_status'] != 0) { titleRow.color = "white"; }

    // Tooltip
    let tt = `${e['calendar']} (${e['account']})`;
    if (e['location']) { tt += "\n\n" + e['location']; }
    if (e['notes']) { tt += "\n\n" + e['notes']; }

    return(
        <div className={css(titleRow)} title={tt}>
          <Conference l={getLink(e)}/>
          <Occurence d={e['duration']} o={e['daynum']}/>
          <Title t={e['title']}/>
        </div>
    );
}

function TimeRow({e}) {
    if (e['all_day']) { return(<span/>); }

    // Urgency
    timeRow.color = prioColors[e['urgency']];

    // Time
    let startEnd = tf.format(iCalTime(e['start_date']));

    if (e['duration'] != 0) {
        startEnd += " - "
            + tf.format(iCalTime(e['end_date']))
            + " (" + hm(e['duration']) + ")";
    }

    return(
	<div className={css(timeRow)} title={e['attendees'].join("\n")}>
	  {startEnd}
	</div>
    );
}

function Event({e}) {
    let eventStyle = (e['all_day'])? allDay : avail[e['availability']];

    e['urgency'] = getUrgency(e);

    eventStyle.color = e['color'];
    eventStyle.opacity = (e['urgency'] == 0)? .666 : 1;

    return(
        <div>
          <div className={css(eventTable)} style={{...eventStyle}}>
            <TitleRow e={e}/>
            <TimeRow e={e}/>

            <Alarm e={e}/>
            <Emoji e={e}/>
          </div>

          <div style={{height: 5}}/>
        </div>
    );
}
