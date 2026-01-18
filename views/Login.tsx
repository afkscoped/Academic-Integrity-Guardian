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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial gradient provided by body CSS, unnecessary absolute divs removed for cleaner DOM */}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-[480px] w-full relative z-10"
      >
        {/* Branding - Floating Animation */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-accent-secondary to-accent-primary shadow-2xl mb-6 shadow-accent-secondary/20 logo-glow"
          >
            <ShieldCheck size={40} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            GUARDIAN <span className="text-accent-secondary">AI</span>
          </h1>
          <p className="text-text-secondary mt-2 text-xs uppercase tracking-[0.25em] font-semibold">
            Institutional Access
          </p>
        </div>

        {/* Login Card - Neon Agent Style */}
        <div className="portal-card">
          <h2 className="text-xl font-semibold text-text-primary mb-8 text-center tracking-wide">Secure Terminal Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Full Identity</label>
              <input
                type="text"
                required
                className="neon-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Access ID (Email)</label>
              <input
                type="email"
                required
                className="neon-input"
                placeholder="j.doe@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${role === 'STUDENT'
                  ? 'bg-accent-secondary/20 border-accent-secondary text-accent-secondary shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                  : 'bg-white/5 text-text-secondary border-white/5 hover:border-white/10'
                  }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('FACULTY')}
                className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${role === 'FACULTY'
                  ? 'bg-accent-secondary/20 border-accent-secondary text-accent-secondary shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                  : 'bg-white/5 text-text-secondary border-white/5 hover:border-white/10'
                  }`}
              >
                Faculty
              </button>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="neon-button w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Initializing Node...
                  </>
                ) : (
                  <>
                    Authenticate
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-accent-secondary/20 flex items-center justify-center gap-2">
            <Building2 size={14} className="text-text-secondary" />
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-widest">{university}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-6 text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-80">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-accent-secondary" />
            <span>AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-accent-primary" />
            <span>ZKP Verified</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
