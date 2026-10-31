"use client";

import { FormEvent, useState } from "react";

type Job = {
  id: string;
  status: string;
  prompt: string;
  duration: number;
  style: string;
  output_path?: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [prompt, setPrompt] = useState(
    "طفل صغير يركض في حقل ضخم عند غروب الشمس، مشهد سينمائي، إضاءة دافئة"
  );
  const [duration, setDuration] = useState(8);
  const [style, setStyle] = useState("cinematic");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const response = await fetch(`${apiBase}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration,
        style,
      }),
    });

    const data = await response.json();
    setJob(data);
    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Short Film Maker</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>وصف المشهد</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            style={styles.textarea}
          />

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>المدة (ثانية)</label>
              <input
                type="number"
                min={3}
                max={20}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={styles.input}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>الأسلوب</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                style={styles.input}
              >
                <option value="cinematic">سينمائي</option>
                <option value="anime">أنمي</option>
                <option value="cartoon">رسوم متحركة</option>
                <option value="realistic">واقعي</option>
              </select>
            </div>
          </div>

          <button disabled={loading} style={styles.button} type="submit">
            {loading ? "جارٍ إنشاء الفيديو..." : "إنشاء الفيديو"}
          </button>
        </form>

        {job && (
          <div style={styles.result}>
            <h3>الفيديو النهائي</h3>
            <p>
              <strong>الاسم:</strong> {job.id}
            </p>
            <p>
              <strong>الحالة:</strong> {job.status}
            </p>

            {job.output_path && (
              <video
                controls
                src={`${apiBase}${job.output_path}`}
                style={styles.video}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a, #111827)",
    fontFamily: "Arial, sans-serif",
    color: "#fff",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "760px",
    background: "rgba(17, 24, 39, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  },
  title: {
    margin: 0,
    marginBottom: "20px",
    fontSize: "2rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  label: {
    fontWeight: 700,
    marginBottom: "6px",
    display: "block",
  },
  textarea: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #334155",
    color: "#fff",
    borderRadius: "12px",
    padding: "12px",
    resize: "vertical",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  input: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #334155",
    color: "#fff",
    borderRadius: "12px",
    padding: "12px",
  },
  button: {
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "14px 18px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "1rem",
  },
  result: {
    marginTop: "28px",
    borderTop: "1px solid #334155",
    paddingTop: "20px",
  },
  video: {
    width: "100%",
    marginTop: "12px",
    borderRadius: "12px",
    background: "#020817",
  },
};
