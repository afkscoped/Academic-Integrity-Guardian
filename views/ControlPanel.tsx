
import React, { useState } from 'react';
import { User, Submission, AccessLog, DeletionRequest } from '../types';

interface ControlPanelProps {
  user: User;
  submissions: Submission[];
  accessLogs: AccessLog[];
  onDeleteRequest: (id: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ user, submissions, accessLogs, onDeleteRequest }) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'DATA' | 'POLICIES'>('LOGS');
  const [pendingRequests, setPendingRequests] = useState<DeletionRequest[]>([]);

  const handleDeletionSubmit = (subId: string, title: string) => {
    if(window.confirm(`Formalize Deletion Request for "${title}"? This request will be audited via the Blockchain Ledger and reviewed by Institutional Governance.`)) {
      const newRequest: DeletionRequest = {
        id: `dr-${Date.now()}`,
        submissionId: subId,
        status: 'PENDING',
        requestDate: new Date().toISOString()
      };
      setPendingRequests([newRequest, ...pendingRequests]);
      alert("Formal request submitted to Governance. Track status below.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-wrap gap-3 mb-8">
        <button 
          onClick={() => setActiveTab('LOGS')}
          className={`flex-1 min-w-[150px] py-4 px-6 rounded-2xl font-bold transition-all border-2 ${activeTab === 'LOGS' ? 'bg-white border-indigo-600 text-indigo-600 shadow-md scale-[1.02]' : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'}`}
        >
          <i className="fa-solid fa-eye mr-2"></i> Access Logs
        </button>
        <button 
          onClick={() => setActiveTab('DATA')}
          className={`flex-1 min-w-[150px] py-4 px-6 rounded-2xl font-bold transition-all border-2 ${activeTab === 'DATA' ? 'bg-white border-indigo-600 text-indigo-600 shadow-md scale-[1.02]' : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'}`}
        >
          <i className="fa-solid fa-database mr-2"></i> Manage My Data
        </button>
        <button 
          onClick={() => setActiveTab('POLICIES')}
          className={`flex-1 min-w-[150px] py-4 px-6 rounded-2xl font-bold transition-all border-2 ${activeTab === 'POLICIES' ? 'bg-white border-indigo-600 text-indigo-600 shadow-md scale-[1.02]' : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'}`}
        >
          <i className="fa-solid fa-shield-halved mr-2"></i> Privacy Charter
        </button>
      </div>

      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden slide-in">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-800 text-xl">Transparency & Audit Trail</h3>
              <p className="text-sm text-slate-500 mt-1">Full visibility into who accessed your data and for what institutional purpose.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded font-black uppercase tracking-widest">Live Audit Active</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">Entity</th>
                  <th className="px-8 py-5">Purpose</th>
                  <th className="px-8 py-5">Resource ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {accessLogs.map(log => (
                  <tr key={log.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-8 py-5 text-slate-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-8 py-5 font-bold text-slate-700">
                       <i className="fa-solid fa-robot mr-2 text-indigo-400"></i> {log.entity}
                    </td>
                    <td className="px-8 py-5 text-slate-600 italic">"{log.purpose}"</td>
                    <td className="px-8 py-5 text-indigo-600 font-mono text-xs">{log.resourceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DATA' && (
        <div className="space-y-6 slide-in">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xl mb-6 flex items-center gap-3">
              <i className="fa-solid fa-lock text-indigo-600"></i> Institutional Rights Manager
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Submissions</h4>
                {submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions.map(sub => {
                      const isPending = pendingRequests.some(pr => pr.submissionId === sub.id);
                      return (
                        <div key={sub.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-white hover:shadow-sm transition-all">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                <i className="fa-solid fa-file-shield"></i>
                             </div>
                             <div>
                               <p className="font-bold text-slate-700 leading-none mb-1">{sub.title}</p>
                               <p className="text-[10px] text-slate-400 font-mono">{sub.hash.substring(0, 16)}...</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => handleDeletionSubmit(sub.id, sub.title)}
                            disabled={isPending}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-tighter rounded-lg transition-all ${isPending ? 'bg-orange-100 text-orange-600 cursor-default' : 'text-red-600 bg-red-50 hover:bg-red-600 hover:text-white shadow-sm'}`}
                          >
                            {isPending ? 'Review Pending' : 'Purge Record'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 italic">No submissions indexed.</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Governance Requests</h4>
                <div className="space-y-4">
                   {pendingRequests.map(req => (
                      <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                         <div>
                            <p className="text-xs font-black text-indigo-600">ID: {req.id.split('-')[1]}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Filed: {new Date(req.requestDate).toLocaleDateString()}</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{req.status}</span>
                         </div>
                      </div>
                   ))}
                   {pendingRequests.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-10">No active governance requests found.</p>
                   )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-900 p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-trash-can text-9xl"></i>
             </div>
             <h3 className="font-bold text-2xl mb-4">Total Data Portability & Erasure</h3>
             <p className="text-red-200 text-sm mb-8 max-w-2xl leading-relaxed">
               In compliance with Article 17, you have the right to request a complete purge of your institutional metadata. This action will permanently disconnect your identity from all submission hashes in the Ledger.
             </p>
             <button className="px-10 py-4 bg-white text-red-900 font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 transition-all shadow-xl active:scale-95">
               Initiate Institutional Purge
             </button>
          </div>
        </div>
      )}

      {activeTab === 'POLICIES' && (
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm slide-in">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">
                 <i className="fa-solid fa-gavel"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-2xl">Privacy & Ethics Charter</h3>
                <p className="text-sm text-slate-500">How we protect your academic integrity through engineering.</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                 <section>
                    <h4 className="font-black text-indigo-600 text-xs uppercase tracking-widest mb-3">Zero-Knowledge Storage</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">Your actual document content is never stored on a public or persistent university cloud. We store a unique SHA-256 fingerprint. Originality can be proven by comparing your local copy to this fingerprint without us ever owning your words.</p>
                 </section>
                 <section>
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-3">On-Premise Resilience</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">All AI inference and Ledger synchronization happens within university-controlled hardware nodes. No third-party data centers or external LLM providers have access to your submissions.</p>
                 </section>
              </div>
              <div className="space-y-8">
                 <section>
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-3">AI Explainability</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">We reject black-box scoring. Our AI is configured to provide textual justifications for similarity flags, empowering you to understand and improve your citations rather than being punished by an opaque number.</p>
                 </section>
                 <section>
                    <h4 className="font-black text-indigo-600 text-xs uppercase tracking-widest mb-3">Data Sovereignty</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">You own your intellectual property. Our platform functions as a custodian of verification, not a owner of content. You may withdraw consent and request data deletion at any stage of your academic career.</p>
                 </section>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .slide-in { animation: slideIn 0.5s ease-out cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ControlPanel;
