from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

app = FastAPI(title="Short Film Maker", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "backend" / "generated"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

jobs: dict[str, dict[str, Any]] = {}


class GenerateRequest(BaseModel):
    project_name: str = Field(default="My Short Film")
    prompt: str
    duration: int = Field(default=8, ge=3, le=30)
    style: Literal["cinematic", "anime", "cartoon", "realistic"] = "cinematic"
    scenes: int = Field(default=3, ge=1, le=8)


def render_video(prompt: str, duration: int, style: str, output_file: Path):
    safe_prompt = prompt.strip().replace("'", "\\'")
    safe_prompt = safe_prompt[:100] or "Short Film"
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

    style_colors = {
        "cinematic": "#f59e0b",
        "anime": "#ec4899",
        "cartoon": "#38bdf8",
        "realistic": "#a3e635",
    }
    accent = style_colors.get(style, "#f59e0b")

    cmd = [
        "ffmpeg",
        "-y",
        "-f", "lavfi",
        "-i", f"color=c=black:s=1280x720:d={duration}",
        "-vf",
        (
            "drawbox=x=0:y=0:width=iw:height=ih:color=black@0.8:t=fill,"
            "drawbox=x=40:y=40:width=iw-80:height=ih-80:color=black@0.25:t=fill,"
            f"drawtext=fontfile='{font_path}':text='{safe_prompt}':"
            "fontsize=42:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black:shadowx=2:shadowy=2,"
            f"drawtext=fontfile='{font_path}':text='{style.upper()}':fontsize=20:fontcolor={accent}:x=80:y=80:shadowcolor=black:shadowx=1:shadowy=1"
        ),
        "-pix_fmt", "yuv420p",
        str(output_file),
    ]

    subprocess.run(cmd, check=True)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/jobs")
def list_jobs():
    return list(jobs.values())


@app.post("/api/jobs")
def create_job(request: GenerateRequest):
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")

    job_id = f"job-{len(jobs) + 1:04d}"
    output_file = OUTPUT_DIR / f"{job_id}.mp4"

    try:
        render_video(request.prompt, request.duration, request.style, output_file)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Video generation failed: {exc}") from exc

    output_url = f"/videos/{job_id}.mp4"
    job = {
        "id": job_id,
        "project_name": request.project_name,
        "status": "done",
        "prompt": request.prompt,
        "duration": request.duration,
        "style": request.style,
        "scenes": request.scenes,
        "output_path": output_url,
    }
    jobs[job_id] = job

    return job


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/videos/{filename}")
def stream_video(filename: str):
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(file_path, media_type="video/mp4")
