import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

def generate_synthetic_data(num_samples=10000):
    np.random.seed(42)
    
    # Features
    distance_remaining = np.random.uniform(10, 1500, num_samples) # km
    scheduled_running_time = distance_remaining / np.random.uniform(50, 90, num_samples) * 60 # mins (avg speed 50-90 km/h)
    current_delay = np.random.exponential(scale=30, size=num_samples) # minutes
    halt_duration = np.random.uniform(0, 30, num_samples) # minutes
    
    # Categorical/Environmental
    weather_condition = np.random.choice([0, 1, 2], num_samples, p=[0.7, 0.2, 0.1]) # 0=Clear, 1=Rain, 2=Fog
    congestion_level = np.random.choice([0, 1, 2], num_samples, p=[0.6, 0.3, 0.1]) # 0=Low, 1=Medium, 2=High
    
    # Target: actual_running_time
    # Actual time = Scheduled + some recovery of delay + weather penalty + congestion penalty + noise
    # If a train is delayed, drivers might speed up to recover time (negative correlation with delay)
    recovery = current_delay * np.random.uniform(0.1, 0.4, num_samples) 
    weather_penalty = weather_condition * np.random.uniform(10, 30, num_samples)
    congestion_penalty = congestion_level * np.random.uniform(5, 20, num_samples)
    noise = np.random.normal(0, 10, num_samples)
    
    actual_running_time = scheduled_running_time + weather_penalty + congestion_penalty - recovery + noise
    # Ensure it's not unrealistically fast
    actual_running_time = np.maximum(actual_running_time, scheduled_running_time * 0.8)
    
    df = pd.DataFrame({
        'distance_remaining': distance_remaining,
        'scheduled_running_time': scheduled_running_time,
        'current_delay': current_delay,
        'halt_duration': halt_duration,
        'weather_condition': weather_condition,
        'congestion_level': congestion_level,
        'actual_running_time': actual_running_time
    })
    
    return df

def train_and_save_model():
    print("Generating synthetic historical data...")
    df = generate_synthetic_data(20000)
    
    features = ['distance_remaining', 'scheduled_running_time', 'current_delay', 
                'halt_duration', 'weather_condition', 'congestion_level']
    
    X = df[features]
    y = df['actual_running_time']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print("-" * 30)
    print("MODEL EVALUATION METRICS")
    print("-" * 30)
    print(f"Mean Absolute Error (MAE): {mae:.2f} minutes")
    print(f"Root Mean Squared Error (RMSE): {rmse:.2f} minutes")
    print(f"R-squared (R2): {r2:.4f}")
    print("-" * 30)
    
    # Save the model
    model_path = os.path.join(os.path.dirname(__file__), 'eta_model.joblib')
    joblib.dump(model, model_path)
    print(f"Model saved successfully to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
