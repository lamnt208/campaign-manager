import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database";

export type CampaignRecipientStatus = "pending" | "sent" | "failed";

class CampaignRecipient extends Model<
  InferAttributes<CampaignRecipient>,
  InferCreationAttributes<CampaignRecipient>
> {
  declare campaign_id: string;
  declare recipient_id: string;
  declare sent_at: CreationOptional<Date | null>;
  declare opened_at: CreationOptional<Date | null>;
  declare status: CreationOptional<CampaignRecipientStatus>;
}

CampaignRecipient.init(
  {
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    recipient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "sent", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "campaign_recipients",
    timestamps: false,
  }
);

export default CampaignRecipient;
