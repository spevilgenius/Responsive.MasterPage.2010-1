function GetSitePOCs(){
	var ctx = new SP.ClientContext.get_current();
	this.web = ctx.get_web();
	ctx.load(this.web);
	ctx.executeQueryAsync(Function.createDelegate(this, this.onSuccessPOCs), Function.createDelegate(this, this.onFailPOCs));
}

function GetSPSiteURL(){
	return window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
}

function GetSPServerURL(){
	return location.protocol + "//" + window.location.hostname;
}

function GetTKERelativeURL(){
	return "https://www.tkeportal.army.mil";
}

function onSuccessPOCs(sender, args){
	var pageURL = GetSPSiteURL() + '/Lists/Site%20Administrators/AllItems.aspx';
	SP.UI.ModalDialog.showModalDialog({ url: pageURL , title:'Site Administrators',   width:700,  height:400 });
}

function onFailPOCs(sender, args){
        alert('Failed to get POC list. Error:' + args.get_message());
}

function GoToPrivactandSecurity(){
	var pageURL = GetSPSiteURL() + '/Pages/Privacy.aspx';
	SP.UI.ModalDialog.showModalDialog({	url: pageURL, title:'DoD Consent / Privacy and Security',   width:800,  height:550 });
}

function GoToSection508(){
	var pageURL = GetSPSiteURL() + '/Pages/Section508.aspx';
	SP.UI.ModalDialog.showModalDialog({ url: pageURL, title:'Accessibility/Section 508',   width:640,  height:340 });
}

function GoToTrainingSite(){
	window.open(GetSPServerURL() + "/sites/cko/Training");
}

function GoToPortalSupport(){
	window.open(GetSPServerURL() + "/sites/helpdesk/");
}

function GoToFAQs(){
	window.open(GetSPServerURL() + "/sites/helpdesk/");
}

function GoToFAQ(){
	window.open(GetSPServerURL() + "/sites/helpdesk/");
}