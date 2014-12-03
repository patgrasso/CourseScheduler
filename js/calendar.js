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
			wrapper;

		calendar.init = function () {
			var i, j, tr;

			wrapper = document.createElement('table');
			document.getElementsByTagName('calendar')[0].appendChild(wrapper);

			for (i = 0; i < 13; i += 1) {
				timeslot[i] = [];
				tr = document.createElement('tr');
				for (j = 0; j < 5; j += 1) {
					timeslot[i][j] = document.createElement('td');
					tr.appendChild(timeslot[i][j]);
				}
				wrapper.appendChild(tr);
			}
		};

		calendar.timeslot = timeslot;

		calendar.init();
		return calendar;
	})();