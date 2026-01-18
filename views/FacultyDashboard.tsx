import React, { useState } from 'react';
import { Submission, LedgerEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Database, Activity, Filter, Search, ChevronRight } from 'lucide-react';

interface FacultyDashboardProps {
  submissions: Submission[];
  ledger: LedgerEntry[];
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ submissions, ledger }) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL'>('ALL');

  const displaySubmissions = filter === 'CRITICAL'
    ? submissions.filter(s => s.similarityScore > 20)
    : submissions;

  const scoreDistribution = [
    { range: '0-10%', count: submissions.filter(s => s.similarityScore <= 10).length },
    { range: '11-20%', count: submissions.filter(s => s.similarityScore > 10 && s.similarityScore <= 20).length },
    { range: '21-30%', count: submissions.filter(s => s.similarityScore > 20 && s.similarityScore <= 30).length },
    { range: '31%+', count: submissions.filter(s => s.similarityScore > 30).length },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Submissions', value: submissions.length, icon: Database, color: 'text-accent-primary' },
          { label: 'Integrity Alerts', value: submissions.filter(s => s.similarityScore > 30).length, icon: AlertTriangle, color: 'text-error' },
          { label: 'Verified Nodes', value: ledger.length, icon: Shield, color: 'text-accent-secondary' },
          { label: 'System Health', value: 'Optimal', icon: Activity, color: 'text-success' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-premium glass flex flex-col items-start"
          >
            <div className={`p-2 rounded-lg bg-white/5 border border-white/10 mb-3 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest leading-none mb-2">{stat.label}</p>
            <h3 className={`text-2xl font-black ${stat.color === 'text-success' ? 'text-success' : 'text-text-primary'}`}>{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registry Table */}
        <div className="lg:col-span-2 card-premium glass !p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Submission Registry</h3>
              <p className="text-[10px] text-text-tertiary mt-1">Real-time forensic monitoring</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === 'ALL' ? 'bg-accent-gradient text-white shadow-lg shadow-accent-primary/20' : 'text-text-tertiary hover:text-text-primary'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('CRITICAL')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === 'CRITICAL' ? 'bg-error text-white shadow-lg shadow-error/20' : 'text-text-tertiary hover:text-text-primary'}`}
              >
                Critical
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-text-tertiary uppercase text-[9px] font-black tracking-[0.2em] border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <th className="px-8 py-5">Intellectual Property</th>
                  <th className="px-8 py-5">Forensic Score</th>
                  <th className="px-8 py-5">State</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {displaySubmissions.map((sub, idx) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={sub.id}
                    className="hover:bg-accent-primary/[0.02] group transition-colors"
                  >
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-text-primary group-hover:text-accent-primary transition-colors">{sub.title}</p>
                      <p className="text-[9px] font-mono text-text-tertiary uppercase mt-1 tracking-widest">ID: {sub.hash.substring(0, 12)}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sub.similarityScore}%` }}
                            className={`h-full ${sub.similarityScore > 30 ? 'bg-error shadow-[0_0_10px_rgba(255,0,85,0.5)]' : sub.similarityScore > 20 ? 'bg-warning' : 'bg-success'}`}
                          ></motion.div>
                        </div>
                        <span className={`text-[10px] font-black ${sub.similarityScore > 30 ? 'text-error' : 'text-text-primary'}`}>{sub.similarityScore}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${sub.status === 'FINAL' ? 'bg-success/10 text-success border-success/20' : 'bg-accent-primary/10 text-accent-primary border-accent-primary/20'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-text-tertiary hover:text-accent-primary hover:border-accent-primary/50 transition-all">
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {displaySubmissions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em]">No matching neural fingerprints found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          <div className="card-premium glass">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary mb-8 border-b border-white/5 pb-4">Institutional Distribution</h3>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="range"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontWeight: 'bold' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontWeight: 'bold' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={index} fill={index === 3 ? 'var(--error)' : index === 2 ? 'var(--warning)' : 'var(--accent-primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-premium bg-bg-secondary border border-accent-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Shield size={60} className="text-accent-primary" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
              Service Status
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Analytic Engine', value: 'Llama-3-70B', status: 'Healthy' },
                { label: 'Latency (Avg)', value: '0.84s', status: 'Optimal' },
                { label: 'Vectors Synced', value: '1.2M', status: 'Ready' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <div className="flex flex-col text-[10px]">
                    <span className="text-text-tertiary uppercase font-bold tracking-tighter">{item.label}</span>
                    <span className="text-text-primary font-black mt-1 font-mono uppercase italic">{item.value}</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
