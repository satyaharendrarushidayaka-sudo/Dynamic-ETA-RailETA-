import joblib
import os
import pandas as pd
from datetime import datetime, timedelta

# Load model once at startup
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'eta_model.joblib')
model = joblib.load(MODEL_PATH)

def predict_ml_eta(routes, delay_minutes: int = 0, weather_condition: int = 0, congestion_level: int = 0, distance_covered: float = 0.0):
    """
    Predicts the ETA using the trained RandomForestRegressor.
    Features: distance_remaining, scheduled_running_time, current_delay, halt_duration, weather_condition, congestion_level
    """
    eta_results = []
    base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    for route in routes:
        arr_eta = None
        dep_eta = None
        
        # Calculate distance remaining for this specific station
        dist_remaining = max(0, route.distance_from_origin - distance_covered)
        
        # Calculate scheduled running time (simplification for prototype)
        avg_speed = 60.0 
        scheduled_running_time = (dist_remaining / avg_speed) * 60
        
        # Prepare feature vector for ML
        if dist_remaining == 0 and route.distance_from_origin > 0:
            # Train already passed this station
            ml_running_time = 0 
        elif route.stop_number == 1 and distance_covered == 0:
            ml_running_time = 0
        else:
            features = pd.DataFrame([{
                'distance_remaining': dist_remaining,
                'scheduled_running_time': scheduled_running_time,
                'current_delay': delay_minutes,
                'halt_duration': route.halt_duration,
                'weather_condition': weather_condition,
                'congestion_level': congestion_level
            }])
            ml_running_time = model.predict(features)[0]
        
        if route.scheduled_arrival:
            try:
                h, m = map(int, route.scheduled_arrival.split(':'))
                arr_time = base_date + timedelta(hours=h, minutes=m)
                
                # Base time is current simulated time or scheduled time + delay
                # Since we are predicting remaining time from current location:
                # We add ml_running_time to the current time, but for the prototype 
                # we'll keep the same offset logic so it aligns with TrainDetails
                origin_dep = routes[0].scheduled_departure or "00:00"
                oh, om = map(int, origin_dep.split(':'))
                origin_dep_time = base_date + timedelta(hours=oh, minutes=om)
                
                # Time taken to cover distance_covered so far (approx)
                time_taken_so_far = (distance_covered / avg_speed) * 60
                
                predicted_arr_time = origin_dep_time + timedelta(minutes=time_taken_so_far + ml_running_time + delay_minutes)
                arr_eta = predicted_arr_time.strftime('%H:%M')
            except Exception:
                pass

        if route.scheduled_departure:
            try:
                h, m = map(int, route.scheduled_departure.split(':'))
                dep_time = base_date + timedelta(hours=h, minutes=m)
                
                origin_dep = routes[0].scheduled_departure or "00:00"
                oh, om = map(int, origin_dep.split(':'))
                origin_dep_time = base_date + timedelta(hours=oh, minutes=om)
                
                time_taken_so_far = (distance_covered / avg_speed) * 60
                
                predicted_dep_time = origin_dep_time + timedelta(minutes=time_taken_so_far + ml_running_time + delay_minutes + route.halt_duration)
                dep_eta = predicted_dep_time.strftime('%H:%M')
            except Exception:
                pass
                
        eta_results.append({
            "stop_number": route.stop_number,
            "station_code": route.station.station_code,
            "station_name": route.station.station_name,
            "distance_from_origin": route.distance_from_origin,
            "scheduled_arrival": route.scheduled_arrival,
            "scheduled_departure": route.scheduled_departure,
            "ml_eta_arrival": arr_eta,
            "ml_eta_departure": dep_eta,
            "delay_minutes": delay_minutes,
            "passed": dist_remaining == 0 and route.distance_from_origin > 0
        })
        
    return eta_results
