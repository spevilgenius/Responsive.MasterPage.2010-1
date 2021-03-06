﻿<%@ Page Language="C#" Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage,Microsoft.SharePoint.Publishing,Version=14.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" %>

<%@ Register TagPrefix="SharePointWebControls" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="PublishingNavigation" Namespace="Microsoft.SharePoint.Publishing.Navigation" Assembly="Microsoft.SharePoint.Publishing, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<asp:Content contentplaceholderid="PlaceHolderAdditionalPageHead" runat="server">
	<SharePointWebControls:UIVersionedContent UIVersion="4" runat="server">
		<ContentTemplate>
			<SharePointWebControls:CssRegistration name="<% $SPUrl:~sitecollection/Style Library/~language/Core Styles/page-layouts-21.css %>" runat="server"/>
			<PublishingWebControls:EditModePanel runat="server">
				<!-- Styles for edit mode only-->
				<SharePointWebControls:CssRegistration name="<% $SPUrl:~sitecollection/Style Library/~language/Core Styles/edit-mode-21.css %>" After="<% $SPUrl:~sitecollection/Style Library/~language/Core Styles/page-layouts-21.css %>" runat="server"/>
			</PublishingWebControls:EditModePanel>
            <SharePointWebControls:ScriptLink Language="javascript" Name="~sitecollection/SiteAssets/js/highcharts.js" Defer="true" runat="server" Localizable="false" />
			<SharePointWebControls:ScriptLink Language="javascript" Name="~sitecollection/SiteAssets/js/exporting.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/jquery.dataTables.min.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/dataTables.bootstrap.min.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~sitecollection/SiteAssets/js/AllDashboardReports.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/ADR_Authorities.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/ADR_Competencies.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/ADR_Customers.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/ADR_Enablers.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/ADR_Functions.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/ADR_Paragraph.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/ADR_Parent.js" Defer="true" runat="server" Localizable="false" />
            <SharePointWebControls:ScriptLink Language="javascript" Name="~site/SiteAssets/js/ADR_SVD.js" Defer="true" runat="server" Localizable="false" />
            <style type="text/css">
                body #s4-leftpanel {
                    display: none !important;
                }

                .s4-ca {
                    margin-left: 0px !important;
                }


                .panel-heading {
                    min-height: 10px;
                }

                .panel-title {
                    float: left;
                }
            </style>

		</ContentTemplate>
	</SharePointWebControls:UIVersionedContent>
</asp:Content>
<asp:Content contentplaceholderid="PlaceHolderPageTitle" runat="server">
	<SharePointWebControls:UIVersionedContent UIVersion="4" runat="server">
		<ContentTemplate>
			<SharePointWebControls:ListProperty Property="Title" runat="server"/> - <SharePointWebControls:FieldValue FieldName="Title" runat="server"/>
		</ContentTemplate>
	</SharePointWebControls:UIVersionedContent>
</asp:Content>
<asp:Content contentplaceholderid="PlaceHolderMain" runat="server">
    <div class="panel-group" id="AllDashboardReports"></div>
</asp:Content>