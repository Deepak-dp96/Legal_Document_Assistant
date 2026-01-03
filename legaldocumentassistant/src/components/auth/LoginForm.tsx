import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LockIcon, MailIcon, AlertCircleIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
});
type LoginFormData = z.infer<typeof loginSchema>;
export function LoginForm() {
  const navigate = useNavigate();
  const {
    login
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'jagadeesh@gmail.com',
      password: 'jagadeesh',
      rememberMe: false
    }
  });
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Attempting login with:', data.email);
      await login(data.email, data.password);
      console.log('Login successful, navigating to dashboard...');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  return <motion.div className="glass-card-premium p-8 w-full max-w-md mx-auto" initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} transition={{
    duration: 0.5
  }}>
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
      <p className="text-white/70">Sign in to your account</p>
    </div>

    {error && <motion.div initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} className="mb-4 p-4 bg-red-500/20 border border-red-500/40 rounded-xl flex items-start space-x-3">
      <AlertCircleIcon size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-300">Login Failed</p>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    </motion.div>}

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MailIcon size={18} className="text-white/50" />
          </div>
          <input type="email" {...register('email')} className="pl-12 block w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20 py-3 px-4 transition-all" placeholder="your.email@example.com" />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LockIcon size={18} className="text-white/50" />
          </div>
          <input type="password" {...register('password')} className="pl-12 block w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20 py-3 px-4 transition-all" placeholder="••••••••" />
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-400">
          {errors.password.message}
        </p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input id="remember-me" type="checkbox" {...register('rememberMe')} className="h-4 w-4 text-neon-cyan focus:ring-neon-cyan border-white/20 rounded bg-white/10" />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
            Remember me
          </label>
        </div>
        <Link to="/forgot-password" className="text-sm font-medium text-neon-cyan hover:text-neon-cyan/80 transition-colors">
          Forgot password?
        </Link>
      </div>

      <button type="submit" className="w-full btn-neon py-3.5 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full holo-line"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-deep-navy text-white/50">
            Or continue with
          </span>
        </div>
      </div>

      <button type="button" className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign in with Google
      </button>

      <div className="text-center mt-6">
        <p className="text-sm text-white/70">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-neon-cyan hover:text-neon-cyan/80 transition-colors">
            Register now
          </Link>
        </p>
      </div>
    </form>

    <div className="mt-8 pt-6 border-t border-white/10 text-center">
      <p className="text-xs text-white/50">Powered by DeepLex AI</p>
    </div>
  </motion.div>;
}