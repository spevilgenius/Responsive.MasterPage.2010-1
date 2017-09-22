// jQuery Gantt Chart
// ==================
/*
		**************   **************   ************      **************
		**************   **************   **************    **************
		**************   *****    *****   *****     *****   *****    *****
		    ******       ****      ****   ****       ****   ****      ****
		    ******       ****      ****   ****       ****   ****      ****
		    ******       ****      ****   ****       ****   ****      ****
		    ******       ****      ****   ****       ****   ****      ****
		    ******       ****      ****   ****       ****   ****      ****
		    ******       *****    *****   *****     *****   *****    *****
		    ******       **************   **************    **************
		    ******       **************   ************      **************
*/
// Basic usage:
/*
        $(".selector").gantt({
            source: [],  // Data Array from "ajax / data.json"
            source_M: [],
            itemsPerPage: 7,
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            dow: ["S", "M", "T", "W", "T", "F", "S"],
            startPos: new Date(),
            offsetUTCHrs: (new Date().getTimezoneOffset() / 60),
            navigate: "buttons",
            scale: "hours|days|weeks|months",  //Default: 'weeks'
            useCookie: false,
            maxScale: "hours|days|weeks|months",  //Default: 'weeks'
            minScale: "hours|days|weeks|months",  //Default: 'months'
            usePowerTips: false,
            showHolidays: true,
            waitText: "Please wait...",
            scrollToToday: true,
            offsetTodayDays: 6,
			detailsPanel: {
				panelWidth: 200,
				columnCount: 2
				columnNames: ["Name","Desc"],
				columnWidths: [100,100],
				columnAlign: ["left","left"]
			},
			onItemClick: function(data) {
			  alert("Item clicked - show some details");
			},
			onAddClick: function(dt, rowId) {
			  alert("Empty space clicked - add an item!");
			},
			onRender: function() {
			  console.log("chart rendered");
			},
            onDataLoadFailed: function(data) {
			  alert("Data Load Failed - show some details");
			}
        });
*/
// Data Content Format:
/*
		//All Properties/Elements are REQUIRED unless noted otherwise
        dataObj = [{
        	id: "0", //uniqueID of the Data Item
			name: " ", //Item name/text
			desc: " ", //Item description
			tooltip: false,  //true|false - use 'title' or 'alt' attributes for displaying a tooltip
			detailsPanel_Data: [" "," "], //Array equal in size to the detailsPanel settings that contains data for each column
			powerTip_Data: "", //If the usePowerTips settings is set to 'true' then the powerTip data comes from this property
			eventBar: { //Object used to build the event bar
				from: DateTime.UTC, //DateTime in UTC format for the start date of the event
				to: DateTime.UTC, //DateTime in UTC format for the end date of the event
				label: "",  //String to use on the event bar
				bgColor: "#ffffff"|rgb(0,0,0),  //Color of the event bar
				txtColor: "#ffffff"|rgb(0,0,0), //Color of the label text on the bar
			},
			dataObj: { //Data Object to be used for callback functions set in the settings - e.g. onItemClick, onAddClick, onDataLoadFailed
				//Object properties are whatever is needed for the callback functionality
				//If not using the dataObj with the callback functions an empty object must still be supplied - {}
				id: "",   //Example property - id
				title: "" //Example property - title
			}
		}];
*/

//
/*jshint shadow:true, unused:false, laxbreak:true, evil:true*/
/*globals jQuery, alert*/
(function ($) {

    "use strict";

    $.fn.gantt = function (options) {

        var cookieKey = "jquery.fn.gantt";
        var scales = ["hours", "days", "weeks", "months"];
        var tblLeftPanel = null;
		var startX, startWidth; var pressed = false; var start = undefined;
		
        //Default settings
        var settings = {
            source: [],
            source_M: [],
            itemsPerPage: 7,
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            dow: ["S", "M", "T", "W", "T", "F", "S"],
            startPos: new Date(),
            offsetUTCHrs: (new Date().getTimezoneOffset() / 60),
            navigate: "buttons",
            scale: "days",
            useCookie: false,
            maxScale: "months",
            minScale: "hours",
            usePowerTips: false,
            showHolidays: true,
            waitText: "Please wait...",
            scrollToToday: true,
            offsetTodayDays: 6,
			detailsPanel: [{
				detailsWidth: 200,
				columnNames: "Name|Desc",
				columnWidths: "100|100"
			}],
            onItemClick: function (data) { return; },
            onAddClick: function (data) { return; },
            onRender: function() { return; },
            onDataLoadFailed: function(data) { return; }
        };

        /**
        * Extend options with default values
        */
        if (options) {
            $.extend(settings, options);
        }

        // can't use cookie if don't have `$.cookie`
        settings.useCookie = settings.useCookie && $.isFunction($.cookie);

        // custom selector `:findday` used to match on specified day in ms.
        //
        // The selector is passed a date in ms and elements are added to the
        // selection filter if the element date matches, as determined by the
        // id attribute containing a parsable date in ms.
        $.extend($.expr[":"], {
            findday: function (a, i, m) {
                var cd = new Date(parseInt(m[3], 10));
                var id = $(a).attr("id");
                id = id ? id : "";
                var si = id.indexOf("-") + 1;
                var ed = new Date(parseInt(id.substring(si, id.length), 10));
                cd = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate());
                ed = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate());
                return cd.getTime() === ed.getTime();
            }
        });
        // custom selector `:findweek` used to match on specified week in ms.
        $.extend($.expr[":"], {
            findweek: function (a, i, m) {
                var cd = new Date(parseInt(m[3], 10));
                var id = $(a).attr("id");
                id = id ? id : "";
                var si = id.indexOf("-") + 1;
                cd = cd.getFullYear() + "-" + cd.getDayForWeek().getWeekOfYear();
                var ed = id.substring(si, id.length);
                return cd === ed;
            }
        });
        // custom selector `:findmonth` used to match on specified month in ms.
        $.extend($.expr[":"], {
            findmonth: function (a, i, m) {
                var cd = new Date(parseInt(m[3], 10));
                cd = cd.getFullYear() + "-" + cd.getMonth();
                var id = $(a).attr("id");
                id = id ? id : "";
                var si = id.indexOf("-") + 1;
                var ed = id.substring(si, id.length);
                return cd === ed;
            }
        });

		// String prototype helper
		// =======================
		String.prototype.width = function(font) {
		  var f = font || '12px arial',
		      o = $('<div>' + this + '</div>')
		            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
		            .appendTo($('body')),
		      w = o.width();
			  o.remove();
			  
		  return w;
		}

        // Date prototype helpers
        // ======================
        
        // Add Days
		Date.prototype.addDays = function(days) {
		    this.setDate(this.getDate() + days);
		    return this;
		};

        // `getWeekId` returns a string in the form of 'dh-YYYY-WW', where WW is
        // the week # for the year.
        // It is used to add an id to the week divs
        Date.prototype.getWeekId = function () {
            var y = this.getFullYear();
            var w = this.getDayForWeek().getWeekOfYear();
            var m = this.getMonth();
            if (m === 11 && w === 1) {
                y++;
            }
            return 'dh-' + y + "-" + w;
        };

        // `getRepDate` returns the seconds since the epoch for a given date
        // depending on the active scale
        Date.prototype.getRepDate = function () {
            switch (settings.scale) {
                case "hours":
                    return this.getTime();
                case "weeks":
                    return this.getDayForWeek().getTime();
                case "months":
                    return new Date(this.getFullYear(), this.getMonth(), 1).getTime();
                default:
                    return this.getTime();
            }
        };

        // `getDayOfYear` returns the day number for the year
        Date.prototype.getDayOfYear = function () {
            var fd = new Date(this.getFullYear(), 0, 0);
            var sd = new Date(this.getFullYear(), this.getMonth(), this.getDate());
            return Math.ceil((sd - fd) / 86400000);
        };

        // `getWeekOfYear` returns the week number for the year
        Date.prototype.getWeekOfYear = function () {
            var ys = new Date(this.getFullYear(), 0, 1);
            var sd = new Date(this.getTime());
            // Find Thursday of this week starting on Monday
            sd.setDate(sd.getDate() + 4 - (sd.getDay() || 7));
            return Math.floor(Math.round((sd - ys) / 86400000) / 7) + 1;
        };

        // `getDaysInMonth` returns the number of days in a month
        Date.prototype.getDaysInMonth = function () {
            return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate();
        };

        // `hasWeek` returns `true` if the date resides on a week boundary
        // **????????????????? Don't know if this is true**
        Date.prototype.hasWeek = function () {
            var df = new Date(this.valueOf());
            df.setDate(df.getDate() - df.getDay());
            var dt = new Date(this.valueOf());
            dt.setDate(dt.getDate() + (6 - dt.getDay()));

            if (df.getMonth() === dt.getMonth()) {
                return true;
            } else {
                return (df.getMonth() === this.getMonth() && dt.getDate() < 4) || (df.getMonth() !== this.getMonth() && dt.getDate() >= 4);
            }
        };

        // `getDayForWeek` returns the Date object for the starting date of
        // the week # for the year
        Date.prototype.getDayForWeek = function () {
            var df = new Date(this.valueOf());
            df.setDate(df.getDate() - df.getDay());
            var dt = new Date(this.valueOf());
            dt.setDate(dt.getDate() + (6 - dt.getDay()));
            if ((df.getMonth() === dt.getMonth()) || (df.getMonth() !== dt.getMonth() && dt.getDate() >= 4)) {
                return new Date(dt.setDate(dt.getDate() - 3));
            } else {
                return new Date(df.setDate(df.getDate() + 3));
            }
        };
		/* Validation Methods */
		function isUndefined(isX) {
			return typeof isX === 'undefined';
		}
		function isFunction(isX) {
			return typeof isX === 'function';
		}
		function isObject(isX) {
			return typeof isX === 'object';
		}
		function isString(isX) {
			return typeof isX === 'string';
		}
		function isBoolean(isX) {
			return typeof isX === 'boolean';
		}
		function isNumber(isX) {
			return typeof isX === 'number';
		}
		function isArray(isX) {
			return Object.prototype.toString.call(isX) === '[object Array]';
		}
		function isEmptyObject(obj) {
		    var name;
		    for (name in obj) {
		        return false;
		    }
		    return true;
		}
        // fixes https://github.com/taitems/jQuery.Gantt/issues/62
        function ktkGetNextDate(currentDate, scaleStep) {
            for(var minIncrements = 1;; minIncrements++) {
                var nextDate = new Date(currentDate);
                nextDate.setHours(currentDate.getHours() + scaleStep * minIncrements);

                if (nextDate.getTime() !== currentDate.getTime()) {
                    return nextDate;
                }

                // If code reaches here, it's because current didn't really increment (invalid local time) because of daylight-saving adjustments
                // => retry adding 2, 3, 4 hours, and so on (until nextDate > current)
            }
        }

        // Grid management
        // ===============

        // Core object is responsible for navigation and rendering
        var core = {
            // Return the element whose topmost point lies under the given point
            // Normalizes for IE
            elementFromPoint: function (x, y) {

                if (!$.support.boxModel) {
                    x -= $(document).scrollLeft();
                    y -= $(document).scrollTop();
                } else {
                    x -= window.pageXOffset;
                    y -= window.pageYOffset;
                }

                return document.elementFromPoint(x, y);
            },

            // **Create the chart**
            create: function (element) {
                // Initialize data with a json object or fetch via an xhr
                // request depending on `settings.source`
                /*if (typeof settings.source !== "string") {
                    element.data = tools.sortData(settings.source,element);
                    core.init(element);
                } else {
                    $.getJSON(settings.source, function (jsData,element) {
                        element.data = tools.sortData(jsData);
                        core.init(element);
                    });
                }*/
                if (typeof settings.source !== "string") {
					element.data = tools.sortData(settings.source,element);
				}
				if (typeof settings.source_M !== "string") {
					element.data_M = tools.sortData(settings.source_M,element);
				}
				core.init(element);

            },

            // **Setup the initial view**
            // Here we calculate the number of rows, pages and visible start
            // and end dates once the data is ready
            init: function (element) {
                try {
                    element.rowsNum = element.data.length;
                    element.pageCount = Math.ceil(element.rowsNum / settings.itemsPerPage);
                    element.rowsOnLastPage = element.rowsNum - (Math.floor(element.rowsNum / settings.itemsPerPage) * settings.itemsPerPage);

                    element.dateStart = tools.getMinDate(element);
                    element.dateEnd = tools.getMaxDate(element);
                    
					// fill available right panel width
					var msInCurrentRange = element.dateEnd - element.dateStart;
					var daysPerUnit = (function () {
					    switch (settings.scale) {
					        case 'months':
					            return 31;
					        case 'weeks':
					            return 7;
					        default:
					            return 1;
					    }
					})();
					var msPerUnit = 8.64e7 * daysPerUnit;
					var totalUnitsNow = Math.ceil(msInCurrentRange / msPerUnit) + 1;
					var totalUnitsNeeded = Math.ceil($(element).width() / tools.getCellSize());
					var unitsToAdd = totalUnitsNeeded - totalUnitsNow;
					if (unitsToAdd > 0) {
					    element.dateEnd.setDate(element.dateEnd.getDate() + (unitsToAdd * daysPerUnit));
					}

                    /* core.render(element); */
                    core.waitToggle(element, true, function () { 
	                    core.render(element);
                    	if(element.initLoad && (element.startPosition > settings.itemsPerPage)){
                    		element.initLoad = false;
							var startPage = Math.ceil(element.startPosition / settings.itemsPerPage)-1;
		                    core.navigatePage(element, startPage);
	                    }else{
	                    }
                    });
                }
                catch(e) {
                    if ( element.data === null || (typeof element.data === 'object' && element.data.length === 0 ) )
                        settings.onDataLoadFailed($(this).data("dataObj"));
                }
            },

            // **Render the grid**
            render: function (element) {
                var content = $('<div class="fn-content"/>');
                var $leftPanel = core.leftPanel(element);
				content.append($leftPanel);
                var $rightPanel = core.rightPanel(element, $leftPanel);
                var mLeft, hPos;

                content.append($rightPanel);
                content.append(core.navigation(element));

                var $dataPanel = $rightPanel.find(".dataPanel");

                element.gantt = $('<div class="fn-gantt" />').append(content);

                $(element).html(element.gantt);

                element.scrollNavigation.panelMargin = parseInt($dataPanel.css("margin-left").replace("px", ""), 10);
                element.scrollNavigation.panelMaxPos = ($dataPanel.width() - $rightPanel.width());

                element.scrollNavigation.canScroll = ($dataPanel.width() > $rightPanel.width());

                core.markNow(element);
                
                core.fillData(element, $dataPanel, $leftPanel);
				core.fillData_M(element, $dataPanel, $leftPanel);
				
                // Set a cookie to record current position in the view
                if (settings.useCookie) {
                    var sc = $.cookie(this.cookieKey + "ScrollPos");
                    if (sc) {
                        element.hPosition = sc;
                    }
                }

                // Scroll the grid to today's date
                if (settings.scrollToToday) {
                    core.navigateTo(element, 'now');
                    core.scrollPanel(element, 0);
                // or, scroll the grid to the left most date in the panel
                } else {
                    if (element.hPosition !== 0) {
                        if (element.scaleOldWidth) {
                            mLeft = ($dataPanel.width() - $rightPanel.width());
                            hPos = mLeft * element.hPosition / element.scaleOldWidth;
                            hPos = hPos > 0 ? 0 : hPos;
                            $dataPanel.css({ "margin-left": hPos + "px" });
                            element.scrollNavigation.panelMargin = hPos;
                            element.hPosition = hPos;
                            element.scaleOldWidth = null;
                        } else {
                            $dataPanel.css({ "margin-left": element.hPosition + "px" });
                            element.scrollNavigation.panelMargin = element.hPosition;
                        }
                        core.repositionLabel(element);
                    }
                }

                $dataPanel.css({ height: $leftPanel.height() });
                core.waitToggle(element, false);
                settings.onRender();
                core.navigateTo(element, 'now');
            },

            // Create and return the left panel with labels
            leftPanel: function (element) {
                /* Left panel */
                // Setup table customizations
                /*
				//	detailsPanel: [{
				//		detailsWidth: 200,
				//		columnNames: "Name|Desc",
				//		columnWidths: "100|100"
				//	}]
                */
  				var panelWidth = settings.detailsPanel[0].detailsWidth;
  				var colNames = settings.detailsPanel[0].columnNames.split("|");
  				var colCount = colNames.length;
  				var colWidths = settings.detailsPanel[0].columnWidths.split("|");;

  				var colDetails = null;
  				
  				var tableLeftPanel = null;
  				  				
                var ganttLeftPanel = $('<div class="leftPanel"/>')
                    .css("width", panelWidth + "px")
                    .append($('<div class="row spacer"/>')
                    .css("height", tools.getCellSize() * element.headerRows + "px")
                    .css("margin-top", (-1 * (tools.getCellSize()+1))+ "px")
                    .css("width", "100%")
                    .css("border-bottom","1px solid #ddd"));

                tableLeftPanel = $('<table id="leftPanelTable" width="'+ panelWidth +'px" class="tableLeft" />');

                var entries = [];
				entries.push('<thead><tr class="tblRow">');

				// The width of the cell must be the sum of all applied Left/Right 
				// padding and margin adjustments subtracted from the provided colWidths values
               	$.each(colNames, function(i, col){
               		entries.push('<th class="tblHeaderCell" style="padding-left:5px;margin-left:-1px;width:'+ (colWidths[i]-6) +'px;">'+ col +'</th>');
               	});
    
               	entries.push('</tr></thead>');    
               	entries.push('<tbody>');
               	
				$.each(element.data, function (i, entry) {
					if(/undefined/.test(entry.detailsPanel_Data)){
						colDetails = [];
						colDetails.push(entry.name);
						colDetails.push(entry.desc);
					}else{
						colDetails = entry.detailsPanel_Data.split("|");
					}

					if (i >= element.pageNum * settings.itemsPerPage && i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {
                    	entries.push('<tr class="tblRow" id="record_' + entry.id + '" offset="' + i % settings.itemsPerPage * tools.getCellSize() + '" data-id="'+ entry.id +'">');
                    	for(var x=0;x<colCount;x++){
                    		if(x==0){
		                        entries.push('<td class="tblCell" style="padding-left:2px;margin-left:-1px;font-weight:bold;width:'+ (colWidths[x]-3) +'px;"><div>');
							}else{
	                            entries.push('<td class="tblCell" style="padding-left:2px;margin-left:-1px;width:'+ (colWidths[x]-3) +'px;"><div>');
	                        }
	                        if( colDetails[x].width() > colWidths[x] ){
		                        entries.push('<span class="fn-label powerTip" title="' + (colDetails[x] || '') + '">' + (colDetails[x] || '') + '</span>');
	                        }else{
		                        entries.push('<span class="fn-label">' + (colDetails[x] || '') + '</span>');
	                        }
	                        
	                        entries.push('</div></td>');
                        }

                        entries.push('</tr>');
                    }
				});
								
				entries.push('</tbody>');
				tableLeftPanel.append(entries.join(""));
				
				tblLeftPanel = tableLeftPanel;
				
				ganttLeftPanel.append(tableLeftPanel);
				
				return ganttLeftPanel;
            },

            // Create and return the data panel element
            dataPanel: function (element, width) {
                var dataPanel = $('<div class="dataPanel" style="width: ' + width + 'px;"/>');

                // Handle mousewheel events for scrolling the data panel
                var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
                if (document.attachEvent) {
                    element.attachEvent("on" + mousewheelevt, function (e) { core.wheelScroll(element, e); });
                } else if (document.addEventListener) {
                    element.addEventListener(mousewheelevt, function (e) { core.wheelScroll(element, e); }, false);
                }

                // Handle click events and dispatch to registered `onAddClick`
                // function
                dataPanel.click(function (e) {

                    e.stopPropagation();
                    var corrX/* <- never used? */, corrY;
                    var leftpanel = $(element).find(".fn-gantt .leftPanel");
                    var datapanel = $(element).find(".fn-gantt .dataPanel");
                    switch (settings.scale) {
                        case "weeks":
                            corrY = tools.getCellSize() * 2;
                            break;
                        case "months":
                            corrY = tools.getCellSize();
                            break;
                        case "hours":
                            corrY = tools.getCellSize() * 4;
                            break;
                        case "days":
                            corrY = tools.getCellSize() * 3;
                            break;
                        default:
                            corrY = tools.getCellSize() * 2;
                            break;
                    }

                    /* Adjust, so get middle of elm
                    corrY -= Math.floor(tools.getCellSize() / 2);
                    */

                    // Find column where click occurred
                    var col = core.elementFromPoint(e.pageX, datapanel.offset().top + corrY);
                    // Was the label clicked directly?
                    if (col.className === "fn-label") {
                        col = $(col.parentNode);
                    } else {
                        col = $(col);
                    }

                    var dt = col.attr("repdate");
                    // Find row where click occurred
                    var row = core.elementFromPoint(leftpanel.offset().left + leftpanel.width() - 10, e.pageY);
                    // Was the lable clicked directly?
                    if (row.className.indexOf("fn-label") === 0) {
                        row = $(row.parentNode);
                    } else {
                        row = $(row);
                    }
                    var rowId = row.data().id;

                    // Dispatch user registered function with the DateTime in ms
                    // and the id if the clicked object is a row
                    settings.onAddClick(dt, rowId);
                });
                return dataPanel;
            },

            // Creates and return the right panel containing the year/week/day
            // header
            rightPanel: function (element, leftPanel /* <- never used? */) {

                var range = null;
                // Days of the week have a class of one of
                // `sn` (Sunday), `sa` (Saturday), or `wd` (Weekday)
                var dowClass = ["sn", "wd", "wd", "wd", "wd", "wd", "sa"];
                //TODO: was someone planning to allow styles to stretch to the bottom of the chart?
                //var gridDowClass = [" sn", "", "", "", "", "", " sa"];

                var yearArr = ['<div class="row"/>'];
                var daysInYear = 0;

                var monthArr = ['<div class="row"/>'];
                var daysInMonth = 0;

                var dayArr = [];

                var hoursInDay = 0;

                var dowArr = [];

                var horArr = [];


                var today = new Date();
                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                var holidays = settings.holidays ? settings.holidays.join() : '';

                // Setup the headings based on the chosen `settings.scale`
                switch (settings.scale) {
                    // **Hours**
                    case "hours":

                        range = tools.parseTimeRange(element.dateStart, element.dateEnd, element.scaleStep);

                        var year = range[0].getFullYear();
                        var month = range[0].getMonth();
                        var day = range[0];

                        for (var i = 0, len = range.length; i < len; i++) {
                            var rday = range[i];

                            // Fill years
                            var rfy = rday.getFullYear();
                            if (rfy !== year) {
                                yearArr.push(
                                    ('<div class="row header year" style="width: '
                                        + tools.getCellSize() * daysInYear
                                        + 'px;"><div class="fn-label">'
                                        + year
                                        + '</div></div>'));

                                year = rfy;
                                daysInYear = 0;
                            }
                            daysInYear++;


                            // Fill months
                            var rm = rday.getMonth();
                            if (rm !== month) {
                                monthArr.push(
                                    ('<div class="row header month" style="width: '
                                    + tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">'
                                    + settings.months[month]
                                    + '</div></div>'));

                                month = rm;
                                daysInMonth = 0;
                            }
                            daysInMonth++;


                            // Fill days & hours

                            var rgetDay = rday.getDay();
                            var getDay = day.getDay();
                            var day_class = dowClass[rgetDay];
                            var getTime = day.getTime();
                            if (holidays.indexOf((new Date(rday.getFullYear(), rday.getMonth(), rday.getDate())).getTime()) > -1) {
                                day_class = "holiday";
                            }else{
                            	if(settings.showHolidays){
                            		if(tools.check_Holiday(rday)){
                            			day_class = "holiday";
                            		}
                            	}
                            }

                            if (rgetDay !== getDay) {
                                var day_class2 = (today - day === 0) ? ' today' : (holidays.indexOf(getTime) > -1) ? "holiday" : dowClass[getDay];

                                dayArr.push('<div class="row date ' + day_class2 + '" '
                                        + ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> '
                                        + ' <div class="fn-label">' + day.getDate() + '</div></div>');
                                dowArr.push('<div class="row day ' + day_class2 + '" '
                                        + ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> '
                                        + ' <div class="fn-label">' + settings.dow[getDay] + '</div></div>');

                                day = rday;
                                hoursInDay = 0;
                            }
                            hoursInDay++;

                            horArr.push('<div class="row day '
                                    + day_class
                                    + '" id="dh-'
                                    + rday.getTime()
                                    + '"  offset="' + i * tools.getCellSize() + '"  repdate="' + rday.getRepDate() + '"><div class="fn-label">'
                                    + rday.getHours()
                                    + '</div></div>');
                        }
                        // Last year
                       yearArr.push(
                            '<div class="row header year" style="width: '
                            + tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">'
                            + year
                            + '</div></div>');

                        // Last month
                        monthArr.push(
                            '<div class="row header month" style="width: '
                            + tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">'
                            + settings.months[month]
                            + '</div></div>');

                        var day_class = dowClass[day.getDay()];

                        if (holidays.indexOf((new Date(day.getFullYear(), day.getMonth(), day.getDate())).getTime()) > -1) {
                            day_class = "holiday";
                        }else{
                        	if(settings.showHolidays){
                        		if(tools.check_Holiday(rday)){
                        			day_class = "holiday";
                        		}
                        	}
                        }


                        dayArr.push('<div class="row date ' + day_class + '" '
                                + ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> '
                                + ' <div class="fn-label">' + day.getDate() + '</div></div>');

                        dowArr.push('<div class="row day ' + day_class + '" '
                                + ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> '
                                + ' <div class="fn-label">' + settings.dow[day.getDay()] + '</div></div>');

                        var dataPanel = core.dataPanel(element, range.length * tools.getCellSize());


                        // Append panel elements
                        dataPanel.append(yearArr.join(""));
                        dataPanel.append(monthArr.join(""));
                        dataPanel.append($('<div class="row"/>').html(dayArr.join("")));
                        dataPanel.append($('<div class="row"/>').html(dowArr.join("")));
                        dataPanel.append($('<div class="row"/>').html(horArr.join("")));

                        break;

                    // **Weeks**
                    case "weeks":
                        range = tools.parseWeeksRange(element.dateStart, element.dateEnd);
                        yearArr = ['<div class="row"/>'];
                        monthArr = ['<div class="row"/>'];
                        var year = range[0].getFullYear();
                        var month = range[0].getMonth();
                        var day = range[0];

                        for (var i = 0, len = range.length; i < len; i++) {
                            var rday = range[i];

                            // Fill years
                            if (rday.getFullYear() !== year) {
                                yearArr.push(
                                    ('<div class="row header year" style="width: '
                                        + tools.getCellSize() * daysInYear
                                        + 'px;"><div class="fn-label">'
                                        + year
                                        + '</div></div>'));
                                year = rday.getFullYear();
                                daysInYear = 0;
                            }
                            daysInYear++;

                            // Fill months
                            if (rday.getMonth() !== month) {
                                monthArr.push(
                                    ('<div class="row header month" style="width:'
                                       + tools.getCellSize() * daysInMonth
                                       + 'px;"><div class="fn-label">'
                                       + settings.months[month]
                                       + '</div></div>'));
                                month = rday.getMonth();
                                daysInMonth = 0;
                            }
                            daysInMonth++;

                            // Fill weeks
                            dayArr.push('<div class="row day wd" '
                                    + ' id="' + rday.getWeekId() + '" offset="' + i * tools.getCellSize() + '" repdate="' + rday.getRepDate() + '"> '
                                    + ' <div class="fn-label">' + rday.getWeekOfYear() + '</div></div>');
                        }


                        // Last year
                        yearArr.push(
                            '<div class="row header year" style="width: '
                            + tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">'
                            + year
                            + '</div></div>');

                        // Last month
                        monthArr.push(
                            '<div class="row header month" style="width: '
                            + tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">'
                            + settings.months[month]
                            + '</div></div>');

                        var dataPanel = core.dataPanel(element, range.length * tools.getCellSize());

                        dataPanel.append(yearArr.join("") + monthArr.join("") + dayArr.join("") + (dowArr.join("")));

                        break;

                    // **Months**
                    case 'months':
                        range = tools.parseMonthsRange(element.dateStart, element.dateEnd);

                        var year = range[0].getFullYear();
                        var month = range[0].getMonth();
                        var day = range[0];

                        for (var i = 0, len = range.length; i < len; i++) {
                            var rday = range[i];

                            // Fill years
                            if (rday.getFullYear() !== year) {
                                yearArr.push(
                                    ('<div class="row header year" style="width: '
                                        + tools.getCellSize() * daysInYear
                                        + 'px;"><div class="fn-label">'
                                        + year
                                        + '</div></div>'));
                                year = rday.getFullYear();
                                daysInYear = 0;
                            }
                            daysInYear++;
                            monthArr.push('<div class="row day wd" id="dh-' + tools.genId(rday.getTime()) + '" offset="' + i * tools.getCellSize() + '" repdate="' + rday.getRepDate() + '">' + (1 + rday.getMonth()) + '</div>');
                        }


                        // Last year
                        yearArr.push(
                            '<div class="row header year" style="width: '
                            + tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">'
                            + year
                            + '</div></div>');

                        // Last month
                        monthArr.push(
                            '<div class="row header month" style="width: '
                            + tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">'
                            + settings.months[month]
                            + '</div></div>');

                        var dataPanel = core.dataPanel(element, range.length * tools.getCellSize());

                        // Append panel elements
                        dataPanel.append(yearArr.join(""));
                        dataPanel.append(monthArr.join(""));
                        dataPanel.append($('<div class="row"/>').html(dayArr.join("")));
                        dataPanel.append($('<div class="row"/>').html(dowArr.join("")));

                        break;

                    // **Days (default)**
                    default:
                        range = tools.parseDateRange(element.dateStart, element.dateEnd);

                        var dateBefore = ktkGetNextDate(range[0], -1);
                        var year = dateBefore.getFullYear();
                        var month = dateBefore.getMonth();
                        var day = dateBefore; // <- never used?

                        for (var i = 0, len = range.length; i < len; i++) {
                            var rday = range[i];

                            // Fill years
                            if (rday.getFullYear() !== year) {
                                yearArr.push(
                                    ('<div class="row header year" style="width:'
                                        + tools.getCellSize() * daysInYear
                                        + 'px;"><div class="fn-label">'
                                        + year
                                        + '</div></div>'));
                                year = rday.getFullYear();
                                daysInYear = 0;
                            }
                            daysInYear++;


                            // Fill months
                            if (rday.getMonth() !== month) {
                                monthArr.push(
                                    ('<div class="row header month" style="width:'
                                       + tools.getCellSize() * daysInMonth
                                       + 'px;"><div class="fn-label">'
                                       + settings.months[month]
                                       + '</div></div>'));
                                month = rday.getMonth();
                                daysInMonth = 0;
                            }
                            daysInMonth++;

                            var getDay = rday.getDay();
                            var day_class = dowClass[getDay];
                            if (holidays.indexOf((new Date(rday.getFullYear(), rday.getMonth(), rday.getDate())).getTime()) > -1) {
                                day_class = "holiday";
                            }else{
                            	if(settings.showHolidays){
                            		if(tools.check_Holiday(rday)){
                            			day_class = "holiday";
                            		}
                            	}
                            }

                            dayArr.push('<div class="row date ' + day_class + '" '
                                    + ' id="dh-' + tools.genId(rday.getTime()) + '" offset="' + i * tools.getCellSize() + '" repdate="' + rday.getRepDate() + '"> '
                                    + ' <div class="fn-label">' + rday.getDate() + '</div></div>');
                            dowArr.push('<div class="row day ' + day_class + '" '
                                    + ' id="dw-' + tools.genId(rday.getTime()) + '"  repdate="' + rday.getRepDate() + '"> '
                                    + ' <div class="fn-label">' + settings.dow[getDay] + '</div></div>');
                        } //for


                        // Last year
                        yearArr.push(
                            '<div class="row header year" style="width: '
                            + tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">'
                            + year
                            + '</div></div>');

                        // Last month
                        monthArr.push(
                            '<div class="row header month" style="width: '
                            + tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">'
                            + settings.months[month]
                            + '</div></div>');

                        var dataPanel = core.dataPanel(element, range.length * tools.getCellSize());


                        // Append panel elements

                        dataPanel.append(yearArr.join(""));
                        dataPanel.append(monthArr.join(""));
                        dataPanel.append($('<div class="row" style="margin-left: 0;" />').html(dayArr.join("")));
                        dataPanel.append($('<div class="row" style="margin-left: 0;" />').html(dowArr.join("")));

                        break;
                }

                return $('<div class="rightPanel"></div>').append(dataPanel);
            },

            // **Navigation**
            navigation: function (element) {
                var ganttNavigate = null;
                // Scrolling navigation is provided by setting
                // `settings.navigate='scroll'`
                if (settings.navigate === "scroll") {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<div class="nav-slider" />')
                            .append($('<div class="nav-slider-left" />')
                                .append($('<button type="button" title="Page Back" class="nav-link nav-page-back"/>')
                                    .html('&lt;')
                                    .click(function () {
                                        core.navigatePage(element, -1);
                                    }))
                                .append($('<div class="page-number"/>')
                                        .append($('<span/>')
                                            .html(element.pageNum + 1 + ' / ' + element.pageCount)))
                                .append($('<button type="button" title="Page Next" class="nav-link nav-page-next"/>')
                                    .html('&gt;')
                                    .click(function () {
                                        core.navigatePage(element, 1);
                                    }))
                                .append($('<button type="button" title="Go To Today" class="nav-link nav-now"/>')
                                    .html('&#9679;')
                                    .click(function () {
                                        core.navigateTo(element, 'now');
                                    }))
                                .append($('<button type="button" title="Move Left by a Month" class="nav-link nav-prev-week"/>')
                                    .html('&lt;&lt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * 8);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * 30);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * 12);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * 6);
                                        }
                                    }))
                                .append($('<button type="button" title="Move Left by a Week" class="nav-link nav-prev-day"/>')
                                    .html('&lt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * 4);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * 7);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * 4);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * 3);
                                        }
                                    })))
                            .append($('<div class="nav-slider-content" />')
                                    .append($('<div class="nav-slider-bar" />')
                                            .append($('<a title="Scroll" class="nav-slider-button" />')
                                                )
                                                .mousedown(function (e) {
                                                    e.preventDefault();
                                                    element.scrollNavigation.scrollerMouseDown = true;
                                                    core.sliderScroll(element, e);
                                                })
                                                .mousemove(function (e) {
                                                    if (element.scrollNavigation.scrollerMouseDown) {
                                                        core.sliderScroll(element, e);
                                                    }
                                                })
                                            )
                                        )
                            .append($('<div class="nav-slider-right" />')
                                .append($('<button type="button" title="Move Right by a Week" class="nav-link nav-next-day"/>')
                                    .html('&gt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * -4);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * -7);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * -4);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * -3);
                                        }
                                    }))
                            .append($('<button type="button" title="Move Right by a Month" class="nav-link nav-next-week"/>')
                                    .html('&gt;&gt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * -8);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * -30);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * -12);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * -6);
                                        }
                                    }))
                                .append($('<button type="button" title="Zoom In" class="nav-link nav-zoomIn"/>')
                                    .html('&#43;')
                                    .click(function () {
                                        core.zoomInOut(element, -1);
                                    }))
                                .append($('<button type="button" title="Zoom Out" class="nav-link nav-zoomOut"/>')
                                    .html('&#45;')
                                    .click(function () {
                                        core.zoomInOut(element, 1);
                                    }))
                                    )
                                );
                    $(document).mouseup(function () {
                        element.scrollNavigation.scrollerMouseDown = false;
                    });
                // Button navigation is provided by setting `settings.navigation='buttons'`
                } else {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<button type="button" class="nav-link nav-page-back"/>')
                            .html('&lt;')
                            .click(function () {
                                core.navigatePage(element, -1);
                            }))
                        .append($('<div class="page-number"/>')
                                .append($('<span/>')
                                    .html(element.pageNum + 1 + ' of ' + element.pageCount)))
                        .append($('<button type="button" class="nav-link nav-page-next"/>')
                            .html('&gt;')
                            .click(function () {
                                core.navigatePage(element, 1);
                            }))
                        .append($('<button type="button" class="nav-link nav-begin"/>')
                            .html('&#124;&lt;')
                            .click(function () {
                                core.navigateTo(element, 'begin');
                            }))
                        .append($('<button type="button" class="nav-link nav-prev-week"/>')
                            .html('&lt;&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * 7);
                            }))
                        .append($('<button type="button" class="nav-link nav-prev-day"/>')
                            .html('&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize());
                            }))
                        .append($('<button type="button" class="nav-link nav-now"/>')
                            .html('&#9679;')
                            .click(function () {
                                core.navigateTo(element, 'now');
                            }))
                        .append($('<button type="button" class="nav-link nav-next-day"/>')
                            .html('&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -1);
                            }))
                        .append($('<button type="button" class="nav-link nav-next-week"/>')
                            .html('&gt;&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -7);
                            }))
                        .append($('<button type="button" class="nav-link nav-end"/>')
                            .html('&gt;&#124;')
                            .click(function () {
                                core.navigateTo(element, 'end');
                            }))
                        .append($('<button type="button" class="nav-link nav-zoomIn"/>')
                            .html('&#43;')
                            .click(function () {
                                core.zoomInOut(element, -1);
                            }))
                        .append($('<button type="button" class="nav-link nav-zoomOut"/>')
                            .html('&#45;')
                            .click(function () {
                                core.zoomInOut(element, 1);
                            }));
                }
                return $('<div class="bottom"/>').append(ganttNavigate);
            },

            // **Progress Bar**
            // Return an element representing a progress of position within
            // the entire chart
            createProgressBar: function (days, id, parentID, cls, desc, txtlabel, dataObj, bgColor, showToolTip, milestone) {
            	milestone = milestone || false;
                var cellWidth = tools.getCellSize();
                var barMarg = tools.getProgressBarMargin() || 0;
                var barWidth = ((cellWidth * days) - barMarg) + 2;
                var barID = milestone ? "_bar_" + id +"-M" : "_bar_" + id;
                var bar = $('<div class="bar" data-id="'+ barID +'" data-pid="'+ parentID +'"/>');
                var label;
                if(cls){
	                bar.addClass(cls);
                }
                
                if(milestone){
                	bar.css({ "z-index" : "1000" });
                	bar.css({ "height" : "16px" });
                	bar.css({ "margin-top" : "0px" });
                	bar.css({ "border-top" : "1px #000 solid" });
                	bar.css({ "border-bottom" : "1px #000 solid" });
                	label = $('<div>&#x25B2;</div>');
                	label.addClass("fn-fulllabel");
                }else{
                	label  = $('<div data-id="_label_'+ id +'">' + txtlabel + '</div>');
                }
                
                bar.css({ "width" : barWidth });     
                bar.data( "dataObj", dataObj );

				if (bgColor){
					bar.css({ "background-color" : bgColor });				
				}	

                if (settings.usePowerTips) {
	                bar.data('powertip', desc);
                }else{
	                if(showToolTip && desc){
	                    bar
	                      .mouseover(function (e) {
	                          var hint = $('<div class="fn-gantt-hint" />').html(desc);
	                          $("body").append(hint);
	                          hint.css("left", e.pageX);
	                          hint.css("top", e.pageY);
	                          hint.show();
	                      })
	                      .hover(function (e) {
	                          var hint = $('<div class="fn-gantt-hint" />').html(desc);
	                          $("body").append(hint);
	                          hint.css("left", e.pageX);
	                          hint.css("top", e.pageY);
	                          hint.show();
	                      })
	                      .mouseout(function () {
	                          $(".fn-gantt-hint").remove();
	                      })
	                      .mousemove(function (e) {
	                          $(".fn-gantt-hint").css("left", e.pageX);
	                          $(".fn-gantt-hint").css("top", e.pageY + 15);
	                      });
					}
				}
				
                bar.click(function (e) {
                    e.stopPropagation();
                    settings.onItemClick(dataObj);
                });
				if(!milestone){
					if(barWidth > txtlabel.width()){
						label.addClass("fn-fulllabel");
					}else{
						label.addClass("fn-label");
						label.css({ "margin-left": (barWidth + 5) });
					}
				}
                bar.append(label);
                
                return bar;
            },

            // Remove the `wd` (weekday) class and add `today` class to the
            // current day/week/month (depending on the current scale)
            markNow: function (element) {
            	var todayDate = new Date();

                switch (settings.scale) {
                    case "weeks":
                        var cd = Date.parse(todayDate);
                        cd = (Math.floor(cd / 36400000) * 36400000);
                        $(element).find(':findweek("' + cd + '")').removeClass('wd').addClass('today');
                        break;
                    case "months":
                        $(element).find(':findmonth("' + todayDate.getDate() + '")').removeClass('wd').addClass('today');
                        break;
                    default:
                        var cd = Date.parse(todayDate);
                        cd = (Math.floor(cd / 36400000) * 36400000);
                        $(element).find(':findday("' + cd + '")').removeClass('wd').addClass('today');
                        break;
                }
            },

            // **Fill the Chart**
            // Parse the data and fill the data panel
            fillData: function (element, datapanel, leftpanel /* <- never used? */) {
				
                $.each(element.data, function (i, entry) {
                
                	var minLabel = entry.name ? entry.name : null;
                	var minDesc = entry.desc ? entry.desc : null;
                	
                	var customized = entry.customStyles[0] ? entry.customStyles[0] : null ;
					var entryDataObj = entry.dataObj[0] ? entry.dataObj[0] : null;
					var showToolTip = entry.tooltip != null ? entry.tooltip : true;
					var powerTip = entry.powerTip_Data ? entry.powerTip_Data : null;
					
	                if (settings.usePowerTips) {
	                	minDesc = powerTip != null ? powerTip : null;
	                }
					
                    if (i >= element.pageNum * settings.itemsPerPage && i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {

                        $.each(entry.eventBar, function (j, eventData) {
                            var _bar = null;
							
                            switch (settings.scale) {
                                // **Hourly data**
                                case "hours":
                                    var dFrom = tools.genId(tools.dateDeserialize(eventData.from).getTime(), element.scaleStep);
                                    var from = $(element).find('#dh-' + dFrom);

                                    var dTo = tools.genId(tools.dateDeserialize(eventData.to).getTime(), element.scaleStep);
                                    var to = $(element).find('#dh-' + dTo);

                                    var cFrom = from.attr("offset");
                                    var cTo = to.attr("offset");
                                    var dl = Math.floor((cTo - cFrom) / tools.getCellSize()) + 1;

		                            _bar = core.createProgressBar(
			                            dl,
			                            eventData.id ? eventData.id : "",
			                            eventData.parent ? eventData.parent : eventData.id,
			                            eventData.customClass ? eventData.customClass : customized.className ? customized.className : null,
			                            eventData.desc ? eventData.desc : minDesc ? minDesc : "",
			                            eventData.label ? eventData.label : minLabel ? minLabel : "",
			                            eventData.dataObj ? eventData.dataObj : entryDataObj ? entryDataObj : null,
			                            customized.bgColor ? customized.bgColor : null,
			                            showToolTip,
			                            false
			                        );

                                    // find row
                                    var topEl = $(element).find("tr[data-id='" + eventData.id + "']");
                                    var top = tools.getCellSize() * 5 + 2 + parseInt(topEl.attr("offset"), 10);
                                    _bar.css({ 'top': top, 'left': Math.floor(cFrom) });

                                    datapanel.append(_bar);
                                    break;

                                // **Weekly data**
                                case "weeks":
                                    var dtFrom = tools.dateDeserialize(eventData.from);
                                    var dtTo = tools.dateDeserialize(eventData.to);

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtTo.getDate() <= 3 && dtTo.getMonth() === 0) {
                                        dtTo.setDate(dtTo.getDate() + 4);
                                    }

                                    var from = $(element).find("#" + dtFrom.getWeekId());

                                    var cFrom = from.attr("offset");

                                    var to = $(element).find("#" + dtTo.getWeekId());
                                    var cTo = to.attr("offset");

                                    var dl = Math.round((cTo - cFrom) / tools.getCellSize()) + 1;

		                            _bar = core.createProgressBar(
			                            dl,
			                            eventData.id ? eventData.id : "",
			                            eventData.parent ? eventData.parent : eventData.id,
			                            eventData.customClass ? eventData.customClass : customized.className ? customized.className : null,
			                            eventData.desc ? eventData.desc : minDesc ? minDesc : "",
			                            eventData.label ? eventData.label : minLabel ? minLabel : "",
			                            eventData.dataObj ? eventData.dataObj : entryDataObj ? entryDataObj : null,
			                            customized.bgColor ? customized.bgColor : null,
			                            showToolTip,
			                            false

			                        );

                                    // find row
                                    var topEl = $(element).find("tr[data-id='" + eventData.id + "']");
                                    var top = tools.getCellSize() * 3 + 2 + parseInt(topEl.attr("offset"), 10);
                                    _bar.css({ 'top': top, 'left': Math.floor(cFrom) });

                                    datapanel.append(_bar);
                                    break;

                                // **Monthly data**
                                case "months":
                                    var dtFrom = tools.dateDeserialize(eventData.from);
                                    var dtTo = tools.dateDeserialize(eventData.to);

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtTo.getDate() <= 3 && dtTo.getMonth() === 0) {
                                        dtTo.setDate(dtTo.getDate() + 4);
                                    }

                                    var from = $(element).find("#dh-" + tools.genId(dtFrom.getTime()));
                                    var cFrom = from.attr("offset");
                                    var to = $(element).find("#dh-" + tools.genId(dtTo.getTime()));
                                    var cTo = to.attr("offset");
                                    var dl = Math.round((cTo - cFrom) / tools.getCellSize()) + 1;

		                            _bar = core.createProgressBar(
			                            dl,
			                            eventData.id ? eventData.id : "",
			                            eventData.parent ? eventData.parent : eventData.id,
			                            eventData.customClass ? eventData.customClass : customized.className ? customized.className : null,
			                            eventData.desc ? eventData.desc : minDesc ? minDesc : "",
			                            eventData.label ? eventData.label : minLabel ? minLabel : "",
			                            eventData.dataObj ? eventData.dataObj : entryDataObj ? entryDataObj : null,
			                            customized.bgColor ? customized.bgColor : null,
			                            showToolTip,
			                            false

			                        );

                                    // find row
                                    var topEl = $(element).find("tr[data-id='" + eventData.id + "']");
                                    var top = tools.getCellSize() * 2 + 2 + parseInt(topEl.attr("offset"), 10);
                                    _bar.css({ 'top': top, 'left': Math.floor(cFrom) });

                                    datapanel.append(_bar);
                                    break;

                                // **days**
                                default:
                                    var dFrom = tools.genId(tools.dateDeserialize(eventData.from).getTime());
                                    var dTo = tools.genId(tools.dateDeserialize(eventData.to).getTime());
                                    var from = $(element).find("#dh-" + dFrom);
                                    var cFrom = from.attr("offset");

                                    var dl = Math.floor(((dTo / 1000) - (dFrom / 1000)) / 86400) + 1;

		                            _bar = core.createProgressBar(
			                            dl,
			                            eventData.id ? eventData.id : "",
			                            eventData.parent ? eventData.parent : eventData.id,
			                            eventData.customClass ? eventData.customClass : customized.className ? customized.className : null,
			                            eventData.desc ? eventData.desc : minDesc ? minDesc : "",
			                            eventData.label ? eventData.label : minLabel ? minLabel : "",
			                            eventData.dataObj ? eventData.dataObj : entryDataObj ? entryDataObj : null,
			                            customized.bgColor ? customized.bgColor : null,
			                            showToolTip,
			                            false

			                        );

                                    // find row
                                    var topEl = $(element).find("tr[data-id='" + eventData.id + "']");
                                    var top = tools.getCellSize() * 4 + 2 + parseInt(topEl.attr("offset"), 10);
                                    _bar.css({ 'top': top, 'left': Math.floor(cFrom) });

                                    datapanel.append(_bar);

                                    break;
                            }
                            
                            var $l = _bar.find(".fn-fulllabel");
                            
							if(customized.txtColor){
								$l.attr("style", "color:" + customized.txtColor + "!important;" );
							}else{
								if ($l && _bar.length) {
									if(_bar[0].style.backgroundColor){
										var invertCompliment = tools.invertColor(_bar[0].style.backgroundColor);

										$l.attr("style", "color:" + invertCompliment + "!important;" );
									}
								} else if ($l) {
									//$l.attr("style", "color:" + invertCompliment + "!important;" );
									$l.css("color", "#000000");
								}
							}
							
                        });

                    }
                });
            },
            fillData_M: function (element, datapanel, leftpanel /* <- never used? */) {

                $.each(element.data_M, function (i, entry) {
                
                	var minLabel = entry.name ? entry.name : null;
                	var minDesc = entry.desc ? entry.desc : null;
                	
                	var customized = entry.customStyles[0] ? entry.customStyles[0] : null ;
					var entryDataObj = entry.dataObj[0] ? entry.dataObj[0] : null;
					var showToolTip = entry.tooltip != null ? entry.tooltip : true;
					var powerTip = entry.powerTip_Data ? entry.powerTip_Data : null;
					
	                if (settings.usePowerTips) {
	                	minDesc = powerTip != null ? powerTip : null;
	                }
                    if (i >= element.pageNum * settings.itemsPerPage && i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {

                        $.each(entry.eventBar, function (j, eventData) {
                            var _bar = null;
							var vert_top = 0;
							var cFrom = 0;
                            var topEl = $(element).find("tr[data-id='" + eventData.parent + "']");
                            switch (settings.scale) {
                                // **Hourly data**
                                case "hours":
                                    var dFrom = tools.genId(tools.dateDeserialize(eventData.from).getTime(), element.scaleStep);
                                    var from = $(element).find('#dh-' + dFrom);

                                    var dTo = tools.genId(tools.dateDeserialize(eventData.to).getTime(), element.scaleStep);
                                    var to = $(element).find('#dh-' + dTo);

                                    cFrom = from.attr("offset");
                                    var cTo = to.attr("offset");
                                    var dl = Math.floor((cTo - cFrom) / tools.getCellSize()) + 1;

		                            _bar = core.createProgressBar(
			                            dl,
			                            eventData.id ? eventData.id : "",
			                            eventData.parent ? eventData.parent : eventData.id,
			                            eventData.customClass ? eventData.customClass : customized.className ? customized.className : null,
			                            eventData.desc ? eventData.desc : minDesc ? minDesc : "",
			                            eventData.label ? eventData.label : minLabel ? minLabel : "",
			                            eventData.dataObj ? eventData.dataObj : entryDataObj ? entryDataObj : null,
			                            customized.bgColor ? customized.bgColor : null,
			                            showToolTip,
			                            true 
			                        );

			                        //Find the vertical position
                                    vert_top = tools.getCellSize() * 5 + 2 + parseInt(topEl.attr("offset"), 10);
                                    break;

                                // **Weekly data**
                                case "weeks":
                                    var dtFrom = tools.dateDeserialize(eventData.from);
                                    var dtTo = tools.dateDeserialize(eventData.to);

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtTo.getDate() <= 3 && dtTo.getMonth() === 0) {
                                        dtTo.setDate(dtTo.getDate() + 4);
                                    }

                                    var from = $(element).find("#" + dtFrom.getWeekId());

                                    cFrom = from.attr("offset");

                                    var to = $(element).find("#" + dtTo.getWeekId());
                                    var cTo = to.attr("offset");

                                    var dl = Math.round((cTo - cFrom) / tools.getCellSize()) + 1;

		                            _bar = core.createProgressBar(
			                            dl,
			                            eventData.id ? eventData.id : "",
			                            eventData.parent ? eventData.parent : eventData.id,
			                            eventData.customClass ? eventData.customClass : customized.className ? customized.className : null,
			                            eventData.desc ? eventData.desc : minDesc ? minDesc : "",
			                            eventData.label ? eventData.label : minLabel ? minLabel : "",
			                            eventData.dataObj ? eventData.dataObj : entryDataObj ? entryDataObj : null,
			                            customized.bgColor ? customized.bgColor : null,
			                            showToolTip,
			                            true
			                        );

			                        //Find the vertical position
                                    vert_top = tools.getCellSize() * 3 + 2 + parseInt(topEl.attr("offset"), 10);
                                    break;

                                // **Monthly data**
                                case "months":
                                    var dtFrom = tools.dateDeserialize(eventData.from);
                                    var dtTo = tools.dateDeserialize(eventData.to);

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtFrom.getDate() <= 3 && dtFrom.getMonth() === 0) {
                                        dtFrom.setDate(dtFrom.getDate() + 4);
                                    }

                                    if (dtTo.getDate() <= 3 && dtTo.getMonth() === 0) {
                                        dtTo.setDate(dtTo.getDate() + 4);
                                    }

                                    var from = $(element).find("#dh-" + tools.genId(dtFrom.getTime()));
                                    cFrom = from.attr("offset");
                                    var to = $(element).find("#dh-" + tools.genId(dtTo.getTime()));
                                    var cTo = to.attr("offset");
                                    var dl = Math.round((cTo - cFrom) / tools.getCellSize()) + 1;

		                            _bar = core.createProgressBar(
			                            dl,
			                            eventData.id ? eventData.id : "",
			                            eventData.parent ? eventData.parent : eventData.id,
			                            eventData.customClass ? eventData.customClass : customized.className ? customized.className : null,
			                            eventData.desc ? eventData.desc : minDesc ? minDesc : "",
			                            eventData.label ? eventData.label : minLabel ? minLabel : "",
			                            eventData.dataObj ? eventData.dataObj : entryDataObj ? entryDataObj : null,
			                            customized.bgColor ? customized.bgColor : null,
			                            showToolTip,
			                            true
			                        );

			                        //Find the vertical position
                                    vert_top = tools.getCellSize() * 2 + 2 + parseInt(topEl.attr("offset"), 10);
                                    break;

                                // **days**
                                default:
                                    var dFrom = tools.genId(tools.dateDeserialize(eventData.from).getTime());
                                    var dTo = tools.genId(tools.dateDeserialize(eventData.to).getTime());
                                    var from = $(element).find("#dh-" + dFrom);
                                    cFrom = from.attr("offset");

                                    var dl = Math.floor(((dTo / 1000) - (dFrom / 1000)) / 86400) + 1;

		                            _bar = core.createProgressBar(
			                            dl,
			                            eventData.id ? eventData.id : "",
			                            eventData.parent ? eventData.parent : eventData.id,
			                            eventData.customClass ? eventData.customClass : customized.className ? customized.className : null,
			                            eventData.desc ? eventData.desc : minDesc ? minDesc : "",
			                            eventData.label ? eventData.label : minLabel ? minLabel : "",
			                            eventData.dataObj ? eventData.dataObj : entryDataObj ? entryDataObj : null,
			                            customized.bgColor ? customized.bgColor : null,
			                            showToolTip,
			                            true
			                        );

			                        //Find the vertical position
                                    vert_top = tools.getCellSize() * 4 + 2 + parseInt(topEl.attr("offset"), 10);
                                    break;
                            }
                            _bar.css({ 'top': vert_top, 'left': Math.floor(cFrom) });
                            datapanel.append(_bar);

                            //Make sure the triangle color is correct for visibility
                            var $l = _bar.find(".fn-fulllabel");
                            
							if(customized.txtColor){
								$l.attr("style", "color:" + customized.txtColor + "!important;" );
							}else{
								if ($l && _bar.length) {
									if(_bar[0].style.backgroundColor){
										var invertCompliment = tools.invertColor(_bar[0].style.backgroundColor);
										$l.attr("style", "color:" + invertCompliment + "!important;" );
									}
								} else if ($l) {
									$l.css("color", "#000000");
								}
							}

                            /* TODO: */
                            //Since Milestones only show a triangle - let's look at the bar main event bar and adjust the label if it imposes any risk to seeing the label.
							/*
                            var $mainEventLabel = $(element).find("div[data-id='_bar_"+ eventData.parent +"']");
                            var pBarWidth = $mainEventLabel.find("div[data-id='_label_"+ eventData.parent +"']").width();
                            var pLabelWidth = $mainEventLabel.find("div[data-id='_label_"+ eventData.parent +"']").text().width()
                            var thisBar = _bar.width();
                            if(window.console){ console.log("Parent: " + eventData.parent + " Bar W: " + pBarWidth + " Label W: " + pLabelWidth + " this Bar W: " + thisBar); }
                            */
							
                        });

                    }
                });
            },

            // **Navigation**
            navigateTo: function (element, val) {
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");
                $dataPanel.click = function () {
                    alert(arguments.join(""));
                };
                var rightPanelWidth = $rightPanel.width();
                var dataPanelWidth = $dataPanel.width();

                switch (val) {
                    case "begin":
                        $dataPanel.animate({
                            "margin-left": "0px"
                        }, "fast", function () { core.repositionLabel(element); });
                        element.scrollNavigation.panelMargin = 0;
                        break;
                    case "end":
                        var mLeft = dataPanelWidth - rightPanelWidth;
                        element.scrollNavigation.panelMargin = mLeft * -1;
                        $dataPanel.animate({
                            "margin-left": "-" + mLeft + "px"
                        }, "fast", function () { core.repositionLabel(element); });
                        break;
                    case "now":
                        if (!element.scrollNavigation.canScroll || !$dataPanel.find(".today").length) {
                            return false;
                        }
                        var max_left = (dataPanelWidth - rightPanelWidth) * -1;
                        var cur_marg = $dataPanel.css("margin-left").replace("px", "");
                        var val = $dataPanel.find(".today").offset().left - $dataPanel.offset().left;

                        val *= -1;
                        if (val > 0) {
                            val = 0;
                        } else if (val < max_left) {
                            val = max_left;
                        }
                        
                        if(settings.offsetTodayDays > 0){
                        	val = Math.floor(val + (settings.offsetTodayDays*tools.getCellSize()));
                        }
                        
                        $dataPanel.animate({
                            "margin-left": val + "px"
                        }, "fast", core.repositionLabel(element));
                        element.scrollNavigation.panelMargin = val;
                        break;
                    default:
                        var max_left = (dataPanelWidth - rightPanelWidth) * -1;
                        var cur_marg = $dataPanel.css("margin-left").replace("px", "");
                        var val = parseInt(cur_marg, 10) + val;
                        if (val <= 0 && val >= max_left) {
                            $dataPanel.animate({
                                "margin-left": val + "px"
                            }, "fast", core.repositionLabel(element));
                        }
                        element.scrollNavigation.panelMargin = val;
                        break;
                }
                core.synchronizeScroller(element);
            },

            // Navigate to a specific page
            navigatePage: function (element, val) {
                if ((element.pageNum + val) >= 0 && (element.pageNum + val) < Math.ceil(element.rowsNum / settings.itemsPerPage)) {
                    core.waitToggle(element, true, function () {
                        element.pageNum += val;
                        element.hPosition = $(".fn-gantt .dataPanel").css("margin-left").replace("px", "");
                        element.scaleOldWidth = false;
                        core.init(element);
                    });
                }
            },

            // Change zoom level
            zoomInOut: function (element, val) {
                core.waitToggle(element, true, function () {

                    var zoomIn = (val < 0);

                    var scaleSt = element.scaleStep + val * 3;
                    scaleSt = scaleSt <= 1 ? 1 : scaleSt === 4 ? 3 : scaleSt;
                    var scale = settings.scale;
                    var headerRows = element.headerRows;
                    if (settings.scale === "hours" && scaleSt >= 13) {
                        scale = "days";
                        headerRows = 4;
                        scaleSt = 13;
                    } else if (settings.scale === "days" && zoomIn) {
                        scale = "hours";
                        headerRows = 5;
                        scaleSt = 12;
                    } else if (settings.scale === "days" && !zoomIn) {
                        scale = "weeks";
                        headerRows = 3;
                        scaleSt = 13;
                    } else if (settings.scale === "weeks" && !zoomIn) {
                        scale = "months";
                        headerRows = 2;
                        scaleSt = 14;
                    } else if (settings.scale === "weeks" && zoomIn) {
                        scale = "days";
                        headerRows = 4;
                        scaleSt = 13;
                    } else if (settings.scale === "months" && zoomIn) {
                        scale = "weeks";
                        headerRows = 3;
                        scaleSt = 13;
                    }

                    if ((zoomIn && $.inArray(scale, scales) < $.inArray(settings.minScale, scales))
                        || (!zoomIn && $.inArray(scale, scales) > $.inArray(settings.maxScale, scales))) {
                        core.init(element);
                        return;
                    }
                    element.scaleStep = scaleSt;
                    settings.scale = scale;
                    element.headerRows = headerRows;
                    var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                    var $dataPanel = $rightPanel.find(".dataPanel");
                    element.hPosition = $dataPanel.css("margin-left").replace("px", "");
                    element.scaleOldWidth = ($dataPanel.width() - $rightPanel.width());

                    if (settings.useCookie) {
                        $.cookie(this.cookieKey + "CurrentScale", settings.scale);
                        // reset scrollPos
                        $.cookie(this.cookieKey + "ScrollPos", null);
                    }
                    core.init(element);
                });
            },

            // Move chart via mouseclick
            mouseScroll: function (element, e) {
                var $dataPanel = $(element).find(".fn-gantt .dataPanel");
                $dataPanel.css("cursor", "move");
                var bPos = $dataPanel.offset();
                var mPos = element.scrollNavigation.mouseX === null ? e.pageX : element.scrollNavigation.mouseX;
                var delta = e.pageX - mPos;
                element.scrollNavigation.mouseX = e.pageX;

                core.scrollPanel(element, delta);

                clearTimeout(element.scrollNavigation.repositionDelay);
                element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);
            },

            // Move chart via mousewheel
            wheelScroll: function (element, e) {
				e.preventDefault(); // e is a jQuery Event
                var delta = e.detail ? e.detail * (-50) : e.wheelDelta / 120 * 50;

                core.scrollPanel(element, delta);

                clearTimeout(element.scrollNavigation.repositionDelay);
                element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);
            },

            // Move chart via slider control
            sliderScroll: function (element, e) {
                var $sliderBar = $(element).find(".nav-slider-bar");
                var $sliderBarBtn = $sliderBar.find(".nav-slider-button");
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");

                var bPos = $sliderBar.offset();
                var bWidth = $sliderBar.width();
                var wButton = $sliderBarBtn.width();

                var pos, mLeft;

                if ((e.pageX >= bPos.left) && (e.pageX <= bPos.left + bWidth)) {
                    pos = e.pageX - bPos.left;
                    pos = pos - wButton / 2;
                    $sliderBarBtn.css("left", pos);

                    mLeft = $dataPanel.width() - $rightPanel.width();

                    var pPos = pos * mLeft / bWidth * -1;
                    if (pPos >= 0) {
                        $dataPanel.css("margin-left", "0px");
                        element.scrollNavigation.panelMargin = 0;
                    } else if (pos >= bWidth - (wButton * 1)) {
                        $dataPanel.css("margin-left", mLeft * -1 + "px");
                        element.scrollNavigation.panelMargin = mLeft * -1;
                    } else {
                        $dataPanel.css("margin-left", pPos + "px");
                        element.scrollNavigation.panelMargin = pPos;
                    }
                    clearTimeout(element.scrollNavigation.repositionDelay);
                    element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 5, element);
                }
            },

            // Update scroll panel margins
            scrollPanel: function (element, delta) {
                if (!element.scrollNavigation.canScroll) {
                    return false;
                }
                var _panelMargin = parseInt(element.scrollNavigation.panelMargin, 10) + delta;
                if (_panelMargin > 0) {
                    element.scrollNavigation.panelMargin = 0;
                    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin + "px");
                } else if (_panelMargin < element.scrollNavigation.panelMaxPos * -1) {
                    element.scrollNavigation.panelMargin = element.scrollNavigation.panelMaxPos * -1;
                    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin + "px");
                } else {
                    element.scrollNavigation.panelMargin = _panelMargin;
                    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin + "px");
                }
                core.synchronizeScroller(element);
            },

            // Synchronize scroller
            synchronizeScroller: function (element) {
                if (settings.navigate === "scroll") {
                    var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                    var $dataPanel = $rightPanel.find(".dataPanel");
                    var $sliderBar = $(element).find(".nav-slider-bar");
                    var $sliderBtn = $sliderBar.find(".nav-slider-button");

                    var bWidth = $sliderBar.width();
                    var wButton = $sliderBtn.width();

                    var mLeft = $dataPanel.width() - $rightPanel.width();
                    var hPos = 0;
                    if ($dataPanel.css("margin-left")) {
                        hPos = $dataPanel.css("margin-left").replace("px", "");
                    }
                    var pos = hPos * bWidth / mLeft - $sliderBtn.width() * 0.25;
                    pos = pos > 0 ? 0 : (pos * -1 >= bWidth - (wButton * 0.75)) ? (bWidth - (wButton * 1.25)) * -1 : pos;
                    $sliderBtn.css("left", pos * -1);
                }
            },

            // Reposition data labels
            repositionLabel: function (element) {
                setTimeout(function () {
                    var $dataPanel;
                    if (!element) {
                        $dataPanel = $(".fn-gantt .rightPanel .dataPanel");
                    } else {
                        var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                        $dataPanel = $rightPanel.find(".dataPanel");
                    }

                    if (settings.useCookie) {
                        $.cookie(this.cookieKey + "ScrollPos", $dataPanel.css("margin-left").replace("px", ""));
                    }
                }, 500);
            },

            // waitToggle
            waitToggle: function (element, show, fn) {
                if (show) {
                    var eo = $(element).offset();
                    var ew = $(element).outerWidth();
                    var eh = $(element).outerHeight();

                    if (!element.loader) {
                        element.loader = $('<div class="fn-gantt-loader">'
                        + '<div class="fn-gantt-loader-spinner"><span>' + settings.waitText + '</span></div></div>');
                    }
                    $(element).append(element.loader);
                    setTimeout(fn, 500);

                } else if (element.loader) {
                  element.loader.detach();
                }
            }
        };

        // Utility functions
        // =================
        var tools = {
        
			sortData: function (sourceData, element) {
				var sortPattern = ["LessThan","inclusive","equalTo","GreaterThan"];
				var sortWindow = { before: 30, after: 90 };
				
				var toBeSorted = sourceData;
				var sorted = [];
				
				var compareStartTime = tools.dateSerialize(settings.startPos,"0");
				var compareEndTime = tools.dateSerialize(settings.startPos,"2359");
				var startTime = null;
				var endTime = null;
				
				var count = 0;
				
				$.each(sortPattern, function(j, method){
					$.each(toBeSorted, function(i, entry){

						startTime = tools.dateDeserialize(entry.eventBar[0].from,entry.eventBar[0].offsetUTC).getTime();
						endTime = tools.dateDeserialize(entry.eventBar[0].to,entry.eventBar[0].offsetUTC).getTime();
										
						switch(method){
							case "inclusive":
								if(startTime < compareStartTime){
									if(endTime > compareEndTime){
										sorted.push(entry);
									}
								}

								break;
							case "equalTo":
								if(startTime >= compareStartTime){
									if(endTime <= compareEndTime){
										sorted.push(entry);
									}
								}
								break;
							case "GreaterThan":
								if(startTime > compareStartTime){
									if(endTime > compareEndTime){
										sorted.push(entry);
									}
								}
								break;
							case "LessThan":
								if(startTime < compareStartTime){
									if(endTime < compareEndTime){
										sorted.push(entry);
									}
								}
								break;
							default:
								//should never happen
								break;
						}

					});
				});
				$.each(sorted, function(k, entry){
					startTime = tools.dateDeserialize(entry.eventBar[0].from,entry.eventBar[0].offsetUTC).getTime();
					endTime = tools.dateDeserialize(entry.eventBar[0].to,entry.eventBar[0].offsetUTC).getTime();
					count++;
					if(startTime <= compareStartTime){
						if(endTime >= compareEndTime){
							element.startPosition = count;
							return false;
						}
					}
				});
				
				return sorted;
			},

            // Return the maximum available date in data depending on the scale
            getMaxDate: function (element) {
                var maxDate = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.eventBar, function (i, date) {
                        maxDate = maxDate < tools.dateDeserialize(date.to) ? tools.dateDeserialize(date.to) : maxDate;
                    });
                });
                maxDate = maxDate || new Date();
                switch (settings.scale) {
                    case "hours":
                        maxDate.setHours(Math.ceil((maxDate.getHours()) / element.scaleStep) * element.scaleStep);
                        maxDate.setHours(maxDate.getHours() + element.scaleStep * 3);
                        break;
                    case "weeks":
                        var bd = new Date(maxDate.getTime());
                        var bd = new Date(bd.setDate(bd.getDate() + 3 * 7));
                        var md = Math.floor(bd.getDate() / 7) * 7;
                        maxDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);
                        break;
                    case "months":
                        var bd = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                        bd.setMonth(bd.getMonth() + 2);
                        maxDate = new Date(bd.getFullYear(), bd.getMonth(), 1);
                        break;
                    default:
                        maxDate.setHours(0);
                        maxDate.setDate(maxDate.getDate() + 3);
                        break;
                }
                return maxDate;
            },

            // Return the minimum available date in data depending on the scale
            getMinDate: function (element) {
                var minDate = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.eventBar, function (i, date) {
                        minDate = minDate > tools.dateDeserialize(date.from) || minDate === null ? tools.dateDeserialize(date.from) : minDate;
                    });
                });
                minDate = minDate || new Date();
                switch (settings.scale) {
                    case "hours":
                        minDate.setHours(Math.floor((minDate.getHours()) / element.scaleStep) * element.scaleStep);
                        minDate.setHours(minDate.getHours() - element.scaleStep * 3);
                        break;
                    case "weeks":
                        var bd = new Date(minDate.getTime());
                        var bd = new Date(bd.setDate(bd.getDate() - 3 * 7));
                        var md = Math.floor(bd.getDate() / 7) * 7;
                        minDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);
                        break;
                    case "months":
                        var bd = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                        bd.setMonth(bd.getMonth() - 3);
                        minDate = new Date(bd.getFullYear(), bd.getMonth(), 1);
                        break;
                    default:
                        minDate.setHours(0);
                        minDate.setDate(minDate.getDate() - 3);
                        break;
                }
                return minDate;
            },

            // Return an array of Date objects between `from` and `to`
            parseDateRange: function (from, to) {
                var current = new Date(from.getTime());
                var end = new Date(to.getTime()); // <- never used?
                var ret = [];
                var i = 0;
                do {
                    ret[i++] = new Date(current.getTime());
                    current.setDate(current.getDate() + 1);
                } while (current.getTime() <= to.getTime());
                return ret;

            },

            // Return an array of Date objects between `from` and `to`,
            // scaled hourly
            parseTimeRange: function (from, to, scaleStep) {
                var current = new Date(from);
                var end = new Date(to);

                // GR: Fix begin
                current.setMilliseconds(0);
                current.setSeconds(0);
                current.setMinutes(0);
                current.setHours(0);

                end.setMilliseconds(0);
                end.setSeconds(0);
                if (end.getMinutes() > 0 || end.getHours() > 0) {
                    end.setMinutes(0);
                    end.setHours(0);
                    end.setTime(end.getTime() + (86400000)); // Add day
                }
                // GR: Fix end

                var ret = [];
                var i = 0;
                for(;;) {
                    var dayStartTime = new Date(current);
                    dayStartTime.setHours(Math.floor((current.getHours()) / scaleStep) * scaleStep);

                    if (ret[i] && dayStartTime.getDay() !== ret[i].getDay()) {
                        // If mark-cursor jumped to next day, make sure it starts at 0 hours
                        dayStartTime.setHours(0);
                    }
                    ret[i] = dayStartTime;

                    // Note that we use ">" because we want to include the end-time point.
                    if (current.getTime() > to.getTime()) break;

                    /* BUG-2: current is moved backwards producing a dead-lock! (crashes chrome/IE/firefox)
                     * SEE: https://github.com/taitems/jQuery.Gantt/issues/62
                    if (current.getDay() !== ret[i].getDay()) {
                       current.setHours(0);
                    }
                    */

                    // GR Fix Begin
                    current = ktkGetNextDate(dayStartTime, scaleStep);
                    // GR Fix End

                    i++;
                }

                return ret;
            },

            // Return an array of Date objects between a range of weeks
            // between `from` and `to`
            parseWeeksRange: function (from, to) {

                var current = new Date(from);
                var end = new Date(to); // <- never used?

                var ret = [];
                var i = 0;
                do {
                    if (current.getDay() === 0) {
                        ret[i++] = current.getDayForWeek();
                    }
                    current.setDate(current.getDate() + 1);
                } while (current.getTime() <= to.getTime());

                return ret;
            },


            // Return an array of Date objects between a range of months
            // between `from` and `to`
            parseMonthsRange: function (from, to) {

                var current = new Date(from);
                var end = new Date(to); // <- never used?

                var ret = [];
                var i = 0;
                do {
                    ret[i++] = new Date(current.getFullYear(), current.getMonth(), 1);
                    current.setMonth(current.getMonth() + 1);
                } while (current.getTime() <= to.getTime());

                return ret;
            },

            // Serialize a date from a string or integer
			dateSerialize: function (date,timeStr) {
				if(timeStr != null && timeStr.length == 4){
					//if timeStr has a value then serialize to the specific time
					date.setHours(timeStr.substring(0,2));
					date.setMinutes(timeStr.substring(2,2));
					date.setSeconds("0");
					date.setMilliseconds("0");
				}else{
					//if timeStr is null or too short then default to midnight "0000"
					date.setHours("0");
					date.setMinutes("0");
					date.setSeconds("0");
					date.setMilliseconds("0");
				}
				return date.getTime();
			},

            // Deserialize a date from a string or integer
            dateDeserialize: function (date) {
                if (typeof date === "string") {
                    date = date.replace(/\/Date\((.*)\)\//, "$1");
                    date = $.isNumeric(date) ? parseInt(date, 10) : $.trim(date);
                }
                
                var offsetUTC = settings.offsetUTCHrs;
                //Convert UTC offset to milliseconds
                var addUTC = $.isNumeric(offsetUTC) ? (parseInt(offsetUTC, 10) * 1000 * 60 * 60) + 1000 : 0;

				//Add the UTC offset to the date
				date = date + addUTC;
				
                return new Date( date );
            },
            
            // Generate an id for a date
            genId: function (ticks) {
                var t = new Date(ticks);
                switch (settings.scale) {
                    case "hours":
                        var hour = t.getHours();
                        if (arguments.length >= 2) {
                            hour = (Math.floor((t.getHours()) / arguments[1]) * arguments[1]);
                        }
                        return (new Date(t.getFullYear(), t.getMonth(), t.getDate(), hour)).getTime();
                    case "weeks":
                        var y = t.getFullYear();
                        var w = t.getDayForWeek().getWeekOfYear();
                        var m = t.getMonth();
                        if (m === 11 && w === 1) {
                            y++;
                        }
                        return y + "-" + w;
                    case "months":
                        return t.getFullYear() + "-" + t.getMonth();
                    default:
                        return (new Date(t.getFullYear(), t.getMonth(), t.getDate())).getTime();
                }
            },

            // normalizes an array of dates into a map of start-of-day millisecond values
            _datesToDays: function ( dates ) {
                var dayMap = {};
                for (var i = 0, len = dates.length, day; i < len; i++) {
                    day = tools.dateDeserialize( dates[i] );
                    dayMap[ day.setHours(0, 0, 0, 0) ] = true;
                }
                return dayMap;
            },
            // Returns true when the given date appears in the array of holidays, if provided
            isHoliday: (function() { // IIFE
                // short-circuits the function if no holidays option was passed
                if (!settings.holidays) {
                  return function () { return false; };
                }
                var holidays = false;
                // returns the function that will be used to check for holidayness of a given date
                return function(date) {
                    if (!holidays) {
                      holidays = tools._datesToDays( settings.holidays );
                    }
                    return !!holidays[
                      // assumes numeric dates are already normalized to start-of-day
                      $.isNumeric(date) ?
                      date :
                      ( new Date(date.getFullYear(), date.getMonth(), date.getDate()) ).getTime()
                    ];
                };
            })(),

			//Alternative Holidays calculator
			check_Holiday: function (dt_date) {
				// check simple dates (month/date - no leading zeroes)
				var n_date = dt_date.getDate(),
					n_month = dt_date.getMonth() + 1;
				var s_date1 = n_month + '/' + n_date;
					
				if ( s_date1 == '1/1'   // New Year's Day
					//|| s_date1 == '6/14'  // Flag Day
					|| s_date1 == '7/4'   // Independence Day
					|| s_date1 == '11/11' // Veterans Day
					|| s_date1 == '12/25' // Christmas Day
				) return true;
				
				// weekday from beginning of the month (month/num/day)
				var n_wday = dt_date.getDay(),
					n_wnum = Math.floor((n_date - 1) / 7) + 1;
				var s_date2 = n_month + '/' + n_wnum + '/' + n_wday;
				
				if (   s_date2 == '1/3/1'  // Birthday of Martin Luther King, third Monday in January
					|| s_date2 == '2/3/1'  // Washington's Birthday, third Monday in February
					//|| s_date2 == '5/3/6'  // Armed Forces Day, third Saturday in May
					|| s_date2 == '9/1/1'  // Labor Day, first Monday in September
					|| s_date2 == '10/2/1' // Columbus Day, second Monday in October
					|| s_date2 == '11/4/4' // Thanksgiving Day, fourth Thursday in November
				) return true;
			
				// weekday number from end of the month (month/num/day)
				var dt_temp = new Date (dt_date);
				dt_temp.setDate(1);
				dt_temp.setMonth(dt_temp.getMonth() + 1);
				dt_temp.setDate(dt_temp.getDate() - 1);
				n_wnum = Math.floor((dt_temp.getDate() - n_date - 1) / 7) + 1;
				var s_date3 = n_month + '/' + n_wnum + '/' + n_wday;
				
				if (   s_date3 == '5/1/1'  // Memorial Day, last Monday in May
				) return true;
			
				// misc complex dates
				//if (s_date1 == '1/20' && (((dt_date.getFullYear() - 1937) % 4) == 0) 
				// Inauguration Day, January 20th every four years, starting in 1937. 
				//) return true;
					
				//if (n_month == 11 && n_date >= 2 && n_date < 9 && n_wday == 2
				// Election Day, Tuesday on or after November 2. 
				//) return true;
				
				return false;
			},
						
            // Get the current cell size
            _getCellSize: null,
            getCellSize: function () {
                if (!tools._getCellSize) {
                    $("body").append(
                        $('<div style="display: none; position: absolute;" class="fn-gantt" id="measureCellWidth"><div class="row"></div></div>')
                    );
                    tools._getCellSize = $("#measureCellWidth .row").height();

                    $("#measureCellWidth").empty().remove();
                }
                return tools._getCellSize;
            },

            // Get the current size of the right panel
            getRightPanelSize: function () {
                $("body").append(
                    $('<div style="display: none; position: absolute;" class="fn-gantt" id="measureCellWidth"><div class="rightPanel"></div></div>')
                );
                var ret = $("#measureCellWidth .rightPanel").height();
                $("#measureCellWidth").empty().remove();
                return ret;
            },

            // Get the current page height
            getPageHeight: function (element) {
                return element.pageNum + 1 === element.pageCount ? element.rowsOnLastPage * tools.getCellSize() : settings.itemsPerPage * tools.getCellSize();
            },

            // Get the current margin size of the progress bar
            _getProgressBarMargin: null,
            getProgressBarMargin: function () {
                if (!tools._getProgressBarMargin && tools._getProgressBarMargin !== 0) {
                    $("body").append(
                        $('<div style="display: none; position: absolute;" id="measureBarWidth" ><div class="fn-gantt"><div class="rightPanel"><div class="dataPanel"><div class="row day"><div class="bar" /></div></div></div></div></div>')
                    );
                    tools._getProgressBarMargin = parseInt($("#measureBarWidth .fn-gantt .rightPanel .day .bar").css("margin-left").replace("px", ""), 10);
                    tools._getProgressBarMargin += parseInt($("#measureBarWidth .fn-gantt .rightPanel .day .bar").css("margin-right").replace("px", ""), 10);
                    $("#measureBarWidth").empty().remove();
                }
                return tools._getProgressBarMargin;
            },
            
			invertColor: function (hexTripletColor) {
				var color = hexTripletColor;
				color = color.substring(1);           // remove #
				color = parseInt(color, 16);          // convert to integer
				color = 0xFFFFFF ^ color;             // invert three bytes
				color = color.toString(16);           // convert to hex
				color = ("000000" + color).slice(-6); // pad with leading zeros
				color = "#" + color;                  // prepend #
				return color;
			},
			
			debug: function (str,type){
				if(window.console){
					type = type || 0;
					switch(type){
						case 1:
							console.info(str);
							break;
						case 2:
							console.warn(str);
							break;
						case 3:
							console.error(str);
							break;
						default:
							console.log(str);
							break;
					}
				}
			}
        };


        this.each(function () {
            this.data = null;        // Received data
            this.data_M = null;
            this.pageNum = 0;        // Current page number
            this.pageCount = 0;      // Available pages count
            this.rowsOnLastPage = 0; // How many rows on last page
            this.rowsNum = 0;        // Number of total rows
            this.hPosition = 0;      // Current position on diagram (Horizontal)
            this.startPosition = 0;  // Starting Row position to determine which page to start on
            this.initLoad = true;
            this.dateStart = null;
            this.dateEnd = null;
            this.scrollClicked = false;
            this.scaleOldWidth = null;
            this.headerRows = null;
            this.testStr = "";

            // Update cookie with current scale
            if (settings.useCookie) {
                var sc = $.cookie(this.cookieKey + "CurrentScale");
                if (sc) {
                    settings.scale = $.cookie(this.cookieKey + "CurrentScale");
                } else {
                    $.cookie(this.cookieKey + "CurrentScale", settings.scale);
                }
            }

            switch (settings.scale) {
                case "hours": this.headerRows = 5; this.scaleStep = 1; break;
                case "weeks": this.headerRows = 3; this.scaleStep = 13; break;
                case "months": this.headerRows = 2; this.scaleStep = 14; break;
                default: this.headerRows = 4; this.scaleStep = 13; break;
            }

            this.scrollNavigation = {
                panelMouseDown: false,
                scrollerMouseDown: false,
                mouseX: null,
                panelMargin: 0,
                repositionDelay: 0,
                panelMaxPos: 0,
                canScroll: true
            };

            this.gantt = null;
            this.loader = null;

            core.create(this);

        });
    };
    
})(jQuery);
