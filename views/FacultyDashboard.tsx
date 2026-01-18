
import React, { useState } from 'react';
import { Submission, LedgerEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Submissions</p>
          <h3 className="text-2xl font-bold text-slate-800">{submissions.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Integrity Violations</p>
          <h3 className="text-2xl font-bold text-red-500">{submissions.filter(s => s.similarityScore > 30).length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Verified Ledger Roots</p>
          <h3 className="text-2xl font-bold text-indigo-600">{ledger.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">System Health</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium text-slate-600">Optimal</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Submission Registry</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('CRITICAL')}
                className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${filter === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Critical (&gt;20%)
              </button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-medium">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Similarity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displaySubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 truncate max-w-[200px]">{sub.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{sub.hash.substring(0, 16)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${sub.similarityScore > 30 ? 'bg-red-500' : sub.similarityScore > 10 ? 'bg-orange-400' : 'bg-green-500'}`}
                            style={{ width: `${sub.similarityScore}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-xs">{sub.similarityScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.status === 'FINAL' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs transition-colors opacity-0 group-hover:opacity-100">
                        View Audit
                      </button>
                    </td>
                  </tr>
                ))}
                {displaySubmissions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Score Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={index} fill={index === 3 ? '#ef4444' : index === 2 ? '#fbbf24' : '#4f46e5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl text-white shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-microchip text-indigo-400"></i>
              Analysis Service Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Model</span>
                <span className="font-mono">GPT-4o (OpenAI)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Inference Latency</span>
                <span className="font-mono">1.2s avg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Embedding Vectors</span>
                <span className="font-mono">82,402 stored</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-[10px] text-green-400">
                  <i className="fa-solid fa-circle text-[6px]"></i>
                  GPU Nodes Healthy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
