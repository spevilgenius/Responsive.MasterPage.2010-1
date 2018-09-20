jQuery(document).ready(function ($) {
    //var tp1 = String(jQuery("#welcomeMenuBox").find("a[title='Open Menu']").text()); // >=2013
    var tp1 = String(jQuery("span[title='Open Menu']").closest("span").text()); // =2010
    //tp1 = tp1.substring(0, tp1.indexOf("Use")); // >=2013
    tp1 = tp1.replace("Site Actions", ""); // =2010
    jQuery("#Nav-UserNameLink").html("").append(tp1 + " ");
    shtml = "";
    try {
        jQuery("menu[id*='PersonalActionMenu'] ie\\:menuitem").each(function () {
            shtml += "<li><a href='#' onclick=\"" + jQuery(this).attr('onmenuclick') + "\"; >" + jQuery(this).attr('text') + "</a></li>";
        });
        jQuery("#Nav-UserNameDD").html("").append(shtml);
    }
    catch (e) { }
    shtml = "";

    try {
        jQuery("menu[id*='SiteActions'] ie\\:menuitem").each(function () {
            shtml += "<li><a href='#' onclick=\"" + jQuery(this).attr('onmenuclick') + "\"; >" + jQuery(this).attr('text') + "</a></li>";
        });
        jQuery("#Nav-SiteActionsDD").html("").append(shtml);
        
    }
    catch (e) {
        jQuery("#Nav-SiteActionsDD").parent().hide();
    }

    var navurl = fixurl("/SiteAssets/html/SiteNavigation2.html");
    jQuery("#NavContent").load(navurl, function () {
        $("#SiteNavigation").show();
    });

    window.setInterval(function () {
        var html = String($(".ms-cui-topBar1").html());
        if (html.length === 0) {
            $("#s4-ribbonrow").hide();
        }
        else {
            $("#s4-ribbonrow").show();
        }
    }, 1000);
});