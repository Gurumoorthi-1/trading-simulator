import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword, resetPassword } from '../utils/services';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm();
  const { register: registerReset, handleSubmit: handleResetSubmit, watch, formState: { errors: resetErrors } } = useForm();

  const newPassword = watch("newPassword", "");

  const onEmailSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await forgotPassword(data.email);
      setEmailAddress(data.email);
      setIsSubmitted(true);
      toast.success(res.message || 'OTP sent successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to request password reset.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await resetPassword(emailAddress, data.otp, data.newPassword);
      toast.success(res.message || 'Password reset successful!');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password. Please check your OTP.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to login
      </Link>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
        <p className="text-slate-400">
          {isSubmitted
            ? `We've sent a 6-digit OTP code to ${emailAddress} to reset your password.`
            : "Enter your email address and we'll send you an OTP to reset your password."}
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                {...registerEmail('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                className={`input-field pl-10 ${emailErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="you@example.com"
              />
            </div>
            {emailErrors.email && <p className="mt-1 text-sm text-red-500">{emailErrors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(14,165,233,0.3)]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>Send OTP Code <Send size={18} /></>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-5">
          {/* Honeypot for Chrome Autofill so it doesn't overwrite the OTP box */}
          <input type="text" style={{ display: 'none' }} autoComplete="username" defaultValue={emailAddress || ''} />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">OTP Code (6 Digits)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <ShieldCheck size={18} />
              </div>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                {...registerReset('otp', {
                  required: 'OTP is required',
                  minLength: { value: 6, message: 'OTP must be 6 digits' }
                })}
                className={`input-field pl-10 ${resetErrors.otp ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="123456"
              />
            </div>
            {resetErrors.otp && <p className="mt-1 text-sm text-red-500">{resetErrors.otp.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...registerReset('newPassword', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must have at least 8 characters' }
                })}
                className={`input-field pl-10 pr-10 ${resetErrors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {resetErrors.newPassword && <p className="mt-1 text-sm text-red-500">{resetErrors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...registerReset('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === newPassword || "The passwords do not match"
                })}
                className={`input-field pl-10 ${resetErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="••••••••"
              />
            </div>
            {resetErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{resetErrors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(14,165,233,0.3)]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>Reset Password</>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
