
import React from 'react';
import { Submission } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentDashboardProps {
  submissions: Submission[];
  onViewDrafts: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ submissions, onViewDrafts }) => {
  const chartData = submissions.slice(0, 5).reverse().map(s => ({
    name: s.title.substring(0, 10),
    score: s.similarityScore
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Total Submissions</p>
          <h3 className="text-3xl font-bold text-slate-800">{submissions.length}</h3>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
             <i className="fa-solid fa-arrow-up mr-1"></i> 12% increase this month
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Avg. Similarity Score</p>
          <h3 className="text-3xl font-bold text-slate-800">
            {submissions.length ? (submissions.reduce((a,b) => a + b.similarityScore, 0) / submissions.length).toFixed(1) : 0}%
          </h3>
          <p className="text-xs text-slate-400 mt-4">Calculated from last 10 documents</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-xl border border-indigo-700 shadow-lg text-white">
          <p className="text-indigo-100 text-sm font-medium">Draft Checks Remaining</p>
          <h3 className="text-3xl font-bold">Unlimited</h3>
          <button 
            onClick={onViewDrafts}
            className="mt-4 w-full bg-white text-indigo-600 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors"
          >
            Start New Draft
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex justify-between items-center">
            Integrity Progress
            <span className="text-xs font-normal text-slate-400">Past 5 Analyses</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" fill="#eef2ff" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-6">Recent Submissions</h3>
          <div className="space-y-4">
            {submissions.slice(0, 4).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${sub.status === 'FINAL' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    <i className={`fa-solid ${sub.status === 'FINAL' ? 'fa-file-circle-check' : 'fa-file-pen'}`}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 truncate max-w-[150px]">{sub.title}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">v{sub.version} • {new Date(sub.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${sub.similarityScore > 30 ? 'text-red-500' : 'text-green-500'}`}>
                    {sub.similarityScore}% Similarity
                  </span>
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                <i className="fa-regular fa-folder-open text-3xl mb-3 block"></i>
                No submissions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
