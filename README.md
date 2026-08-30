# RailETA - Dynamic Train ETA Prediction System

An AI-powered prototype built to dynamically predict Indian Railways train ETAs using Machine Learning.

## Features
- **Dynamic ETA Engine:** Calculates Estimated Time of Arrival factoring in current delay.
- **AI/ML Prediction:** A RandomForestRegressor trained on 20,000 synthetic historical records to predict arrival times based on delay, weather, and congestion.
- **Interactive UI:** Built with React and Tailwind CSS, featuring a beautiful Dashboard, Live Map, and Analytics views.
- **Robust Architecture:** Backend designed with FastAPI and SQLite, ready to scale into Cassandra and Spark.

## Quick Start (For Judges)

Follow these steps to run the complete stack locally.

### 1. Backend Setup
The backend runs on Python/FastAPI.
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # (Windows)
# source venv/bin/activate # (Mac/Linux)
pip install -r requirements.txt
```

#### Database Initialization
Run the ingestion script to create and populate the SQLite database with simulated trains and routes:
```bash
python ingest_data.py
```

#### Start FastAPI Server
```bash
python -m uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000/docs`

### 2. Frontend Setup
The frontend runs on React + Vite. Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Access the application in your browser at `http://localhost:5173/`

## Project Structure
- `backend/`: FastAPI Python application.
  - `ml/`: Model training scripts and generated `.joblib` model.
  - `data/`: CSV datasets representing Indian Railways topology.
- `frontend/`: React + Vite UI application.
  - `src/pages/`: Main application dashboards (Map, Analytics, Architecture).
