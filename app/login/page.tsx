'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, storeAuthData } from '@/lib/auth';
import Link from 'next/link';
import { HiOutlineEye, HiOutlineEyeSlash, HiArrowLeft } from 'react-icons/hi2';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Registration fields
  const [name, setName] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'driver'>('customer');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // OTP handlers
  const handleSendOtp = async () => {
    if (!mobileNumber) {
      setError('Mobile number is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setError('');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        storeAuthData(data.token, data.user);
        redirectBasedOnRole(data.user.role);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      storeAuthData(response.token, response.user);
      redirectBasedOnRole(response.user.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'admin': router.push('/admin-dashboard'); break;
      case 'employee': router.push('/employee-dashboard'); break;
      case 'driver': router.push('/driver-dashboard'); break;
      case 'customer': router.push('/customer-dashboard'); break;
      default: router.push('/');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = {
        name,
        mobileNumber: regMobile,
        password: regPassword,
        role: regRole,
      };
      if (regRole === 'customer') {
        if (!regEmail) {
          setError('Email is mandatory for user registration');
          setLoading(false);
          return;
        }
        payload.email = regEmail;
      } else if (regRole === 'driver') {
        if (regEmail) payload.email = regEmail;
      }
      
      const response = await registerUser(payload);
      storeAuthData(response.token, response.user);
      redirectBasedOnRole(response.user.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-3 sm:p-4"
      style={{ backgroundImage: 'url("/images/car3_bg.png")' }}>
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 sm:p-6 border border-white/20 dark:border-slate-800 transition-all max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {/* Header with Back Arrow and Logo */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="p-1.5 -ml-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors">
              <HiArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex justify-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <img src="/images/logo.png" alt="Edge Tours" className="h-7 sm:h-8 w-auto object-contain" />
              </div>
            </div>
            <div className="w-8"></div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-center text-slate-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            {isLogin ? 'Sign in to access your dashboard' : 'Join us as a customer or driver'}
          </p>

          {error && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {isLogin && (
            <div className="mt-4 flex bg-slate-50 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Email Login
              </button>
              <button
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                OTP Login
              </button>
            </div>
          )}

          {/* Email Login Form - Compact */}
          {isLogin && loginMethod === 'email' && (
            <form className="mt-3 space-y-2.5" onSubmit={handleEmailLogin}>
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
                <input type="email" placeholder="john@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white outline-none text-sm" />
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white outline-none pr-10 text-sm" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <HiOutlineEyeSlash size={16} /> : <HiOutlineEye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.15em] text-[10px] sm:text-[11px] py-2.5 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : 'Enter Dashboard'}
              </button>
            </form>
          )}

          {/* OTP Login Form - Compact */}
          {isLogin && loginMethod === 'otp' && (
            <form className="mt-3 space-y-2.5" onSubmit={handleOtpLogin}>
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Mobile Number</label>
                <input type="tel" placeholder="9876543210" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white outline-none text-sm" />
              </div>
              {!otpSent ? (
                <button type="button" onClick={handleSendOtp} disabled={loading} className="w-full bg-slate-800 dark:bg-slate-700 text-white font-black uppercase tracking-wider text-[10px] sm:text-[11px] py-2.5 rounded-lg shadow-md transition-all active:scale-95 mt-2">
                  {loading ? 'Sending...' : 'Send Verification OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Verification Code</label>
                    <input type="text" placeholder="6-digit OTP" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-green-500 transition-all dark:text-white outline-none text-center text-base sm:text-lg font-bold tracking-[0.3em] sm:tracking-[0.5em]" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-wider text-[10px] sm:text-[11px] py-2.5 rounded-lg shadow-md transition-all active:scale-95 mt-2">
                    {loading ? 'Verifying...' : 'Verify & Enter'}
                  </button>
                </>
              )}
            </form>
          )}

          {/* Registration Form - Compact (No Scrolling Needed) */}
          {!isLogin && (
            <form className="mt-3 space-y-2.5" onSubmit={handleRegister}>
              <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setRegRole('customer')}
                  className={`flex-1 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${regRole === 'customer' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('driver')}
                  className={`flex-1 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${regRole === 'driver' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Driver
                </button>
              </div>

              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Full Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm" />
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Mobile Number *</label>
                <input type="tel" required value={regMobile} onChange={e => setRegMobile(e.target.value)} className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm" />
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                  Email {regRole === 'customer' ? '*' : '(optional)'}
                </label>
                <input type="email" required={regRole === 'customer'} value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm" />
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Password *</label>
                <div className="relative">
                  <input 
                    type={showRegPassword ? "text" : "password"} 
                    required 
                    value={regPassword} 
                    onChange={e => setRegPassword(e.target.value)} 
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showRegPassword ? <HiOutlineEyeSlash size={16} /> : <HiOutlineEye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider text-[10px] sm:text-[11px] py-2.5 rounded-lg shadow-md transition-all active:scale-95 mt-3">
                {loading ? 'Creating...' : `Register as ${regRole === 'customer' ? 'User' : 'Driver'}`}
              </button>
            </form>
          )}

          <div className="text-center mt-4">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white transition-colors">
              {isLogin ? "New here? Register" : 'Back to login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}