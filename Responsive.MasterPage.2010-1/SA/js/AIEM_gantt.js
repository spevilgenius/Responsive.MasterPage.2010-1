	/*
	* AIEM Gantt
	* 2014 Christopher Stoll CTR (Insignia Technologies)
	*
	* Purpose: Queries appropriate lists and structures the data for 
	* use by the Gantt widget and supporting data controls.
	*
	*/

	/* GUIDs of lists Containing the key data */
	// Global Variables
	/* GUIDs of lists Containing the key data */
	//LIVE List - 
	var _listName = "{17a60bca-9a53-4de1-8dd1-cde01c2ab90e}";  //Event Data
	var _listURL = "/AIEM/Lists/AIEMEvents/";
	//DEV List - 
	//var _listName = "{6D6DC2CC-A60F-4D7E-B0D6-3D94458756DD}";  //Event Data
	//var _listURL = "/AIEM/Lists/devAIEMEvents/";

	var colorList = "{08F1A2CF-B81B-4728-B817-26680892F08B}"; //Organizations with Color settings
	var imagesLib = "{8d93adec-24ba-401f-8bda-c6ac7411f75b}"; //Image Library for flags

	var listData = {};
	var colorPal = {};
	var images = {};
	var ganttData = [];
	var milestoneData = [];
	var nameArray = [];
	var daysOffSet = 2;
	
	var MULTICHOICE = ";#"; 
	var winWidth = $(window).width();
    var winHeight = $(window).height();
    
    var modalPop;
	var resizeTimeout;
	
	$(document).ready(function() {
		
		"use strict";

		if(/devPages/.test(window.location)){
			if(window.console){ console.log(window.location); }
			$("td[class='s4-titletext']").empty();
			$("td[class='s4-titletext']").append("<div style='font-size:16px;color:#B00;text-align:center;width:100%'>THIS IS A DEMO / DEVELOPMENT PAGE</div>");
		}
		//Page Button Actions
		$("#getData").on("click",function(e){
			e.preventDefault();
			filterData($("#lvlChoice"));
		});
		
		$("#printMe").on("click",function(e){
			e.preventDefault();
			$("#s4-ribbonrow").hide();
			$("#s4-titlerow").hide();
			$("#navbar").hide();
			$("#optionsTable").hide();
			$(this).hide();
			$("#resetPage").show();
			window.print();
		});
		$("#resetPage").on("click",function(e){
			e.preventDefault();
			$("#s4-ribbonrow").show();
			$("#s4-titlerow").show();
			$("#navbar").show();
			$("#optionsTable").show();
			$("#printMe").show();
			$(this).hide();
		});
				
		//Setup the date picker controls
		var today = new Date();
		$("#dateStart").val(today.format("mm/dd/yyyy"));
		$("#dateEnd").val(today.addDays(90).format("mm/dd/yyyy"));
		$("#dateStart").datepicker();
		$("#dateEnd").datepicker();

		//Wait for the XMLWriter to load
		SP.SOD.executeFunc('sp.runtime.js', 'SP.XmlWriter', function() {
			//Collect the images from the library
			collectImages();
			
			//Collect the color palette for use on the gantt
 			if( getColorPalette() > 0){
 				//Build the gantt passing the Start and End dates for the range
				pushGantt($("#dateStart").val(),$("#dateEnd").val());
				//Populate the drop-down filter
				popFilter();
				//Build the legend for the first time
				buildLegend();
			}else{
				//If getting the color palette fails show alert
				alert("No Data - Lead Organization Color Palette");
			}
		});
	});
	
	//Keep the legend visible by rebuilding the div when the page is resized.		
    $(window).resize(function() {
    	var winWidthNew = $(window).width();
	    // compare the new width with old one
	    if(winWidth != winWidthNew){
	    	//Have to delay firing the legend function - otherwise the function
	    	//doesn't fire when the browser maximize button is used
			setTimeout(function() {
				buildLegend();
			  }, 15);
	    }
	    //Update the width and height
	    winWidth = winWidthNew;
	});

	/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 */
	
	var dateFormat = function () {
	    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
	        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
	        timezoneClip = /[^-+\dA-Z]/g,
	        pad = function (val, len) {
	            val = String(val);
	            len = len || 2;
	            while (val.length < len) val = "0" + val;
	            return val;
	        };
	
	    // Regexes and supporting functions are cached through closure
	    return function (date, mask, utc) {
	        var dF = dateFormat;
	
	        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
	        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
	            mask = date;
	            date = undefined;
	        }
	
	        // Passing date through Date applies Date.parse, if necessary
	        date = date ? new Date(date) : new Date;
	        if (isNaN(date)) throw SyntaxError("invalid date");
	
	        mask = String(dF.masks[mask] || mask || dF.masks["default"]);
	
	        // Allow setting the utc argument via the mask
	        if (mask.slice(0, 4) == "UTC:") {
	            mask = mask.slice(4);
	            utc = true;
	        }
	
	        var _ = utc ? "getUTC" : "get",
	            d = date[_ + "Date"](),
	            D = date[_ + "Day"](),
	            m = date[_ + "Month"](),
	            y = date[_ + "FullYear"](),
	            H = date[_ + "Hours"](),
	            M = date[_ + "Minutes"](),
	            s = date[_ + "Seconds"](),
	            L = date[_ + "Milliseconds"](),
	            o = utc ? 0 : date.getTimezoneOffset(),
	            flags = {
	                d:    d,
	                dd:   pad(d),
	                ddd:  dF.i18n.dayNames[D],
	                dddd: dF.i18n.dayNames[D + 7],
	                m:    m + 1,
	                mm:   pad(m + 1),
	                mmm:  dF.i18n.monthNames[m],
	                mmmm: dF.i18n.monthNames[m + 12],
	                yy:   String(y).slice(2),
	                yyyy: y,
	                h:    H % 12 || 12,
	                hh:   pad(H % 12 || 12),
	                H:    H,
	                HH:   pad(H),
	                M:    M,
	                MM:   pad(M),
	                s:    s,
	                ss:   pad(s),
	                l:    pad(L, 3),
	                L:    pad(L > 99 ? Math.round(L / 10) : L),
	                t:    H < 12 ? "a"  : "p",
	                tt:   H < 12 ? "am" : "pm",
	                T:    H < 12 ? "A"  : "P",
	                TT:   H < 12 ? "AM" : "PM",
	                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
	                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
	                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
	            };
	
	        return mask.replace(token, function ($0) {
	            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
	        });
	    };
	}();
	
	// Some common format strings
	dateFormat.masks = {
	    "default":      "ddd mmm dd yyyy HH:MM:ss",
	    shortDate:      "m/d/yy",
	    mediumDate:     "mmm d, yyyy",
	    longDate:       "mmmm d, yyyy",
	    fullDate:       "dddd, mmmm d, yyyy",
	    shortTime:      "h:MM TT",
	    mediumTime:     "h:MM:ss TT",
	    longTime:       "h:MM:ss TT Z",
	    isoDate:        "yyyy-mm-dd",
	    isoTime:        "HH:MM:ss",
	    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
	    spQuery:		"yyyy-mm-dd",
	    milDate:		"dd-mmm-yy"
	};
	
	// Internationalization strings
	dateFormat.i18n = {
	    dayNames: [
	        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
	        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	    ],
	    monthNames: [
	        "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
	        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	    ]
	};
	
	// For convenience...
	Date.prototype.format = function (mask, utc) {
	    return dateFormat(this, mask, utc);
	};
	
	// Add Days
	Date.prototype.addDays = function(days) {
	    this.setDate(this.getDate() + days);
	    return this;
	};

/*** End Date Format Code ***/

	var collectImages = function () {
		/*
		* Using the images library populate the images array with the images in the library
		*/
		$().SPServices({
			operation: "GetListItems",
			async: false,
			listName: imagesLib,
			CAMLViewFields:"<ViewFields><FieldRef Name='ID'/><FieldRef Name='ServerUrl'/><FieldRef Name='BaseName'/><FieldRef Name='NameOrTitle'/></ViewFields>",
			completefunc: function (xData, Status){
				images = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
					mapping: {
						ows_ID: {mappedName: "ID", objectType: "Counter"},
						ows_NameOrTitle: {mappedName: "FileName", objectType: "Text"},
						ows_BaseName: {mappedName: "Name", objectType: "Text"},
						ows_ServerUrl: {mappedName: "SRC", objectType: "Text"}
					},
					includeAllAttrs: true,
					removeOws: false
				});
			}

	  	});
	  	
	  	return images.length;

	}
	
	var getImage = function (name) {
		/*
		* From the images array - Get a specific image URL (SRC) based on the name passed to the function
		* ** If the image is not found then at minimum return the 'warning' image
		*/
		var warningIdx = -1;
		var imageIdx = -1;

		$.each(images, function(i,v){
			if(v.Name.toLowerCase().indexOf(name.toLowerCase()) > -1){
				imageIdx = i;
			}
			if(v.Name.indexOf("warning") > -1){
				warningIdx = i;
			}
		});
		
		if(imageIdx > -1){
			return images[imageIdx].SRC;
		}
		
		return images[warningIdx].SRC;		
	}

	var buildLegend = function () {
		/*
		* From the colorPal array - Build the legend
		* We want this to be dynamic based on the width of the page.
		*/
		var legend = $("#colorLegend");  //On page div that will hold the legend table
		var firstCoE = true;
		var splitTbl = false;
		var splitPoint = 0;
		var splitWatch = 0;
		var coeCount = 0;
		
		//Need to know how many 'CoE' organizations exist before
		// determining how many cells are going to be produced
		$.each(colorPal, function(i,v){
			if(/CoE/.test(v.Title)){
				coeCount++;
			}
		});

		var cellCount = (colorPal.length-coeCount) + 1;  //Total cells that need to be shown. '+1' is the combined 'CoE' cell
		var scrWidth = winWidth;  //scrWidth
		var maxWidth = cellCount * 65; //maxTable width based on a cell width of 65 multiplied by the number of cells to produce

		//If the table width is larger than the ScreenWidth (minus 200px) then we want to split the table into sections
		if(maxWidth > (scrWidth-200)){
			splitTbl = true;
			//Determine how many cells can fit on to the screen in a single row and subtract 1 so there is a buffer between the table and outer edges
			splitPoint = Math.abs(Math.floor(scrWidth/65))-1;
		}	
	
		//Make sure the on page DIV is empty
		legend.empty();
		
		//Build the table - setting attributes and adding data to the table.
		var tbl = $("<table align='center' cellpadding='4'/>");
			tbl.css({"border":"0"});
		var tr = $("<tr/>");
			tr.css({ "height": "35"});
		var td = null;
			td = $("<td/>")
			td.append("LEGEND");
			//if we are splitting the table then set the column span for the Legend header to the appropriate size
			td.attr({ "colspan" : splitTbl ? splitPoint : cellCount });
			td.css({ "text-align" : "center" });
			tr.append(td);
			tbl.append(tr);
			
			tr = $("<tr/>");
			tr.css({ "height": "35"});
			
			$.each(colorPal, function(i,v){
				td = $("<td/>")
				//When we hit the first CoE build the block - otherwise only do the other organizations
				if(/CoE/.test(v.Title) && firstCoE){
					td.append("CoE");
					td.css({ "width" : "65px" });
					td.css({ "text-align" : "center" });
					td.css({ "background-color" : v.bgColor["lookupId"] });
					td.css({ "color" : v.txtColor["lookupId"] });
					tr.append(td);
					firstCoE = false;
				}else{
					//Make sure it is not a 'CoE'
					if(!(/CoE/.test(v.Title))){
						td.append(v.Title);
						td.css({ "width" : "65px" });
						td.css({ "text-align" : "center" });
						td.css({ "background-color" : v.bgColor["lookupId"] });
						td.css({ "color" : v.txtColor["lookupId"] });
						tr.append(td);
					}else{
						if(splitTbl && (/CoE/.test(v.Title))){ splitWatch--; }
					}
				}
				//if we are splitting the table, then we have to watch for the split points and append a new row to the table.
				if(splitTbl){
					splitWatch++;
					if(splitWatch == splitPoint){
						tbl.append(tr);
						tr = $("<tr/>");
						tr.css({ "height": "35"});
						splitWatch = 0;
					}
				}
			});
		//Append the last row to the table	
		tbl.append(tr);
		//Append the table to the DIV tag
		legend.append(tbl);
	}

	var popFilter = function () {
		/*
		* Populate the Filter dropdown with the Organizations from the colorPal array
		* NOTE: SES and STAR levels are current hard coded on the page
		*/

		var filterChoices = $("#lvlChoice");

		filterChoices.append("<optgroup label='Lead Organizations'>");
		
		$.each(colorPal, function(i,v){
			filterChoices.append("<option value='"+ v.Title +"'>"+ v.Title +"</option>");
		});
		
		filterChoices.append("</optgroup>");

		$("#lvlChoice").dropdownchecklist({ 
			icon: {}, 
			emptyText: "Click to Select...",
			width: 200,
			zIndex: 12000
		});
	}

	var getColorPalette = function () {
		/*
		* Using the Event Organizations list build the colorPal object
		*/

		$().SPServices({
			operation: "GetListItems",
			async: false,
			listName: colorList,
			CAMLViewFields:"<ViewFields><FieldRef Name='Title'/><FieldRef Name='ColorCode'/><FieldRef Name='Text_ColorCode'/></ViewFields>",
			completefunc: function (xData, Status){
				colorPal = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
					mapping: {
						ows_ID: {mappedName: "ID", objectType: "Counter"},
						ows_Title: {mappedName: "Title", objectType: "Text"},
						ows_ColorCode: {mappedName: "bgColor", objectType: "Lookup"},
						ows_Text_ColorCode: {mappedName: "txtColor", objectType: "Lookup"}
					},
					includeAllAttrs: true,
					removeOws: false
				});
			}

	  	});
	  	
	  	return colorPal.length;
	}

	var getColor = function (val,el) {
		/*
		* Get the appropriate color scheme in the colorPal object based on Organization's name in the Title element
		*/
		var color = "";
		$.each(colorPal, function(i,v){
			if(v["Title"] == val){
				color = v[el]["lookupId"];
			}
		});
		return color;
	}

	var pushGantt = function (dateStart,dateEnd) {	
		/*
		* Get the data, build the object for use by the gantt widget, show (push) the widget to the page
		*/
		if( getGanttData(dateStart,dateEnd) > 0 ) {
			if( buildObjectFormat() > 0 ) {
				showGantt();
			}else{
				alert("No Data");
			}
		}else{
			alert("No Data");
		}
	}

	var getGanttData = function (dateStart,dateEnd) {
		/*
		* Get the event data based on the Start and End date parameters
		* Two (2) data sets are pulled
		* - 'Overlap' (overlapData) : Data where the event overlaps today's date
		* - 'Normal' (normalData) : Data that fits within the date range selected
		*/

		var stringQuery = "";
		var days = null;
		var overlapData = {};
		var normalData = {};
		var milestones = {};
		var groupedData = {};
		
		//Instantiate a new instance of the Javascript CAML Builder object
		var caml = new CamlBuilder();
		
		//Build the query for the 'Normal' data set
		var queryCAML = caml.Where()
							.TextField('Status').EqualTo('Approved')
							.And()
							.DateTimeField('StartDate').GreaterThanOrEqualTo(dateISO(dateStart,true).format("spQuery"))
							.And()
							.DateTimeField('EndDate').LessThanOrEqualTo(dateISO(dateEnd,false).format("spQuery"))
        					.OrderBy('StartDate').ThenBy('EndDate').ThenBy('Title')
							.ToString();
    	
    	stringQuery = "<Query>" + queryCAML + "</Query>";

		var viewFields = "<ViewFields><FieldRef Name='ID'/><FieldRef Name='Title'/><FieldRef Name='LeadOrg'/><FieldRef Name='AssignedTo'/><FieldRef Name='GOSESLevel'/><FieldRef Name='Location'/><FieldRef Name='Participants'/><FieldRef Name='EventTopics'/><FieldRef Name='StartDate'/><FieldRef Name='EndDate'/><FieldRef Name='Milestones'/><FieldRef Name='LoE'/><FieldRef Name='PriorCoord'/><FieldRef Name='Status'/><FieldRef Name='Attachments' /><FieldRef Name='IsMilestone' /><FieldRef Name='ParentEventID' /></ViewFields>";
						
						

		//Get the 'Normal' data set
		$().SPServices({
			operation: "GetListItems",
			async: false,
			listName: _listName,
			CAMLViewFields: viewFields,
			CAMLQuery: stringQuery, 
			completefunc: function (xData, Status){
				normalData = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
					mapping: {
						ows_ID: {mappedName: "ID", objectType: "Counter"},
						ows_Title: {mappedName: "Title", objectType: "Text"},
						ows_EventTopics: {mappedName: "Desc", objectType: "Text"},
						ows_StartDate: {mappedName: "StartDate", objectType: "DateType"},
						ows_EndDate: {mappedName: "EndDate", objectType: "DateType"},
						ows_Milestones:  {mappedName: "Milestones", objectType: "Text"},
						ows_LoE:  {mappedName: "LoE", objectType: "Text"},
						ows_Location: {mappedName: "Location", objectType: "Text"},
						ows_Participants: {mappedName: "Participants", objectType: "Text"},
						ows_AssignedTo: {mappedName: "AssignedTo", objectType: "Text"},
						ows_PriorCoord: {mappedName: "PriorCoordDesc", objectType: "Text"},
						ows_Status: {mappedName: "Status", objectType: "Text"},
						ows_GOSESLevel: {mappedName: "choiceLevel", objectType: "Text"},
						ows_LeadOrg: {mappedName: "LeadOrg", objectType: "Text"},
						ows_ConfPacket: {mappedName: "ConfPacket", objectType: "Text"},
						ows_Attachments: {mappedName: "Attachments", objectType: "Text"},
						ows_IsMilestone: {mappedName: "IsMilestone", objectType: "Text"},
						ows_ParentEventID: {mappedName: "ParentEventID", objectType: "Text"}

					},
					includeAllAttrs: true,
					removeOws: false
				});
			}
	  	});
	  	
	  	//Build the query for the 'Overlap' data set
		queryCAML = caml.Where()
						.TextField('Status').EqualTo('Approved')
						.And()
						.DateTimeField('StartDate').LessThan(dateISO(dateStart,true).format("spQuery"))
						.And()
						.DateTimeField('EndDate').GreaterThanOrEqualTo(dateISO(dateStart,false).format("spQuery"))
    					.OrderBy('StartDate').ThenBy('EndDate').ThenBy('Title')
						.ToString();
    	
    	stringQuery = "<Query>" + queryCAML + "</Query>";

		//Get the 'Overlap' data set
		$().SPServices({
			operation: "GetListItems",
			async: false,
			listName: _listName,
			CAMLViewFields: viewFields,
			CAMLQuery: stringQuery, 
			completefunc: function (xData, Status){
				overlapData = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
					mapping: {
						ows_ID: {mappedName: "ID", objectType: "Counter"},
						ows_Title: {mappedName: "Title", objectType: "Text"},
						ows_EventTopics: {mappedName: "Desc", objectType: "Text"},
						ows_StartDate: {mappedName: "StartDate", objectType: "DateType"},
						ows_EndDate: {mappedName: "EndDate", objectType: "DateType"},
						ows_Milestones:  {mappedName: "Milestones", objectType: "Text"},
						ows_LoE:  {mappedName: "LoE", objectType: "Text"},
						ows_Location: {mappedName: "Location", objectType: "Text"},
						ows_Participants: {mappedName: "Participants", objectType: "Text"},
						ows_AssignedTo: {mappedName: "AssignedTo", objectType: "Text"},
						ows_PriorCoord: {mappedName: "PriorCoordDesc", objectType: "Text"},
						ows_Status: {mappedName: "Status", objectType: "Text"},
						ows_GOSESLevel: {mappedName: "choiceLevel", objectType: "Text"},
						ows_LeadOrg: {mappedName: "LeadOrg", objectType: "Text"},
						ows_ConfPacket: {mappedName: "ConfPacket", objectType: "Text"},
						ows_Attachments: {mappedName: "Attachments", objectType: "Text"},
						ows_IsMilestone: {mappedName: "IsMilestone", objectType: "Text"},
						ows_ParentEventID: {mappedName: "ParentEventID", objectType: "Text"}

					},
					includeAllAttrs: true,
					removeOws: false
				});
			}
	  	});
	  	
	  	//Build the query for the 'Milestone' data set
		queryCAML = caml.Where()
						.TextField('Status').EqualTo('Approved')
						.And()
						.DateTimeField('StartDate').GreaterThanOrEqualTo(dateISO(dateStart,true).format("spQuery"))
						.And()
						.TextField('IsMilestone').EqualTo('1')
    					.OrderBy('StartDate').ThenBy('EndDate').ThenBy('Title')
						.ToString();
    	
    	stringQuery = "<Query>" + queryCAML + "</Query>";

		//Get the 'Overlap' data set
		$().SPServices({
			operation: "GetListItems",
			async: false,
			listName: _listName,
			CAMLViewFields: viewFields,
			CAMLQuery: stringQuery, 
			completefunc: function (xData, Status){
				milestones = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
					mapping: {
						ows_ID: {mappedName: "ID", objectType: "Counter"},
						ows_Title: {mappedName: "Title", objectType: "Text"},
						ows_EventTopics: {mappedName: "Desc", objectType: "Text"},
						ows_StartDate: {mappedName: "StartDate", objectType: "DateType"},
						ows_EndDate: {mappedName: "EndDate", objectType: "DateType"},
						ows_Milestones:  {mappedName: "Milestones", objectType: "Text"},
						ows_LoE:  {mappedName: "LoE", objectType: "Text"},
						ows_Location: {mappedName: "Location", objectType: "Text"},
						ows_Participants: {mappedName: "Participants", objectType: "Text"},
						ows_AssignedTo: {mappedName: "AssignedTo", objectType: "Text"},
						ows_PriorCoord: {mappedName: "PriorCoordDesc", objectType: "Text"},
						ows_Status: {mappedName: "Status", objectType: "Text"},
						ows_GOSESLevel: {mappedName: "choiceLevel", objectType: "Text"},
						ows_LeadOrg: {mappedName: "LeadOrg", objectType: "Text"},
						ows_ConfPacket: {mappedName: "ConfPacket", objectType: "Text"},
						ows_Attachments: {mappedName: "Attachments", objectType: "Text"},
						ows_IsMilestone: {mappedName: "IsMilestone", objectType: "Text"},
						ows_ParentEventID: {mappedName: "ParentEventID", objectType: "Text"}

					},
					includeAllAttrs: true,
					removeOws: false
				});
			}
	  	});
	  	
	  	//Build a new object that combines the 'Normal' and 'Overlap' datasets
		//Using $.extend() will append the overlapData and remove any duplicate occurances of data
		//listData = $.extend({}, normalData, overlapData);
		groupedData = overlapData.concat(normalData);
		listData = groupedData.concat(milestones);
	  	return listData.length;
	}

	var filterData = function (selected) {
		/*
		* Used to apply the filter selections to the data
		*/
		getGanttData($("#dateStart").val(),$("#dateEnd").val());
		
		var	toBeFiltered = listData ;
		var filterArr = selected.val() || [];

		var filteredData = filterChartData(toBeFiltered, filterArr);

		toBeFiltered = filteredData;
		listData = toBeFiltered;

		buildObjectFormat();
		showGantt();
	}

	var filterChartData = function(jsonObj, filterStr ){
		var fJSONObj={};
		var ttlRecords = 0;
		var tempStar = "";
		var tempOrg = "";
		var objType = (typeof filterStr == 'object');
		var starFilters = [];
		var orgFilters = [];
		var ex = false;
		var idx = 0;

		//check for exclusive filtering
		if(filterStr[idx] === "EX"){
			//alert("Exclusive");
			ex = true;
			idx = 1;
		}
		
		//check for '-star' vs. 'orgs'
		if(objType){
			//collect 'star' filters
			for(var x=0+idx;x<filterStr.length;x++){
				if((filterStr[x].indexOf("star")>-1)||(filterStr[x].indexOf("ses")>-1)){
					starFilters.push(filterStr[x].toLowerCase());
					idx++;
				}
			}
			//collect 'org' filters
			for(var x=0+idx;x<filterStr.length;x++){
				orgFilters.push(filterStr[x].toLowerCase());
			}
		}

		if(jsonObj != null){
			for(var i in jsonObj){
				tempStar = getTrimmedText(jsonObj[i]["choiceLevel"],1).toLowerCase();
				tempOrg = getTrimmedText(jsonObj[i]["LeadOrg"],1).toLowerCase();
				if((starFilters.length > 0) && (orgFilters.length > 0)){
					if(ex){
						for(var x in starFilters){
							for(var y in orgFilters){
								if((starFilters[x] == tempStar)&&(orgFilters[y] == tempOrg)){
									fJSONObj[i]=jsonObj[i];
									ttlRecords++;
								}
							}
						}
					}else{
						for(var x in starFilters){
							if(starFilters[x] == tempStar){
								fJSONObj[i]=jsonObj[i];
								ttlRecords++;
								continue;		
							}
							for(var y in orgFilters){
								if(orgFilters[y] == tempOrg){
									fJSONObj[i]=jsonObj[i];
									ttlRecords++;			
								}
							}
						}
					}
				}else if(starFilters.length > 0){
					for(var x in starFilters){
						if(starFilters[x] == tempStar){
							fJSONObj[i]=jsonObj[i];
							ttlRecords++;			
						}
					}
				}else if(orgFilters.length > 0 ){
					for(var y in orgFilters){
						if(orgFilters[y] == tempOrg){
							fJSONObj[i]=jsonObj[i];
							ttlRecords++;			
						}
					}
				}
			}
		}

		if(ttlRecords <= 0){ 
			if((starFilters.length > 0) && (orgFilters.length > 0)){
				modalPop = SP.UI.ModalDialog.$1I_1('No Data Found', 'Filter criteria produced zero(0) results. Original Data set will be shown.', false, false, null, null, 270, '12px 12px 4px 6px', 0);
			}
			return jsonObj; 
		}

		return fJSONObj;
	}

	var showGantt = function () {
		/*
		*
		* Instantiate the Gantt widget by setting the source, options, and defining the extended functions
		* ** See the detailed Gantt documentation in the Shared Documents library **
		* ** Key Notes **
		*
		*	- itemsPerPage: defaults to show all items based on the length of the listData object
		*	- usePowerTips: dependent on the powerTips.js API
		*	- detailsPanel: MUST HAVE at minimum one (1) entry and the detailsWidth must equal the sum of the columnWidths values. columnNames and columnWidths are piped (|) delimited.
		*	
		*/

		$("#ganttAIEM").gantt({
			source: ganttData,
			source_M: milestoneData,
			navigate: "scroll",
			scale: "days",
			maxScale: "months",
			minScale: "hours",
			itemsPerPage:  $("#showAllItems").is(':checked')? listData.length : 15,
			scrollToToday: true,
			usePowerTips: true,
			waitText: "ARCIC Integrated Event Matrix is rendering ...",
			offsetTodayDays: daysOffSet,
			detailsPanel: [{
				detailsWidth: 350,
				columnNames: "Event|Start Date|End Date",
				columnWidths: "200|75|75"
			}],
			onItemClick: function(obj) {
				//$.modalPopUp("/AIEM/Lists/AIEMEvents/DispEvent.aspx?isDlg=1&ID="+obj.id+"&ContentTypeId=0x0",obj.title,800,600);
				$.modalPopUpWParams(_listURL+"DispEvent.aspx",obj.title,"&ID="+obj.id+"&ContentTypeId=0x0",800,758);			},
			onAddClick: function(dt, rowId) {
				//alert("Empty space clicked - add an item!");
			},
			onRender: function() {
				$(".powerTip").powerTip({
					placement: 'lp',
					offsetH: 160
				});
				$(".bar").powerTip({
					followMouse: true // north-east tooltip position
				});
				$("#loadingBox").hide();

				//modalPop.close();

			},
			onDataLoadFailed: function(data) {
				alert("Data failed to load!")
			}
		});
               
	}

	var buildObjectFormat = function () {
		/*
		* The Magic Happens Here *
		*
		* Build the Object to be used as the source for the Gantt widget
		* ** See the detailed Gantt documentation in the Shared Documents library **
		* ** Key Notes **
		*
		*	-
		*	
		*/

		ganttData = [];
		
		for(var i in listData ){
			if(!(listData[i].IsMilestone=="1")){
				ganttData.push({
					id: listData[i].ID,
					name: listData[i].Title,
					desc: listData[i].Desc,
					tooltip: false,
					detailsPanel_Data: listData[i].Title +"|"+ dateMil(listData[i].StartDate) +"|"+ dateMil(listData[i].EndDate),
					powerTip_Data: getToolTip(listData[i]),
					eventBar: [{
						id: listData[i].ID,
						parent: 0,
						from: getNumericDate(listData[i].StartDate),
						to: getNumericDate(listData[i].EndDate),
						label: getBarLabel(listData[i])
					}],
					customStyles: [{
						bgColor: getColor(getTrimmedText(listData[i].LeadOrg,1),"bgColor"),
						txtColor: getColor(getTrimmedText(listData[i].LeadOrg,1),"txtColor")
					}],
					dataObj:  [{
						id: listData[i].ID,
						title: listData[i].Title
					}]
				});
			}else{
				milestoneData.push({
					id: listData[i].ID,
					name: listData[i].Title,
					desc: listData[i].Desc,
					tooltip: false,
					detailsPanel_Data: listData[i].Title +"|"+ dateMil(listData[i].StartDate) +"|"+ dateMil(listData[i].EndDate),
					powerTip_Data: getToolTip(listData[i]),
					eventBar: [{
						id: listData[i].ID,
						parent: listData[i].ParentEventID,
						from: getNumericDate(listData[i].StartDate),
						to: getNumericDate(listData[i].EndDate),
						label: getBarLabel(listData[i])
					}],
					customStyles: [{
						bgColor: getColor(getTrimmedText(listData[i].LeadOrg,1),"bgColor"),
						txtColor: getColor(getTrimmedText(listData[i].LeadOrg,1),"txtColor")
					}],
					dataObj:  [{
						id: listData[i].ID,
						title: listData[i].Title
					}]
				});
			}
		}
		
		return ganttData.length;
	}
	
	var getBarLabel = function (val) {
		/*
		* Construct the string that will be used on the bar of the gantt line
		* - This is where the stars or SES image is added to the text.
		*/
		var strData = "";
		var star = val["choiceLevel"].replace(" ","");

		if(star.indexOf("Star") > -1){
			for(s=0;s<parseInt(star.substring(0,1));s++){
				strData += "&#9733;";
			}
		}else{
			if(star.indexOf("SES") > -1){
			strData += "<img style='height:12px;margin-top:2px;' src='"+ getImage(star) +"'>";
			}
		}
		
		strData += "&nbsp;" + val["Title"] + "; ";
		strData += "&nbsp;" + getTrimmedText(val["LeadOrg"],1);
		return strData;
	}
	
	var getToolTip = function (val) {
		/*
		* Construct the table that will be used on the custom tooltip (powerTip) shown when hovering on the event.
		*/
		
		var strData = "";
		var star = val["choiceLevel"].replace(" ","");
		strData = "<table width='100%'><tr><td align='left' width='33%'>";
		
		if(val["Attachments"]=="1"){
			strData += "<img style='height:40px;' src='"+ getImage("Attachments")+"'>";
		}else{
			strData += "&nbsp;";
		}
		strData += "</td><td align='center' width='34%'>";
		
		strData += "<img style='height:40px;' src='"+ getImage(star) +"'>";

		strData += "</td><td align='right' width='33%'>&nbsp;</td></tr><tr><td colspan='3'>";
		strData += "<b>Event:</b>&nbsp;" + val["Title"] +"<br>";
		strData += "<b>Event Topics:</b>&nbsp;" + val["Desc"].cleanHTML().showMoreMsg() +"<p>";
		strData += "<b>Start Date:</b>&nbsp;" + dateMil(val["StartDate"]) +"<br>";
		strData += "<b>End Date:</b>&nbsp;" + dateMil(val["EndDate"]) +"<p>";
		
		strData += "<b>Lead Organization:</b>&nbsp;" + val["LeadOrg"].trimMultiChoice() +"<br>";
		strData += "<b>Assigned To:</b>&nbsp;" + val["AssignedTo"].trimMultiChoice() +"<br>";
		strData += "<b>Participants:</b>&nbsp;" + val["Participants"].trimMultiChoice() +"<br>";
		strData += "<b>Location:</b>&nbsp;" + val["Location"] +"<br>";
		strData += "<b>Prior Coordination Desc:</b>&nbsp;" + val["PriorCoordDesc"].cleanHTML().showMoreMsg() +"<p/>";
		strData += "<b>Milestones:</b>&nbsp;" + val["Milestones"].cleanHTML().showMoreMsg() +"<p/>";
		strData += "<b>Line(s) of Effort:</b>&nbsp;" + val["LoE"].trimMultiChoice() +"<p/>";
		strData += "<b>Conference Packet Required:</b>&nbsp;" + val["ConfPacket"] +"<p/>";
		strData += "</td></tr></table>";
		
		return strData;
	}

	/*
	*
	* 	UTILITY FUNCTIONS
	*
	*/
	
	var escapeRegExp = function (string) {
	    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}
	
	var replaceAll = function(string, find, replace) {
	  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
	}

	var getTrimmedText = function(val,el){
		var trimVal = val;

		if(/#/i.test(val) > 0){
			trimVal = val.split("#")[el];
		}

		return trimVal;
	}

	var getNumericDate = function(val){
		var date = val.split(" ")[0].split("-");
		var hour = val.split(" ")[1].split(":");
		var d = Date.UTC(date[0], date[1]-1, date[2], hour[0], hour[1]);
		return	"/Date("+ d +")/";
	}
	
	var dateTrim = function(val){
		var trimDate = val.split(" ")[0];
		return trimDate;
	}
	
	var dateMil = function(val){
		var dateParts = val.split(" ")[0].split("-");
		var isoDate = new Date(dateParts[0],dateParts[1]-1,dateParts[2]);
		var strDate = isoDate.format("milDate");
		return strDate;
	}
	
	var dateISO = function(val,startDate){
		var dateParts = val.split("/");
		var rtnDate;
		
		if(startDate){
			rtnDate = new Date(dateParts[2],dateParts[0]-1,dateParts[1],0,0,0);			
		}else{
			rtnDate = new Date(dateParts[2],dateParts[0]-1,dateParts[1],11,59,59);
		}

		return rtnDate;
	}

	/*
	*
	* 	STRING object extended functionality (prototypes)
	*
	*/
	String.prototype.trimMultiChoice = function(){
		var str = this;
		var arr = str.split(MULTICHOICE);
		var rtn = "";
		if(arr.length > 0){
			for(var i=0;i<arr.length;i++){
				if(!arr[i].isNumeric()){
					rtn += arr[i] + ", ";
				}
			}
			rtn = rtn.substring(0,rtn.length-2);
		}else{
			rtn = arr[0];
		}
	
		return rtn;
	}
	
	String.prototype.isNumeric = function() {
	  return !isNaN(parseFloat(this)) && isFinite(this);
	}
	
	String.prototype.cleanHTML = function() {
		var rtn = this.replace(/^\s+|\s+$/g,'').replace(/(<(br[^>]*)>)/ig, '\n').replace(/(<([^>]+)>)/ig,'');
		return "<div>" + rtn + "</div>";
	}
	
	String.prototype.showMoreMsg = function() {
		var rtn = this;
		if(this.length > 230){
			rtn = this.substring(0,229) + "...<div style='color:#EEE8AA;'><b>[<i>Click Event to Show More</i>]</b></div>";
		}	
		return rtn;
	}
	function debug(str,type){
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
