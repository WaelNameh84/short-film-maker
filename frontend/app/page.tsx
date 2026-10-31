"use client";

import { FormEvent, useEffect, useState } from "react";

type Job = {
  id: string;
  project_name: string;
  status: string;
  prompt: string;
  duration: number;
  style: string;
  scenes: number;
  output_path?: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [projectName, setProjectName] = useState("My Short Film");
  const [prompt, setPrompt] = useState(
    "طفل صغير يركض في حقل واسع أثناء غروب الشمس، حركة بطيئة، مشهد سينمائي، إضاءة دافئة"
  );
  const [duration, setDuration] = useState(8);
  const [style, setStyle] = useState("cinematic");
  const [scenes, setScenes] = useState(3);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadJobs() {
    try {
      const response = await fetch(`${apiBase}/api/jobs`);
      if (!response.ok) return;
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiBase}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          prompt,
          duration,
          style,
          scenes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create video");
      }

      const data = await response.json();
      setJobs((prev) => [data, ...prev]);
    } catch (error) {
      console.error(error);
      alert((error as Error).message || "Error while creating the video");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="panel panel-left">
        <div className="badge">Short Film Maker</div>
        <h1>أنشئ فيديو قصير من فكرة نصية</h1>
        <p className="subtitle">
          أداة سريعة لإنشاء أفكار سينمائية قصيرة وتصدير فيديو محلي للاستخدام الشخصي.
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            اسم المشروع
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="مثال: Midnight Run"
            />
          </label>

          <label>
            وصف المشهد
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب سيناريوك هنا..."
            />
          </label>

          <div className="inline-fields">
            <label>
              المدة (ثانية)
              <input
                type="number"
                min={3}
                max={30}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </label>

            <label>
              المشاهد
              <input
                type="number"
                min={1}
                max={8}
                value={scenes}
                onChange={(e) => setScenes(Number(e.target.value))}
              />
            </label>
          </div>

          <label>
            الأسلوب
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="cinematic">سينمائي</option>
              <option value="anime">أنمي</option>
              <option value="cartoon">رسوم متحركة</option>
              <option value="realistic">واقعي</option>
            </select>
          </label>

          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? "جارٍ إنشاء الفيديو..." : "إنشاء الفيديو"}
          </button>
        </form>
      </section>

      <aside className="panel panel-right">
        <div className="header-row">
          <h2>المشاريع</h2>
          <button className="ghost-btn" onClick={loadJobs}>تحديث</button>
        </div>

        <div className="jobs-list">
          {jobs.length === 0 ? (
            <div className="empty-state">لا توجد مشاريع بعد.</div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-top">
                  <span className="job-tag">{job.style}</span>
                  <span className="job-time">{job.duration}s</span>
                </div>
                <h3>{job.project_name}</h3>
                <p>{job.prompt}</p>

                {job.output_path && (
                  <video controls src={`${apiBase}${job.output_path}`} />
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </main>
  );
}
