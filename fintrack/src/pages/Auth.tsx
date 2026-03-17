import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; // 1. IMPORT AXIOS

interface AuthProps {
  onLoginSuccess: () => void;
}

const Auth = ({ onLoginSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  // 2. LOGIKA HANDLESUBMIT YANG TERHUBUNG KE BACKEND
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validasi Client-Side untuk Register
    if (!isLogin) {
      if (!name || !email || !password) {
        window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Semua kolom wajib diisi!', type: 'error' } }));
        return;
      }
      if (!passwordRegex.test(password)) {
        setPasswordError('Password minimal 8 karakter, wajib mengandung huruf besar, huruf kecil, angka, dan simbol (@$!%*?&#).');
        return;
      }
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      // 👇 UPDATE: URL Backend sekarang mengarah ke Vercel!
      const response = await axios.post(`https://fintrack-backend-rho.vercel.app${endpoint}`, payload);

      if (isLogin) {
        // --- PROSES LOGIN SUKSES ---
        // Simpan Token & Data User
        localStorage.setItem('fintrack_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        localStorage.setItem('fintrack_is_logged_in', 'true');

        window.dispatchEvent(new CustomEvent('fintrack-toast', { 
          detail: { msg: 'Login berhasil! Selamat datang.', type: 'success' } 
        }));
        
        onLoginSuccess(); // Panggil fungsi callback untuk pindah ke Dashboard
      } else {
        // --- PROSES REGISTER SUKSES ---
        setShowVerification(true); // Tampilkan layar simulasi verifikasi email
        window.dispatchEvent(new CustomEvent('fintrack-toast', { 
          detail: { msg: 'Akun berhasil dibuat!', type: 'success' } 
        }));
      }
    } catch (error: any) {
      // TAMPILKAN ERROR DARI BACKEND (Misal: Email sudah ada/Password salah)
      const errorMsg = error.response?.data?.error || "Terjadi kesalahan sistem";
      window.dispatchEvent(new CustomEvent('fintrack-toast', { 
        detail: { msg: errorMsg, type: 'error' } 
      }));
    }
  };

  const handleSimulateEmailVerification = () => {
    // Karena saat ini verifikasi masih simulasi, kita langsung pindahkan ke login
    setShowVerification(false);
    setIsLogin(true);
    setPassword('');
    setShowPassword(false);
    window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Email berhasil diverifikasi! Silakan login.', type: 'success' } }));
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setName(''); 
    setEmail(''); 
    setPassword(''); 
    setPasswordError('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#A844FF]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white p-10 rounded-[45px] shadow-2xl border border-slate-100 relative z-10 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {showVerification ? (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center py-6"
            >
              <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                ✉️
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">Cek Email Anda</h2>
              <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                Kami telah mengirimkan link konfirmasi ke <br/><b className="text-slate-900">{email}</b>.<br/> Silakan klik link tersebut untuk mengaktifkan akun FinTrack Anda.
              </p>
              
              <div className="p-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Zona Simulasi (Dev Only)</p>
                <button 
                  onClick={handleSimulateEmailVerification}
                  className="w-full py-4 bg-green-500 text-white font-black rounded-[18px] text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                >
                  Simulasikan Klik Link Email
                </button>
              </div>
            </motion.div>

          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <div className="flex justify-center mb-8">
                <div className="w-14 h-14 bg-[#A844FF] rounded-[18px] flex items-center justify-center text-white text-2xl font-black italic shadow-lg shadow-purple-200">
                  F
                </div>
              </div>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  {isLogin ? 'Selamat Datang' : 'Buat Akun'}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                  {isLogin ? 'Login ke FinTrack' : 'Mulai perjalanan finansialmu'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="name-input"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <input 
                        type="text" 
                        placeholder="Nama Lengkap" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-50 rounded-[20px] text-sm font-bold outline-none focus:bg-white focus:border-purple-200 transition-all mb-4"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <input 
                  type="email" 
                  placeholder="Alamat Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-50 rounded-[20px] text-sm font-bold outline-none focus:bg-white focus:border-purple-200 transition-all"
                  required
                />
                
                <div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      className={`w-full p-4 pr-12 bg-slate-50 border rounded-[20px] text-sm font-bold outline-none transition-all focus:bg-white ${passwordError ? 'border-rose-400 focus:border-rose-400' : 'border-slate-50 focus:border-purple-200'}`}
                      required
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors p-1"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {passwordError && (
                    <p className="text-[10px] font-bold text-rose-500 mt-2 ml-2 leading-relaxed">
                      {passwordError}
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 mt-6 bg-[#0F172A] text-white font-black rounded-[20px] text-[11px] uppercase tracking-widest hover:bg-[#A844FF] transition-all shadow-xl active:scale-95"
                >
                  {isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button 
                  type="button"
                  onClick={handleToggleMode}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#3b82f6] transition-colors"
                >
                  {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Auth;