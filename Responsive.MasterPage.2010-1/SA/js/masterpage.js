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

    var navurl = fixurl("/SiteAssets/html/SiteNavigation.html");
    var scripturl = fixurl("/SiteAssets/js/webslidemenu.js");
    var navscript = fixurl("/SiteAssets/js/SiteNavigation.js");
    logit("NAVURL: " + navurl);
    jQuery("#SiteNavigation").load(navurl, function () {
        loadCSS(fixurl('/SiteAssets/css/webslidemenu.css'));
        loadCSS(fixurl('/SiteAssets/css/font-awesome.css'));
        loadscript(scripturl, function () {
            loadscript(navscript, function () {
                $("#SiteNavigation").show();
            });
        });
    });

    jQuery('#UNModal').on('shown.bs.modal', function (event) {
        var rt = jQuery(event.relatedTarget)
        var tab = rt.data('tab');
        var modal = jQuery(this);
        modal.find("a[href*='" + tab + "']").click();

        // Sets heights based on window height
        h1 = jQuery(window).height();
        h2 = parseInt(h1 / 2);
        h5 = (Math.floor(h1 / 10) * 10) - 100;
        h6 = h5 - 70;
        jQuery(".unmodal").css({ height: h5 + "px" });
        jQuery("#UNModal .modal-body").css({ height: h5 + "px" });
        jQuery("#UNModal .tab-content").css({ height: h6 + "px" });
        jQuery("#UNModal-TabsClosePanel").css({ height: h5 + "px" });
        // End set heights
        jQuery(".modal-backdrop").on('click', function () {
            jQuery('#UNModal').modal('hide');
            jQuery("a[href='#UNModal']").blur();
        });
    });

    jQuery('#UNModal .nav-tabs-nns a').on('shown.bs.tab', function (event) {
        var x = jQuery(event.target).text();         // active tab
        jQuery("#deptSticky").removeClass("sticky"); // ensure it was not applied in previous viewing of tab and scrolled
        jQuery("#resSticky").removeClass("sticky"); // ensure it was not applied in previous viewing of tab and scrolled
        switch (x) {
            case "Departments":
                jQuery("#tabOrganizations").scrollTop(0);
                var placeholder = jQuery("#deptStickyHolder");
                var fixonscroll = jQuery("#deptSticky");
                jQuery(".tab-content").on('scroll', function () {
                    var pht = placeholder.position().top;
                    if ((pht <= 60) && !fixonscroll.is(".sticky")) {
                        placeholder.height(placeholder.height());
                        fixonscroll.addClass("sticky");
                    }
                    else if ((pht > 60) && fixonscroll.is(".sticky")) {
                        placeholder.css("height", "auto");
                        fixonscroll.removeClass("sticky");
                    }
                });
                break;

            case "Resources":
                jQuery("#tabResources").scrollTop(0);
                var placeholder = jQuery("#resStickyHolder");
                var fixonscroll = jQuery("#resSticky");
                jQuery(".tab-content").on('scroll', function () {
                    var pht = placeholder.position().top;
                    if ((pht <= 60) && !fixonscroll.is(".sticky")) {
                        placeholder.height(placeholder.height());
                        fixonscroll.addClass("sticky");
                    }
                    else if ((pht > 60) && fixonscroll.is(".sticky")) {
                        placeholder.css("height", "auto");
                        fixonscroll.removeClass("sticky");
                    }
                });
                break;
        }
    });

    jQuery("#deptLinks li").click(function () {
        jQuery("#deptLinks li").removeClass("active");
        jQuery(this).addClass("active");
    });

    jQuery("#UNModal-TabsClosePanel").click(function () {
        jQuery("#UNModal").modal("hide");
        jQuery("a[href='#UNModal']").blur();
    });

    jQuery("#UNModalClose").click(function () {
        jQuery("#UNModal").modal("hide");
        jQuery("a[href='#UNModal']").blur();
    });

    jQuery("#UNModalClose").hover(function () {
        jQuery(this).css({ "cursor": "pointer" });
    }, function () {
        jQuery(this).css({ "cursor": "default" });
    });

});