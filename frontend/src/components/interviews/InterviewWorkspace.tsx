import axios from "axios";
import { CheckCircle2, ClipboardCheck, LoaderCircle, MessageSquareText, RefreshCw, Sparkles, Target } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import api, { parseApiError } from "../../services/api";
import "../applications/phase-four.css";

type Option = { id: number; name?: string; title?: string; company?: string | null; status?: string };
type Question = { id: string; category: "technical" | "behavioral" | "hr"; question: string; what_to_cover: string };
type Feedback = { overall_score: number; summary: string; strengths: string[]; improvements: string[]; question_feedback: { question_id: string; score: number; feedback: string; better_answer: string }[] };
type Interview = { id: number; resume: { id: number; name: string }; job_description: { id: number; title: string; company: string | null }; focus: string; questions: Question[]; answers: { question_id: string; answer: string }[] | null; overall_score: number | null; feedback: Feedback | null; completed_at: string | null; created_at: string };
type Collection<T> = { data: T[] };

export function InterviewWorkspace({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [resumes, setResumes] = useState<Option[]>([]); const [jobs, setJobs] = useState<Option[]>([]);
  const [resumeId, setResumeId] = useState(""); const [jobId, setJobId] = useState(""); const [focus, setFocus] = useState("mixed");
  const [interview, setInterview] = useState<Interview | null>(null); const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true); const [generating, setGenerating] = useState(false); const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(""); const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controller.current?.abort(); const next = new AbortController(); controller.current = next; setLoading(true); setError("");
    try {
      const [resumeResponse, jobResponse, interviewResponse] = await Promise.all([
        api.get<Collection<Option>>("/resumes", { signal: next.signal }), api.get<Collection<Option>>("/job-descriptions", { signal: next.signal }), api.get<Collection<Interview>>("/interviews", { signal: next.signal }),
      ]);
      const parsed = resumeResponse.data.data.filter((resume) => resume.status === "parsed"); setResumes(parsed); setJobs(jobResponse.data.data);
      setResumeId(String(parsed[0]?.id ?? "")); setJobId(String(jobResponse.data.data[0]?.id ?? ""));
      const latest = interviewResponse.data.data[0] ?? null; setInterview(latest); setAnswers(Object.fromEntries(latest?.answers?.map((answer) => [answer.question_id, answer.answer]) ?? []));
    } catch (failure) { if (!axios.isCancel(failure)) setError(parseApiError(failure, "Interview preparation could not be loaded.").message); }
    finally { if (!next.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => { window.clearTimeout(timer); controller.current?.abort(); }; }, [load]);
  useEffect(() => onDirtyChange(Object.values(answers).some(Boolean) && !interview?.completed_at), [answers, interview, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  async function generate() {
    if (!resumeId || !jobId || generating || evaluating) return; setGenerating(true); setError("");
    try { const response = await api.post<{ data: Interview }>("/interviews", { resume_id: Number(resumeId), job_description_id: Number(jobId), focus }, { timeout: 360_000 }); setInterview(response.data.data); setAnswers({}); }
    catch (failure) { setError(parseApiError(failure, "The interview set could not be generated.").message); }
    finally { setGenerating(false); }
  }

  async function evaluate() {
    if (!interview || evaluating || generating) return;
    const submitted = interview.questions.map((question) => ({ question_id: question.id, answer: answers[question.id]?.trim() ?? "" })).filter((answer) => answer.answer.length >= 20);
    if (!submitted.length) { setError("Write at least 20 characters for one answer before requesting feedback."); return; }
    setEvaluating(true); setError("");
    try { const response = await api.post<{ data: Interview }>(`/interviews/${interview.id}/evaluate`, { answers: submitted }, { timeout: 360_000 }); setInterview(response.data.data); }
    catch (failure) { setError(parseApiError(failure, "Your answers could not be evaluated.").message); }
    finally { setEvaluating(false); }
  }

  if (loading) return <section className="phase-state phase-page-state" aria-busy="true"><LoaderCircle className="spin" /> Opening interview studio…</section>;
  if (!resumes.length || !jobs.length) return <section className="phase-state phase-page-state"><Target /><strong>Prepare your source material first</strong><span>Parse a resume and save a target role before generating interview questions.</span></section>;

  return <div className="phase-four interview-studio">
    <section className="interview-setup"><header><span><MessageSquareText /></span><div><p>PRACTICE BRIEF</p><h2>Build a role-specific interview</h2></div></header><div className="interview-controls"><label><span>Resume</span><select value={resumeId} onChange={(e) => setResumeId(e.target.value)} disabled={generating || evaluating}>{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.name}</option>)}</select></label><label><span>Target role</span><select value={jobId} onChange={(e) => setJobId(e.target.value)} disabled={generating || evaluating}>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label><label><span>Focus</span><select value={focus} onChange={(e) => setFocus(e.target.value)} disabled={generating || evaluating}><option value="mixed">Balanced</option><option value="technical">Technical</option><option value="behavioral">Behavioral</option><option value="hr">HR</option></select></label><button type="button" onClick={() => void generate()} disabled={generating || evaluating} aria-busy={generating}>{generating ? <LoaderCircle className="spin" /> : <Sparkles />}{generating ? "Building set…" : "Generate questions"}</button></div><div className={`phase-message${error ? " has-error" : ""}`} role={error ? "alert" : "status"}>{error || (generating ? "Local Ollama is preparing your questions. Keep this tab open for up to five minutes." : "Questions and evaluations run privately through local Ollama.")}</div></section>

    {interview ? <>
      <section className="practice-deck" aria-labelledby="practice-title"><header><div><p>MOCK INTERVIEW · {interview.focus}</p><h2 id="practice-title">{interview.job_description.title}</h2></div><span>{interview.questions.length} prompts</span></header><ol>{interview.questions.map((question, index) => { const detail = interview.feedback?.question_feedback.find((item) => item.question_id === question.id); return <li key={question.id}><div className="question-number">{String(index + 1).padStart(2, "0")}</div><div><span className={`question-category is-${question.category}`}>{question.category}</span><h3>{question.question}</h3><details><summary>What a strong answer covers</summary><p>{question.what_to_cover}</p></details><label><span>Your answer</span><textarea className="resize-none" rows={5} value={answers[question.id] ?? ""} onChange={(e) => setAnswers((current) => ({ ...current, [question.id]: e.target.value }))} disabled={generating || evaluating} placeholder="Use a specific situation, your actions, and the outcome." /></label>{detail && <aside className="question-feedback"><strong>{detail.score}/100</strong><p>{detail.feedback}</p><small>Stronger version</small><p>{detail.better_answer}</p></aside>}</div></li>; })}</ol><footer><span>Answer one or more prompts, then ask the local coach for feedback.</span><button type="button" onClick={() => void evaluate()} disabled={evaluating || generating} aria-busy={evaluating}>{evaluating ? <LoaderCircle className="spin" /> : <ClipboardCheck />}{evaluating ? "Reviewing answers…" : "Evaluate answers"}</button></footer></section>
      {interview.feedback && <section className="interview-result"><div className="interview-score"><span>INTERVIEW SIGNAL</span><strong>{interview.feedback.overall_score}</strong><small>/100</small></div><div><h2>{interview.feedback.summary}</h2><section><h3><CheckCircle2 /> What worked</h3><ul>{interview.feedback.strengths.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3><Target /> Improve next</h3><ul>{interview.feedback.improvements.map((item) => <li key={item}>{item}</li>)}</ul></section></div></section>}
    </> : <section className="phase-state phase-page-state"><MessageSquareText /><strong>No practice set yet</strong><span>Choose a resume, target role, and focus to begin.</span></section>}
    {error && !interview && <button type="button" className="phase-retry" onClick={() => void load()}><RefreshCw /> Reload studio</button>}
  </div>;
}
