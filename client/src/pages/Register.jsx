import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../context/store';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register: registerUser, isLoading } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch("password", "");

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 6) score += 1;
    if (pwd.length > 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);

  const onSubmit = async (data) => {
    const result = await registerUser(data.name, data.email, data.password);

    if (result.success) {
      toast.success(result.message || 'Account created successfully!');
      navigate('/login');
    } else {
      toast.error(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-slate-400">Join the simulation and master the markets.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <User size={18} />
            </div>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="input-field pl-10"
              placeholder="John Doe"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Mail size={18} />
            </div>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              className="input-field pl-10"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must have at least 8 characters' }
              })}
              className="input-field pl-10 pr-10"
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
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}

          {password.length > 0 && (
            <div className="mt-2 flex gap-1 h-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`flex-1 rounded-full ${strength >= level ? strength <= 2 ? 'bg-red-500' : strength <= 3 ? 'bg-yellow-500' : 'bg-green-500' : 'bg-dark-border'}`}
                ></div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <ShieldCheck size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || "The passwords do not match"
              })}
              className="input-field pl-10"
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer text-slate-400 text-sm">
            <input
              type="checkbox"
              {...register('terms', { required: 'You must accept the terms' })}
              className="mt-1 rounded border-dark-border bg-dark-bg text-primary-500 focus:ring-primary-500/50"
            />
            <span>
              I agree to the <a href="#" className="text-primary-500 hover:text-primary-400">Terms of Service</a> and <a href="#" className="text-primary-500 hover:text-primary-400">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(14,165,233,0.3)]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>Create Account <UserPlus size={18} /></>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-400">
        Already have an account? <Link to="/login" className="text-white hover:text-primary-400 font-medium">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
