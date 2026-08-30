import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTrainETA, fetchTrainMLETA } from '../services/api';

const TrainDetails = () => {
  const { id } = useParams();
  const [etaData, setEtaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [useML, setUseML] = useState(true);
  const [weather, setWeather] = useState(0);
  const [congestion, setCongestion] = useState(0);

  useEffect(() => {
    setLoading(true);
    if (useML) {
      fetchTrainMLETA(id, delayMinutes, weather, congestion).then(data => {
        setEtaData(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      fetchTrainETA(id, delayMinutes).then(data => {
        setEtaData(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id, delayMinutes, useML, weather, congestion]);

  if (loading && !etaData) return <div className="p-6">Loading train details...</div>;
  if (!etaData) return <div className="p-6 text-red-500">Train not found.</div>;

  return (
    <div className="p-6">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-bold">{etaData.train_number}</h1>
            <p className="text-slate-500 mt-1">Live ETA Tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setUseML(false)} 
              className={`px-4 py-2 rounded-l-lg font-medium text-sm border border-slate-300 ${!useML ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}>
              Baseline ETA
            </button>
            <button 
              onClick={() => setUseML(true)} 
              className={`px-4 py-2 rounded-r-lg font-medium text-sm border border-slate-300 -ml-2 ${useML ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}>
              ML Prediction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Delay: <span className="text-blue-600 font-bold">{delayMinutes} min</span>
            </label>
            <input 
              type="range" 
              min="0" max="300" step="5"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {useML && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weather Condition</label>
                <select 
                  value={weather} 
                  onChange={(e) => setWeather(parseInt(e.target.value))}
                  className="w-full border-slate-300 rounded-md shadow-sm p-2 text-sm">
                  <option value={0}>Clear (0)</option>
                  <option value={1}>Rain (1)</option>
                  <option value={2}>Fog (2)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Network Congestion</label>
                <select 
                  value={congestion} 
                  onChange={(e) => setCongestion(parseInt(e.target.value))}
                  className="w-full border-slate-300 rounded-md shadow-sm p-2 text-sm">
                  <option value={0}>Low (0)</option>
                  <option value={1}>Medium (1)</option>
                  <option value={2}>High (2)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">{useML ? 'AI Predicted ETA' : 'Baseline Schedule ETA'}</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><span className="text-slate-500 font-medium">Updating Engine...</span></div>}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-medium">Station</th>
              <th className="p-4 font-medium">Distance (km)</th>
              <th className="p-4 font-medium">Sched. Arrival</th>
              <th className="p-4 font-medium text-blue-600">Expected Arrival</th>
              <th className="p-4 font-medium text-blue-600">Expected Departure</th>
            </tr>
          </thead>
          <tbody>
            {etaData.eta.map((stop, idx) => {
              const arr = useML ? stop.ml_eta_arrival : stop.baseline_eta_arrival;
              const dep = useML ? stop.ml_eta_departure : stop.baseline_eta_departure;
              
              return (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium">
                    {stop.station_name} <span className="text-slate-400 text-sm">({stop.station_code})</span>
                  </td>
                  <td className="p-4">{stop.distance_from_origin}</td>
                  <td className="p-4 text-slate-500">{stop.scheduled_arrival || '--:--'}</td>
                  <td className="p-4 font-bold text-blue-700 bg-blue-50/50">
                    {arr || '--:--'}
                  </td>
                  <td className="p-4 font-bold text-blue-700">
                    {dep || '--:--'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainDetails;
