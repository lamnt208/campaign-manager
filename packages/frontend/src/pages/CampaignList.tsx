import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useListCampaigns } from "../api/campaigns";
import { useAuthStore } from "../store/authStore";
import StatusBadge from "../components/StatusBadge";
import SkeletonCard from "../components/SkeletonCard";
import ThemeToggle from "../components/ThemeToggle";

const PAGE_SIZE = 10;

export default function CampaignList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useListCampaigns({ limit: PAGE_SIZE, offset });

  function handleLogout() {
    queryClient.clear();
    clearAuth();
    navigate("/login");
  }

  return (
    <div className="page">
      <nav className="nav sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Campaign Manager
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden text-sm sm:block" style={{ color: "var(--text-muted)" }}>
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium transition-colors hover:text-primary-600"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Campaigns
            </h2>
            {data && (
              <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
                {data.total} campaign{data.total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Link to="/campaigns/new" className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            New Campaign
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
            Failed to load campaigns. Please try again.
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {data && data.campaigns.length === 0 && (
          <div
            className="rounded-xl border border-dashed py-20 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <svg
                className="h-6 w-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              No campaigns yet
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Get started by creating your first campaign.
            </p>
            <Link to="/campaigns/new" className="btn-primary mx-auto mt-4 w-fit">
              <PlusIcon className="h-4 w-4" />
              New Campaign
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {data?.campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              to={`/campaigns/${campaign.id}`}
              className="animate-fade-in block rounded-xl border p-5 shadow-sm transition-all hover:shadow-md"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="truncate font-semibold" style={{ color: "var(--text-primary)" }}>
                      {campaign.name}
                    </h3>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <p className="mt-1 truncate text-sm" style={{ color: "var(--text-muted)" }}>
                    {campaign.subject}
                  </p>
                  {campaign.recipient_count !== undefined && (
                    <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {campaign.recipient_count} recipient
                      {campaign.recipient_count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                  {campaign.scheduled_at && (
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {data && data.total > PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="btn-secondary disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {offset + 1}–{Math.min(offset + PAGE_SIZE, data.total)} of {data.total}
            </span>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={offset + PAGE_SIZE >= data.total}
              className="btn-secondary disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
