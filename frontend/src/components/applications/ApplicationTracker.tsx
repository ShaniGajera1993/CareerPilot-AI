import axios from "axios";
import { BriefcaseBusiness, CalendarClock, LoaderCircle, MapPin, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api, { parseApiError, type ApiFieldErrors } from "../../services/api";
import "./phase-four.css";

type Status = "wishlist" | "applied" | "interview" | "offer" | "rejected";
type Application = { id: number; role: string; company: string; location: string | null; status: Status; applied_at: string | null; interview_at: string | null; notes: string | null; updated_at: string };
type Collection = { data: Application[]; meta: { total: number } };
const statuses: Status[] = ["wishlist", "applied", "interview", "offer", "rejected"];

export function ApplicationTracker({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [items, setItems] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [form, setForm] = useState({ role: "", company: "", location: "", status: "wishlist" as Status, applied_at: "", interview_at: "", notes: "" });
  const [errors, setErrors] = useState<ApiFieldErrors>({});
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const controller = useRef<AbortController | null>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const dirty = useMemo(() => Object.values(form).some(Boolean) && Boolean(form.role || form.company || form.location || form.applied_at || form.interview_at || form.notes || form.status !== "wishlist"), [form]);

  const load = useCallback(async () => {
    controller.current?.abort();
    const next = new AbortController(); controller.current = next; setLoading(true); setLoadError("");
    try {
      const response = await api.get<Collection>("/applications", { signal: next.signal, params: filter === "all" ? {} : { status: filter } });
      setItems(response.data.data);
    } catch (error) { if (!axios.isCancel(error)) setLoadError(parseApiError(error, "Applications could not be loaded.").message); }
    finally { if (!next.signal.aborted) setLoading(false); }
  }, [filter]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => { window.clearTimeout(timer); controller.current?.abort(); }; }, [load]);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  useEffect(() => { if (deleteTarget) cancelDeleteRef.current?.focus(); }, [deleteTarget]);
  useEffect(() => {
    if (!deleteTarget) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setDeleteTarget(null); };
    window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close);
  }, [deleteTarget]);

  function change(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: "" })); }

  async function create(event: React.FormEvent) {
    event.preventDefault(); if (saving) return;
    const nextErrors: ApiFieldErrors = {};
    if (!form.role.trim()) nextErrors.role = "Add the role title.";
    if (!form.company.trim()) nextErrors.company = "Add the company name.";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); document.getElementById(nextErrors.role ? "application-role" : "application-company")?.focus(); return; }
    setSaving(true); setMessage("");
    try {
      const response = await api.post<{ data: Application }>("/applications", { ...form, location: form.location || null, applied_at: form.applied_at || null, interview_at: form.interview_at || null, notes: form.notes || null });
      setItems((current) => [response.data.data, ...current]);
      setForm({ role: "", company: "", location: "", status: "wishlist", applied_at: "", interview_at: "", notes: "" });
      setMessage(`${response.data.data.role} added to your pipeline.`);
    } catch (error) { const failure = parseApiError(error, "Application could not be saved."); setErrors(failure.fieldErrors); setMessage(failure.message); }
    finally { setSaving(false); }
  }

  async function updateStatus(item: Application, status: Status) {
    setUpdatingId(item.id); setMessage("");
    try { const response = await api.put<{ data: Application }>(`/applications/${item.id}`, { status }); setItems((current) => current.map((known) => known.id === item.id ? response.data.data : known)); setMessage(`${item.role} moved to ${status}.`); }
    catch (error) { setMessage(parseApiError(error, "Application status could not be updated.").message); }
    finally { setUpdatingId(null); }
  }

  async function remove() {
    if (!deleteTarget) return; const target = deleteTarget; setUpdatingId(target.id);
    try { await api.delete(`/applications/${target.id}`); setItems((current) => current.filter((item) => item.id !== target.id)); setMessage(`${target.role} removed.`); setDeleteTarget(null); }
    catch (error) { setMessage(parseApiError(error, "Application could not be removed.").message); }
    finally { setUpdatingId(null); }
  }

  return <div className="phase-four application-tracker">
    <section className="pipeline-composer" aria-labelledby="application-add-title">
      <header><span><Plus /></span><div><p>PIPELINE INTAKE</p><h2 id="application-add-title">Track the next opportunity</h2></div></header>
      <form noValidate onSubmit={create}>
        <div className="phase-form-grid">
          <label><span>Role</span><input id="application-role" value={form.role} onChange={(e) => change("role", e.target.value)} aria-invalid={Boolean(errors.role)} aria-describedby="application-role-error" /><small id="application-role-error">{errors.role}</small></label>
          <label><span>Company</span><input id="application-company" value={form.company} onChange={(e) => change("company", e.target.value)} aria-invalid={Boolean(errors.company)} aria-describedby="application-company-error" /><small id="application-company-error">{errors.company}</small></label>
          <label><span>Location</span><input value={form.location} onChange={(e) => change("location", e.target.value)} /></label>
          <label><span>Stage</span><select value={form.status} onChange={(e) => change("status", e.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label><span>Applied date</span><input type="date" value={form.applied_at} onChange={(e) => change("applied_at", e.target.value)} /></label>
          <label><span>Interview time</span><input type="datetime-local" value={form.interview_at} onChange={(e) => change("interview_at", e.target.value)} /></label>
          <label className="phase-wide"><span>Notes</span><textarea className="resize-none" rows={3} value={form.notes} onChange={(e) => change("notes", e.target.value)} /></label>
        </div>
        <footer><div role="status" aria-live="polite">{message}</div><button type="submit" disabled={saving} aria-busy={saving}>{saving ? <LoaderCircle className="spin" /> : <Plus />}{saving ? "Saving…" : "Add application"}</button></footer>
      </form>
    </section>

    <section className="pipeline-board" aria-labelledby="pipeline-title">
      <header><div><p>LIVE PIPELINE</p><h2 id="pipeline-title">Applications</h2></div><label><span>Show</span><select value={filter} onChange={(e) => setFilter(e.target.value as Status | "all")}><option value="all">All stages</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></header>
      {loading ? <div className="phase-state" aria-busy="true"><LoaderCircle className="spin" /> Loading applications…</div> : loadError ? <div className="phase-state has-error" role="alert">{loadError}<button type="button" onClick={() => void load()}><RefreshCw /> Try again</button></div> : items.length === 0 ? <div className="phase-state"><BriefcaseBusiness /><strong>No applications in this view</strong><span>Add an opportunity or choose another stage.</span></div> : <ul className="pipeline-list">{items.map((item) => <li key={item.id} className={`stage-${item.status}`}><i /><div className="pipeline-main"><strong>{item.role}</strong><span>{item.company}</span><small>{item.location && <><MapPin />{item.location}</>}{item.interview_at && <><CalendarClock />{new Date(item.interview_at).toLocaleString()}</>}</small>{item.notes && <p>{item.notes}</p>}</div><label><span className="sr-only">Stage for {item.role}</span><select disabled={updatingId === item.id} value={item.status} onChange={(e) => void updateStatus(item, e.target.value as Status)}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><button type="button" className="phase-icon-button" onClick={() => setDeleteTarget(item)} aria-label={`Remove ${item.role}`}><Trash2 /></button></li>)}</ul>}
    </section>
    {deleteTarget && <div className="phase-dialog-backdrop" role="presentation"><section role="alertdialog" aria-modal="true" aria-labelledby="delete-application-title" aria-describedby="delete-application-description" className="phase-dialog"><button type="button" className="phase-dialog-x" onClick={() => setDeleteTarget(null)} aria-label="Close"><X /></button><Trash2 /><h2 id="delete-application-title">Remove {deleteTarget.role}?</h2><p id="delete-application-description">This deletes the application and its notes from your pipeline. It cannot be undone.</p><footer><button ref={cancelDeleteRef} type="button" onClick={() => setDeleteTarget(null)}>Keep application</button><button type="button" className="is-danger" onClick={() => void remove()} disabled={updatingId === deleteTarget.id}>Remove application</button></footer></section></div>}
  </div>;
}
