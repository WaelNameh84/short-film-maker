from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="Short Film Maker")

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

jobs: dict[str, dict] = {}


class GenerateRequest(BaseModel):
    prompt: str
    duration: int = 8
    style: Literal["cinematic", "anime", "cartoon", "realistic"] = "cinematic"


def render_video(prompt: str, duration: int, output_file: Path):
    safe_prompt = prompt.replace("'", "\\'")
    safe_prompt = safe_prompt[:80]
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

    cmd = [
        "ffmpeg",
        "-y",
        "-f", "lavfi",
        "-i", f"color=c=black:s=1280x720:d={duration}",
        "-vf",
        f"drawtext=fontfile='{font_path}':text='{safe_prompt}':fontsize=42:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
        "-pix_fmt", "yuv420p",
        str(output_file),
    ]

    subprocess.run(cmd, check=True)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/jobs")
def create_job(request: GenerateRequest):
    job_id = f"job-{len(jobs) + 1:04d}"
    output_file = OUTPUT_DIR / f"{job_id}.mp4"

    try:
        render_video(request.prompt, request.duration, output_file)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Video generation failed: {exc}")

    output_url = f"/videos/{job_id}.mp4"
    job = {
        "id": job_id,
        "status": "done",
        "prompt": request.prompt,
        "duration": request.duration,
        "style": request.style,
        "output_path": output_url,
    }
    jobs[job_id] = job

    return job


@app.get("/videos/{filename}")
def stream_video(filename: str):
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(file_path, media_type="video/mp4")
