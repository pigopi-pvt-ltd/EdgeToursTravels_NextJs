'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, storeAuthData } from '@/lib/auth';
import Link from 'next/link';

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

  // --- OTP handlers ---
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
      case 'admin':
        router.push('/admin-dashboard');
        break;
      case 'employee':
        router.push('/employee-dashboard');
        break;
      case 'driver':
        router.push('/driver-dashboard');
        break;
      case 'customer':
        router.push('/customer-dashboard');
        break;
      default:
        router.push('/');
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
        if (regEmail) payload.email = regEmail; // optional
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0A1128] dark:to-[#0A1128] p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-white dark:border-slate-800 transition-all">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <img src="/images/logo.png" alt="Edge Tours" className="h-12 w-auto object-contain" />
            </div>
          </Link>
        </div>
        <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mt-2 text-sm">
          {isLogin ? 'Sign in to access your dashboard' : 'Join us as a customer or driver'}
        </p>

        {error && (
          <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {isLogin && (
          <div className="mt-8 flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Email Login
            </button>
            <button
              onClick={() => setLoginMethod('otp')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              OTP Login
            </button>
          </div>
        )}

        {/* Email Login Form */}
        {isLogin && loginMethod === 'email' && (
          <form className="mt-8 space-y-4" onSubmit={handleEmailLogin}>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
              <input type="email" placeholder="john@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Password</label>
              <input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[11px] py-4.5 rounded-2xl shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] dark:shadow-none transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_20px_35px_-10px_rgba(79,70,229,0.5)] active:scale-95 disabled:opacity-50 mt-6 border border-white/10 flex items-center justify-center gap-3">
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </button>
          </form>
        )}

        {/* OTP Login Form */}
        {isLogin && loginMethod === 'otp' && (
          <form className="mt-8 space-y-4" onSubmit={handleOtpLogin}>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Mobile Number</label>
              <input type="tel" placeholder="+91 9876543210" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white outline-none" />
            </div>
            {!otpSent ? (
              <button type="button" onClick={handleSendOtp} disabled={loading} className="w-full bg-slate-800 dark:bg-slate-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-4">
                {loading ? 'Sending...' : 'Send Verification OTP'}
              </button>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Verification Code</label>
                  <input type="text" placeholder="6-digit OTP" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all dark:text-white outline-none text-center text-xl font-bold tracking-[0.5em]" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-4">
                  {loading ? 'Verifying...' : 'Verify & Enter'}
                </button>
              </>
            )}
          </form>
        )}

        {/* Registration Form */}
        {!isLogin && (
          <form className="mt-8 space-y-4" onSubmit={handleRegister}>
            <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRegRole('customer')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${regRole === 'customer' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                User (Customer)
              </button>
              <button
                type="button"
                onClick={() => setRegRole('driver')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${regRole === 'driver' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Driver
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Full Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Mobile Number *</label>
              <input type="tel" required value={regMobile} onChange={e => setRegMobile(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Email {regRole === 'customer' ? '*' : '(optional)'}
              </label>
              <input type="email" required={regRole === 'customer'} value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Password *</label>
              <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-4">
              {loading ? 'Creating...' : `Register as ${regRole === 'customer' ? 'User' : 'Driver'}`}
            </button>
          </form>
        )}

        <div className="text-center mt-8">
          <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white transition-colors">
            {isLogin ? "New here? Register" : 'Back to login'}
          </button>
        </div>
      </div>
    </div>
  );
}