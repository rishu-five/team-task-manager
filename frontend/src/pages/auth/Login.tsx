import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/services';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [rememberMe, setRememberMe]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset-password flow
  const [resetStep, setResetStep]         = useState<'login' | 'request' | 'verify'>('login');
  const [otp, setOtp]                     = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess]   = useState(false);

  const { login, refetchUser } = useAuth();
  const navigate = useNavigate();

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const fd = new URLSearchParams();
      fd.append('username', email);
      fd.append('password', password);
      const data = await authApi.login(fd);
      login(data.access_token, null as any);
      await refetchUser();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError(''); setIsSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setResetStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP.');
    } finally { setIsSubmitting(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!otp) { setError('Please enter the OTP.'); return; }
    setError(''); setIsSubmitting(true);
    try {
      await authApi.verifyPasswordReset({ email, otp, new_password: newPassword, confirm_password: confirmPassword });
      setResetSuccess(true);
      setResetStep('login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally { setIsSubmitting(false); }
  };

  /* ── Shared input class ────────────────────────────────────── */
  const inputCls =
    'w-full bg-[#EEF2FF] dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 ' +
    'border border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-700 ' +
    'rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-150';

  /* ── Page shell ───────────────────────────────────────────── */
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#E8EDF5] dark:bg-[#030712] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1526] rounded-3xl shadow-2xl shadow-indigo-100/40 dark:shadow-black/60 p-8 sm:p-10 relative border border-white dark:border-indigo-500/10">
        {children}
      </div>
    </div>
  );

  /* ── Brand Colors ────────────────────────────────────────── */
  const brandGradient = 'linear-gradient(90deg, #7c3aed, #06b6d4)';
  const brandButton = 'linear-gradient(135deg, #7c3aed, #2563eb)';

  /* ── OTP Request screen ───────────────────────────────────── */
  if (resetStep === 'request') {
    return (
      <Shell>
        <button onClick={() => { setResetStep('login'); setError(''); setOtp(''); setNewPassword(''); setConfirmPassword(''); }} className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Forgot</h1>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">your password?</h2>
        <p className="mt-2 text-sm" style={{ background: brandGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          No worries — enter your email and we'll send you an OTP.
        </p>

        {error && <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3">{error}</div>}

        <form onSubmit={handleRequestOTP} className="mt-7 space-y-4">
          <input id="otp-email" type="email" required autoComplete="email"
            placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
          <button type="submit" disabled={isSubmitting}
            style={{ background: brandButton }}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
          </button>
        </form>
      </Shell>
    );
  }

  /* ── OTP Verify screen ───────────────────────────────────── */
  if (resetStep === 'verify') {
    return (
      <Shell>
        <button onClick={() => { setResetStep('request'); setError(''); setOtp(''); setNewPassword(''); setConfirmPassword(''); }} className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Enter OTP &</h1>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">New Password</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">OTP sent to <span className="font-semibold text-gray-700 dark:text-gray-200">{email}</span></p>

        {error && <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3">{error}</div>}

        <form onSubmit={handleResetPassword} className="mt-7 space-y-4" autoComplete="off">
          <input
            type="text"
            required
            maxLength={6}
            inputMode="numeric"
            name="otp-code"
            autoComplete="one-time-code"
            placeholder="6-digit OTP"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            className={inputCls + ' text-center text-xl tracking-[0.4em] font-bold'}
          />
          <input
            type="password"
            required
            name="new-password"
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            required
            name="confirm-new-password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className={inputCls}
          />
          <button type="submit" disabled={isSubmitting}
            style={{ background: brandButton }}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      </Shell>
    );
  }

  /* ── Main Login screen ─────────────────────────────────────── */
  return (
    <Shell>
      {/* Heading */}
      <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">Welcome back!</h1>
      <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">Login to account</h2>


      {/* Success banner */}
      {resetSuccess && (
        <div className="mt-4 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl px-4 py-3 font-medium">
          ✓ Password reset successful! Please log in.
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-3">
        {/* Email */}
        <input
          id="email" type="email" autoComplete="email" required
          placeholder="Email address" value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputCls}
        />

        {/* Password */}
        <div className="relative">
          <input
            id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
            placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputCls + ' pr-12'}
          />
          <button
            type="button" tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Log In button */}
        <button
          type="submit" disabled={isSubmitting}
          style={{ background: brandButton }}
          className="w-full mt-1 py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
        </button>
      </form>

      {/* Remember me + Forgot password */}
      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 accent-indigo-600 cursor-pointer"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => { setError(''); setResetStep('request'); }}
          className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
        >
          Forgot password?
        </button>
      </div>
    </Shell>
  );
};
