using System;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using Microsoft.SharePoint;
using Microsoft.SharePoint.Publishing;

namespace MyNNS.Responsive.MasterPage.Features.MyNNS.Responsive.DepartmentHomePageLayout
{
    /// <summary>
    /// This class handles events raised during feature activation, deactivation, installation, uninstallation, and upgrade.
    /// </summary>
    /// <remarks>
    /// The GUID attached to this class may be used during packaging and should not be modified.
    /// </remarks>

    [Guid("1e02765c-5f44-40bf-8e03-fb1a5375edb5")]
    public class MyNNSResponsiveEventReceiver : SPFeatureReceiver
    {
        // Uncomment the method below to handle the event raised after a feature has been activated.

        public override void FeatureActivated(SPFeatureReceiverProperties properties)
        {
            using (SPSite site = properties.Feature.Parent as SPSite)
            {
                using (SPWeb web = site.OpenWeb())
                {
                    SPList list;
                    SPField field;
                    Boolean exists = false;

                    web.AllowUnsafeUpdates = true;

                    foreach (SPList clist in web.Lists)
                    {
                        if (clist.Title.ToString().Equals("HomepageInfo"))
                        {
                            exists = true;
                        }
                    }
                    if (!exists)
                    {
                        web.Lists.Add("HomepageInfo", "List that supports the 'Who we are' web part information.", SPListTemplateType.GenericList);
                        list = web.Lists["HomepageInfo"];
                        Microsoft.SharePoint.Publishing.Fields.HtmlField hfld = list.Fields.CreateNewField("HTML", "Who") as Microsoft.SharePoint.Publishing.Fields.HtmlField;
                        list.Fields.Add(hfld);
                        hfld = list.Fields.CreateNewField("HTML", "What") as Microsoft.SharePoint.Publishing.Fields.HtmlField;
                        list.Fields.Add(hfld);
                        hfld = list.Fields.CreateNewField("HTML", "Where") as Microsoft.SharePoint.Publishing.Fields.HtmlField;
                        list.Fields.Add(hfld);
                        hfld = list.Fields.CreateNewField("HTML", "Leadership") as Microsoft.SharePoint.Publishing.Fields.HtmlField;
                        list.Fields.Add(hfld);

                        list.Fields.Add("Leader", SPFieldType.User, false);
                        field = list.Fields["Title"];
                        field.DefaultValue = "HomePage Information";
                        field.ShowInDisplayForm = false;
                        field.ShowInEditForm = false;
                        field.ShowInNewForm = false;
                        field.Required = false;
                        field.Update();
                        //SPFieldMultiLineText fld = (SPFieldMultiLineText)list.Fields["Who"];
                        //fld.NumberOfLines = 15;
                        //fld.RichText = true;
                        //fld.RichTextMode = SPRichTextMode.FullHtml;
                        //fld.Update();
                        //fld = (SPFieldMultiLineText)list.Fields["What"];
                        //fld.NumberOfLines = 15;
                        //fld.RichText = true;
                        //fld.RichTextMode = SPRichTextMode.FullHtml;
                        //fld.Update();
                        //fld = (SPFieldMultiLineText)list.Fields["Where"];
                        //fld.NumberOfLines = 15;
                        //fld.RichText = true;
                        //fld.RichTextMode = SPRichTextMode.FullHtml;
                        //fld.Update();
                        //fld = (SPFieldMultiLineText)list.Fields["Leadership"];
                        //fld.NumberOfLines = 15;
                        //fld.RichText = true;
                        //fld.RichTextMode = SPRichTextMode.FullHtml;
                        //fld.Update();

                        list.Update();
                        web.Update();
                    }
                    web.AllowUnsafeUpdates = false;
                }
            }
        }


        // Uncomment the method below to handle the event raised before a feature is deactivated.

        public override void FeatureDeactivating(SPFeatureReceiverProperties properties)
        {
        }


        // Uncomment the method below to handle the event raised after a feature has been installed.

        //public override void FeatureInstalled(SPFeatureReceiverProperties properties)
        //{
        //}


        // Uncomment the method below to handle the event raised before a feature is uninstalled.

        //public override void FeatureUninstalling(SPFeatureReceiverProperties properties)
        //{
        //}

        // Uncomment the method below to handle the event raised when a feature is upgrading.

        //public override void FeatureUpgrading(SPFeatureReceiverProperties properties, string upgradeActionName, System.Collections.Generic.IDictionary<string, string> parameters)
        //{
        //}
    }
}
