import { BriefcaseBusiness, GraduationCap, LoaderCircle, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api, { parseApiError } from "../../services/api";

export type ResumeProfile = {
  basics: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    headline: string | null;
    summary: string | null;
  };
  experience: Array<{
    company: string;
    role: string;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string | null;
    field: string | null;
    start_date: string | null;
    end_date: string | null;
  }>;
  skills: string[];
};

type EditableResume = { id: number; name: string; parsed_content: ResumeProfile };

export function ResumeEditor({
  resume,
  onClose,
  onSaved,
  onDirtyChange,
}: {
  resume: EditableResume;
  onClose: () => void;
  onSaved: (profile: ResumeProfile) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [profile, setProfile] = useState<ResumeProfile>(resume.parsed_content);
  const [savedProfile, setSavedProfile] = useState<ResumeProfile>(resume.parsed_content);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isDirty = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(savedProfile),
    [profile, savedProfile],
  );

  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  useEffect(() => {
    if (!showCloseConfirmation) return;
    const appRoot = document.getElementById("root");
    const returnFocus = closeButtonRef.current;
    if (appRoot) appRoot.inert = true;
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowCloseConfirmation(false);
      if (event.key !== "Tab") return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", handleDialogKeys);
    return () => {
      window.removeEventListener("keydown", handleDialogKeys);
      if (appRoot) appRoot.inert = false;
      returnFocus?.focus();
    };
  }, [showCloseConfirmation]);

  function updateBasic(field: keyof ResumeProfile["basics"], value: string) {
    setProfile((current) => ({
      ...current,
      basics: { ...current.basics, [field]: value || null },
    }));
    setSavedMessage("");
  }

  async function saveResume() {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await api.put<{ data: { parsed_content: ResumeProfile } }>(
        `/resumes/${resume.id}`,
        profile,
      );
      setProfile(response.data.data.parsed_content);
      setSavedProfile(response.data.data.parsed_content);
      onSaved(response.data.data.parsed_content);
      setSavedMessage("Changes saved");
    } catch (requestError) {
      setError(parseApiError(requestError, "Your resume changes could not be saved.").message);
      window.setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="resume-editor" aria-labelledby="resume-editor-title">
      <header className="resume-editor-header">
        <div>
          <span>AI PARSED DRAFT</span>
          <h2 id="resume-editor-title">Review {resume.name}</h2>
          <p>AI can miss details. Check the draft against your original before using it.</p>
        </div>
        <button ref={closeButtonRef} type="button" className="editor-close" onClick={() => isDirty ? setShowCloseConfirmation(true) : onClose()} aria-label="Close resume editor" disabled={isSaving}>
          <X />
        </button>
      </header>

      <form noValidate onSubmit={(event) => { event.preventDefault(); void saveResume(); }}>
        <div ref={errorRef} className={`editor-feedback${error ? " has-error" : ""}`} role={error ? "alert" : "status"} tabIndex={error ? -1 : undefined}>
          {error || savedMessage || (isDirty ? "Unsaved changes" : "All changes saved")}
        </div>

        <fieldset disabled={isSaving}>
          <legend>Contact and profile</legend>
          <div className="editor-grid">
            {([
              ["full_name", "Full name"], ["email", "Email"], ["phone", "Phone"],
              ["location", "Location"], ["headline", "Professional headline"],
            ] as const).map(([field, label]) => (
              <label key={field} className={field === "headline" ? "editor-wide" : ""}>
                <span>{label}</span>
                <input
                  type={field === "email" ? "email" : "text"}
                  value={profile.basics[field] ?? ""}
                  onChange={(event) => updateBasic(field, event.target.value)}
                />
              </label>
            ))}
            <label className="editor-wide">
              <span>Professional summary</span>
              <textarea rows={5} value={profile.basics.summary ?? ""} onChange={(event) => updateBasic("summary", event.target.value)} />
            </label>
          </div>
        </fieldset>

        <fieldset disabled={isSaving}>
          <legend>Skills</legend>
          <label>
            <span>Skills, one per line</span>
            <textarea
              rows={5}
              value={profile.skills.join("\n")}
              onChange={(event) => setProfile((current) => ({ ...current, skills: event.target.value.split("\n").map((skill) => skill.trim()).filter(Boolean) }))}
            />
          </label>
        </fieldset>

        <fieldset disabled={isSaving}>
          <legend><BriefcaseBusiness /> Experience</legend>
          <div className="editor-section-title">
            <button type="button" onClick={() => setProfile((current) => ({ ...current, experience: [...current.experience, { company: "", role: "", location: null, start_date: null, end_date: null, current: false, bullets: [] }] }))}>
              <Plus /> Add experience
            </button>
          </div>
          {profile.experience.length === 0 ? <p className="editor-empty">No experience entries were detected.</p> : profile.experience.map((item, index) => (
            <div className="editor-entry" key={`experience-${index}`}>
              <div className="editor-entry-grid">
                {(["role", "company", "location", "start_date", "end_date"] as const).map((field) => (
                  <label key={field}>
                    <span>{field.replace("_", " ")}</span>
                    <input value={item[field] ?? ""} onChange={(event) => setProfile((current) => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: event.target.value || null } : entry) }))} />
                  </label>
                ))}
                <label className="editor-checkbox"><input type="checkbox" checked={item.current} onChange={(event) => setProfile((current) => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, current: event.target.checked } : entry) }))} /> Current role</label>
                <label className="editor-wide"><span>Achievements, one per line</span><textarea rows={4} value={item.bullets.join("\n")} onChange={(event) => setProfile((current) => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, bullets: event.target.value.split("\n").map((bullet) => bullet.trim()).filter(Boolean) } : entry) }))} /></label>
              </div>
              <button type="button" className="editor-remove" onClick={() => setProfile((current) => ({ ...current, experience: current.experience.filter((_, entryIndex) => entryIndex !== index) }))}><Trash2 /> Remove experience</button>
            </div>
          ))}
        </fieldset>

        <fieldset disabled={isSaving}>
          <legend><GraduationCap /> Education</legend>
          <div className="editor-section-title">
            <button type="button" onClick={() => setProfile((current) => ({ ...current, education: [...current.education, { institution: "", degree: null, field: null, start_date: null, end_date: null }] }))}><Plus /> Add education</button>
          </div>
          {profile.education.length === 0 ? <p className="editor-empty">No education entries were detected.</p> : profile.education.map((item, index) => (
            <div className="editor-entry" key={`education-${index}`}>
              <div className="editor-entry-grid">
                {(["institution", "degree", "field", "start_date", "end_date"] as const).map((field) => (
                  <label key={field}><span>{field.replace("_", " ")}</span><input value={item[field] ?? ""} onChange={(event) => setProfile((current) => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: event.target.value || null } : entry) }))} /></label>
                ))}
              </div>
              <button type="button" className="editor-remove" onClick={() => setProfile((current) => ({ ...current, education: current.education.filter((_, entryIndex) => entryIndex !== index) }))}><Trash2 /> Remove education</button>
            </div>
          ))}
        </fieldset>

        <footer className="editor-actions">
          <button type="button" className="editor-secondary" disabled={isSaving || !isDirty} onClick={() => { setProfile(savedProfile); setError(""); }}>Discard changes</button>
          <button type="submit" className="editor-save" disabled={!isDirty || isSaving} aria-busy={isSaving}>
            {isSaving ? <LoaderCircle className="spin" /> : <Save />}<span>{isSaving ? "Saving…" : "Save changes"}</span>
          </button>
        </footer>
      </form>
      {showCloseConfirmation && createPortal(
        <div className="dashboard-dialog-backdrop" role="presentation">
          <div ref={dialogRef} className="dashboard-dialog" role="alertdialog" aria-modal="true" aria-labelledby="editor-unsaved-title" aria-describedby="editor-unsaved-description">
            <h2 id="editor-unsaved-title">Discard unsaved changes?</h2>
            <p id="editor-unsaved-description">Your resume edits will be lost.</p>
            <div>
              <button type="button" autoFocus onClick={() => setShowCloseConfirmation(false)}>Keep editing</button>
              <button type="button" className="is-danger" onClick={onClose}>Discard changes</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
