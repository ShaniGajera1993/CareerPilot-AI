import axios from "axios";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  FileSearch,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api, { parseApiError } from "../../services/api";
import "./career-analysis.css";

type ResumeOption = {
  id: number;
  name: string;
  status: "uploaded" | "parsing" | "parsed" | "parse_failed";
};

type JobOption = {
  id: number;
  title: string;
  company: string | null;
};

type Improvement = {
  priority: "high" | "medium" | "low";
  title: string;
  explanation: string;
  suggested_rewrite: string | null;
};

type BulletRewrite = { original: string; improved: string; reason: string };

type AnalysisResult = {
  score: number;
  verdict: string;
  summary: string;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  improvements: Improvement[];
  improved_summary: string | null;
  bullet_rewrites: BulletRewrite[];
};

type Analysis = {
  id: number;
  resume: { id: number; name: string };
  job_description: { id: number; title: string; company: string | null };
  score: number;
  result: AnalysisResult;
  created_at: string;
};

type CoverLetter = {
  id: number;
  resume: { id: number; name: string };
  job_description: { id: number; title: string; company: string | null };
  tone: Tone;
  content: string;
  created_at: string;
};

type Tone = "professional" | "confident" | "warm";
type Collection<T> = { data: T[] };
type Item<T> = { data: T };

const tones: { value: Tone; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Direct and polished" },
  { value: "confident", label: "Confident", description: "Bold without overclaiming" },
  { value: "warm", label: "Warm", description: "Personal and conversational" },
];

function scoreBand(score: number): string {
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Promising match";
  return "Needs tailoring";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function CareerAnalysisWorkspace() {
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [letterError, setLetterError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const loadController = useRef<AbortController | null>(null);

  const loadWorkspace = useCallback(async () => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    setIsLoading(true);
    setLoadError("");

    try {
      const [resumeResponse, jobResponse, analysisResponse, letterResponse] = await Promise.all([
        api.get<Collection<ResumeOption>>("/resumes", { signal: controller.signal }),
        api.get<Collection<JobOption>>("/job-descriptions", { signal: controller.signal }),
        api.get<Collection<Analysis>>("/resume-analyses", { signal: controller.signal }),
        api.get<Collection<CoverLetter>>("/cover-letters", { signal: controller.signal }),
      ]);
      const parsedResumes = resumeResponse.data.data.filter((resume) => resume.status === "parsed");
      setResumes(parsedResumes);
      setJobs(jobResponse.data.data);
      setAnalyses(analysisResponse.data.data);
      setLetters(letterResponse.data.data);
      setResumeId((current) => current || String(parsedResumes[0]?.id ?? ""));
      setJobId((current) => current || String(jobResponse.data.data[0]?.id ?? ""));
      setAnalysis(analysisResponse.data.data[0] ?? null);
      setLetter(letterResponse.data.data[0] ?? null);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setLoadError(parseApiError(error, "Your AI toolkit could not be loaded.").message);
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadWorkspace(), 0);
    return () => {
      window.clearTimeout(timer);
      loadController.current?.abort();
    };
  }, [loadWorkspace]);

  const canGenerate = Boolean(resumeId && jobId);
  const selectedRole = useMemo(() => jobs.find((job) => job.id === Number(jobId)), [jobId, jobs]);

  async function generateAnalysis() {
    if (!canGenerate || isAnalyzing || isWriting) return;
    setIsAnalyzing(true);
    setAnalysisError("");
    setCopyStatus("");
    try {
      const response = await api.post<Item<Analysis>>("/resume-analyses", {
        resume_id: Number(resumeId),
        job_description_id: Number(jobId),
      }, { timeout: 360_000 });
      setAnalysis(response.data.data);
      setAnalyses((current) => [response.data.data, ...current]);
    } catch (error) {
      setAnalysisError(parseApiError(error, "The analysis could not be completed.").message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function generateCoverLetter() {
    if (!canGenerate || isAnalyzing || isWriting) return;
    setIsWriting(true);
    setLetterError("");
    setCopyStatus("");
    try {
      const response = await api.post<Item<CoverLetter>>("/cover-letters", {
        resume_id: Number(resumeId),
        job_description_id: Number(jobId),
        tone,
      }, { timeout: 360_000 });
      setLetter(response.data.data);
      setLetters((current) => [response.data.data, ...current]);
    } catch (error) {
      setLetterError(parseApiError(error, "The cover letter could not be generated.").message);
    } finally {
      setIsWriting(false);
    }
  }

  async function copyLetter() {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter.content);
      setCopyStatus("Cover letter copied.");
    } catch {
      setCopyStatus("Copy was blocked. Select the letter text and copy it manually.");
    }
  }

  if (isLoading) {
    return <section className="career-toolkit-state" aria-busy="true"><LoaderCircle className="spin" /><strong>Opening your AI toolkit…</strong></section>;
  }

  if (loadError) {
    return <section className="career-toolkit-state has-error" role="alert"><strong>{loadError}</strong><button type="button" onClick={() => void loadWorkspace()}><RefreshCw /> Try again</button></section>;
  }

  if (!resumes.length || !jobs.length) {
    return (
      <section className="career-toolkit-state is-empty">
        <FileSearch />
        <strong>Your analysis needs two ingredients</strong>
        <p>{!resumes.length ? "Parse a resume in My Resume. " : ""}{!jobs.length ? "Save a target role in Job Matcher." : ""}</p>
      </section>
    );
  }

  return (
    <div className="career-toolkit">
      <section className="career-brief" aria-labelledby="career-brief-title">
        <header>
          <span><Target /></span>
          <div><p>MATCH BRIEF</p><h2 id="career-brief-title">Choose the story and the role</h2></div>
        </header>
        <form noValidate onSubmit={(event) => { event.preventDefault(); void generateAnalysis(); }}>
          <label>
            <span>Parsed resume</span>
            <select value={resumeId} onChange={(event) => setResumeId(event.target.value)} disabled={isAnalyzing || isWriting}>
              {resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.name}</option>)}
            </select>
          </label>
          <span className="career-brief-arrow" aria-hidden="true"><ArrowRight /></span>
          <label>
            <span>Target role</span>
            <select value={jobId} onChange={(event) => setJobId(event.target.value)} disabled={isAnalyzing || isWriting}>
              {jobs.map((job) => <option value={job.id} key={job.id}>{job.title}{job.company ? ` · ${job.company}` : ""}</option>)}
            </select>
          </label>
          <button type="submit" disabled={!canGenerate || isAnalyzing || isWriting} aria-busy={isAnalyzing}>
            {isAnalyzing ? <LoaderCircle className="spin" /> : <Sparkles />}
            {isAnalyzing ? "Reading the evidence…" : "Analyze fit"}
          </button>
        </form>
        <div className={`career-operation-status${analysisError ? " has-error" : ""}`} role={analysisError ? "alert" : "status"} aria-live="polite">
          {analysisError || (isAnalyzing ? "Local analysis can take 1–5 minutes. Keep this tab open." : "Your resume stays on this computer while Ollama analyzes it.")}
        </div>
      </section>

      {analysis ? (
        <section className="analysis-report" aria-labelledby="analysis-report-title">
          <article className="analysis-score-card">
            <div className="analysis-score-topline"><span>ATS FIT SIGNAL</span><small>{formatDate(analysis.created_at)}</small></div>
            <div className="analysis-score-number"><strong>{analysis.score}</strong><span>/100</span></div>
            <div className="analysis-score-track"><i style={{ width: `${analysis.score}%` }} /></div>
            <h2 id="analysis-report-title">{scoreBand(analysis.score)}</h2>
            <p>{analysis.result.verdict}</p>
            <small>{analysis.resume.name} → {analysis.job_description.title}</small>
          </article>

          <article className="analysis-summary-card">
            <span><FileSearch /></span><div><h3>What the evidence says</h3><p>{analysis.result.summary}</p></div>
            <div className="analysis-keywords">
              <section><h4><CheckCircle2 /> Already speaking their language</h4><div>{analysis.result.matched_keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div></section>
              <section className="is-missing"><h4><Target /> Add only when truthful</h4><div>{analysis.result.missing_keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div></section>
            </div>
          </article>

          <article className="analysis-strengths">
            <header><Check /><h3>Strengths to lead with</h3></header>
            <ul>{analysis.result.strengths.map((strength) => <li key={strength}>{strength}</li>)}</ul>
          </article>

          <article className="analysis-improvements">
            <header><Lightbulb /><div><h3>Priority improvements</h3><p>Specific changes for {analysis.job_description.title}</p></div></header>
            <ol>{analysis.result.improvements.map((item, index) => <li key={`${item.title}-${index}`}><span className={`priority is-${item.priority}`}>{item.priority}</span><div><h4>{item.title}</h4><p>{item.explanation}</p>{item.suggested_rewrite && <blockquote>{item.suggested_rewrite}</blockquote>}</div></li>)}</ol>
          </article>

          {(analysis.result.improved_summary || analysis.result.bullet_rewrites.length > 0) && (
            <article className="analysis-rewrites">
              <header><WandSparkles /><div><h3>Ready-to-review rewrites</h3><p>Use these only after checking every detail.</p></div></header>
              {analysis.result.improved_summary && <section><h4>Professional summary</h4><p>{analysis.result.improved_summary}</p></section>}
              {analysis.result.bullet_rewrites.map((rewrite, index) => <section key={`${rewrite.original}-${index}`}><h4>Experience bullet</h4><del>{rewrite.original}</del><p>{rewrite.improved}</p><small>{rewrite.reason}</small></section>)}
            </article>
          )}
        </section>
      ) : (
        <section className="analysis-empty"><Sparkles /><strong>Your first fit signal starts here</strong><p>Run an analysis to uncover keyword evidence, strengths, and truthful rewrites.</p></section>
      )}

      <section className="cover-letter-studio" aria-labelledby="cover-letter-title">
        <header><div><span>COVER LETTER STUDIO</span><h2 id="cover-letter-title">Turn the match into a focused introduction</h2><p>Grounded in the selected resume and {selectedRole?.title ?? "target role"}.</p></div><WandSparkles /></header>
        <fieldset disabled={isAnalyzing || isWriting}>
          <legend>Choose a tone</legend>
          <div className="tone-options">{tones.map((option) => <label key={option.value} className={tone === option.value ? "is-selected" : ""}><input type="radio" name="tone" value={option.value} checked={tone === option.value} onChange={() => setTone(option.value)} /><span><strong>{option.label}</strong><small>{option.description}</small></span></label>)}</div>
        </fieldset>
        <button type="button" className="cover-generate" onClick={() => void generateCoverLetter()} disabled={!canGenerate || isAnalyzing || isWriting} aria-busy={isWriting}>{isWriting ? <LoaderCircle className="spin" /> : <WandSparkles />}{isWriting ? "Drafting your letter…" : "Generate cover letter"}</button>
        <div className={`career-operation-status${letterError ? " has-error" : ""}`} role={letterError ? "alert" : "status"}>{letterError || (isWriting ? "Ollama is writing locally. This can take a few minutes." : "Generated letters are saved to your private workspace.")}</div>
        {letter ? <article className="cover-letter-paper"><header><div><strong>{letter.job_description.title}</strong><span>{letter.job_description.company || "Company not specified"} · {letter.tone} tone · {formatDate(letter.created_at)}</span></div><button type="button" onClick={() => void copyLetter()}><Clipboard /> Copy letter</button></header><p>{letter.content}</p><small role="status" aria-live="polite">{copyStatus}</small></article> : <div className="cover-letter-empty">No letter generated yet.</div>}
      </section>

      {(analyses.length > 1 || letters.length > 1) && <p className="career-history-note">Your latest {analyses.length} analyses and {letters.length} letters are saved. This workspace opens the newest result.</p>}
    </div>
  );
}
