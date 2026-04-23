import User from "./User";
import Campaign from "./Campaign";
import Recipient from "./Recipient";
import CampaignRecipient from "./CampaignRecipient";

User.hasMany(Campaign, { foreignKey: "created_by", as: "campaigns" });
Campaign.belongsTo(User, { foreignKey: "created_by", as: "creator" });

Campaign.belongsToMany(Recipient, {
  through: CampaignRecipient,
  foreignKey: "campaign_id",
  otherKey: "recipient_id",
  as: "recipients",
});
Recipient.belongsToMany(Campaign, {
  through: CampaignRecipient,
  foreignKey: "recipient_id",
  otherKey: "campaign_id",
  as: "campaigns",
});

Campaign.hasMany(CampaignRecipient, {
  foreignKey: "campaign_id",
  as: "campaignRecipients",
});
CampaignRecipient.belongsTo(Recipient, {
  foreignKey: "recipient_id",
  as: "recipient",
});

export { User, Campaign, Recipient, CampaignRecipient };
