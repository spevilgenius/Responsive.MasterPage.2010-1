/*---------------------------------------------------------------------------------   IE Fixes   -------------------------------------------------------------------------------*/
// SharePoint 2010 does not render well in IE=10 mode for some features such as people pickers and the rich text editor. These should fix this.
function MergeAttributes(oTarget, oSource) {
    var oAttributes = oSource.attributes;
    for (var i = 0; i < oAttributes.length; i++) {
        var oAttrib = oAttributes[i];
        if (oAttrib != null &&
            oAttrib.specified &&
            oAttrib.nodeName != "id" &&
            oAttrib.nodeName != "ID" &&
            oAttrib.nodeName != "name") {
            oTarget.setAttribute(oAttrib.nodeName, oAttrib.nodeValue);
        }
    }
    if (oSource.getAttribute("type") != null)
        oTarget.setAttribute("type", oSource.getAttribute("type"));
    if (oSource.submenuRoot != null)
        oTarget.submenuRoot = oSource.submenuRoot;
}