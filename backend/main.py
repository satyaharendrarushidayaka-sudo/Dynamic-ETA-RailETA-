from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from api import trains, stations, simulator

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RailETA API", version="1.0.0")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trains.router, prefix="/api/trains", tags=["Trains"])
app.include_router(stations.router, prefix="/api/stations", tags=["Stations"])
app.include_router(simulator.router, prefix="/api/simulation", tags=["Simulation"])

@app.get("/api/health")
def health_check():
    return {"status": "ONLINE", "database": "ONLINE", "ml_model": "READY"}
