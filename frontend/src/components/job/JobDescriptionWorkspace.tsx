import axios from "axios";
import { BriefcaseBusiness, Building2, FileText, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api, { parseApiError, type ApiFieldErrors } from "../../services/api";

type JobDescription = { id: number; title: string; company: string | null; description: string; created_at: string };
type Collection = { data: JobDescription[]; meta: { current_page: number; total: number } };

export function JobDescriptionWorkspace({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<ApiFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const isDirty = useMemo(() => Boolean(title || company || description), [company, description, title]);

  const loadJobs = useCallback(async (page = 1) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    if (page === 1) { setIsLoading(true); setLoadError(""); }
    else { setIsLoadingMore(true); setLoadMoreError(""); }
    try {
      const response = await api.get<Collection>("/job-descriptions", { signal: controller.signal, params: { page } });
      setJobs((current) => page === 1 ? response.data.data : [...current, ...response.data.data.filter((job) => !current.some((known) => known.id === job.id))]);
      setCurrentPage(response.data.meta.current_page);
      setTotalJobs(response.data.meta.total);
    } catch (error) {
      if (!axios.isCancel(error)) {
        const message = parseApiError(error, "Your job descriptions could not be loaded.").message;
        if (page === 1) setLoadError(message); else setLoadMoreError(message);
      }
    } finally {
      if (!controller.signal.aborted) { if (page === 1) setIsLoading(false); else setIsLoadingMore(false); }
    }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void loadJobs(), 0); return () => { window.clearTimeout(timer); controllerRef.current?.abort(); }; }, [loadJobs]);
  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  async function saveJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const nextErrors: ApiFieldErrors = {};
    if (!title.trim()) nextErrors.title = "Add the role title.";
    if (description.trim().length < 50) nextErrors.description = "Paste at least 50 characters from the job description.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      (nextErrors.title ? titleRef.current : document.getElementById("job-description"))?.focus();
      return;
    }

    setIsSaving(true); setErrors({}); setFormError(""); setSuccess("");
    try {
      const response = await api.post<{ data: JobDescription }>("/job-descriptions", { title: title.trim(), company: company.trim() || null, description: description.trim() });
      setJobs((current) => [response.data.data, ...current]);
      setTotalJobs((current) => current + 1);
      setTitle(""); setCompany(""); setDescription("");
      setSuccess(`${response.data.data.title} saved for matching.`);
      titleRef.current?.focus();
    } catch (error) {
      const failure = parseApiError(error, "This job description could not be saved.");
      setErrors(failure.fieldErrors); setFormError(failure.message);
    } finally { setIsSaving(false); }
  }

  return (
    <div className="job-workspace">
      <section className="job-intake" aria-labelledby="job-intake-title">
        <header><span><BriefcaseBusiness /></span><div><h2 id="job-intake-title">Add a target role</h2><p>Paste the complete listing so CareerPilot can compare it with your resume next.</p></div></header>
        <form noValidate onSubmit={saveJob}>
          <div className={`job-feedback${formError ? " has-error" : ""}`} role={formError ? "alert" : "status"}>{formError || success}</div>
          <fieldset className="job-fields" disabled={isSaving} aria-label="Job description details">
            <label><span>Role title</span><input ref={titleRef} required maxLength={160} value={title} onChange={(event) => { setTitle(event.target.value); setErrors((current) => ({ ...current, title: "" })); }} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "job-title-error" : undefined} /><small id="job-title-error">{errors.title}</small></label>
            <label><span>Company <em>Optional</em></span><input maxLength={160} value={company} onChange={(event) => setCompany(event.target.value)} /></label>
            <label className="job-description-field"><span>Job description</span><textarea id="job-description" required minLength={50} maxLength={50000} rows={13} value={description} onChange={(event) => { setDescription(event.target.value); setErrors((current) => ({ ...current, description: "" })); }} aria-invalid={Boolean(errors.description)} aria-describedby="job-description-help job-description-error" /><small id="job-description-help">Include responsibilities, requirements, and preferred skills.</small><small id="job-description-error" className="field-error">{errors.description}</small></label>
          </fieldset>
          <footer><span>{description.length.toLocaleString("en-US")} / 50,000 characters</span><button type="submit" disabled={isSaving} aria-busy={isSaving}>{isSaving ? <LoaderCircle className="spin" /> : <Plus />}<span>{isSaving ? "Saving…" : "Save job description"}</span></button></footer>
        </form>
      </section>

      <section className="job-library" aria-labelledby="job-library-title">
        <header><div><h2 id="job-library-title">Saved roles</h2><p>Your targets for the upcoming match analysis.</p></div><span>{totalJobs}</span></header>
        {isLoading ? <div className="job-library-state" aria-busy="true"><LoaderCircle className="spin" /> Loading roles…</div> : loadError ? <div className="job-library-state has-error" role="alert"><span>{loadError}</span><button type="button" onClick={() => void loadJobs()}><RefreshCw /> Try again</button></div> : jobs.length === 0 ? <div className="job-library-state is-empty"><FileText /><strong>No target roles yet</strong><span>Saved job descriptions will appear here.</span></div> : <><ul>{jobs.map((job) => <li key={job.id}><span><Building2 /></span><div><strong>{job.title}</strong><small>{job.company || "Company not specified"} · Saved {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(job.created_at))}</small><p>{job.description}</p></div></li>)}</ul>{(jobs.length < totalJobs || loadMoreError) && <footer className="job-library-more">{loadMoreError && <span role="alert">{loadMoreError}</span>}{jobs.length < totalJobs && <button type="button" onClick={() => void loadJobs(currentPage + 1)} disabled={isLoadingMore} aria-busy={isLoadingMore}>{isLoadingMore ? <LoaderCircle className="spin" /> : null}{isLoadingMore ? "Loading…" : "Load more roles"}</button>}</footer>}</>}
      </section>
    </div>
  );
}
