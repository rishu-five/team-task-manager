import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/services';
import { Loader2, Eye, EyeOff, User, Shield } from 'lucide-react';

/* ── Page shell (defined outside to avoid losing input focus on every keystroke) ───────────────── */
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#E8EDF5] dark:bg-[#030712] flex items-center justify-center p-4 transition-colors">
    <div className="w-full max-w-md bg-white dark:bg-[#0D1526] rounded-3xl shadow-2xl shadow-indigo-100/40 dark:shadow-black/60 p-8 sm:p-10 relative border border-white dark:border-indigo-500/10">
      {children}
    </div>
  </div>
);

export const Signup: React.FC = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [fullName, setFullName]         = useState('');
  const [userType, setUserType]         = useState('member');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await authApi.signup({
        email,
        password,
        full_name: fullName,
        user_type: userType,
      });
      
      // Auto login after signup
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const data = await authApi.login(formData);
      localStorage.setItem('token', data.access_token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Shared input class ────────────────────────────────────── */
  const inputCls =
    'w-full bg-[#EEF2FF] dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 ' +
    'border border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-700 ' +
    'rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-150';

  /* ── Brand Colors ────────────────────────────────────────── */
  const brandButton = 'linear-gradient(135deg, #7c3aed, #2563eb)';

  return (
    <Shell>
      {/* Heading */}
      <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">Join us today!</h1>
      <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">Create account</h2>

      {/* Error banner */}
      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-3">
        {/* Full Name */}
        <input
          id="fullName"
          type="text"
          required
          placeholder="Full name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className={inputCls}
        />

        {/* Email */}
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputCls}
        />

        {/* Password */}
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputCls + ' pr-12'}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Account Role Selector */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Account Role
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setUserType('member')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 text-center cursor-pointer ${
                userType === 'member'
                  ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10 font-bold shadow-md shadow-indigo-500/5'
                  : 'border-gray-100 dark:border-gray-800 bg-[#EEF2FF]/50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 hover:bg-[#EEF2FF] dark:hover:bg-gray-800/80 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <User className={`h-4.5 w-4.5 mb-1 transition-colors ${userType === 'member' ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400'}`} />
              <span className="text-xs font-bold">Member</span>
            </button>
            
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 text-center cursor-pointer ${
                userType === 'admin'
                  ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10 font-bold shadow-md shadow-indigo-500/5'
                  : 'border-gray-100 dark:border-gray-800 bg-[#EEF2FF]/50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 hover:bg-[#EEF2FF] dark:hover:bg-gray-800/80 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Shield className={`h-4.5 w-4.5 mb-1 transition-colors ${userType === 'admin' ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400'}`} />
              <span className="text-xs font-bold">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setUserType('super_admin')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 text-center cursor-pointer ${
                userType === 'super_admin'
                  ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10 font-bold shadow-md shadow-indigo-500/5'
                  : 'border-gray-100 dark:border-gray-800 bg-[#EEF2FF]/50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 hover:bg-[#EEF2FF] dark:hover:bg-gray-800/80 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Shield className={`h-4.5 w-4.5 mb-1 transition-colors ${userType === 'super_admin' ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400'}`} />
              <span className="text-xs font-bold">S. Admin</span>
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: brandButton }}
          className="w-full !mt-5 py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
        </button>
      </form>

      {/* Sign In Link */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
        >
          Sign In here
        </button>
      </div>
    </Shell>
  );
};
