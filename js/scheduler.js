/**
 * ~~ Course Scheduler ~~
 * Author: Patrick Grasso
 *
 * The application pulls data from Stevens' course scheduler XML data file and
 * creates possible schedules based on the courses you select.
 */

/*jslint browser: true*/
/*global TERM: true*/
/*global ActiveXObject*/
/*global console*/
var TERM = "2015S";

var SCHEDULER = (function () {
        "use strict";

        var scheduler = {},
            courses = [],
            itemList = document.getElementById("courses"),
            suggestionBox = document.getElementById("suggest_box"),
            req;


        function loadCourses() {
            var response = 1;

            if (req.readyState === 4) {
                response = req.responseXML.documentElement;
                courses = response.getElementsByTagName('Course');
            }
        }


        function addToList(text) {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(text));
            itemList.appendChild(li);
        }


        scheduler.init = function () {
            if (window.XMLHttpRequest) {
                req = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            }

            req.onreadystatechange = function () {
                loadCourses();
            };
            req.open('GET', '2015S.xml', true);
            req.send();
        };


        scheduler.addCourse = function () {
            var i, query = document.getElementById("course_input").value;
        };


        scheduler.search = function (query) {
            var i, tr, td;

            for (i = 0; i < courses.length; i += 1) {
                if (courses[i].getAttribute("Section").indexOf(query) >= 0 ||
                    courses[i].getAttribute("Title").toUpperCase().indexOf(query) >= 0) {
                    tr = document.createElement("tr"),
                    td = document.createElement("td"),
                    td.appendChild(document.createTextNode(courses[i].getAttribute("Section") + " - " + courses[i].getAttribute("Title")));
                    tr.appendChild(td);
                    tr.addEventListener('click', function(event) {
                        document.getElementById("course_input").value = event.target.innerText;
                        while (suggestionBox.firstChild) {
                            suggestionBox.removeChild(suggestionBox.firstChild);
                        }
                    });
                    suggestionBox.appendChild(tr);
                }
            }
        };


        scheduler.updateSuggestions = function (query) {
            while (suggestionBox.firstChild) {
                suggestionBox.removeChild(suggestionBox.firstChild);
            }
            if (query === '' || query.trim() === '') {
                return;
            }
            
            this.search(query.toUpperCase());
        };

        return scheduler;
    })();


window.onload = SCHEDULER.init();
window.onkeydown = function (event) {
    "use strict";
    if (event.keyCode === 13) {
        SCHEDULER.addCourse();
    }
};