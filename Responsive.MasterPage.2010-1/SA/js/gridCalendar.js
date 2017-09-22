	/*
	* AWG Grid Calendar
	* 2015 Christopher Stoll CTR (Insignia Technologies)
	*
	* Purpose: Queries appropriate lists and structures the data for use by the gridCalendar widget and supporting data controls.
	*
	*/

	// SUPER Globals
	var _MULTICHOICE = ";#"; 
	var _winWidth = $(window).width();
    var _winHeight = $(window).height();
    
    var _modalPop;
	var _resizeTimeout;
    
	// Global Variables
	/* GUIDs of lists Containing the key data */
	//LIVE List - 
	var _listName = "{17a60bca-9a53-4de1-8dd1-cde01c2ab90e}";  //Event Data
	var _listURL = "/AIEM/Lists/AIEMEvents/";
	//DEV List - 
	//var _listName = "{6D6DC2CC-A60F-4D7E-B0D6-3D94458756DD}";  //Event Data
	//var _listURL = "/AIEM/Lists/devAIEMEvents/";


	var _colorList = "{08F1A2CF-B81B-4728-B817-26680892F08B}"; //Organizations with Color settings
	var _orgList = "{08F1A2CF-B81B-4728-B817-26680892F08B}"; //Organizations for getting sort order
	var _imagesLib = "{8d93adec-24ba-401f-8bda-c6ac7411f75b}"; //Image Library for flags
	var _listData = {};
	var _theData = [];

	var _groupData = [];
	var _legendData = [];

	var _colorPal = {};
	var _images = {};
	var _ganttData = [];
	var _nameArray = [];
	var _daysOffSet = 2;
		
	var _viewFieldsList = "<ViewFields><FieldRef Name='ID'/><FieldRef Name='Title'/><FieldRef Name='AssignedTo'/><FieldRef Name='GOSESLevel'/><FieldRef Name='Location'/><FieldRef Name='EventTopics'/><FieldRef Name='StartDate'/><FieldRef Name='EndDate'/><FieldRef Name='Milestones'/><FieldRef Name='LoE'/><FieldRef Name='PriorCoord'/><FieldRef Name='Status'/><FieldRef Name='Attachments' /><FieldRef Name='LeadOrg'/><FieldRef Name='Participants'/><FieldRef Name='AOCOP'/><FieldRef Name='LeadOrg_x003a_ID'/><FieldRef Name='Participants_x003a_ID'/><FieldRef Name='AOCOP_x003a_ID'/><FieldRef Name='IsMilestone' /><FieldRef Name='ParentEventID' /></ViewFields>";
	
	var _listMapping = {
		ows_ID: {mappedName: "ID", objectType: "Counter"},
		ows_Title: {mappedName: "Title", objectType: "Text"},
		ows_EventTopics: {mappedName: "Desc", objectType: "Text"},
		ows_StartDate: {mappedName: "StartDate", objectType: "DateType"},
		ows_EndDate: {mappedName: "EndDate", objectType: "DateType"},
		ows_Milestones:  {mappedName: "Milestones", objectType: "Text"},
		ows_LoE:  {mappedName: "LoE", objectType: "Text"},
		ows_Location: {mappedName: "Location", objectType: "Text"},
		ows_LeadOrg: {mappedName: "LeadOrg", objectType: "Text"},
		ows_LeadOrg_x003a_ID: {mappedName: "LeadOrg_ID", objectType: "Text"},
		ows_Participants: {mappedName: "Participants", objectType: "Text"},
		ows_Participants_x003a_ID: {mappedName: "Participants_ID", objectType: "Text"},
		ows_AOCOP: {mappedName: "AOCOP", objectType: "Text"},
		ows_AOCOP_x003a_ID: {mappedName: "AOCOP_ID", objectType: "Text"},
		ows_AssignedTo: {mappedName: "AssignedTo", objectType: "Text"},
		ows_PriorCoord: {mappedName: "PriorCoordDesc", objectType: "Text"},
		ows_Status: {mappedName: "Status", objectType: "Text"},
		ows_GOSESLevel: {mappedName: "choiceLevel", objectType: "Text"},
		ows_ConfPacket: {mappedName: "ConfPacket", objectType: "Text"},
		ows_IsMilestone: {mappedName: "IsMilestone", objectType: "Text"},
		ows_ParentEventID: {mappedName: "ParentEventID", objectType: "Text"},
		ows_Attachments: {mappedName: "Attachments", objectType: "Text"}
	}
	
	var ExecCOP = true;

	var txtMonth = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	var today = new Date();
	var onlyLead = false;

	var _varMonth = today.getMonth();
	var _varYear = today.getFullYear();
	var _startDate = null;
	var _endDate = null;
	var _daysInMonth = null;
	
	$(document).ready(function() {
		"use strict";
		if(/devPages/.test(window.location)){
			if(window.console){ console.log(window.location); }
			$("td[class='s4-titletext']").empty();
			$("td[class='s4-titletext']").append("<div style='font-size:16px;color:#B00;text-align:center;width:100%'>THIS IS A DEMO / DEVELOPMENT PAGE</div>");
		}

		//Setup the date picker controls and date variables
		_startDate = new Date(_varYear, _varMonth, 1);
        _daysInMonth = new Date(_varYear, (_varMonth+1), 0).getDate();
        _endDate = new Date(_varYear, _varMonth, _daysInMonth);
		SP.SOD.executeFunc('sp.runtime.js', 'SP.XmlWriter', function() {
			//Collect the images from the library
			collectImages();
			
			//Collect the color palette for use on the gantt
 			var colorDefer = getColorPalette();
			
			$.when(colorDefer).then(function(){
				getGroupings();
				getLegend();
			}).then(function(){
				popGrid();
			});
		});
		$("#onlyLead").on("click",function(e){
			e.preventDefault();
			onlyLead = !onlyLead;
			if(onlyLead){
				$("#onlyLead").html('Show All');
				$("#onlyLead").prop('title', 'Show All Events.');  
			}else{
				$("#onlyLead").html('Show Only Lead'); 
				$("#onlyLead").prop('title', 'Show Events where ONLY the Lead.');
			}
			popGrid();
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
		function UNDO_resizes4WP()
		{
			$("#customPageFooter").hide();
			var undoHT = $("#customPageFooter").height();
			$("#s4-workspace").css('height', ($("#s4-workspace").height() + undoHT) + 'px');
		}
		ExecuteOrDelayUntilScriptLoaded(function () { SP.UI.Workspace.add_resized(UNDO_resizes4WP); }, "init.js");
	
	});
	
	function popGrid(){
		$("#gridCalendar_COP").empty();
		_theData = [];
		
			var startDate = _startDate.format("mm/dd/yyyy");
			var endDate = _endDate.format("mm/dd/yyyy");
			var viewMonth = _varMonth;
			var viewYear = _varYear;

			var loopVal = 0;
			var dataPull_Done = pullData(startDate,endDate);
			
			$.when( dataPull_Done ).then(function () {
				var dataList_Done = getGridObjectData();
				var lpGroups = [];
				var legendGroups = [];
				var dumpArr = [];
				$.when( dataList_Done ).then(function () {
					for(var x=0;x<_groupData.length;x++){
						if($.inArray( _groupData[x].id, dumpArr ) === -1){
							dumpArr.push(_groupData[x].id);
							lpGroups.push({ 
								id: _groupData[x].id, 
								text: _groupData[x].title, 
								records: 0,
								recordIDs: [], 
								bgColor: _groupData[x].bgColor.lookupId,
								txtColor: _groupData[x].txtColor.lookupId,
								order: _groupData[x].order
							});
						}
					}
					for(var x=0;x<lpGroups.length;x++){
						var records = 0;
						var arrIDs = [];
						for(var y=0;y<_listData.length;y++){
							if(lpGroups[x].id == _listData[y].LeadOrg_ID.split(";#")[0]){
								records++;
								arrIDs.push(_listData[y].ID);
							}else{
								if(!onlyLead){
									if(_listData[y].Participants.indexOf(lpGroups[x].text) > 0){
										records++;
										arrIDs.push(_listData[y].ID);
									}
								}
							}
						}
						lpGroups[x].records = records;
						lpGroups[x].recordIDs = $.extend(true, [], arrIDs);
					}
				}).then(function () {
					dumpArr = [];
					for(var x=0;x<_legendData.length;x++){
						if($.inArray( _legendData[x].id, dumpArr ) === -1){
							dumpArr.push(_legendData[x].id);
							legendGroups.push({ 
								id: _legendData[x].id, 
								text: _legendData[x].title,
								records: 0, 
								bgColor: _legendData[x].bgColor.lookupId,
								txtColor: _legendData[x].txtColor.lookupId,
								order: _legendData[x].order
							});
						}
					}
				}).then(function () {
					$("#gridCalendar_COP").gridCalendar({
						dataSet: _theData,
						title: "ARCIC Executive COP",
						waitText: "The Grid is now rendering ...",
						customLoader: $("#loadingBox"),
						onlyLead: onlyLead,
						viewMonth: viewMonth, // Month to Show
						viewYear: viewYear, // Year to Show
						leftPanel: {
							panelWidth: 125,
							panelTitle: "",
							groups: lpGroups
						},
						showLegend: true,
						legend: {
							title: "Legend - Other Organizations",
							data: legendGroups
						},
						usePowerTips: true,
						useNavControl: true,
						onNavLeftClick: function(){
							//Navigated the Month backward
							$("#loadingBox").show();
							if((_varMonth-1)<0){
								_varMonth = 11;
								_varYear--;
							}else{
								_varMonth--;
							}
							_startDate = new Date(_varYear, _varMonth, 1);
					        _daysInMonth = new Date(_varYear, (_varMonth+1), 0).getDate();
					        _endDate = new Date(_varYear, _varMonth, _daysInMonth);
							popGrid();
						},
						onNavRightClick: function(){
							//Navigated the Month forward
							$("#loadingBox").show();
							if((_varMonth+1)>11){
								_varMonth = 0;
								_varYear++;
							}else{
								_varMonth++;
							}
							_startDate = new Date(_varYear, _varMonth, 1);
					        _daysInMonth = new Date(_varYear, (_varMonth+1), 0).getDate();
					        _endDate = new Date(_varYear, _varMonth, _daysInMonth);
							popGrid();
						},
			            onRender: function() { 
			            	//Do some stuff after being grid Calendar is rendered.
							$(".powerTip").powerTip({
								placement: 'lp',
								offsetH: 160
							});
							$(".bar").powerTip({
								followMouse: true // north-east tooltip position
							});
			            },
						onItemClick: function(obj) {
							$.modalPopUpWParams(_listURL+"DispEvent.aspx",obj.title,"&ID="+obj.id+"&ContentTypeId=0x0",800,758);
						},
						onDataLoadFailed: function(errObj) {
							debug(errObj.errMsg);
						},
						debug: false
					});	
				}).done(function () {
					$("#loadingBox").hide();			
				});
			});
	}
	//Keep the legend visible by rebuilding the div when the page is resized.		
    $(window).resize(function() {
    	var winWidthNew = $(window).width();
	    // compare the new width with old one
	    if(_winWidth != winWidthNew){
	    	//Have to delay firing the legend function - otherwise the function
	    	//doesn't fire when the browser maximize button is used
			setTimeout(function() {
				//buildLegend();
			  }, 15);
	    }
	    //Update the width and height
	    _winWidth = winWidthNew;
	});

	//Little debug function for writing messages to the browser's (IE) console
	function debug(str){
		if(window.console){
			console.log(str);
		}
	}
	
	function pullData(dateStart,dateEnd){
		var defer = $.Deferred();
		var currentQuery, endsQuery, beginsQuery;
		var currentData, endsData, beginsData;
		var days = null;
		var currentDataSet = {};
		var endsDataSet = {};
		var beginsDataSet = {};

		var dataPull_Done;
		
		//Instantiate a new instance of the Javascript CAML Builder object
		var caml = new CamlBuilder();
		
		//Data in the given month
		var query = caml.Where()
						.TextField('Status').EqualTo('Approved')
						.And()
						.DateTimeField('StartDate').GreaterThanOrEqualTo(dateISO(dateStart,true).format("spQuery"))
						.And()
						.DateTimeField('EndDate').LessThanOrEqualTo(dateISO(dateEnd,false).format("spQuery"))
    					.OrderBy('LeadOrg').ThenBy('StartDate').ThenBy('EndDate').ThenBy('Title')
						.ToString();
    	
    	currentQuery = "<Query>" + query + "</Query>";

	  	//Data Begins during the given month
		    query = caml.Where()
						.TextField('Status').EqualTo('Approved')
						.And()
						.DateTimeField('EndDate').GreaterThanOrEqualTo(dateISO(dateStart,true).format("spQuery"))
						.And()
						.DateTimeField('StartDate').LessThan(dateISO(dateStart,false).format("spQuery"))
    					.OrderBy('LeadOrg').ThenBy('StartDate').ThenBy('EndDate').ThenBy('Title')
						.ToString();
    	
    	beginsQuery = "<Query>" + query + "</Query>";

	  	//Data Ends during the given month
		    query = caml.Where()
						.TextField('Status').EqualTo('Approved')
						.And()
						.DateTimeField('StartDate').LessThanOrEqualTo(dateISO(dateEnd,true).format("spQuery"))
						.And()
						.DateTimeField('EndDate').GreaterThan(dateISO(dateEnd,false).format("spQuery"))
    					.OrderBy('LeadOrg').ThenBy('StartDate').ThenBy('EndDate').ThenBy('Title')
						.ToString();
    	
    	endsQuery = "<Query>" + query + "</Query>";

		var currentData = $().SPHelper.GetListData({
			list: _listName,
			CAMLQuery: currentQuery,
			CAMLViewFields: _viewFieldsList,
			CAMLQueryOptions: "<QueryOptions><ExpandUserField>False</ExpandUserField></QueryOptions>",
			mapping: _listMapping,
			includeAllAttrs: true,
			removeOws: false,
		}).done(function(){
			currentDataSet = this.data
		});
		var beginsData = $().SPHelper.GetListData({
			list: _listName,
			CAMLQuery: beginsQuery,
			CAMLViewFields: _viewFieldsList,
			CAMLQueryOptions: "<QueryOptions><ExpandUserField>False</ExpandUserField></QueryOptions>",
			mapping: _listMapping,
			includeAllAttrs: true,
			removeOws: false,
		}).done(function(){
			beginsDataSet = this.data
		});
		var endsData = $().SPHelper.GetListData({
			list: _listName,
			CAMLQuery: endsQuery,
			CAMLViewFields: _viewFieldsList,
			CAMLQueryOptions: "<QueryOptions><ExpandUserField>False</ExpandUserField></QueryOptions>",
			mapping: _listMapping,
			includeAllAttrs: true,
			removeOws: false,
		}).done(function(){
			endsDataSet = this.data
		});

		$.when(currentData,beginsData,endsData).then(function(){
			//Ok we waited
			},function(){
				//Failure Function
				if(currentData.state()==="rejected"){
					debug("Getting the currentDataSet - Something Failed");	
				}
				if(beginsData.state()==="rejected"){
					debug("Getting the beginsDataSet - Something Failed");	
				}
				if(endsData.state()==="rejected"){
					debug("Getting the endsDataSet - Something Failed");	
				}
		}).always(function(){
			//Success Function
			var mergedData = $.merge( [], beginsDataSet);
		  	//Build a new object that combines the 'Normal' and 'Overlap' datasets
		  	
		  	if(endsDataSet.length>0){
		  		mergedData = $.merge( mergedData, endsDataSet);
		  	}
		  	
		  	if(currentDataSet.length>0){
			  	mergedData = $.merge( mergedData, currentDataSet);
		  	}
			
			var existingIDs = [];
			mergedData = $.grep(mergedData, function(v) {
			    if ($.inArray(v.ID, existingIDs) === -1) {
			        existingIDs.push(v.ID);
			        return true;
			    }else {
			        return false;
			    }
			});

			_listData = mergedData;
			dataPull_Done = defer.resolve();
		});
		
		return dataPull_Done;
	}
	
	function getGridObjectData(){

		var defer = $.Deferred();
		var deferDone;
		
		var loopCount = 0;

		for(var i in _listData ){
			_theData.push({	
				id: _listData[i].ID,
				name: _listData[i].Title,
				desc: _listData[i].Desc,
				lead: _listData[i].LeadOrg,
				participants: _listData[i].Participants,
				tagged:"",
				tooltip: false,
				detailsPanel_Data: getTrimmedText(_listData[i].LeadOrg,1),
				powerTip_Data: getToolTip(_listData[i]),
				eventBar: {
					id: _listData[i].ID,
					parent: checkParent(_listData[i]),
					milestone: checkMilestone(_listData[i]),
					from: dateSerialize(_listData[i].StartDate),
					to: dateSerialize(_listData[i].EndDate),
					label: getBarLabel(_listData[i])
				},
				customStyles: {
					bgColor: getColor(getTrimmedText(_listData[i].LeadOrg,1),"bgColor"),
					txtColor: getColor(getTrimmedText(_listData[i].LeadOrg,1),"txtColor")
				},
				dataObj: {
					listName: _listName,
					id: _listData[i].ID,
					parent: checkParent(_listData[i]),
					title: _listData[i].Title
				},
				errObj: {
					errMsg: "Something went wrong with ListItem ID: " + _listData[i].ID
				}
			});
			loopCount++;
		}

		deferDone = defer.resolve();				

		return deferDone;
	}
	function checkMilestone(obj){
		var rtnVal = false;
		if(obj.IsMilestone == "1"){
			rtnVal = !(parseInt(obj.ID,10) == parseInt(obj.ParentEventID,10));
		}
		return rtnVal;
	}
	function checkParent(obj) {
		var returnID = 0;
		if((obj.IsMilestone == "Yes")||(obj.IsMilestone == "1")){
			returnID = obj.ParentEventID;
		}else{
			returnID = obj.ID;
		}
		return parseInt(returnID,10);
	}
	
	function collectImages() {
		/*
		* Using the images library populate the images array with the images in the library
		*/
		$().SPServices({
			operation: "GetListItems",
			async: false,
			listName: _imagesLib,
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

	function getGroupings(){
		var defer = $.Deferred();
		var deferStatus;
		/*
		* Using the Event Organizations list build the colorPal object
		*/
		var copListData = [];
		var copList = $().SPHelper.GetListData({
			list: _orgList,
			CAMLQuery: "<Query><Where><Eq><FieldRef Name='ExecCOP'></FieldRef><Value Type='Integer'>1</Value></Eq></Where><OrderBy><FieldRef Name='ExecCOPOrder'/></OrderBy></Query>",
			CAMLViewFields: "<ViewFields><FieldRef Name='Title'/><FieldRef Name='ExecCOP'/><FieldRef Name='ExecCOPOrder'/><FieldRef Name='ColorCode'/><FieldRef Name='Text_ColorCode'/><FieldRef Name='ListOrder'/></ViewFields>",
			mapping: {
				ows_ID: {mappedName: "ID", objectType: "Counter"},
				ows_Title: {mappedName: "Title", objectType: "Text"},
				ows_ColorCode: {mappedName: "bgColor", objectType: "Lookup"},
				ows_Text_ColorCode: {mappedName: "txtColor", objectType: "Lookup"},
				ows_ExecCOPOrder: {mappedName: "order", objectType: "Text"}
			}
		}).done(function(){
			copListData = this.data
		});
		
		$.when(copList).then(function(){
			$.each(copListData, function(i,v){
				if(ExecCOP){
					_groupData.push({ id: v["ID"], title: v["Title"], bgColor: v["bgColor"], txtColor: v["txtColor"], order: v["order"] });
				}else{
					//This will be used for the Org View with tags
				}
			});

			deferStatus = defer.resolve();
		},function(){
			//Failure Function
			debug("Left Panel Groupings List - Something Failed");	
			deferStatus = defer.reject();
		});

	  	return deferStatus;
	}
	
	function getLegend(){
		var defer = $.Deferred();
		var deferStatus = defer.resolve();

		var legendListData = [];
		var legendList = $().SPHelper.GetListData({
			list: _orgList,
			CAMLQuery: "<Query><Where><Eq><FieldRef Name='ExecCOP'></FieldRef><Value Type='Integer'>0</Value></Eq></Where><OrderBy><FieldRef Name='ListOrder'/></OrderBy></Query>",
			CAMLViewFields: "<ViewFields><FieldRef Name='Title'/><FieldRef Name='ExecCOP'/><FieldRef Name='ExecCOPOrder'/><FieldRef Name='ColorCode'/><FieldRef Name='Text_ColorCode'/><FieldRef Name='ListOrder'/></ViewFields>",
			mapping: {
				ows_ID: {mappedName: "ID", objectType: "Counter"},
				ows_Title: {mappedName: "Title", objectType: "Text"},
				ows_ColorCode: {mappedName: "bgColor", objectType: "Lookup"},
				ows_Text_ColorCode: {mappedName: "txtColor", objectType: "Lookup"},
				ows_ListOrder: {mappedName: "order", objectType: "Text"}
			}
		}).done(function(){
			legendListData = this.data
		});
		
		$.when(legendList).then(function(){
			$.each(legendListData, function(i,v){
				_legendData.push({ id: v["ID"], title: v["Title"], bgColor: v["bgColor"], txtColor: v["txtColor"], order: v["order"] });
			});

			deferStatus = defer.resolve();
		},function(){
			//Failure Function
			debug("Legend List Data - Something Failed");	
			deferStatus = defer.reject();
		});
	
	  	return deferStatus;
	}
	var getColorPalette = function () {
		var defer = $.Deferred();
		var deferStatus;
		/*
		* Using the Event Organizations list build the colorPal object
		*/
		var colorPal = $().SPHelper.GetListData({
			list: _colorList,
			CAMLQuery: "<Query><OrderBy><FieldRef Name='ListOrder'/></OrderBy></Query>",
			CAMLViewFields: "<ViewFields><FieldRef Name='Title'/><FieldRef Name='ColorCode'/><FieldRef Name='Text_ColorCode'/><FieldRef Name='ListOrder'/></ViewFields>",
			mapping: {
				ows_ID: {mappedName: "ID", objectType: "Counter"},
				ows_Title: {mappedName: "Title", objectType: "Text"},
				ows_ColorCode: {mappedName: "bgColor", objectType: "Lookup"},
				ows_Text_ColorCode: {mappedName: "txtColor", objectType: "Lookup"},
				ows_ListOrder: {mappedName: "order", objectType: "Text"}
			}
		}).done(function(){
			_colorPal = this.data
		});
		
		$.when(colorPal).then(function(){
			deferStatus = defer.resolve();
		},function(){
			//Failure Function
			debug("Something Failed");	
			deferStatus = defer.reject();
		});

	  	return deferStatus;
	}
	var getColor = function (val,el) {
		/*
		* Get the appropriate color scheme in the colorPal object based on Organization's name in the Title element
		*/
		var color = "";
		$.each(_colorPal, function(i,v){
			if(v["Title"] == val){
				color = v[el]["lookupId"];
			}
		});
		return color;
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
			rtnDate = new Date(parseInt(dateParts[2],10),parseInt(dateParts[0],10)-1,parseInt(dateParts[1],10),0,0,0);
		}else{
			rtnDate = new Date(parseInt(dateParts[2],10),parseInt(dateParts[0],10)-1,parseInt(dateParts[1],10),11,59,59);
		}

		return rtnDate;
	}

	function dateSerialize(val){
		var date = val.split(" ")[0].split("-");
		var hour = val.split(" ")[1].split(":");
		var d = Date.UTC(date[0], date[1]-1, date[2], hour[0], hour[1]);
		return	"/Date("+ d +")/";
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

