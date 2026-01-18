
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activeView: string;
  onViewChange: (view: any) => void;
  onToggleRole: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, onViewChange, onToggleRole }) => {
  const menuItems = [
    { id: 'HOME', icon: 'fa-house', label: 'Dashboard' },
    { id: 'DRAFT', icon: 'fa-pen-to-square', label: 'Draft Analysis' },
    { id: 'VERIFY', icon: 'fa-certificate', label: 'Verification' },
    { id: 'LEDGER', icon: 'fa-link', label: 'Audit Ledger' },
  ];

  if (user.role === 'STUDENT') {
    menuItems.push({ id: 'CONTROL_PANEL', icon: 'fa-user-shield', label: 'Control Panel' });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 text-indigo-600 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <span className="font-bold text-lg tracking-tight">Guardian AI</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Switch View</p>
          <button 
            onClick={onToggleRole}
            className="w-full text-xs bg-white border border-slate-200 py-2 rounded-lg hover:shadow-sm transition-all text-slate-600 font-medium"
          >
            Switch to {user.role === 'STUDENT' ? 'Faculty' : 'Student'}
          </button>
        </div>
        
        <div className="flex items-center gap-3 px-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[10px] text-slate-500 font-mono">On-Prem Node Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
