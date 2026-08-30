import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchStations, startSimulation, pauseSimulation, resetSimulation, getSimulationState, triggerSimulationEvent } from '../services/api';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

// Fix Leaflet's default icon path issues with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const trainIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1004/1004381.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const LiveMap = () => {
  const [stations, setStations] = useState([]);
  const [simState, setSimState] = useState({ running: false, trains: [] });
  const [loading, setLoading] = useState(true);
  const [selectedTrainId, setSelectedTrainId] = useState(null);
  const [eventToast, setEventToast] = useState(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const stationsData = await fetchStations();
        setStations(stationsData);
      } catch (err) {
        console.error("Failed to load map data:", err);
      }
    };
    loadStations();
  }, []);

  useEffect(() => {
    const pollState = async () => {
      try {
        const data = await getSimulationState();
        setSimState(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    
    pollState(); // Initial fetch
    const interval = setInterval(pollState, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    await startSimulation();
    setSimState(s => ({ ...s, running: true }));
  };
  
  const handlePause = async () => {
    await pauseSimulation();
    setSimState(s => ({ ...s, running: false }));
  };
  
  const handleReset = async () => {
    await resetSimulation();
  };

  const fireEvent = async (eventType) => {
    if (!selectedTrainId) return;
    try {
      const result = await triggerSimulationEvent(selectedTrainId, eventType);
      setEventToast(result);
      setTimeout(() => setEventToast(null), 8000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading Live Map...</div>;

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex gap-4">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Live Network Simulation</h1>
            <p className="text-slate-500">Real-time simulated movement and dynamic ETA updates</p>
          </div>
          <div className="flex gap-2">
            {!simState.running ? (
              <button onClick={handleStart} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                <Play size={18} /> Start Engine
              </button>
            ) : (
              <button onClick={handlePause} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">
                <Pause size={18} /> Pause Engine
              </button>
            )}
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700">
              <RotateCcw size={18} /> Reset
            </button>
          </div>
        </div>
        
        <div className="flex-1 w-full relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden z-0">
          {eventToast && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white border-l-4 border-amber-500 shadow-lg rounded-r-md p-4 max-w-md animate-fade-in-down">
              <h3 className="font-bold flex items-center gap-2 text-amber-700"><AlertTriangle size={18}/> {eventToast.event_name} Triggered</h3>
              <p className="mt-2 text-sm text-slate-700">The ML model recalculated ETA instantly based on the event.</p>
              <div className="mt-3 text-sm grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-500 text-xs uppercase">Before</span><br/>
                  <span className="font-bold">{eventToast.before_eta || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-500 text-xs uppercase">After</span><br/>
                  <span className="font-bold">{eventToast.after_eta || 'N/A'}</span>
                </div>
              </div>
              <div className="mt-2 text-sm font-semibold text-rose-600">
                Impact: {eventToast.change_minutes > 0 ? '+' : ''}{eventToast.change_minutes} minutes
              </div>
            </div>
          )}

          <MapContainer center={[22.0, 79.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {stations.map((station) => (
              <Marker key={`station-${station.id}`} position={[station.latitude, station.longitude]}>
                <Popup>
                  <div className="font-bold">{station.station_name}</div>
                  <div className="text-sm text-slate-500">Code: {station.station_code}</div>
                </Popup>
              </Marker>
            ))}

            {simState.trains.map((train) => (
              <Marker 
                key={`train-${train.train_id}`} 
                position={[train.lat, train.lon]} 
                icon={trainIcon}
                eventHandlers={{ click: () => setSelectedTrainId(train.train_id) }}
              >
                <Popup>
                  <div className="font-bold text-blue-700 mb-1">{train.train_number} - {train.train_name}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm border-t border-slate-200 pt-2 mt-2">
                    <span className="text-slate-500">Speed:</span> <span className="font-medium">{train.current_speed.toFixed(1)} km/h</span>
                    <span className="text-slate-500">Delay:</span> 
                    <span className={`font-medium ${train.delay_minutes > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {train.delay_minutes} min
                    </span>
                    <span className="text-slate-500">Distance:</span> <span className="font-medium">{train.distance_covered.toFixed(1)} km</span>
                    <span className="text-slate-500">Updated:</span> <span className="font-medium">{train.last_updated}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h2 className="font-bold text-lg">Event Simulator</h2>
          <p className="text-sm text-slate-500 mt-1">Select a train on the map and trigger an event to see ML ETA propagation.</p>
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          {selectedTrainId ? (
            <div>
              <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded border border-blue-100 font-medium">
                Target: Train #{simState.trains.find(t => t.train_id === selectedTrainId)?.train_number}
              </div>
              
              <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500 mb-3">Delay & Environment</h3>
              <div className="space-y-2 mb-6">
                <button onClick={() => fireEvent('Heavy Congestion')} className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-blue-300 transition-colors">
                  <span className="font-medium text-amber-700">Heavy Congestion</span>
                  <p className="text-xs text-slate-500">Increases ML congestion penalty, drops speed</p>
                </button>
                <button onClick={() => fireEvent('Heavy Rain')} className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-blue-300 transition-colors">
                  <span className="font-medium text-blue-700">Heavy Rain</span>
                  <p className="text-xs text-slate-500">Sets weather=Rain, adds ML delay penalty</p>
                </button>
              </div>

              <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500 mb-3">Operational Events</h3>
              <div className="space-y-2 mb-6">
                <button onClick={() => fireEvent('Speed Restriction')} className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-blue-300 transition-colors">
                  <span className="font-medium text-red-600">Speed Restriction</span>
                  <p className="text-xs text-slate-500">Caps speed to 30km/h temporarily</p>
                </button>
                <button onClick={() => fireEvent('Signal Delay')} className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-blue-300 transition-colors">
                  <span className="font-medium text-orange-600">Signal Delay</span>
                  <p className="text-xs text-slate-500">Train halted, adds 15m delay directly</p>
                </button>
                <button onClick={() => fireEvent('Previous Train Delay')} className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-blue-300 transition-colors">
                  <span className="font-medium text-purple-600">Cascading Delay</span>
                  <p className="text-xs text-slate-500">Previous train cleared late, adds 25m</p>
                </button>
              </div>

              <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500 mb-3">Recovery</h3>
              <div className="space-y-2">
                <button onClick={() => fireEvent('Normal Operation')} className="w-full text-left px-3 py-2 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors">
                  <span className="font-medium text-emerald-700">Clear All Events</span>
                  <p className="text-xs text-emerald-600/70">Restores normal speed and weather</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-slate-400 p-6">
              Click any train marker on the map to inject simulation events.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
