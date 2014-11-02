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
            req,
            idPattern   = new RegExp("[A-Z]{1,4} ?[0-9]{3}"),
            lecPattern  = new RegExp("[A-Z]{1,4} ?[0-9]{3}[A-Z]$"),
            recPattern  = new RegExp("[A-Z]{1,4} ?[0-9]{3}R[A-Z]+$"),
            wsPattern   = new RegExp("[A-Z]{1,4} ?[0-9]{3}W[S01]"),
            labPattern  = new RegExp("[A-Z]{1,4} ?[0-9]{3}L[A-Z]$");

        /**
         * Course object constructor
         */
        function Course(id_, title_) {
            this.id = id_;
            this.title = title_;
            this.lectures = [];
            this.recitations = [];
            this.workshops = [];
            this.labs = [];

            this.addSection = function (sectionObj) {
                if (lecPattern.test(sectionObj.section)) {
                    this.lectures.push(sectionObj);
                } else if (recPattern.test(sectionObj.section)) {
                    this.recitations.push(sectionObj);
                } else if (wsPattern.test(sectionObj.section)) {
                    this.workshops.push(sectionObj);
                } else if (labPattern.test(sectionObj.section)) {
                    this.labs.push(sectionObj);
                } else {
                    console.log("Unidentified Class Type: " + sectionObj.section);
                    console.log(sectionObj);
                }
            };
        }

        /**
         * Section object constructor
         * Use for lectures, recitations, workshops, and labs
         */
        function Section(xmlObj, type_) {
            var i, j, d, meetingObjs;

            this.type           = type_;

            // Get values from XML tag
            this.section        = xmlObj.getAttribute("Section");
            this.title          = xmlObj.getAttribute("Title");
            this.callnumber     = xmlObj.getAttribute("CallNumber");
            this.mincredit      = xmlObj.getAttribute("MinCredit");
            this.maxcredit      = xmlObj.getAttribute("MaxCredit");
            this.maxenrollment  = xmlObj.getAttribute("20"); // TODO this may need to be parseInt()'d
            this.currenrollment = xmlObj.getAttribute("CurrentEnrollment");
            this.status         = xmlObj.getAttribute("Status");
            this.startdate      = new Date(xmlObj.getAttribute("StartDate"));
            this.enddate        = new Date(xmlObj.getAttribute("EndDate"));
            this.instructor     = xmlObj.getAttribute("Instructor1");

            // Get meetings from sub-elements of the tag
            this.meetings       = [];
            meetingObjs         = xmlObj.getElementsByTagName("Meeting");

            for (i = 0; i < meetingObjs.length; i += 1) {
                d = meetingObjs[i].getAttribute("Day");

                if (d === "TBA") {
                    this.meetings.push(new Meeting(meetingObjs[i], d))
                }
                for (j = 0; j < d.length; j += 1) {
                    this.meetings.push(new Meeting(meetingObjs[i], d[j]));
                }
            }
        }

        /**
         * Meeting object constructor
         */
        function Meeting(xmlObj, day_) {
            this.day        = day_;
            this.starttime  = new Time(xmlObj.getAttribute("StartTime"));
            this.endtime    = new Time(xmlObj.getAttribute("EndTime"));
            this.site       = xmlObj.getAttribute("Site"); // This may be unnecessary
            this.building   = xmlObj.getAttribute("Building");
            this.room       = xmlObj.getAttribute("Room");
            this.activity   = xmlObj.getAttribute("Activity");

            this.checkConflict = function (otherMeeting) {
                if (otherMeeting.day !== this.day || otherMeeting.starttime === true) {
                    return false;
                } else if (otherMeeting.starttime >= this.starttime &&
                           this.endtime >= otherMeeting.starttime) {
                    return true;
                } else if (this.starttime >= otherMeeting.starttime &&
                           otherMeeting.endtime >= this.starttime) {
                    return true;
                }
                return false;
            };
        }

        scheduler.Meeting = Meeting;

        /**
         * Time object constructor
         */
        function Time(timeStr) {
            if (timeStr === null || timeStr === undefined) {
                this.hour ==
            }
            this.hour   = parseInt(timeStr);
            this.minute = parseInt(timeStr.slice(3));

            // Returns minute difference between otherTime and this time
            this.compareTo = function (otherTime) {
                return o
            }
        }

        /**
         * Parses the XML Course tags, grouping different sections together for a course
         * as well as recitations, workshops, and labs
         *
         * @returns void; all items are stored within SCHEDULER
         */
        function parseXMLCourses(xmlCourseArray) {
            var i,
                j,
                course,
                sections = [];

            for (i = 0; i < xmlCourseArray.length; i += 1) {
                sections.push(new Section(xmlCourseArray[i]));
            }

            for (i = 0; i < sections.length; i += 1) {
                course = new Course(sections[i].section.match(idPattern)[0], sections[i].title);
                for (j = 0; j < sections.length; j += 1) {
                    if (sections[j].section.match(idPattern)[0] === course.id) {
                        course.addSection(sections.splice(j, 1)[0]);
                        j -= 1;
                    }
                }
                courses.push(course);
            }
        }

        
        scheduler.find = function(id) {
            var i;
            for (i = 0; i < courses.length; i += 1) {
                if (courses[i].id.indexOf(id) !== -1) {
                    console.log(courses[i]);
                }
            }
        };

        function addToList(text) {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(text));
            itemList.appendChild(li);
        }


        scheduler.init = function () {
            var fileToGet = '2015S-' + (new Date()).toISOString().slice(0, 10) + '.xml';

            if (window.XMLHttpRequest) {
                req = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            }

            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    parseXMLCourses(req.responseXML.documentElement.getElementsByTagName("Course"));
                }
            };
            req.open('GET', fileToGet, true);
            req.send();
        };


        scheduler.addCourse = function () {
            var i, j, query = document.getElementById("course_input").value;

            for (i = 0; i < courses.length; i += 1) {
                if (courses[i].id === query) {
                    for (j = 0; j < courses[i].lectures.length; j += 1) {
                        addToList(courses[i].lectures[j].section);
                    }
                }
            }
        };


        scheduler.search = function (query) {
            var i, tr, td;

            for (i = 0; i < courses.length; i += 1) {
                if (courses[i].id.indexOf(query) >= 0 ||
                    courses[i].title.toUpperCase().indexOf(query) >= 0) {
                    tr = document.createElement("tr"),
                    td = document.createElement("td"),
                    td.appendChild(document.createTextNode(courses[i].id + " - " + courses[i].title));
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

        scheduler.courses = courses;
        return scheduler;
    })();


window.onload = SCHEDULER.init();
window.onkeydown = function (event) {
    "use strict";
    if (event.keyCode === 13) {
        SCHEDULER.addCourse();
    }
};