import { useState, FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useGetCampaign, useUpdateCampaign } from "../api/campaigns";
import StatusBadge from "../components/StatusBadge";
import StatsBar from "../components/StatsBar";
import CampaignActions from "../components/CampaignActions";
import SkeletonCard from "../components/SkeletonCard";
import type { RecipientStatus } from "../types";

const recipientStatusConfig: Record<RecipientStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "text-slate-500 dark:text-slate-400" },
  sent: { label: "Sent", className: "text-emerald-600 dark:text-emerald-400" },
  failed: { label: "Failed", className: "text-red-600 dark:text-red-400" },
};

function EditForm({
  campaignId,
  defaultName,
  defaultSubject,
  defaultBody,
  onDone,
}: {
  campaignId: string;
  defaultName: string;
  defaultSubject: string;
  defaultBody: string;
  onDone: () => void;
}) {
  const update = useUpdateCampaign(campaignId);
  const [name, setName] = useState(defaultName);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({ name, subject, body });
      toast.success("Campaign updated");
      onDone();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to update campaign";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-4">
      <div>
        <label className="label">Campaign Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input"
        />
      </div>
      <div>
        <label className="label">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="input"
        />
      </div>
      <div>
        <label className="label">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={6}
          className="input resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={update.isPending} className="btn-primary">
          {update.isPending ? "Saving..." : "Save changes"}
        </button>
        <button type="button" onClick={onDone} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetCampaign(id!);
  const [editing, setEditing] = useState(false);

  return (
    <div className="page">
      <nav className="nav">
        <div className="mx-auto flex max-w-4xl items-center gap-2 text-sm">
          <Link
            to="/campaigns"
            className="transition-colors hover:text-primary-600"
            style={{ color: "var(--text-muted)" }}
          >
            Campaigns
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span className="truncate font-medium" style={{ color: "var(--text-primary)" }}>
            {data?.campaign.name ?? "Loading..."}
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
            Failed to load campaign. Please try again.
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {data && (
          <div className="animate-fade-in space-y-5">
            {/* Campaign card */}
            <div
              className="rounded-2xl border p-6 shadow-sm"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              {editing ? (
                <EditForm
                  campaignId={data.campaign.id}
                  defaultName={data.campaign.name}
                  defaultSubject={data.campaign.subject}
                  defaultBody={data.campaign.body}
                  onDone={() => setEditing(false)}
                />
              ) : (
                <>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                          {data.campaign.name}
                        </h2>
                        <StatusBadge status={data.campaign.status} />
                      </div>
                      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                        {data.campaign.subject}
                      </p>
                      {data.campaign.scheduled_at && (
                        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                          Scheduled: {new Date(data.campaign.scheduled_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {data.campaign.status === "draft" && (
                      <button onClick={() => setEditing(true)} className="btn-secondary shrink-0">
                        Edit
                      </button>
                    )}
                  </div>

                  <div
                    className="mb-5 rounded-xl px-4 py-3 text-sm"
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <p className="whitespace-pre-wrap">{data.campaign.body}</p>
                  </div>

                  <CampaignActions campaignId={data.campaign.id} status={data.campaign.status} />
                </>
              )}
            </div>

            {/* Stats card */}
            <div
              className="rounded-2xl border p-6 shadow-sm"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <h3 className="mb-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                Stats
              </h3>
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Total", value: data.stats.total },
                  { label: "Sent", value: data.stats.sent },
                  { label: "Failed", value: data.stats.failed },
                  { label: "Opened", value: data.stats.opened },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl px-3 py-3 text-center"
                    style={{ backgroundColor: "var(--bg-subtle)" }}
                  >
                    <p
                      className="text-2xl font-bold tabular-nums"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {value}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <StatsBar
                  label="Send Rate"
                  value={data.stats.sent}
                  percentage={data.stats.send_rate}
                  color="bg-emerald-500"
                />
                <StatsBar
                  label="Open Rate"
                  value={data.stats.opened}
                  percentage={data.stats.open_rate}
                  color="bg-primary-500"
                />
              </div>
            </div>

            {/* Recipients card */}
            {data.campaign.campaignRecipients.length > 0 && (
              <div
                className="overflow-hidden rounded-2xl border shadow-sm"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    Recipients ({data.campaign.campaignRecipients.length})
                  </h3>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {data.campaign.campaignRecipients.map((cr) => {
                    const status = recipientStatusConfig[cr.status];
                    return (
                      <div
                        key={cr.recipient_id}
                        className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-[var(--bg-subtle)]"
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {cr.recipient?.name}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {cr.recipient?.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold capitalize ${status.className}`}>
                            {status.label}
                          </span>
                          {cr.sent_at && (
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {new Date(cr.sent_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
