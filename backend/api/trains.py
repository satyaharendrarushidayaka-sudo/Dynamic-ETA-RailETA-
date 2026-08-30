from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_trains(db: Session = Depends(get_db)):
    trains = db.query(models.Train).all()
    return trains

@router.get("/{train_id}")
def get_train(train_id: int, db: Session = Depends(get_db)):
    train = db.query(models.Train).filter(models.Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    
    routes = db.query(models.Route).filter(models.Route.train_id == train_id).order_by(models.Route.stop_number).all()
    
    # attach routes
    result = {
        "id": train.id,
        "train_number": train.train_number,
        "train_name": train.train_name,
        "origin": train.origin,
        "destination": train.destination,
        "type": train.type,
        "routes": []
    }
    
    for r in routes:
        station = db.query(models.Station).filter(models.Station.id == r.station_id).first()
        result["routes"].append({
            "stop_number": r.stop_number,
            "station_code": station.station_code,
            "station_name": station.station_name,
            "distance_from_origin": r.distance_from_origin,
            "scheduled_arrival": r.scheduled_arrival,
            "scheduled_departure": r.scheduled_departure,
            "halt_duration": r.halt_duration
        })
        
    return result

from services.eta import calculate_baseline_eta
from sqlalchemy.orm import joinedload

@router.get("/{train_id}/eta")
def get_train_eta(train_id: int, delay: int = 0, db: Session = Depends(get_db)):
    train = db.query(models.Train).filter(models.Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
        
    # Eager load the station relationship
    routes = db.query(models.Route).options(joinedload(models.Route.station)).filter(models.Route.train_id == train_id).order_by(models.Route.stop_number).all()
    
    eta_data = calculate_baseline_eta(routes, delay_minutes=delay)
    return {
        "train_id": train.id,
        "train_number": train.train_number,
        "current_delay_minutes": delay,
    }

from services.ml_prediction import predict_ml_eta

@router.get("/{train_id}/eta/ml")
def get_train_eta_ml(train_id: int, delay: int = 0, weather: int = 0, congestion: int = 0, db: Session = Depends(get_db)):
    train = db.query(models.Train).filter(models.Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
        
    routes = db.query(models.Route).options(joinedload(models.Route.station)).filter(models.Route.train_id == train_id).order_by(models.Route.stop_number).all()
    
    eta_data = predict_ml_eta(routes, delay_minutes=delay, weather_condition=weather, congestion_level=congestion)
    return {
        "train_id": train.id,
        "train_number": train.train_number,
        "current_delay_minutes": delay,
        "weather_condition": weather,
        "congestion_level": congestion,
        "eta": eta_data
    }
