import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LockIcon, MailIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['Admin', 'User', 'Auditor']),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});
type RegisterFormData = z.infer<typeof registerSchema>;
export function RegisterForm() {
  const navigate = useNavigate();
  const {
    register: registerUser
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'User',
      terms: false
    }
  });
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    try {
      await registerUser(data.name, data.email, data.password, data.role);
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return <motion.div className="glass-card-premium p-8 w-full max-w-md mx-auto" initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }}>
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
          <img src="/ChatGPT_Image_Nov_19%2C_2025%2C_09_28_42_AM.png" alt="DeepLex Logo" className="w-20 h-20" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
        <p className="text-white/70 mt-2">Join DeepLex to get started</p>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <UserIcon size={18} className="text-white/50" />
            </div>
            <input id="name" type="text" {...register('name')} className="pl-12 block w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20 py-3 px-4 transition-all" placeholder="John Doe" />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MailIcon size={18} className="text-white/50" />
            </div>
            <input id="email" type="email" {...register('email')} className="pl-12 block w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20 py-3 px-4 transition-all" placeholder="your.email@example.com" />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockIcon size={18} className="text-white/50" />
            </div>
            <input id="password" type="password" {...register('password')} className="pl-12 block w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20 py-3 px-4 transition-all" placeholder="••••••••" />
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockIcon size={18} className="text-white/50" />
            </div>
            <input id="confirmPassword" type="password" {...register('confirmPassword')} className="pl-12 block w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20 py-3 px-4 transition-all" placeholder="••••••••" />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>}
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-white/90 mb-1">
            Role
          </label>
          <select id="role" {...register('role')} className="block w-full bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20 py-3 px-4 transition-all">
            <option value="Admin" className="bg-gray-800">Admin</option>
            <option value="User" className="bg-gray-800">User</option>
            <option value="Auditor" className="bg-gray-800">Auditor</option>
          </select>
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
        </div>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input id="terms" type="checkbox" {...register('terms')} className="h-4 w-4 text-neon-cyan focus:ring-neon-cyan border-white/30 rounded bg-white/10" />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-white/90">
              I agree to the{' '}
              <a href="#" className="text-blue-300 hover:text-blue-200 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-300 hover:text-blue-200 underline">
                Privacy Policy
              </a>
            </label>
            {errors.terms && <p className="mt-1 text-sm text-red-600">
                {errors.terms.message}
              </p>}
          </div>
        </div>
        <div>
          <button type="submit" className="w-full btn-neon py-3.5 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-white/80">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200 underline">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </motion.div>;
}