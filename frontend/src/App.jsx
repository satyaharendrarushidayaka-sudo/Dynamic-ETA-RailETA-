import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart, Settings, TrainFront } from 'lucide-react';
import { fetchTrains } from './services/api';
import TrainDetails from './pages/TrainDetails';
import LiveMap from './pages/LiveMap';
import Analytics from './pages/Analytics';
import Architecture from './pages/Architecture';

const Dashboard = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ onTime: 0, delayed: 0 });

  useEffect(() => {
    fetchTrains().then(data => {
      setTrains(data);
      // Mock metrics for dashboard visualization
      const delayedCount = Math.floor(data.length * 0.2); // 20% delayed for demo
      setMetrics({
        onTime: data.length - delayedCount,
        delayed: delayedCount
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-slate-600 mb-6">Total trains monitored and active alerts.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 font-medium">Total Monitored</h3>
          <p className="text-3xl font-bold mt-2">{trains.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 font-medium">On Time</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-600">{loading ? '--' : metrics.onTime}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 font-medium">Delayed Alerts</h3>
          <p className="text-3xl font-bold mt-2 text-amber-600">{loading ? '--' : metrics.delayed}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-medium">Train Number</th>
              <th className="p-4 font-medium">Train Name</th>
              <th className="p-4 font-medium">Origin</th>
              <th className="p-4 font-medium">Destination</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center">Loading trains...</td></tr>
            ) : trains.map(train => (
              <tr key={train.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold">{train.train_number}</td>
                <td className="p-4">{train.train_name}</td>
                <td className="p-4">{train.origin}</td>
                <td className="p-4">{train.destination}</td>
                <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{train.type}</span></td>
                <td className="p-4 text-right">
                  <Link to={`/train/${train.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 p-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
    >
      <Icon size={20}/> {label}
    </Link>
  );
};

const Sidebar = () => (
  <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
    <div className="p-4 border-b border-slate-800 flex items-center gap-2 mb-4">
      <TrainFront className="text-blue-400" />
      <span className="text-xl font-bold tracking-wider">RailETA</span>
    </div>
    <nav className="flex-1 px-4 space-y-2">
      <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
      <SidebarItem to="/map" icon={Map} label="Live Map" />
      <SidebarItem to="/analytics" icon={BarChart} label="Analytics" />
      <SidebarItem to="/architecture" icon={Settings} label="Architecture" />
    </nav>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/train/:id" element={<TrainDetails />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/architecture" element={<Architecture />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;
