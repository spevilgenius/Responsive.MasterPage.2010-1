<%@ Page language="C#"   Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage,Microsoft.SharePoint.Publishing,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document" %>
<%@ Register Tagprefix="SharePointWebControls" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="PublishingNavigation" Namespace="Microsoft.SharePoint.Publishing.Navigation" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<asp:Content ContentPlaceholderID="PlaceHolderAdditionalPageHead" runat="server">
	<SharePointWebControls:CssRegistration name="<% $SPUrl:~sitecollection/Style Library/~language/Themable/Core Styles/pagelayouts15.css %>" runat="server"/>
	<PublishingWebControls:EditModePanel runat="server">
		<!-- Styles for edit mode only-->
		<SharePointWebControls:CssRegistration name="<% $SPUrl:~sitecollection/Style Library/~language/Themable/Core Styles/editmode15.css %>" After="<% $SPUrl:~sitecollection/Style Library/~language/Themable/Core Styles/pagelayouts15.css %>" runat="server"/>
	</PublishingWebControls:EditModePanel>
	<style type="text/css">
		/*Overide Sharepoint classes*/
		 /* Fix misaligned page title*/
		#DeltaPlaceHolderPageTitleInTitleArea{
			padding-left:10px !important;
		}
		 /* Web Part Titles */
		.ms-webpart-titleText{
			margin-bottom:10px;
			font-size:1.1em;
			font-weight:700;
			font-family:"Segoe UI";
			color:black;
			background-color:white !important;
		}
		 /* Search Boxes */
		.ms-srch-sbLarge > input{
			padding:0 !important;
		}
		.ms-textLarge{
			width:238px !important;
		}
		.ms-srch-sb-border, .ms-srch-sb-borderFocused{
			 margin-bottom:36px !important;
		}
		/* Give the Web part Headers a horizontal line to their left */ 
		.ms-webpart-titleText:after{
			content:"";
			display: inline-block;
			height: 0.5em;
			vertical-align: bottom;
			width: 100%;
			margin-right: -100%;
			margin-left: 10px;
			border-top: 1px solid #dedede;
		}
		#DeltaPlaceHolderPageTitleInTitleArea{
			padding-left:10px !important;
		}
		#s4-titlerow{
			display:block !important;
			box-sizing:content-box;
			margin:0;
		}
		#sideNavBox{
			padding:0;
			width:200px;
		}
		#pageTitle{
			margin-top:auto;
		}
		.ms-webpart-zone, ul.cbs-List{
			display:block;
		}
		.ms-core-sideNavBox-removeLeftMargin{
			margin-left:0;
		}
		#sideNavBox{
			margin-left:0;
		}
		#sideNavBox ul ul a{
			padding-left:40px !important;
		}
		#sideNavBox a{
			padding-left:20px !important;
		}
		#otherArticles li div{
			padding:10px 5px;
			border-bottom:#d6dbde solid 1px;
		}
		a.label:visited{
			color:#fff;
		}
		.ms-srch-item{
			width:auto;
			cursor:pointer; 
		}
		.ms-srch-upscope-top{
			display:none !important;
		}
		.ms-srch-resultFooter #ResultFooter{
			display:none;
		}
		a.keyword, a.keyword:visited{
			font-weight:normal;
			color:#777;
			background-color:#ddd;
		}
		.ms-srch-sbLarge > input{
			border:none !important;
			box-sizing:border-box;
		}
		#searchImg, img.ms-srch-pagingNext, img.ms-srch-pagingPrev{
			max-width:none
		}
		.ms-webpart-titleText{
			margin-top:0;
			margin-bottom:0;
		}
		.ms-srch-result{
			margin-top:0;
		}
		@media(max-width: 768px){
			#contentBox{margin:0 5px; width:98%; min-width:98%;}
			#sideNavBox{display:none}
			.articleRollupDesc{padding-left:0}
			#s4-titlerow{height:auto}
			#siteIcon,#DeltaPlaceHolderSearchArea,#DeltaTopNavigation{display:none}
			#pageTitle{display:block; height:auto}
			.ms-breadcrumb-box{height:auto}
			.ms-core-pageTitle{white-space:normal}
		}
		
	</style>
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitle" runat="server">
	<SharePointWebControls:FieldValue FieldName="Title" runat="server"/>
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitleInTitleArea" runat="server">
<script type="text/javascript">
	var url = window.location.toString();
	if (url.indexOf('#') >= 0) {
		url = url.substr(0, url.indexOf('#'));
	}
	var urlParts = url.split('/');
	if (isNaN(urlParts[urlParts.length - 1]) && url.indexOf('tags.aspx') <= 0 && url.indexOf('NewsSearch.aspx') <= 0 && url.indexOf('EventsSearch.aspx') <= 0 && url.indexOf('MediaSearch.aspx') <= 0) {
		lastPart = urlParts[urlParts.length - 1];
		lastPart = lastPart.replace('-', ' ');
		document.write('<span style="text-transform:capitalize;">' + lastPart + '</span>');
	}
	else if (url.indexOf('tags.aspx') > 0) {
		lastPart = url.substr(url.lastIndexOf('=') + 1)
		document.write(lastPart + ' Articles');
	}
	else if (url.indexOf('NewsSearch.aspx') > 0) {
		document.write('News Search');
	}
	else {
		document.write('<span style="text-transform:capitalize;">' + urlParts[3] + '</span>');
	}
</script>
</asp:Content>

<asp:Content ContentPlaceHolderId="PlaceHolderMain" runat="server">
	<div class="container-fluid" style="margin-top:20px; margin-bottom:100px;">
	
		<div class="row">
			<div class="col-lg-12">
				<script type="text/javascript">
					if (urlParts.length > 4 && url.indexOf('tags.aspx') <= 0 && url.indexOf('NewsSearch.aspx') <= 0) {
						var lastPart = urlParts[urlParts.length - 2];
						lastPart = lastPart.replace('-', ' ');
						document.write('<p><a href="' + url.substr(0, url.lastIndexOf('/')) + '">&#8592; Back to <span style="text-transform:capitalize;">' + lastPart + '</span></a></p>');
					}
					/*else if (url.indexOf('tags.aspx') > 0){
						document.write('<p><a href="/news">&#8592; Back to News</a></p>');
					}*/
				</script>
			</div>
		</div>
		<div class="row">
			<div class="col-lg-9">
				<WebPartPages:WebPartZone runat="server" Title="<%$Resources:cms,WebPartZoneTitle_Header%>" ID="Header"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
			</div>
			<div class="col-lg-3" id="otherArticles">
				<WebPartPages:WebPartZone runat="server" Title="<%$Resources:cms,WebPartZoneTitle_Right%>" ID="RightColumn" Orientation="Vertical"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
			</div>
		</div>
	</div>
	<script type="text/javascript">
		jQuery(document).ready(function () {
			jQuery('.col-lg-9 div, .col-lg-9 ul').children().each(function () {
				var $this = jQuery(this);
				$this.removeClass('ms-fullWidth');
				$this.removeClass('ms-webpart-chrome-fullWidth');
				$this.removeClass('cbs-List');
				$this.removeClass('ms-webpart-cell-vertical');
				$this.removeClass('ms-webpart-chrome-vertical');
			});
		});
	</script>
	<SharePointWebControls:ScriptBlock runat="server">
		if(typeof(MSOLayout_MakeInvisibleIfEmpty) == &quot;function&quot;) 
		
		
		
		
		{MSOLayout_MakeInvisibleIfEmpty();}
	</SharePointWebControls:ScriptBlock>
</asp:Content>
