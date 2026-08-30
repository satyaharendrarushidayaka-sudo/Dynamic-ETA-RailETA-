import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

// Synthetic Analytics Data for the prototype
const performanceData = [
  { name: 'Monday', baseline_error: 45, ml_error: 12 },
  { name: 'Tuesday', baseline_error: 52, ml_error: 10 },
  { name: 'Wednesday', baseline_error: 38, ml_error: 9 },
  { name: 'Thursday', baseline_error: 65, ml_error: 14 },
  { name: 'Friday', baseline_error: 70, ml_error: 15 },
  { name: 'Saturday', baseline_error: 40, ml_error: 8 },
  { name: 'Sunday', baseline_error: 35, ml_error: 7 },
];

const delayCauses = [
  { name: 'Weather', occurrences: 120 },
  { name: 'Congestion', occurrences: 250 },
  { name: 'Signal Failure', occurrences: 45 },
  { name: 'Speed Restriction', occurrences: 85 },
  { name: 'Platform Unavail.', occurrences: 190 },
];

const Analytics = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Network Analytics & AI Performance</h1>
      <p className="text-slate-500 mb-6">Compare our Machine Learning ETA accuracy against traditional baseline methods.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* ML vs Baseline MAE Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-4">ETA Prediction Error (Minutes)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="baseline_error" name="Baseline Error (min)" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.5} />
                <Area type="monotone" dataKey="ml_error" name="AI Model Error (min)" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-500 mt-4 text-center">Lower is better. AI drastically reduces ETA error margin.</p>
        </div>

        {/* Delay Causes Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-4">Root Causes of Network Delay (Monthly)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={delayCauses}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="occurrences" name="Reported Incidents" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <h3 className="text-slate-500 font-medium">Model MAE</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">10.59 min</p>
          <p className="text-xs text-slate-400 mt-2">Tested on 20,000 runs</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <h3 className="text-slate-500 font-medium">Baseline MAE</h3>
          <p className="text-3xl font-bold mt-2 text-slate-600">49.40 min</p>
          <p className="text-xs text-slate-400 mt-2">Traditional Additive Logic</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <h3 className="text-slate-500 font-medium">Accuracy Improvement</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-600">~ 78.5%</p>
          <p className="text-xs text-slate-400 mt-2">Net predictive gain</p>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
