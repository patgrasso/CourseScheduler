(function() {
	var app = angular.module('scheduler', [ ]);


	app.controller('CourseSelectController', function () {
		this.searchResults = SCHEDULER.courses;
		this.query = "";

		this.updateSearchResults = function () {
			this.searchResults = SCHEDULER.search(this.query.toUpperCase());
		};
	});
})();