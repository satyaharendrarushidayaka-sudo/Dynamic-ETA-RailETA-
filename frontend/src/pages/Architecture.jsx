import React from 'react';
import { Server, Database, Activity, Cpu, ArrowRight, Cloud, Globe } from 'lucide-react';

const Architecture = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Production System Architecture</h1>
      <p className="text-slate-500 mb-8">
        This diagram illustrates how the current SQLite/FastAPI prototype scales into an enterprise-grade Indian Railways deployment processing data for over 13,000 trains daily.
      </p>

      {/* Interactive Diagram Section */}
      <div className="bg-slate-900 rounded-2xl p-8 shadow-xl text-white mb-8 overflow-x-auto">
        <div className="min-w-[800px] flex items-center justify-between gap-4">
          
          {/* Edge / IoT */}
          <div className="flex flex-col items-center flex-1">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full text-center">
              <Globe className="mx-auto mb-2 text-blue-400" size={32} />
              <h3 className="font-bold text-sm">GPS Data (NTES)</h3>
              <p className="text-xs text-slate-400 mt-1">Locomotives & Stations</p>
            </div>
          </div>

          <ArrowRight className="text-slate-600" />

          {/* Ingestion Layer */}
          <div className="flex flex-col items-center flex-1">
            <div className="bg-orange-900/40 p-4 rounded-xl border border-orange-700/50 w-full text-center">
              <Activity className="mx-auto mb-2 text-orange-400" size={32} />
              <h3 className="font-bold text-sm">Apache Kafka</h3>
              <p className="text-xs text-orange-200 mt-1">Real-time Stream Ingestion</p>
            </div>
          </div>

          <ArrowRight className="text-slate-600" />

          {/* Processing Layer */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="bg-blue-900/40 p-4 rounded-xl border border-blue-700/50 text-center">
              <Cpu className="mx-auto mb-2 text-blue-400" size={32} />
              <h3 className="font-bold text-sm">Apache Spark</h3>
              <p className="text-xs text-blue-200 mt-1">Stream Processing</p>
            </div>
            <div className="bg-emerald-900/40 p-4 rounded-xl border border-emerald-700/50 text-center">
              <Cloud className="mx-auto mb-2 text-emerald-400" size={32} />
              <h3 className="font-bold text-sm">ML Inference</h3>
              <p className="text-xs text-emerald-200 mt-1">Random Forest Model</p>
            </div>
          </div>

          <ArrowRight className="text-slate-600" />

          {/* Storage Layer */}
          <div className="flex flex-col items-center flex-1">
            <div className="bg-purple-900/40 p-4 rounded-xl border border-purple-700/50 w-full text-center">
              <Database className="mx-auto mb-2 text-purple-400" size={32} />
              <h3 className="font-bold text-sm">Cassandra / Postgres</h3>
              <p className="text-xs text-purple-200 mt-1">Distributed Storage</p>
            </div>
          </div>

          <ArrowRight className="text-slate-600" />

          {/* API / UI */}
          <div className="flex flex-col items-center flex-1">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full text-center">
              <Server className="mx-auto mb-2 text-sky-400" size={32} />
              <h3 className="font-bold text-sm">FastAPI + React</h3>
              <p className="text-xs text-slate-400 mt-1">Client Dashboard</p>
            </div>
          </div>

        </div>
      </div>

      {/* Explanatory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Globe size={20} className="text-blue-500"/> Data Sources</h3>
          <p className="text-sm text-slate-600">
            In production, train GPS coordinates, NTES (National Train Enquiry System) data, weather APIs, and track congestion metrics are continuously collected.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Activity size={20} className="text-orange-500"/> Message Broker</h3>
          <p className="text-sm text-slate-600">
            <strong>Apache Kafka</strong> replaces our direct API calls. It handles millions of high-throughput GPS pings per second, buffering data reliably for downstream consumption.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Cpu size={20} className="text-indigo-500"/> Stream Processing</h3>
          <p className="text-sm text-slate-600">
            <strong>Apache Spark Streaming</strong> consumes Kafka topics, cleans the data, calculates distance differentials, and passes the features into our scaled AI/ML models.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Database size={20} className="text-purple-500"/> Distributed DB</h3>
          <p className="text-sm text-slate-600">
            <strong>Apache Cassandra</strong> is used for heavy write-loads (GPS logs), while PostgreSQL handles relational metadata (routes, schedules). Replacing our SQLite prototype.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Architecture;
