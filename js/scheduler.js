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
         * Time object constructor
         */
        function Time(timeStr) {
            if (timeStr === null || timeStr === undefined) {
                this.hour = null;
                this.minute = null;
            } else {
                this.hour   = parseInt(timeStr, 10);
                this.minute = parseInt(timeStr.slice(2), 10) || parseInt(timeStr.slice(3), 10);
            }

            // Returns minute difference between otherTime and this time
            this.compareTo = function (otherTime) {
                if (otherTime === null || otherTime.hour === null) {
                    return 0;
                }
                return ((this.hour * 60) + this.minute) - ((otherTime.hour * 60) + otherTime.minute);
            };
        }


        /**
         * Meeting object constructor
         */
        function Meeting(xmlObj, day) {
            this.day        = day;
            this.starttime  = new Time(xmlObj.getAttribute("StartTime"));
            this.endtime    = new Time(xmlObj.getAttribute("EndTime"));
            this.site       = xmlObj.getAttribute("Site"); // This may be unnecessary
            this.building   = xmlObj.getAttribute("Building");
            this.room       = xmlObj.getAttribute("Room");
            this.activity   = xmlObj.getAttribute("Activity");

            this.checkConflict = function (otherMeeting) {
                if (otherMeeting.day !== this.day || otherMeeting.starttime.hour === null) {
                    return false;
                }
                if (otherMeeting.starttime.compareTo(this.starttime) >= 0 &&
                           this.endtime.compareTo(otherMeeting.starttime) >= 0) {
                    return true;
                }
                if (this.starttime.compareTo(otherMeeting.starttime) >= 0 &&
                           otherMeeting.endtime.compareTo(this.starttime) >= 0) {
                    return true;
                }
                return false;
            };
        }


        /**
         * Course object constructor
         */
        function Course(id, title) {
            this.id = id;
            this.title = title;
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
                }/* else {
                    console.log("Unidentified Class Type: " + sectionObj.section);
                    console.log(sectionObj);
                }*/
            };
        }


        /**
         * Section object constructor
         * Use for lectures, recitations, workshops, and labs
         */
        function Section(xmlObj, type) {
            var i, j, d, meetingObjs;

            this.type           = type;

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
                    this.meetings.push(new Meeting(meetingObjs[i], d));
                }
                for (j = 0; j < d.length; j += 1) {
                    this.meetings.push(new Meeting(meetingObjs[i], d[j]));
                }
            }

            this.checkConflict = function (otherSection) {
                var i, j;

                for (i = 0; i < this.meetings.length; i += 1) {
                    for (j = 0; j < otherSection.meetings.length; j += 1) {
                        if (this.meetings[i].checkConflict(otherSection.meetings[j])) {
                            return true;
                        }
                    }
                }
                return false;
            };
        }


        function getValidSchedules(schedule, course) {
            var i, j, k, valid, tempSchedules, newSchedules;

            // Go through each lecture in the course. If the lecture fits into a
            // schedule (doesn't conflict with ANY section in the schedule), copy
            // the schedule, push the lecture section, and push it to newSchedules
            newSchedules = balaclava(schedule, course.lectures);

            if (course.recitations.length > 0) {
                for (i = 0, tempSchedules = []; i < newSchedules.length; i += 1) {
                    tempSchedules = tempSchedules.concat(balaclava(newSchedules[i], course.recitations));
                }
                newSchedules = tempSchedules;
            }
            if (course.workshops.length > 0) {
                for (i = 0, tempSchedules = []; i < newSchedules.length; i += 1) {
                    tempSchedules = tempSchedules.concat(balaclava(newSchedules[i], course.workshops));
                }
                newSchedules = tempSchedules;
            }
            if (course.labs.length > 0) {
                for (i = 0, tempSchedules = []; i < newSchedules.length; i += 1) {
                    tempSchedules = tempSchedules.concat(balaclava(newSchedules[i], course.labs));
                }
                newSchedules = tempSchedules;
            }
            return newSchedules;
        }

        function balaclava(schedule, sections) {
            var i, j, valid, tempSchedule, newSchedules = [];

            for (i = 0, valid = false; i < sections.length; i += 1) {
                for (j = 0, valid = true; j < schedule.length; j += 1) {
                    valid &= !schedule[j].checkConflict(sections[i]);
                }
                if (valid) {
                    tempSchedule = schedule.slice(0);
                    tempSchedule.push(sections[i]);
                    newSchedules.push(tempSchedule);
                }
            }
            return newSchedules;
        }

        function mash(scheduleList, course) {
            var i, newSchedules = [];

            if (course === null || course === undefined) {
                return scheduleList;
            }
            for (i = 0; i < scheduleList.length; i += 1) {
                newSchedules = newSchedules.concat(getValidSchedules(scheduleList[i], course));
            }
            return newSchedules;
        }

        scheduler.mash = mash;



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
                        i -= (i === j) ? 1 : 0;
                        j -= 1;
                    }
                }
                courses.push(course);
            }
            test();
        }


        scheduler.find = function (id) {
            var i;
            for (i = 0; i < courses.length; i += 1) {
                if (courses[i].id.indexOf(id) !== -1) {
                    return courses[i];
                }
            }
        };

        scheduler.deepFind = function (id) {
            var i, j;
            for (i = 0; i < courses.length; i += 1) {
                if (courses[i].id.indexOf(id) !== -1) {
                    return courses[i];
                }
                for (j = 0; j < courses[i].lectures.length; j += 1) {
                    if (courses[i].lectures[j].section.indexOf(id) !== -1) {
                        return courses[i];
                    }
                }
                for (j = 0; j < courses[i].recitations.length; j += 1) {
                    if (courses[i].recitations[j].section.indexOf(id) !== -1) {
                        return courses[i];
                    }
                }
            }
        };

        function addToList(text) {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(text));
            itemList.appendChild(li);
        }


        scheduler.init = function () {
            var fileToGet = '2015S-' + (new Date()).toLocaleDateString().replace(/\//g, '-') + '.xml';

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
            var i, results = [];

            for (i = 0; i < courses.length; i += 1) {
                if (courses[i].id.indexOf(query) >= 0 ||
                    courses[i].title.toUpperCase().indexOf(query) >= 0) {
                    results.push(courses[i]);
                }
            }
            return results;
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


// TEMPORARY ~~ TESTING //
var x, y, z;

function test() {
    z = SCHEDULER.find('MA 123');
    y = [[z.lectures[0], z.recitations[0]]];
    x = SCHEDULER.mash(y, SCHEDULER.find('CS 385'));
}

function makeMySchedule(courseArray) {
    var i, schedules = [[]];

    for (i = 0; i <= courseArray.length; i += 1) {
        schedules = SCHEDULER.mash(schedules, SCHEDULER.find(courseArray[i]));
    }
    return schedules;
}

function craftLink(schedule) {
    var i, link = "http://web.stevens.edu/scheduler/#2015S=";

    for (i = 0; i < schedule.length; i += 1) {
        link += schedule[i].callnumber + ',';
    }
    return link;
}