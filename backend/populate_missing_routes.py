import pandas as pd
import random
import os

data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

df_routes = pd.read_csv(os.path.join(data_dir, "routes.csv"))
df_trains = pd.read_csv(os.path.join(data_dir, "trains.csv"))
df_stations = pd.read_csv(os.path.join(data_dir, "stations.csv"))

existing_train_ids = df_routes['train_id'].unique()

new_routes = []
route_id_counter = df_routes['route_id'].max() + 1

for index, train in df_trains.iterrows():
    train_id = train['train_id']
    if train_id in existing_train_ids:
        continue
        
    # Generate 5 random stops for this train
    stations = df_stations.sample(5).to_dict('records')
    distance = 0
    
    for i, st in enumerate(stations):
        distance += random.randint(50, 300)
        
        arr_h = (10 + i * 2) % 24
        dep_h = (arr_h) % 24
        
        arr_time = f"{arr_h:02d}:00" if i > 0 else None
        dep_time = f"{dep_h:02d}:10" if i < 4 else None
        
        new_routes.append({
            'route_id': route_id_counter,
            'train_id': train_id,
            'station_id': st['station_id'],
            'stop_number': i + 1,
            'distance_from_origin': distance if i > 0 else 0,
            'scheduled_arrival': arr_time,
            'scheduled_departure': dep_time,
            'halt_duration': 10 if (i > 0 and i < 4) else 0
        })
        route_id_counter += 1

if new_routes:
    df_new = pd.DataFrame(new_routes)
    df_combined = pd.concat([df_routes, df_new], ignore_index=True)
    df_combined.to_csv(os.path.join(data_dir, "routes.csv"), index=False)
    print(f"Added {len(new_routes)} missing routes.")
else:
    print("No missing routes.")
