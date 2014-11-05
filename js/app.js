(function() {
	var app = angular.module('scheduler', [ ]);


	app.controller('ScheduleController', function () {
		this.searchResults = SCHEDULER.courses;
		this.query = "";
		this.current = this.searchResults[0];
		this.currentSection = null;

		this.updateSearchResults = function () {
			this.searchResults = SCHEDULER.search(this.query.toUpperCase());
			this.current = this.searchResults[0];
			this.currentSection = this.searchResults[0].lectures[0];
		};

		this.updateRecitations = function () {
			this.currentSection = this.currentSelection.lectures[0];
		};
	});
})();