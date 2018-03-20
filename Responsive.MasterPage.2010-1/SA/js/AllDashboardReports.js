var CKO = CKO || {};
CKO.DASHBOARDS = CKO.DASHBOARDS || {};
CKO.DASHBOARDS.ALLDASHBOARDS = CKO.DASHBOARDS.ALLDASHBOARDS || {};

CKO.DASHBOARDS.ALLDASHBOARDS.VARIABLES = {
    site: null,
    loc: String(window.location),
    title: null,
    charts: ["Authorities", "Competencies", "Customers", "Enablers", "Functions", "Paragraph", "Parent", "Standards_vs_Directives"],
    titles: ["Authorities", "Competencies", "Customers", "Enablers", "Functions", "Paragraph", "Parent", "Standards vs Directives"],
    chart: null,
    html: "",
    firsttime: true,
    timefilter: null,
    persontypefilter: null,
    orgtypefilter: null,
    filter:
    '   <tr>' +
    '       <td>Time Period:&nbsp;&nbsp;</td>' +
    '       <td>' +
    '         <select id="TimeFilter" name="Time Period">' +
    '               <option id="W" value="W">Week</option>' +
    '               <option id="M" selected value="M"">Month</option>' +
    '               <option id="Q" value="Q">Quarter</option>' +
    '               <option id="Y" value="Y">Year</option>' +
    '         </select>' +
    '       </td>' +
    '       <td>&nbsp;&nbsp;Personnel Type:&nbsp;&nbsp;</td>' +
    '       <td>' +
    '          <select id="PersonTypeFilter" name="Personnel Type">' +
    '              <option id="All" selected value="All" >All</option>' +
    '              <option id="Contractor" value="Contractor">Contractor</option>' +
    '              <option id="Civilian" value="Civilian">Civilian</option>' +
    '              <option id="Military" value="Military">Military</option>' +
    '         </select>' +
    '       </td>' +
    '       <td>&nbsp;&nbsp;Organization:&nbsp;&nbsp;</td>' +
    '       <td>' +
    '            <select id="OrgFilter" name="Organization">' +
    '                <option id="All" selected value="All">All</option>' +
    '                <option id="ACoE" value="ACoE">ACoE</option>' +
    '                <option id="CASCOM-SCoE" value="CASCOM-SCoE">CASCOM-SCoE</option>' +
    '                <option id="CCoE" value="CCoE">CCoE</option>' +
    '                <option id="FCoE" value="FCoE">FCoE</option>' +
    '                <option id="HQ-TRADOC" value="HQ TRADOC">HQ-TRADOC</option>' +
    '                <option id="ICoE" value="ICoE">ICoE</option>' +
    '                <option id="MCoE" value="MCoE">MCoE</option>' +
    '                <option id="MCCoE" value="MCCoE">MCCoE</option>' +
    '                <option id="MSCoE" value="MSCoE">MSCoE</option>' +
    '                <option id="SSI" value="SSI">SSI</option>' +
    '                <option id="USAREC" value="USAREC">USAREC</option>' +
    '                <option id="USACC" value="USACC">USACC</option>' +
    '            </select>' +
    '        </td> '
}

CKO.DASHBOARDS.ALLDASHBOARDS.Reports = function () {
    var v = CKO.DASHBOARDS.ALLDASHBOARDS.VARIABLES;

    function Init(site) {
        v.site = site;
        //v.timefilter = timefilter;
        //v.persontypefilter =  persontypefilter;
        //v.orgtypefilter = orgtypefilter;

        //$().SPSTools_Notify({ type: 'wait', content: 'Loading Your Dashboard...Please wait...' });
        drawBaseUI();
    }

    function drawBaseUI() {
        v.html = "";
        for (var i = 0; i < v.charts.length; i++) {
            var chart = v.charts[i];
            var title = v.titles[i];
            v.html += "<div class='panel panel-info'>";
            v.html += "<div class='panel-heading'>";
            v.html += "<h4 class='panel-title' id='panel-title_"+[i] + "'" + "><a data-toggle='collapse' data-parent='#AllDashboardsReports' href='#collapse_" + chart + "'>" + title + "</a></h4>";
            v.html += "<table id='filtertable_" + [i] + "'" + " class='allDashboardFilter'><tbody>"; 
            v.html += formatfilter(chart, v.filter);
            v.html += "<td>&nbsp;&nbsp;<a href='#' class='btn btn-default' id='filter_" + chart + "'data-chart=" + chart + "' onclick='CKO.DASHBOARDS.ALLDASHBOARDS.Reports().SelectFilters(this);'>Select Filters</a></td></tr></tbody></table></div>";
            v.html += "<div id='" + chart + "'>";
            v.html += "<div id='collapse_" + chart + "' data-chart=" + chart + " class='panel-collapse collapse' data-drawn_='false' data-index_='" + chart + "'>";
            v.html += "<div class='panel-body' id='" + chart + "_panel'></div></div></div></div>";
        }

        $("#AllDashboardReports").html("").append(v.html);
        //drawBaseGantts();

        // toggle display of the filters next to the headers
        $("#panel-title_0").click(function () {
            $('#filtertable_0').toggle();
        });

        $("#panel-title_1").click(function () {
            $('#filtertable_1').toggle();
        });

        $("#panel-title_2").click(function () {
            $('#filtertable_2').toggle();
        });

        $("#panel-title_3").click(function () {
            $('#filtertable_3').toggle();
        });

        $("#panel-title_4").click(function () {
            $('#filtertable_4').toggle();
        });

        $("#panel-title_5").click(function () {
            $('#filtertable_5').toggle();
        });

        $("#panel-title_6").click(function () {
            $('#filtertable_6').toggle();
        });

        $("#panel-title_7").click(function () {
            $('#filtertable_7').toggle();
        });

        $(".collapse").on('shown.bs.collapse', function () {
            logit("Chart Expanded!");
            if ($(this).attr("data-drawn") == 'false') {
                $().SPSTools_Notify({ type: 'wait', content: 'Loading Chart...Please wait...' });
                var id = $(this).attr("id");
                var idx = $(this).attr("data-index");
                id = id.split("_");
                $(this).attr("data-drawn", "true");
                var selected = $(this).attr("data-chart");
                //switch (selected) {
                //    case "Authorities":
                //        //$("#Authorities_panel").html("").append(v.html);

                //        EnsureScriptFunc("ADR_Authorities.js", null, function () {
                //            CKO.DASHBOARDS.ALLDASHBOARDS.Authorities().Init(site,"Authorities");
                //        });
                //        break;

                //    case "Competencies":
                //        //$("#Competencies_panel").html("").append(v.html);
                //        //EnsureScriptFunc("ADR_Competencies.js", null, function () {
                //        //    CKO.DASHBOARDS.ALLDASHBOARDS.Competencies().Init(site);
                //        //});
                //        break;

                //    case "Customers ":
                //        //$("#Customers_panel").html("").append(v.html);
                //        //EnsureScriptFunc("ADR_Customers.js", null, function () {
                //        //    CKO.DASHBOARDS.ALLDASHBOARDS.Customers().Init(site);
                //        //});
                //        break;


                //    case "Enablers":
                //        EnsureScriptFunc("ADR_Enablers.js", null, function () {
                //            $CKO.DASHBOARDS.ALLDASHBOARDS.Enablers().Init(site, "Enablers");
                //        });
                //        break;

                //    case "Functions":
                //        //$("#Functions_panel").html("").append(v.html);
                //        //EnsureScriptFunc("ADR_Functions.js", null, function () {
                //        //    CKO.DASHBOARDS.ALLDASHBOARDS.Functions().Init(site);
                //        //});
                //        break;

                //    case "Paragraph":
                //        //$("#Paragraph_panel").html("").append(v.html);
                //        //EnsureScriptFunc("ADR_Paragraph.js", null, function () {
                //        //    CKO.DASHBOARDS.ALLDASHBOARDS.Paragraph().Init(site);
                //        //});
                //        break;

                //    case "Parent":
                //        //$("#Parent_panel").html("").append(v.html);
                //        //EnsureScriptFunc("ADR_Parent.js", null, function () {
                //        //    CKO.DASHBOARDS.ALLDASHBOARDS.Parent().Init(site);
                //        //});
                //        break;

                //    case "Standards_vs_Directives":


                //        //$("#Standards_vs_Directives_panel").html("").append(v.html);
                //        //EnsureScriptFunc("ADR_Standards_vs_Directives.js", null, function () {
                //        //    CKO.DASHBOARDS.ALLDASHBOARDS.Standards_vs_Directives().Init(site);
                //        //});
                //        break;
                //}
            }
            $("#SPSTools_Notify").fadeOut("2500", function () {
                $("#SPSTools_Notify").html("");
            });
        });

        //drawDashboards();
    }

    function formatfilter(title, filter) {
        filter = String(filter);
        filter = filter.replace("TimeFilter", "TimeFilter_" + title);
        filter = filter.replace("PersonTypeFilter", "PersonTypeFilter_" + title);
        filter = filter.replace("OrgFilter", "OrgFilter_" + title);
        return filter;
    }

    function SelectFilters(obj) {
        var id = $(obj).attr("id");
        id = id.split("_");
        v.persontypefilter = $("#PersonTypeFilter_" + id[1] + " option:selected").val();
        v.orgfilter = $("#OrgFilter_" + id[1] + " option:selected").val();
        v.timefilter = $("#TimeFilter_" + id[1] + " option:selected").val();

        //alert('Boo: ' + boo + ' PersonTypeFilter: ' + v.persontypefilter + '<br /><br />OrgTypeFilter: ' + v.orgfilter + '<br /><br />TimeFilter: ' + v.timefilter);

        
        var selected = id[1];
        switch (selected) {
            case "Enablers":
                $("#Enablers_panel")
                CKO.DASHBOARDS.ALLDASHBOARDS.Enablers().Init(v.site, id[1], v.persontypefilter, v.orgfilter, v.timefilter);
                break;
        }
        //alert("Calling function ADR_ " + id[1]);
    };

    return {
        Init: Init,
        SelectFilters: SelectFilters
    }

};

CKO.DASHBOARDS.ALLDASHBOARDS.Reports().Init("https://hq.tradoc.army.mil/sites/ocko/pmt");