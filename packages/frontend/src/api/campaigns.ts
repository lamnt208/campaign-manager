import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import client from "./client";
import type { Campaign, CampaignStats, CampaignRecipientRow } from "../types";

interface ListCampaignsResponse {
  campaigns: Campaign[];
  total: number;
  limit: number;
  offset: number;
}

interface GetCampaignResponse {
  campaign: Campaign & { campaignRecipients: CampaignRecipientRow[] };
  stats: CampaignStats;
}

export function useListCampaigns(params: { limit?: number; offset?: number } = {}) {
  return useQuery<ListCampaignsResponse>({
    queryKey: ["campaigns", params],
    queryFn: () => client.get("/campaigns", { params }).then((r) => r.data),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasSendingCampaign = data.campaigns.some((c) => c.status === "sending");
      return hasSendingCampaign ? 3000 : false;
    },
  });
}

export function useGetCampaign(
  id: string,
  options?: Partial<UseQueryOptions<GetCampaignResponse>>
) {
  return useQuery<GetCampaignResponse>({
    queryKey: ["campaign", id],
    queryFn: () => client.get(`/campaigns/${id}`).then((r) => r.data),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.campaign.status === "sending" ? 2000 : false;
    },
    ...options,
  });
}

export function useGetStats(id: string) {
  return useQuery<CampaignStats>({
    queryKey: ["campaign-stats", id],
    queryFn: () => client.get(`/campaigns/${id}/stats`).then((r) => r.data),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; subject: string; body: string; recipientIds: string[] }) =>
      client.post("/campaigns", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; subject?: string; body?: string }) =>
      client.patch(`/campaigns/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/campaigns/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useScheduleCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scheduled_at: string) =>
      client.post(`/campaigns/${id}/schedule`, { scheduled_at }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useSendCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => client.post(`/campaigns/${id}/send`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
