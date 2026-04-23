import { useState, FormEvent, KeyboardEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCreateCampaign } from "../api/campaigns";
import { useCreateRecipient } from "../api/recipients";

interface RecipientEntry {
  email: string;
  name: string;
}

export default function CampaignNew() {
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const createRecipient = useCreateRecipient();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [recipients, setRecipients] = useState<RecipientEntry[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function parseRecipientInput(raw: string): RecipientEntry | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(trimmed)) {
      return { email: trimmed, name: trimmed.split("@")[0] };
    }
    return null;
  }

  function addRecipient() {
    const entry = parseRecipientInput(recipientInput);
    if (!entry) return;
    if (recipients.some((r) => r.email === entry.email)) {
      setRecipientInput("");
      return;
    }
    setRecipients((prev) => [...prev, entry]);
    setRecipientInput("");
  }

  function handleRecipientKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient();
    }
  }

  function removeRecipient(email: string) {
    setRecipients((prev) => prev.filter((r) => r.email !== email));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (recipientInput.trim()) {
      addRecipient();
    }

    setSubmitting(true);
    try {
      const recipientIds: string[] = [];
      for (const r of recipients) {
        const recipient = await createRecipient.mutateAsync(r);
        recipientIds.push(recipient.id);
      }

      const res = await createCampaign.mutateAsync({ name, subject, body, recipientIds });
      toast.success("Campaign created");
      navigate(`/campaigns/${res.campaign.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to create campaign";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <nav className="nav">
        <div className="mx-auto flex max-w-2xl items-center gap-2 text-sm">
          <Link
            to="/campaigns"
            className="transition-colors hover:text-primary-600"
            style={{ color: "var(--text-muted)" }}
          >
            Campaigns
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            New Campaign
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h2 className="mb-6 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Create Campaign
        </h2>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Summer Sale 2026"
              className="input"
            />
          </div>

          <div>
            <label className="label">Email Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="e.g. Exclusive offer just for you"
              className="input"
            />
          </div>

          <div>
            <label className="label">Email Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={8}
              placeholder="Write your email content here..."
              className="input resize-none"
            />
          </div>

          <div>
            <label className="label">Recipients</label>
            <p className="mb-2 text-xs" style={{ color: "var(--text-muted)" }}>
              Type an email address and press Enter or comma to add
            </p>

            {recipients.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {recipients.map((r) => (
                  <span
                    key={r.email}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                  >
                    {r.email}
                    <button
                      type="button"
                      onClick={() => removeRecipient(r.email)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={handleRecipientKeyDown}
              onBlur={addRecipient}
              placeholder="email@example.com"
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Creating..." : "Create Campaign"}
            </button>
            <Link to="/campaigns" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
