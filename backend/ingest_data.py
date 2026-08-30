import pandas as pd
from database import engine, Base
import models
import os

def ingest():
    print("Creating tables...")
    # Drop all tables and recreate them properly using SQLAlchemy schema
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    
    print("Loading stations...")
    df_stations = pd.read_csv(os.path.join(data_dir, "stations.csv"))
    df_stations = df_stations.rename(columns={"station_id": "id"})
    df_stations.to_sql("stations", con=engine, if_exists="append", index=False)
    
    print("Loading trains...")
    df_trains = pd.read_csv(os.path.join(data_dir, "trains.csv"))
    df_trains = df_trains.rename(columns={"train_id": "id"})
    df_trains.to_sql("trains", con=engine, if_exists="append", index=False)
    
    print("Loading routes...")
    df_routes = pd.read_csv(os.path.join(data_dir, "routes.csv"))
    df_routes = df_routes.rename(columns={"route_id": "id"})
    df_routes.to_sql("routes", con=engine, if_exists="append", index=False)
    
    print("Data ingestion complete!")

if __name__ == "__main__":
    ingest()
