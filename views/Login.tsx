
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (userData: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !university) {
      alert("Please fill in all fields (Name, University, Email, Password).");
      return;
    }

    setIsLoading(true);

    // Simulate network delay for institutional SSO/Auth verification
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white text-3xl shadow-xl mb-4">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Guardian AI</h1>
          <p className="text-slate-500 mt-2 font-medium">Academic Integrity & Data Sovereignty</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden slide-up">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Institutional Portal</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    <i className="fa-solid fa-user"></i>
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>


              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">University Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    <i className="fa-solid fa-building-columns"></i>
                  </span>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Enter your university name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">University Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    <i className="fa-solid fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${role === 'STUDENT' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    <i className="fa-solid fa-graduation-cap mr-2"></i>
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('FACULTY')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${role === 'FACULTY' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    <i className="fa-solid fa-chalkboard-user mr-2"></i>
                    Faculty
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100 mt-4"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Verifying Identity...
                  </>
                ) : (
                  <>
                    Secure Sign In
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
            <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed uppercase tracking-tighter">
              Private On-Premise Authentication Node<br />
              Global Tech University Integrity Network
            </p>
          </div>
        </div>
      </div >
      <style>{`
        .slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div >
  );
};

export default Login;
