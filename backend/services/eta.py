from datetime import datetime, timedelta

def calculate_baseline_eta(routes, delay_minutes: int = 0):
    """
    Calculates the baseline ETA by adding the current delay to the scheduled timings.
    Handles 'HH:MM' time formats and wraps around midnight.
    """
    eta_results = []
    
    # We assume the train started today for simplicity of the prototype
    base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    for route in routes:
        arr_eta = None
        dep_eta = None
        
        if route.scheduled_arrival:
            try:
                h, m = map(int, route.scheduled_arrival.split(':'))
                arr_time = base_date + timedelta(hours=h, minutes=m)
                # If time is less than previous stop's time, it crossed midnight. 
                # For this prototype we'll just add the delay.
                arr_eta = (arr_time + timedelta(minutes=delay_minutes)).strftime('%H:%M')
            except ValueError:
                pass

        if route.scheduled_departure:
            try:
                h, m = map(int, route.scheduled_departure.split(':'))
                dep_time = base_date + timedelta(hours=h, minutes=m)
                dep_eta = (dep_time + timedelta(minutes=delay_minutes)).strftime('%H:%M')
            except ValueError:
                pass
                
        eta_results.append({
            "stop_number": route.stop_number,
            "station_code": route.station.station_code,
            "station_name": route.station.station_name,
            "distance_from_origin": route.distance_from_origin,
            "scheduled_arrival": route.scheduled_arrival,
            "scheduled_departure": route.scheduled_departure,
            "baseline_eta_arrival": arr_eta,
            "baseline_eta_departure": dep_eta,
            "delay_minutes": delay_minutes
        })
        
    return eta_results
