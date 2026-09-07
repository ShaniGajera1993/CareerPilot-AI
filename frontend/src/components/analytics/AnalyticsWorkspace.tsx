import axios from "axios";
import { BarChart3, CheckCircle2, LoaderCircle, RefreshCw, Target, TrendingUp, UsersRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import api, { parseApiError } from "../../services/api";
import "../applications/phase-four.css";

type Analytics = {
  applications: { total: number; by_status: Record<string, number> };
  ats: { average: number | null; latest: number | null; trend: { score: number; date: string }[] };
  interviews: { total: number; completed: number; average_score: number | null };
  skills: { matched: Record<string, number>; missing: Record<string, number> };
};
const stages = ["wishlist", "applied", "interview", "offer", "rejected"];

export function AnalyticsWorkspace() {
  const [data, setData] = useState<Analytics | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const controller = useRef<AbortController | null>(null);
  const load = useCallback(async () => { controller.current?.abort(); const next = new AbortController(); controller.current = next; setLoading(true); setError(""); try { const response = await api.get<{ data: Analytics }>("/analytics", { signal: next.signal }); setData(response.data.data); } catch (failure) { if (!axios.isCancel(failure)) setError(parseApiError(failure, "Analytics could not be loaded.").message); } finally { if (!next.signal.aborted) setLoading(false); } }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => { window.clearTimeout(timer); controller.current?.abort(); }; }, [load]);
  if (loading) return <section className="phase-state phase-page-state" aria-busy="true"><LoaderCircle className="spin" /> Calculating your progress…</section>;
  if (error || !data) return <section className="phase-state phase-page-state has-error" role="alert">{error}<button type="button" onClick={() => void load()}><RefreshCw /> Try again</button></section>;
  const maxPipeline = Math.max(1, ...Object.values(data.applications.by_status));
  return <div className="phase-four analytics-workspace">
    <section className="analytics-summary">
      <article><span><BarChart3 /></span><small>Applications</small><strong>{data.applications.total}</strong><p>opportunities tracked</p></article>
      <article><span><TrendingUp /></span><small>Average ATS</small><strong>{data.ats.average ?? "—"}</strong><p>{data.ats.latest === null ? "Run your first analysis" : `Latest signal ${data.ats.latest}/100`}</p></article>
      <article><span><UsersRound /></span><small>Practice sets</small><strong>{data.interviews.total}</strong><p>{data.interviews.completed} evaluated</p></article>
      <article><span><CheckCircle2 /></span><small>Interview score</small><strong>{data.interviews.average_score ?? "—"}</strong><p>average completed score</p></article>
    </section>
    <section className="analytics-grid">
      <article className="trajectory-card"><header><div><p>EVIDENCE TRAJECTORY</p><h2>ATS score history</h2></div><span>Last {data.ats.trend.length} analyses</span></header>{data.ats.trend.length ? <div className="trajectory-bars">{data.ats.trend.map((point, index) => <div key={`${point.date}-${index}`}><span>{point.score}</span><i style={{ height: `${Math.max(8, point.score)}%` }} /><small>{new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</small></div>)}</div> : <div className="analytics-empty">ATS analyses will create your trajectory.</div>}</article>
      <article className="pipeline-chart"><header><p>APPLICATION FUNNEL</p><h2>Pipeline distribution</h2></header><ul>{stages.map((stage) => <li key={stage}><span>{stage}</span><i><em style={{ width: `${(data.applications.by_status[stage] / maxPipeline) * 100}%` }} /></i><strong>{data.applications.by_status[stage]}</strong></li>)}</ul></article>
      <article className="skill-evidence"><header><CheckCircle2 /><div><p>EVIDENCE BANK</p><h2>Skills already matched</h2></div></header>{Object.keys(data.skills.matched).length ? <ul>{Object.entries(data.skills.matched).map(([skill, count]) => <li key={skill}><span>{skill}</span><strong>{count}×</strong></li>)}</ul> : <div className="analytics-empty">Matched skills appear after ATS analysis.</div>}</article>
      <article className="skill-evidence is-gap"><header><Target /><div><p>TAILORING QUEUE</p><h2>Recurring skill gaps</h2></div></header>{Object.keys(data.skills.missing).length ? <ul>{Object.entries(data.skills.missing).map(([skill, count]) => <li key={skill}><span>{skill}</span><strong>{count}×</strong></li>)}</ul> : <div className="analytics-empty">No recurring gaps identified yet.</div>}</article>
    </section>
  </div>;
}
