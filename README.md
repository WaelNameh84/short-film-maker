# Short Film Maker

MVP for generating short video concepts from text prompts.

## Features
- Text prompt input
- Duration and style selection
- Backend API for generation
- MP4 video output generated locally

## Run locally

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open:
- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health

## Notes
This is an MVP that creates a local MP4 placeholder video with the prompt overlaid on a black background. It is the base for adding real AI video generation next.
