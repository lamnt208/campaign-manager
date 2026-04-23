export type CampaignStatus = "draft" | "sending" | "scheduled" | "sent";
export type RecipientStatus = "pending" | "sent" | "failed";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduled_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  recipient_count?: number;
}

export interface Recipient {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface CampaignRecipientRow {
  campaign_id: string;
  recipient_id: string;
  sent_at: string | null;
  opened_at: string | null;
  status: RecipientStatus;
  recipient?: Recipient;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

export interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  campaigns?: T[];
  recipients?: T[];
}
