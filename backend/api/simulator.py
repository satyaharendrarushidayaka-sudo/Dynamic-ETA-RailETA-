import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from database import get_db, SessionLocal
import models
from services.ml_prediction import predict_ml_eta
from datetime import datetime
from pydantic import BaseModel
import math

router = APIRouter()

# Global Simulation State
class SimulationEngine:
    def __init__(self):
        self.is_running = False
        self.trains_state = {}
        self.routes_cache = {}
        self.task = None

    def load_data(self, db: Session):
        trains = db.query(models.Train).all()
        for train in trains:
            routes = db.query(models.Route).options(joinedload(models.Route.station)).filter(models.Route.train_id == train.id).order_by(models.Route.stop_number).all()
            if not routes:
                continue
            
            self.routes_cache[train.id] = routes
            self._init_train(train.id, train.train_number, train.train_name)
            
    def _init_train(self, train_id, train_number, train_name):
        routes = self.routes_cache[train_id]
        origin = routes[0].station
        self.trains_state[train_id] = {
            "train_number": train_number,
            "train_name": train_name,
            "lat": origin.latitude,
            "lon": origin.longitude,
            "distance_covered": 0.0,
            "current_speed": 60.0,  # km/h
            "delay_minutes": 0,
            "weather": 0,
            "congestion": 0,
            "next_stop_idx": 1 if len(routes) > 1 else 0,
            "last_updated": datetime.now().strftime("%H:%M:%S"),
            "event_history": []
        }


    async def simulation_loop(self):
        while True:
            if self.is_running:
                db = SessionLocal()
                try:
                    for train_id, state in self.trains_state.items():
                        routes = self.routes_cache[train_id]
                        if state["next_stop_idx"] >= len(routes):
                            continue # Journey complete
                            
                        # Update position
                        # 60 km/h = 1 km/min = 1/60 km/s.
                        # For prototype simulation speed, let's say 1 second = 2 km covered.
                        dist_step = state["current_speed"] * (2.0 / 60.0) 
                        state["distance_covered"] += dist_step
                        
                        next_route = routes[state["next_stop_idx"]]
                        prev_route = routes[state["next_stop_idx"] - 1]
                        
                        # Did it reach the next stop?
                        if state["distance_covered"] >= next_route.distance_from_origin:
                            state["distance_covered"] = next_route.distance_from_origin
                            state["lat"] = next_route.station.latitude
                            state["lon"] = next_route.station.longitude
                            state["next_stop_idx"] += 1
                        else:
                            # Interpolate position
                            segment_dist = next_route.distance_from_origin - prev_route.distance_from_origin
                            if segment_dist > 0:
                                progress = (state["distance_covered"] - prev_route.distance_from_origin) / segment_dist
                                progress = max(0, min(1, progress))
                                state["lat"] = prev_route.station.latitude + (next_route.station.latitude - prev_route.station.latitude) * progress
                                state["lon"] = prev_route.station.longitude + (next_route.station.longitude - prev_route.station.longitude) * progress
                                
                        state["last_updated"] = datetime.now().strftime("%H:%M:%S")
                finally:
                    db.close()
            await asyncio.sleep(2) # tick every 2 seconds

sim_engine = SimulationEngine()

@router.on_event("startup")
async def startup_event():
    db = SessionLocal()
    sim_engine.load_data(db)
    db.close()
    sim_engine.task = asyncio.create_task(sim_engine.simulation_loop())

@router.post("/start")
def start_simulation():
    sim_engine.is_running = True
    return {"message": "Simulation started"}

@router.post("/pause")
def pause_simulation():
    sim_engine.is_running = False
    return {"message": "Simulation paused"}

@router.post("/reset")
def reset_simulation():
    db = SessionLocal()
    sim_engine.load_data(db)
    db.close()
    return {"message": "Simulation reset"}

@router.get("/state")
def get_state():
    # Fetch ETAs for all running trains
    result = []
    for train_id, state in sim_engine.trains_state.items():
        routes = sim_engine.routes_cache[train_id]
        
        eta_data = predict_ml_eta(
            routes, 
            delay_minutes=state["delay_minutes"],
            weather_condition=state["weather"],
            congestion_level=state["congestion"],
            distance_covered=state["distance_covered"]
        )
        
        result.append({
            "train_id": train_id,
            "train_number": state["train_number"],
            "train_name": state["train_name"],
            "lat": state["lat"],
            "lon": state["lon"],
            "current_speed": state["current_speed"],
            "delay_minutes": state["delay_minutes"],
            "distance_covered": state["distance_covered"],
            "last_updated": state["last_updated"],
            "etas": eta_data
        })
    return {"running": sim_engine.is_running, "trains": result}

class EventPayload(BaseModel):
    train_id: int
    event_type: str

@router.post("/event")
def trigger_event(payload: EventPayload):
    train_id = payload.train_id
    if train_id not in sim_engine.trains_state:
        raise HTTPException(status_code=404, detail="Train not found")
        
    state = sim_engine.trains_state[train_id]
    routes = sim_engine.routes_cache[train_id]
    
    # Calculate BEFORE ETA (for the final destination)
    before_etas = predict_ml_eta(
        routes, 
        delay_minutes=state["delay_minutes"],
        weather_condition=state["weather"],
        congestion_level=state["congestion"],
        distance_covered=state["distance_covered"]
    )
    before_final_eta = before_etas[-1]["ml_eta_arrival"]
    
    # Apply Event
    event = payload.event_type
    if event == "Speed Restriction":
        state["current_speed"] = 30.0
        state["delay_minutes"] += 12
    elif event == "Signal Delay":
        state["delay_minutes"] += 15
        state["current_speed"] = 0.0
    elif event == "Heavy Congestion":
        state["congestion"] = 2
        state["current_speed"] -= 20.0
    elif event == "Unscheduled Stop":
        state["delay_minutes"] += 20
        state["current_speed"] = 0.0
    elif event == "Heavy Rain":
        state["weather"] = 1
        state["delay_minutes"] += 10
        state["current_speed"] -= 15.0
    elif event == "Previous Train Delay":
        state["delay_minutes"] += 25
    elif event == "Normal Operation":
        state["weather"] = 0
        state["congestion"] = 0
        state["current_speed"] = 60.0
        state["delay_minutes"] = max(0, state["delay_minutes"] - 5)
        
    state["current_speed"] = max(0.0, state["current_speed"])
    
    # Calculate AFTER ETA
    after_etas = predict_ml_eta(
        routes, 
        delay_minutes=state["delay_minutes"],
        weather_condition=state["weather"],
        congestion_level=state["congestion"],
        distance_covered=state["distance_covered"]
    )
    after_final_eta = after_etas[-1]["ml_eta_arrival"]
    
    # Calculate delta in minutes
    change_mins = 0
    if before_final_eta and after_final_eta:
        try:
            bh, bm = map(int, before_final_eta.split(':'))
            ah, am = map(int, after_final_eta.split(':'))
            change_mins = (ah*60 + am) - (bh*60 + bm)
        except:
            pass
            
    res = {
        "event_name": event,
        "before_eta": before_final_eta,
        "after_eta": after_final_eta,
        "change_minutes": change_mins
    }
    state["event_history"].append(res)
    
    return res
