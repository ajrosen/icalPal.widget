# icalPal

Calendar widget for [Übersicht](https://tracesof.net/uebersicht/) using [icalPal](https://github.com/ajrosen/icalPal/).

<img height=320 src="https://github.com/ajrosen/icalPal.widget/blob/6d69d88825dcef37ca4855e4ecd70260d237de27/screenshot.png"/>

## Installation

Extract [icalPal.widget.zip](https://github.com/ajrosen/icalPal.widget/blob/6d69d88825dcef37ca4855e4ecd70260d237de27/icalPal.widget.zip) into your widgets folder.

## Configuration

Standard positioning, font selection, colors, etc., are at the top of icalPal.jsx.

icalPal.cf stores the options that are passed to icalPal.  This is the best place to choose which calendars you want to show.  See [icalPal Usage](https://github.com/ajrosen/icalPal/blob/main/README.md#usage) for the available options.

## Usage

There is a hidden scrollbar, allowing you to show as many events as you want without overwhelming your desktop.

The meeting indicators are clickable.  They will open the meeting link in your default browser.

The event colors match the color of the event's calendar, as chosen in the Calendar app.

The repeat icon :repeat: is shown for recurring events.

The alarm icon :alarm_clock: is shown for events that have an alert set.

Events with a striped background indicate that you are *tentative* for the event.  A gradient means you are *free*, and a solid background means you are *busy*.

### Tooltips

Some components of an event show tooltips when you hover over them.

* The title shows the calendar, account, notes, and location of the event
* The time will list the attendees of a meeting
* The meeting indicator shows the meeting link
* The alarm indicator shows how long before the event the (last) alarm is set for
