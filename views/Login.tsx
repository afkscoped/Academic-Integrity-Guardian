import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, Sparkles, Building2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [university, _setUniversity] = useState('Global Tech University');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const userData: User = {
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        email: email,
        role: role,
        institution: university
      };
      onLogin(userData);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-secondary/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex p-4 rounded-3xl bg-accent-gradient shadow-2xl mb-6 shadow-accent-primary/20"
          >
            <ShieldCheck size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-text-primary">
            GUARDIAN <span className="text-accent-primary">AI</span>
          </h1>
          <p className="text-text-tertiary mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">
            Academic Integrity & Data Sovereignty
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-[2.5rem] p-10 border shadow-2xl overflow-hidden relative group" style={{ borderColor: 'var(--border-strong)', background: 'var(--bg-elevated)' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />

          <h2 className="text-xl font-black text-text-primary mb-8 text-center tracking-tight">Institutional Portal</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="input-premium pl-4"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Institutional Email</label>
              <input
                type="email"
                required
                className="input-premium pl-4"
                placeholder="j.doe@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${role === 'STUDENT'
                    ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20'
                    : 'glass text-text-tertiary border-white/10 hover:border-white/20'
                  }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('FACULTY')}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${role === 'FACULTY'
                    ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20'
                    : 'glass text-text-tertiary border-white/10 hover:border-white/20'
                  }`}
              >
                Faculty
              </button>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-gradient py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent-primary/20 disabled:opacity-70 disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying Node...
                  </>
                ) : (
                  <>
                    Secure Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t flex items-center justify-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <Building2 size={14} className="text-text-tertiary" />
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{university}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-accent-primary" />
            <span>AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-accent-secondary" />
            <span>ZKP Verified</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
