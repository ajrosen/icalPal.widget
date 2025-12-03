//////////////////////////////////////////////////
// Set icalPal options

// Command-Line options
let icalPalOptions = [
    "--ec 'Jewish Holidays','TPS District Events Calendar',Hours,Celtics,Bruins",
    "--days 35",
    "--df '%a %b %e, %Y'",
];

// Set path to icalPal
const icalPal = "icalPal";
// const icalPal = "/Users/ajr/.gem/ruby/3.4.0/bin/icalPal";
// const icalPal = "/Users/ajr/Sync/GitHub/dotfiles/etc/config/share/gem/ruby/3.4.0/bin/icalPal";


//////////////////////////////////////////////////
// Refresh widget every 15 minutes

export const refreshFrequency = 15 * 60 * 1000;


//////////////////////////////////////////////////
// Set position, size, font, and colors

export const className = {
    // Position
    top: 4,
    left: 120,
    width: 450,
    height: 750,

    // Font
    fontFamily: "Hack Nerd Font",
    fontSize: 14,

    // Color
    color: "white",

    // Scrolling
    overflowY: "auto",
    "&::-webkit-scrollbar": { display: "none" }
};

// Colors for day header
const dayHeader = {
    background: "black",
    color: "white",
};

// Colors for relative days
const relDayColors = [
    "gray",
    "#b00000",			// Yesterday
    "#00f000",			// Today
    "#f0f000",			// Tomorrow
];


//////////////////////////////////////////////////
// Vertical spacing

const spacing = {
    header: 4,			// Between day header and first event
    event: 2,			// Between events
    days: 4,			// Between last event of one day and the next day header
};


//////////////////////////////////////////////////
// Styles

const pad = 8;
const dark = shade(.75);
const light = shade(.65);
const fade = shade(.75, 1, 90);


//////////////////////////////////////////////////
// Day header

const visibleDayTable = {
    ...dayHeader,
    border: "2px solid",
    borderRadius: 9,
    fontStyle: "italic",
    marginBottom: spacing.header,
    padding: 2,
};

const hiddenDayTable = {
    ...visibleDayTable,
    opacity: .5,
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
    borderRadius: 9,
    cursor: "pointer",
    padding: 0,
    position: "absolute",
    top: 1,
    width: 24,
};

const occurence = {
    border: "solid 1px yellow",
    borderRadius: 9,
    color: "white",
    fontSize: "smaller",
    position: "absolute",
    right: 4,
    bottom: 4,
};

const title = {
    display: "inline-block",
    height: "18px",
    paddingTop: "1px",
    position: "relative",
    verticalAlign: "center",
};

const emojiStyle = {
    position: "absolute",
    right: 4,
    top: -1,
};

// Time
const timeRow = { ...title, paddingLeft: pad * 4, };
const alarmStyle = { position: "absolute", bottom: 0, left: pad + 2, };
const recurStyle = { position: "absolute", right: 4, top: -2, };

// Types of meeting links to look for
// Chime, Google, GoTo Webinar, Parcel, SimplePractice, Teams, WebEx, Zoom, POTS, Video, Generic
const meetings = [
    { type: "C", regex: /(https?:\/\/chime\.aws\/[^\n <>]*)/ },
    { type: "G", regex: /(https?:\/\/meet\.google\.com\/[^\n <>]*)/ },
    { type: "GW", regex: /(https?:\/\/global\.gotowebinar\.com\/s?join\/[^\n <>]*)/ },
    { type: "P", regex: /(https?:\/\/parcel\.app\/[^\n <>]*)/ },
    { type: "SP", regex: /(https:\/\/video.simplepractice.com\/.*)/ },
    { type: "T", regex: /(https?:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\n <>]*)/ },
    { type: "W", regex: /(https?:\/\/.*\.webex\.com\/[^\n <>]*)/ },
    { type: "Z", regex: /(https?:\/\/[a-z0-9]{2,20}.zoom.[a-z]{2,3}\/.\/[^\n <>]*)/ },
    { type: "☎", regex: /(tel:.*)/ },
    { type: "🖥️", regex: /(https?:\/\/.*video.*)/ },
    { type: "W", regex: /(https?:\/\/.*)/ },
];

// Conference colors (Chime, Google, Parcel, Teams, WebEx, Zoom, POTS, Video, Generic)
const confCol = {
    "C": "black",
    "G": "red",
    "GW": "blue",
    "P": "#8b5742",
    "SP": "green",
    "T": "green",
    "W": "blue",
    "Z": "magenta",
    "☎": "green",
    "🖥️": "white",
    "W": "cornflowerblue",
};

// Availbility (busy, free, tentative)
const avail = [
    { background: dark },
    { background: fade },
    { background: stripe(0, 96, 4, -45) + "," + dark },
];

// Meeting priorities colors (done, soon, running, normal)
const prioColors = [ "white", "yellow", "red", "white", ];

// End of user-serviceable parts
//////////////////////////////////////////////////


import {css} from "uebersicht";
import * as G from "../lib/globals.jsx";

export const command = icalPal + " " + icalPalOptions.join(" ")
    + " --norc --nrd --output json events";

let now = Math.round(new Date().valueOf() / 1000);
const ITIME = 978307200;

let events = undefined;
let emoji = false;

let k = 0;

// Convert from RGB to HSL
function rgbToHsl(r, g, b) {
    var max, min, delta;
    var h, s, l;

    r /= 255;
    g /= 255;
    b /= 255;

    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    delta = max - min;

    if (delta == 0) { h = 0; }
    else if (max == r) { h = 60 * (((g - b) / delta) % 6); }
    else if (max == g) { h = 60 * (((b - r) / delta) + 2); }
    else { h = 60 * (((r - g) / delta) + 4); }

    if (h < 0) { h += 360; }

    s = (max == 0)? 0 : delta / max;
    s *= 100;

    l = max * 100;

    return {h : Math.floor(h), s : Math.floor(s), l : Math.floor(l)};
}

// Convert from HSL to RGB
function hslToRgb(h, s, l) {
    var c, x, m, r, g, b;

    s /= 100;
    l /= 100;

    c = l * s;
    x = c * (1 - Math.abs((h / 60) % 2 - 1));
    m = l - c;

    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }

    r = Math.floor((r + m) * 255 + .5);
    g = Math.floor((g + m) * 255 + .5);
    b = Math.floor((b + m) * 255 + .5);

    return {r : r, g : g, b : b};
}

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

    let n = now;
    let sc = e['sctime'].replace(/ /, "T").replace(/ .*/, "");
    let ec = e['ectime'].replace(/ /, "T").replace(/ .*/, "");

    let sd = Date.parse(sc) / 1000;
    let ed = Date.parse(ec) / 1000;

    let ti = e['trigger_interval'];

    if (ed < n) { return 0; }
    if (sd <= n && ed >= n) { return 2; }
    if ((sd - n) < -ti) { return 1; }
 
    return 3;
}

// Look for meeting links
function getLink(e) {
    let s =  e.conference_url_detected + " " + e.url + " " + e.notes + " " + e.location;
    try { s = decodeURIComponent(s); }
    catch { }

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
const df = Intl.DateTimeFormat(0, { month: "short", weekday: "short", day: "2-digit", year: "numeric" });
const tf = Intl.DateTimeFormat(0, { hour: "2-digit", minute: "numeric" });

// Epoch + 31 years
function iCalTime(t) {
    return((t.valueOf() +  ITIME) * 1000);
}

function unixTime(t) {
    return((new Date(t).valueOf() / 1000) - ITIME);
}

// Format D as D:HH:MM, H:MM or Mm
function dhm(t) {
    const d = Math.floor(t / (3600 * 24));
    const h = Math.floor((t / 3600) - (d * 24));
    const m = Math.floor(((t % 3600) / 60));

    if (d > 0) { return([d, String(h).padStart(2, '0'), String(m).padStart(2, '0')].join(":")); }
    if (h > 0) { return([h, String(m).padStart(2, '0')].join(":")); }
    return(m + "m");
}

function click(e) {
    let days = document.querySelectorAll('[day="' + e.sday + '"]');
    if (days.length == 0) { return; }

    let x = document.getElementById(e['sdate']);
    if (x.vis == undefined) { x.vis = true; }
    x.vis = !x.vis;

    x.className = (x.vis)? css(visibleDayTable) : css(hiddenDayTable);
    days.forEach(i => { i.style.display = ((x.vis)? "block" : "none"); });

    return;
}


//////////////////////////////////////////////////
// Format items for output

// The date
function Day({d}) {
    return(<span key={k++} className={css(date)}>{d}</span>);
}

// The date relative to now
function RelDay({d}) {
    const msecs = 86400000;	// Milliseconds in 24 hours

    let diff = Math.floor((Date.parse(d) - (now * 1000)) / msecs) + 1;

    let text = Math.abs(diff) + " days " + ((diff > 0)? "from now" : "ago");
    let color = 0;

    switch (diff) {
    case -2: text = "day before yesterday"; color++; break;
    case -1: text = "yesterday"; color++; break;
    case 0: text = "today"; color += 2; break;
    case 1: text = "tomorrow"; color += 3; break;
    case 2: text = "day after tomorrow"; color += 3; break;
    }

    relDay.color = relDayColors[color];

    // Make the day darker the further in the future it is
    if (color == 0) {
        const shade = Math.max(92, 255 - (diff * 16));
        const hex = shade.toString(16);
        relDay.color = '#' + hex + hex + hex;
    }

    return(<span key={k++} id={"dayCount" + diff} className={css(relDay)}>{text}</span>);
}

// Conference call button
function Conference({l}) {
    if (l == undefined) { return(""); }

    return(
        <a key={k++} href={l.url} title={l.url}>
	  <button key={k++} className={css(link)} style={{color: confCol[l.type], background: "white"}}>
	    {l.type}
	  </button>
	</a>
    );
}

// Day of multi-day events
function Occurence({e}) {
    if (e['duration'] <= 86400) { return(<span style={{paddingLeft: pad * 4}}/>); }

    return(
        <span>
          <span style={{paddingLeft: pad * 4}}/>
          <span key={k++} className={css(occurence)}>&#8201;{e['daynum']}&#8201;</span>
        </span>
    );
}

// Title of event
function Title({e}) {
    let trim = (className.width / 10) + 1;

    if (e['duration'] > 86400) {
        trim -= 3 + Math.floor(e['daynum'] / 10);
    }

    let t = e['title'];

    return(
        <span key={k++} className={css(title)}>
          {t.substr(0, trim).trimEnd()}
          {((t.length > trim)? "\u2026" : "")}
        </span>
    );
}

// Alarm icon
function Alarm({e}) {
    if (e['all_day'] || !e['trigger_interval']) { return(""); }

    return(
        <span key={k++} className={css(alarmStyle)} title={Math.abs(e['trigger_interval'] / 60) + "m"}>
          {String.fromCodePoint(0x23f0)}
        </span>
    );
}

// Icon for recurring events
// The tooltip is for debugging
function Recur({e}) {
    if (! e['has_recurrences']) { return(""); }
    if (e['calendar'].includes("Holiday")) { return(""); }
    if (emoji) { return(""); }

    let spec = "";

    if (G.getLevel() == G.DEBUG) {
        spec = "S:" + e['specifier']
            + ":F" + e['frequency']
            + ":I" + e['interval']
            + ":C" + e['count'];

        if (e['rdate'] != undefined) {
            spec +=  ":R " + e['rdate'];
        }
    }

    return(
        <span key={k++} className={css(recurStyle)} title={spec}>
          {String.fromCodePoint(0x1f501)}
        </span>
    );
}

// Emojis for birthdays and holidays
function Emoji({e}) {
    let cp = undefined;
    let cs = undefined;
    emoji = false;

    if (e == undefined) { return(""); }

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

        // Regional
        else if (e['title'] == "Day of the Dead") { cp = 0x1f480; }
    }

    if (cs || cp) {
        emoji = true;
        return(
            <span key={k++} className={css(emojiStyle)}>
              {cs? cs : String.fromCodePoint(cp)}
            </span>
        );
    }

    return("");
}


//////////////////////////////////////////////////
// Day header

function DayHeader({e}) {
    return(
        <div key={k++} id={e['sdate']} className={css(visibleDayTable)}
             onClick={() => click(e)}>
          <Day d={e['sdate']}/>
          <RelDay d={e['sdate']}/>
        </div>
    );
}


//////////////////////////////////////////////////
// Event

// Title
function TitleRow({e}) {
    if (e['invitation_status'] != 0) { titleRow.color = "white"; }

    // Lighter
    let hsl = rgbToHsl(Number("0x" + e['color'].substring(1, 3)),
                       Number("0x" + e['color'].substring(3, 5)),
                       Number("0x" + e['color'].substring(5, 7)));
    let rgb = hslToRgb(hsl.h, Math.min(hsl.s, 40), Math.max(hsl.l, 70));
    titleRow.color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    // Birthdays
    if (e['calendar'] == "Birthdays") {
	let sd = new Date(e['sdate']);
	let ed = new Date((e['start_date'] + ITIME) * 1000);
	e['title'] += " (" + (sd.getFullYear() - ed.getFullYear()) + ")";
    }

    // Tooltip
    let tt = e['title'];
    tt += "\n" + '-'.repeat(40);
    tt += `\n${e['calendar']} (${e['account']})`;
    if (e['location']) { tt += "\n" + "-".repeat(80) + "\n" + e['location']; }
    if (e['notes']) { tt += "\n" + "-".repeat(80)  + "\n" + e['notes']; }

    return(
        <div key={k++} className={css(titleRow)} title={tt}>
          <Conference l={getLink(e)}/>
          <Occurence e={e}/>
          <Title e={e}/>
        </div>
    );
}

// Time
function TimeRow({e}) {
    if (e['all_day']) { return(""); }

    // Urgency
    timeRow.color = prioColors[e['urgency']];

    // Duration
    let startEnd = tf.format(iCalTime(e['start_date']));

    if (e['duration'] != 0) {
        startEnd += " - " + tf.format(iCalTime(e['end_date'])) + " (" + dhm(e['duration']) + ")";
    }

    // Tooltip
    let tt = undefined;
    if (e['attendees']) { tt = e['attendees'].sort().join("\n"); }

    return(
	<div key={k++} className={css(timeRow)} title={tt}>
	  {startEnd}
	</div>
    );
}

// Div to contain an event
function Event({e}) {
    let eventStyle = (e['all_day'])? allDay : avail[e['availability']];

    e['urgency'] = getUrgency(e);

    eventStyle.color = e['color'];
    eventStyle.opacity = (e['urgency'] == 0)? .666 : 1;

    return(
        <div>
          <div key={k++} day={e.sday} className={css(eventTable)} style={{...eventStyle}}>
            <TitleRow e={e}/>
            <TimeRow e={e}/>

            <Alarm e={e}/>
            <Emoji e={e}/>
            <Recur e={e}/>
          </div>

          <div day={e.sday} style={{height: spacing.event}}/>
        </div>
    );
}

///////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////
// init

export function init() {
    G.level(G.INFO, "icalPal");
    G.clear();

    G.info(command);
}


//////////////////////////////////////////////////
// updateState

export function updateState(payload) {
    G.debug([ "US", payload ]);

    events = [];

    if (payload == undefined) { return(undefined); }
    if (payload.output == undefined) { return(undefined); }

    now = Math.round(new Date().valueOf() / 1000);

    try {
        let j = JSON.parse(payload.output);
        for (let i in j) { events.push(j[i]); }
        events.sort(function(a, b) { return a['stime'] - b['stime']; });
        return(true);
    }
    catch(e) {
        console.error([ "US", e ]);
        return(undefined);
    }
}


//////////////////////////////////////////////////
// render

export function render() {
    if (! Array.isArray(events)) { return(<div><i>Loading...</i></div>); }
    if (events.length == 0) { return(<div>No events</div>); }

    let sday = -1;
    k = 0;

    const retval = [];

    for (let event in events) {
        let e = events[event];

        e['sday'] = df.format(new Date(e['sdate'])).replace(/, /g, " ");

        if (e['sday'] != sday) {
            if (sday != -1) { retval.push(<div key={k++} style={{height: spacing.days}}/>); }
            retval.push(<DayHeader key={k++} e={e}/>);

            sday = e['sday'];
        }

        retval.push(<Event key={k++} e={e}/>);
    };

    return(retval);
}
