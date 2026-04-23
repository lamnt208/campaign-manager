import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarDaysIcon,
  PaperAirplaneIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useDeleteCampaign, useScheduleCampaign, useSendCampaign } from "../api/campaigns";
import type { CampaignStatus } from "../types";

interface Props {
  campaignId: string;
  status: CampaignStatus;
}

type PendingAction = "send" | "delete" | null;

function extractError(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback;
}

const confirmConfig: Record<
  NonNullable<PendingAction>,
  { title: string; description: string; confirmLabel: string; confirmClass: string }
> = {
  send: {
    title: "Send campaign",
    description:
      "This will send the campaign to all recipients immediately. This cannot be undone.",
    confirmLabel: "Send now",
    confirmClass: "btn-success",
  },
  delete: {
    title: "Delete campaign",
    description: "This campaign and all its data will be permanently deleted.",
    confirmLabel: "Delete",
    confirmClass: "btn-danger",
  },
};

function ConfirmDialog({
  action,
  onConfirm,
  onCancel,
  loading,
}: {
  action: NonNullable<PendingAction>;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const cfg = confirmConfig[action];
  return (
    <div className="animate-fade-in rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
      <div className="flex gap-3">
        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {cfg.title}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {cfg.description}
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={onConfirm} disabled={loading} className={cfg.confirmClass}>
              {loading ? "Processing..." : cfg.confirmLabel}
            </button>
            <button onClick={onCancel} disabled={loading} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignActions({ campaignId, status }: Props) {
  const navigate = useNavigate();
  const [scheduledAt, setScheduledAt] = useState("");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const deleteMutation = useDeleteCampaign();
  const scheduleMutation = useScheduleCampaign(campaignId);
  const sendMutation = useSendCampaign(campaignId);

  async function handleConfirm() {
    if (pendingAction === "delete") {
      try {
        await deleteMutation.mutateAsync(campaignId);
        toast.success("Campaign deleted");
        navigate("/campaigns");
      } catch (err) {
        toast.error(extractError(err, "Failed to delete campaign"));
        setPendingAction(null);
      }
    } else if (pendingAction === "send") {
      try {
        await sendMutation.mutateAsync();
        toast.success("Send initiated — recipients are being processed");
        setPendingAction(null);
      } catch (err) {
        toast.error(extractError(err, "Failed to send campaign"));
        setPendingAction(null);
      }
    }
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    try {
      await scheduleMutation.mutateAsync(new Date(scheduledAt).toISOString());
      toast.success("Campaign scheduled");
      setShowScheduleForm(false);
      setScheduledAt("");
    } catch (err) {
      toast.error(extractError(err, "Failed to schedule campaign"));
    }
  }

  if (status === "sent") return null;

  if (status === "sending") {
    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <ArrowPathIcon className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Sending in progress...</span>
      </div>
    );
  }

  const isActing = deleteMutation.isPending || sendMutation.isPending;

  return (
    <div className="space-y-3">
      {pendingAction ? (
        <ConfirmDialog
          action={pendingAction}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
          loading={isActing}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {status === "draft" && (
            <>
              <button
                onClick={() => setShowScheduleForm((v) => !v)}
                disabled={scheduleMutation.isPending}
                className="btn-secondary"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                Schedule
              </button>
              <button
                onClick={() => setPendingAction("send")}
                disabled={sendMutation.isPending}
                className="btn-success"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                Send Now
              </button>
              <button
                onClick={() => setPendingAction("delete")}
                disabled={deleteMutation.isPending}
                className="btn-danger"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </>
          )}

          {status === "scheduled" && (
            <button
              onClick={() => setPendingAction("send")}
              disabled={sendMutation.isPending}
              className="btn-success"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              Send Now
            </button>
          )}
        </div>
      )}

      {showScheduleForm && !pendingAction && (
        <form onSubmit={handleSchedule} className="animate-fade-in flex gap-2">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            required
            className="input"
          />
          <button type="submit" disabled={scheduleMutation.isPending} className="btn-primary">
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setShowScheduleForm(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
