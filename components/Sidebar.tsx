
import React from 'react';
import { motion } from 'framer-motion';
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
    <aside className="sidebar-container w-72 h-screen sticky top-0 flex flex-col bg-bg-panel/50 backdrop-blur-xl border-r z-50 transition-all duration-300" style={{ borderColor: 'var(--border-glow)' }}>
      <div className="p-8">
        <div className="flex items-center gap-4 text-accent-primary mb-12 group cursor-pointer">
          <div className="w-10 h-10 bg-accent-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent-primary/20 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-shield-halved text-xl"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-text-primary">GUARDIAN</span>
            <span className="text-[10px] font-black text-accent-primary tracking-[0.3em] -mt-1">INTEGRITY</span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all relative group ${isActive
                  ? 'text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-accent-gradient rounded-2xl shadow-lg shadow-accent-primary/20"
                  />
                )}
                <i className={`fa-solid ${item.icon} w-5 z-10 ${isActive ? 'text-white' : 'text-accent-primary'}`}></i>
                <span className="z-10 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-6">
        <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3">Context Engine</p>
          <button
            onClick={onToggleRole}
            className="w-full text-[11px] font-bold glass border border-white/10 py-3 rounded-xl hover:border-accent-primary/50 transition-all text-text-primary flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-shuffle text-accent-primary" />
            Switch to {user.role === 'STUDENT' ? 'Faculty' : 'Student'}
          </button>
        </div>


        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-text-tertiary font-mono">On-Prem Node Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
