import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type { Recipient } from "../types";

interface ListRecipientsResponse {
  recipients: Recipient[];
  total: number;
  limit: number;
  offset: number;
}

export function useListRecipients(params: { limit?: number; offset?: number } = {}) {
  return useQuery<ListRecipientsResponse>({
    queryKey: ["recipients", params],
    queryFn: () => client.get("/recipients", { params }).then((r) => r.data),
  });
}

export function useCreateRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; name: string }) =>
      client.post("/recipients", data).then((r) => r.data.recipient as Recipient),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipients"] }),
  });
}
