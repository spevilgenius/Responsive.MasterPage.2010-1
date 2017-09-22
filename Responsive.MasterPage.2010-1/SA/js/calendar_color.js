$(document).ready(function () { });
_spBodyOnLoadFunctionNames.push("WaitForCalendarToLoad");
var SEPARATOR = "|||";
var MULTICHOICE = ";#";
var listName = "{17a60bca-9a53-4de1-8dd1-cde01c2ab90e}";
var colorList = "{08F1A2CF-B81B-4728-B817-26680892F08B}";
var imagesLib = "{8d93adec-24ba-401f-8bda-c6ac7411f75b}";
var listData = {};
var colorPal = {};
var images = {};
var progress = 0;
var debug = true;

function WaitForCalendarToLoad() {
    var color = false;
    getColorPalette();
    collectImages();
    if (typeof SP.UI.ApplicationPages.CalendarNotify.$4a == "undefined") {
        var pwold$4b = SP.UI.ApplicationPages.CalendarNotify.$4b;
        SP.UI.ApplicationPages.CalendarNotify.$4b = function () {
            pwold$4b();
            ctrl = SP.UI.ApplicationPages.CalendarInstanceRepository.firstInstance();
            color = true;
            if (ctrl) {
                ctrl.expandAll()
            }
            ColourCalendar()
        };
        SP.UI.ApplicationPages.SummaryCalendarView.prototype.renderGrids = function ($p0) {
            var $v_0 = new Sys.StringBuilder();
            var $v_1 = $p0.length;
            for (var $v_2 = 0; $v_2 < $v_1; $v_2++) {
                this.$7t_2($v_2, $p0[$v_2])
            }
            for (var $v_3 = 0; $v_3 < $v_1; $v_3++) {
                $v_0.append("<div>");
                this.$I_2.$7o($v_0, $p0[$v_3], $v_3);
                $v_0.append(this.emptY_DIV);
                $v_0.append("</div>")
            }
            this.setInnerHtml($v_0.toString());
            if (color) {
                ColourCalendar()
            }
        }
    } else {
        var pwold$4a = SP.UI.ApplicationPages.CalendarNotify.$4a;
        SP.UI.ApplicationPages.CalendarNotify.$4a = function () {
            pwold$4a();
            ctrl = SP.UI.ApplicationPages.CalendarInstanceRepository.firstInstance();
            color = true;
            if (ctrl) {
                ctrl.expandAll()
            }
            ColourCalendar()
        };
        SP.UI.ApplicationPages.SummaryCalendarView.prototype.renderGrids = function ($p0) {
            var $v_0 = new Sys.StringBuilder();
            var $v_1 = $p0.length;
            for (var $v_2 = 0; $v_2 < $v_1; $v_2++) {
                this.$7r_2($v_2, $p0[$v_2])
            }
            for (var $v_3 = 0; $v_3 < $v_1; $v_3++) {
                $v_0.append("<div>");
                this.$I_2.$7m($v_0, $p0[$v_3], $v_3);
                $v_0.append(this.emptY_DIV);
                $v_0.append("</div>")
            }
            this.setInnerHtml($v_0.toString());
            if (color) {
                ColourCalendar()
            }
        }
    }
    buildLegend();
    $("#loadingBox").hide()
}

function ColourCalendar() {
    var temp = "";
    var orgData;
    var lblText = "";
    var x = 0;
    var json = {};
    var ttlElem = jQuery("a:contains(" + SEPARATOR + ")").length;
    if (jQuery("a:contains(" + SEPARATOR + ")") != null) {
        jQuery("a:contains(" + SEPARATOR + ")").each(function (i) {
            x++;
            progress = Math.ceil(x / ttlElem * 100);
            jQuery('div:contains("progressbar")').text(progress);
            $box = jQuery(this).parents("div[title]");
            json = getRecData(this.innerHTML.split(SEPARATOR)[1]);
            lblText = getBarLabel(json[0]);
            this.innerHTML = "<span style='color:" + getColor(getTrimmedText(json[0].LeadOrg, 1), "txtColor") + "'>" + lblText + "</span>";
            jQuery($box).attr("title", "");
            jQuery($box).data("powertip", getToolTip(json[0]));
            jQuery($box).powerTip({
                smartPlacement: true,
                mouseOnToPopup: true
            });
            $box.css("background-color", getColor(getTrimmedText(json[0].LeadOrg, 1), "bgColor"))
        })
    }
}

function getRecData(id) {
    var recData = {};
    var stringQuery = "<Query><Where><Eq><FieldRef Name='ID'/><Value Type='Text'>" + id + "</Value></Eq></Where></Query>";
    var viewFields = "<ViewFields><FieldRef Name='ID'/><FieldRef Name='Title'/><FieldRef Name='LeadOrg'/><FieldRef Name='AssignedTo'/><FieldRef Name='GOSESLevel'/><FieldRef Name='Location'/><FieldRef Name='Participants'/><FieldRef Name='EventTopics'/><FieldRef Name='StartDate'/><FieldRef Name='EndDate'/><FieldRef Name='Milestones'/><FieldRef Name='LoE'/><FieldRef Name='PriorCoord'/><FieldRef Name='Status'/><FieldRef Name='Attachments' /></ViewFields>";
    $().SPServices({
        operation: "GetListItems",
        async: false,
        listName: listName,
        CAMLViewFields: viewFields,
        CAMLQuery: stringQuery,
        completefunc: function (xData, Status) {
            recData = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                mapping: {
                    ows_ID: {
                        mappedName: "ID",
                        objectType: "Counter"
                    },
                    ows_Title: {
                        mappedName: "Title",
                        objectType: "Text"
                    },
                    ows_EventTopics: {
                        mappedName: "Desc",
                        objectType: "Text"
                    },
                    ows_StartDate: {
                        mappedName: "StartDate",
                        objectType: "DateType"
                    },
                    ows_EndDate: {
                        mappedName: "EndDate",
                        objectType: "DateType"
                    },
                    ows_Milestones: {
                        mappedName: "Milestones",
                        objectType: "Text"
                    },
                    ows_LoE: {
                        mappedName: "LoE",
                        objectType: "Text"
                    },
                    ows_Location: {
                        mappedName: "Location",
                        objectType: "Text"
                    },
                    ows_Participants: {
                        mappedName: "Participants",
                        objectType: "Text"
                    },
                    ows_AssignedTo: {
                        mappedName: "AssignedTo",
                        objectType: "Text"
                    },
                    ows_PriorCoord: {
                        mappedName: "PriorCoordDesc",
                        objectType: "Text"
                    },
                    ows_Status: {
                        mappedName: "Status",
                        objectType: "Text"
                    },
                    ows_GOSESLevel: {
                        mappedName: "choiceLevel",
                        objectType: "Text"
                    },
                    ows_LeadOrg: {
                        mappedName: "LeadOrg",
                        objectType: "Text"
                    },
                    ows_ConfPacket: {
                        mappedName: "ConfPacket",
                        objectType: "Text"
                    },
                    ows_Attachments: {
                        mappedName: "Attachments",
                        objectType: "Text"
                    }
                },
                includeAllAttrs: true,
                removeOws: false
            })
        }
    });
    return recData
}
var getBarLabel = function (val) {
    var strData = "";
    var star = val.choiceLevel.replace(" ", "");
    if (star.indexOf("Star") > -1) {
        for (s = 0; s < parseInt(star.substring(0, 1)) ; s++) {
            strData += "&#9733;"
        }
    } else {
        if (star.indexOf("SES") > -1) {
            strData += "<img style='height:12px;margin-top:2px;' src='" + getImage(star) + "'>"
        }
    }
    strData += "&nbsp;" + val.Title + "; ";
    strData += "&nbsp;" + getTrimmedText(val.LeadOrg, 1);
    return strData
};

function getToolTip(val) {
    var strData = "";
    var star = val.choiceLevel.replace(" ", "");
    strData = "<table width='100%'><tr><td align='left' width='33%'>";
    if (val.Attachments == "1") {
        strData += "<img style='height:40px;' src='" + getImage("Attachments") + "'>"
    } else {
        strData += "&nbsp;"
    }
    strData += "</td><td align='center' width='34%'>";
    strData += "<img style='height:40px;' src='" + getImage(star) + "'>";
    strData += "</td><td align='right' width='33%'>&nbsp;</td></tr><tr><td colspan='3'>";
    strData += "<b>Event:</b>&nbsp;" + val.Title + "<br>";
    strData += "<b>Event Topics:</b>&nbsp;" + val.Desc.cleanHTML().showMoreMsg() + "<p>";
    strData += "<b>Start Date:</b>&nbsp;" + dateMil(val.StartDate) + "<br>";
    strData += "<b>End Date:</b>&nbsp;" + dateMil(val.EndDate) + "<p>";
    strData += "<b>Lead Organization:</b>&nbsp;" + val.LeadOrg.trimMultiChoice() + "<br>";
    strData += "<b>Assigned To:</b>&nbsp;" + val.AssignedTo.trimMultiChoice() + "<br>";
    strData += "<b>Participants:</b>&nbsp;" + val.Participants.trimMultiChoice() + "<br>";
    strData += "<b>Location:</b>&nbsp;" + val.Location + "<br>";
    strData += "<b>Prior Coordination Desc:</b>&nbsp;" + val.PriorCoordDesc.cleanHTML().showMoreMsg() + "<p/>";
    strData += "<b>Milestones:</b>&nbsp;" + val.Milestones.cleanHTML().showMoreMsg() + "<p/>";
    strData += "<b>Line(s) of Effort:</b>&nbsp;" + val.LoE.trimMultiChoice() + "<p/>";
    strData += "<b>Conference Packet Required:</b>&nbsp;" + val.ConfPacket + "<p/>";
    strData += "</td></tr></table>";
    return strData
}

function GetActualText(originalText) {
    var parts = originalText.split(SEPARATOR);
    return parts[0] + parts[2]
}

function GetID(originalText) {
    var parts = originalText.split(SEPARATOR);
    return parts[1]
}

function getTrimmedText(val, el, chr) {
    var trimVal = val;
    if ((typeof chr === "undefined") || (chr === undefined) || (chr === undefined)) {
        if (/#/i.test(val) > 0) {
            trimVal = val.split("#")[el]
        }
    } else {
        var patt = new RegExp(chr, "g");
        if (patt.test(val) > 0) {
            trimVal = val.split(chr)[el]
        }
    }
    return trimVal
}

function getNumericDate(val) {
    var date = val.split(" ")[0].split("-");
    var hour = val.split(" ")[1].split(":");
    var d = Date.UTC(date[0], date[1] - 1, date[2], hour[0], hour[1]);
    return "/Date(" + d + ")/"
}

function dateTrim(val) {
    var trimDate = val.split(" ")[0];
    return trimDate
}

function dateMil(val) {
    var dateParts = val.split(" ")[0].split("-");
    var isoDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    var strDate = isoDate.format("milDate");
    return strDate
}

function dateISO(val) {
    var dateParts = val.split("/");
    return (new Date(dateParts[2], dateParts[0] - 1, dateParts[1]))
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), "g"), replace)
}

function getColorPalette() {
    $().SPServices({
        operation: "GetListItems",
        async: false,
        listName: colorList,
        CAMLViewFields: "<ViewFields><FieldRef Name='Title'/><FieldRef Name='ColorCode'/><FieldRef Name='Text_ColorCode'/></ViewFields>",
        completefunc: function (xData, Status) {
            colorPal = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                mapping: {
                    ows_ID: {
                        mappedName: "ID",
                        objectType: "Counter"
                    },
                    ows_Title: {
                        mappedName: "Title",
                        objectType: "Text"
                    },
                    ows_ColorCode: {
                        mappedName: "bgColor",
                        objectType: "Lookup"
                    },
                    ows_Text_ColorCode: {
                        mappedName: "txtColor",
                        objectType: "Lookup"
                    }
                },
                includeAllAttrs: true,
                removeOws: false
            })
        }
    });
    return colorPal.length
}

function getColor(val, el) {
    var trimColor = null;
    $.each(colorPal, function (i, v) {
        if (v.Title == val) {
            trimColor = v[el]["lookupId"]
        }
    });
    if (trimColor == null) {
        if (el == "txtColor") {
            trimColor = "#000000"
        } else {
            trimColor = "#D0E4FD"
        }
    }
    return trimColor
}

function buildLegend() {
    var legend = $("#colorLegend");
    var firstCoE = true;
    var tbl = $("<table align='center'/>");
    tbl.css({
        border: "0"
    });
    var tr = tr = $("<tr/>");
    tr.css({
        height: "35"
    });
    var td = null;
    td = $("<td/>");
    td.append("LEGEND");
    td.css({
        width: "55"
    });
    td.css({
        "text-align": "center"
    });
    tr.append(td);
    tbl.append(tr);
    $.each(colorPal, function (i, v) {
        tr = tr = $("<tr/>");
        tr.css({
            height: "35"
        });
        td = $("<td/>");
        if (/CoE/.test(v.Title) && firstCoE) {
            td.append("CoE");
            td.css({
                width: "55"
            });
            td.css({
                "text-align": "center"
            });
            td.css({
                "background-color": v.bgColor.lookupId
            });
            td.css({
                color: v.txtColor.lookupId
            });
            tr.append(td);
            tbl.append(tr);
            firstCoE = false
        } else {
            if (!(/CoE/.test(v.Title))) {
                td.append(v.Title);
                td.css({
                    width: "55"
                });
                td.css({
                    "text-align": "center"
                });
                td.css({
                    "background-color": v.bgColor.lookupId
                });
                td.css({
                    color: v.txtColor.lookupId
                });
                tr.append(td);
                tbl.append(tr)
            }
        }
    });
    legend.append(tbl)
}

function collectImages() {
    $().SPServices({
        operation: "GetListItems",
        async: false,
        listName: imagesLib,
        CAMLViewFields: "<ViewFields><FieldRef Name='ID'/><FieldRef Name='ServerUrl'/><FieldRef Name='BaseName'/><FieldRef Name='NameOrTitle'/></ViewFields>",
        completefunc: function (xData, Status) {
            images = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                mapping: {
                    ows_ID: {
                        mappedName: "ID",
                        objectType: "Counter"
                    },
                    ows_NameOrTitle: {
                        mappedName: "FileName",
                        objectType: "Text"
                    },
                    ows_BaseName: {
                        mappedName: "Name",
                        objectType: "Text"
                    },
                    ows_ServerUrl: {
                        mappedName: "SRC",
                        objectType: "Text"
                    }
                },
                includeAllAttrs: true,
                removeOws: false
            })
        }
    });
    return images.length
}

function getImage(name) {
    var warningIdx = -1;
    var imageIdx = -1;
    $.each(images, function (i, v) {
        if (v.Name.toLowerCase().indexOf(name.toLowerCase()) > -1) {
            imageIdx = i
        }
        if (v.Name.indexOf("warning") > -1) {
            warningIdx = i
        }
    });
    if (imageIdx > -1) {
        return images[imageIdx].SRC
    }
    return images[warningIdx].SRC
}
var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) {
                val = "0" + val
            }
            return val
        };
    return function (date, mask, utc) {
        var dF = dateFormat;
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined
        }
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) {
            throw SyntaxError("invalid date")
        }
        mask = String(dF.masks[mask] || mask || dF.masks["default"]);
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true
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
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };
        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1)
        })
    }
}();
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    spQuery: "yyyy-mm-dd",
    milDate: "dd-mmm-yy"
};
dateFormat.i18n = {
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc)
};
Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
    return this
};
String.prototype.trimMultiChoice = function () {
    var str = this;
    var arr = str.split(MULTICHOICE);
    var rtn = "";
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (!arr[i].isNumeric()) {
                rtn += arr[i] + ", "
            }
        }
        rtn = rtn.substring(0, rtn.length - 2)
    } else {
        rtn = arr[0]
    }
    return rtn
};
String.prototype.isNumeric = function () {
    return !isNaN(parseFloat(this)) && isFinite(this)
};
String.prototype.cleanHTML = function () {
    var rtn = this.replace(/^\s+|\s+$/g, "").replace(/(<(br[^>]*)>)/ig, "\n").replace(/(<([^>]+)>)/ig, "");
    return "<div>" + rtn + "</div>"
};
String.prototype.showMoreMsg = function () {
    var rtn = this;
    if (this.length > 230) {
        rtn = this.substring(0, 229) + "...<div style='color:#EEE8AA;'><b>[<i>Click Event to Show More</i>]</b></div>"
    }
    return rtn
};