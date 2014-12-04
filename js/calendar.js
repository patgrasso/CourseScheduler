/**
 * Title: calendar.js
 * Author: Patrick Grasso
 *
 * Description: Handles the HTML weekly calendar (table)
 *
 */
var CALENDAR = (function () {
		"use strict";

		var calendar = {},
			timeslot = [],
			wrapper,
			dayIndex = {'M': 0, 'T': 1, 'W': 2, 'R': 3, 'F': 4};


		calendar.init = function () {
			var i, j, tr, td;

			wrapper = document.createElement('table');
			document.getElementsByTagName('calendar')[0].appendChild(wrapper);

			// M-F
			tr = document.createElement('tr');
			td = document.createElement('td');
			tr.appendChild(td);
			td = document.createElement('td');
			td.appendChild(document.createTextNode('M'));
			tr.appendChild(td);
			td = document.createElement('td');
			td.appendChild(document.createTextNode('T'));
			tr.appendChild(td);
			td = document.createElement('td');
			td.appendChild(document.createTextNode('W'));
			tr.appendChild(td);
			td = document.createElement('td');
			td.appendChild(document.createTextNode('R'));
			tr.appendChild(td);
			td = document.createElement('td');
			td.appendChild(document.createTextNode('F'));
			tr.appendChild(td);
			wrapper.appendChild(tr);

			for (i = 0; i < 13; i += 1) {
				timeslot[i] = [];
				tr = document.createElement('tr');
				td = document.createElement('td');
				td.appendChild(document.createTextNode((i + 8) % 13));
				tr.appendChild(td);
				for (j = 0; j < 5; j += 1) {
					timeslot[i][j] = document.createElement('td');
					tr.appendChild(timeslot[i][j]);
				}
				wrapper.appendChild(tr);
			}
		};


		calendar.update = function (schedule) {
			var section, meeting, i;

			calendar.clear();

			for (section in schedule) {
				section = schedule[section];
				for (meeting in section.meetings) {
					meeting = section.meetings[meeting];

					for (i = Math.round(meeting.starttime.hour + meeting.starttime.minute / 60) - 3;
							i < Math.round(meeting.endtime.hour + meeting.endtime.minute / 60) - 3;
							i += 1) {
						modifyTD(i, dayIndex[meeting.day]+1, section.section);
					}
				}
			}
		};


		calendar.clear = function () {
			var i, j;

			for (i in timeslot) {
				for (j in timeslot[i]) {
					timeslot[i][j].innerHTML = '';
				}
			}
		};


		function modifyTD(i, j, text) {
			var td = document.getElementsByTagName('tr')[i].childNodes[j]
			td.style = 'background-color: #ffff00;';
			td.appendChild(document.createTextNode(text));
		}

		calendar.timeslot = timeslot;

		calendar.init();
		return calendar;
	})();