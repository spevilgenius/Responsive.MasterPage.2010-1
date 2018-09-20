// fixes sp2010 incompatibility issues with IE >= 11
ExecuteOrDelayUntilScriptLoaded(function () { 
	ClickDay = function (c) {
	    ULSvmd:;
	    var a = GetIframe();
	    if (a == null) return DP_MoveToDate(c);
	    var b = GetParentWindow().parent.document.getElementById(a.resultfield.id + g_strDatePickerRangeValidatorID);
	    if (b != null) b.style.display = "none";
	    var d = a.OnSelectDateCallback;d(a.resultfield, c, a.targetAttribute);
	    var e = a.resultfunc;e(a.resultfield);
	    if (!browseris.firefox36up) return true;
	}
	OnIframeLoadFinish = function() {
	    ULSvmd:;
	    if (this.Picker != null && this.Picker.readyState != null && this.Picker.readyState == "complete") {
	        document.body.scrollLeft = g_scrollLeft;
	        document.body.scrollTop = g_scrollTop;
	        this.Picker.style.display = "block";
	        if (document.frames) document.frames[this.Picker.id].focus();
	        else this.Picker.focus();
	    }
	    var content = $.trim($(this.Picker).contents().find('body').text());
	    if(content == 'true'){
	    	this.Picker.style.display = "none";
	    }		    
	}
	RTE.Canvas.checkCurrentFocus = function() {
	    ULSNVe:;
	    var a = RTE.Selection.getSelectionRange();
	    var b = a ? a.parentElement() : null;
	    if (RTE.Canvas.isInEditable(b) && !RTE.Cursor.get_range().isValid()) {
	        RTE.Cursor.updateRangeToCurrentSelection();
	        RTE.Cursor.update()
	    }
	};
}, "sp.ui.rte.js");
