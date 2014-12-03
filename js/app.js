(function() {
	var app = angular.module('scheduler', [ ]);


	app.controller('ScheduleController', function () {
		this.searchResults = SCHEDULER.courses;
		this.query = "";
		this.current = this.searchResults[0];

		this.updateSearchResults = function () {
			this.searchResults = SCHEDULER.search(this.query.toUpperCase());
			this.current = this.searchResults[0];
		};


		this.currentlySelectedQuery = "";
		this.currentlySelected = [];

		this.addCourseToSelected = function () {
			if (this.currentlySelected.indexOf(this.current) === -1) {
				this.currentlySelected.push(this.current);
			}
		};

		this.removeCourseFromSelected = function () {
			var index = this.currentlySelected.indexOf(this.currentlySelectedQuery[0]);
			this.currentlySelected = this.currentlySelected.splice(0, index).concat(
							this.currentlySelected.splice(1));

		};


		this.schedules = [];
		this.currentSchedule = null;

		this.makeSchedule = function () {
			this.schedules = makeMySchedule(this.currentlySelected.map(function (arr) {
				return arr[0].id;
			}));
		};

		this.sendScheduleToCalendar = function () {
			CALENDAR.update(this.currentSchedule[0]);
		};

		
	});
})();