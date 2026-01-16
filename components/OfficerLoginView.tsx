import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Loader2, ArrowLeft } from 'lucide-react';

interface OfficerLoginViewProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const OfficerLoginView: React.FC<OfficerLoginViewProps> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      // Strict check for admin credentials
      if (username === 'admin' && password === '1234') {
        onLoginSuccess();
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-100 p-6">
      
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header / Logo Area */}
        <div className="bg-slate-900 p-8 flex flex-col items-center justify-center text-white relative">
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-24 h-24 bg-white rounded-full p-1 mb-4 shadow-lg flex items-center justify-center overflow-hidden">
            {/* Logo Placeholder - Replace src with actual logo URL */}
            <img 
              src="https://placehold.co/200x200/1e3a8a/ffffff?text=SAO+Logo" 
              alt="อบต.หนองทุ่ม" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2 className="text-xl font-bold">เข้าสู่ระบบเจ้าหน้าที่</h2>
          <p className="text-slate-400 text-sm">ศูนย์กู้ชีพกู้ภัย อบต.หนองทุ่ม</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">ชื่อผู้ใช้งาน</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                placeholder="Username"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">รหัสผ่าน</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} /> เข้าสู่ระบบ</>}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">สำหรับเจ้าหน้าที่เท่านั้น (Demo: admin / 1234)</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficerLoginView;