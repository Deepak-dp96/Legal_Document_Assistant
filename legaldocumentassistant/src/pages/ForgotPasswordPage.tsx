import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MailIcon, ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';
import { authService } from '../services/authService';
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setIsSubmitted(true);
      } else {
        setError(response.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-deep-navy">
    {/* Animated Mesh Background */}
    <div className="absolute inset-0 mesh-background"></div>

    {/* Particles */}
    <div className="particles">
      {[...Array(20)].map((_, i) => <div key={i} className="particle" style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${15 + Math.random() * 10}s`
      }} />)}
    </div>

    {/* Holographic Glow Effects */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-royal-blue/10 rounded-full blur-3xl"></div>

    <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }} className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative px-4 sm:px-0">
      <div className="glass-card-premium p-8">
        {!isSubmitted ? <>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Forgot Password?
            </h2>
            <p className="text-white/70">
              Enter your email and we'll send you a new password
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MailIcon size={18} className="text-white/50" />
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-12 block w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20 py-3 px-4 transition-all" placeholder="your.email@example.com" />
              </div>
            </div>

            <button type="submit" className="w-full btn-neon py-3.5 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send New Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="flex items-center justify-center text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors">
              <ArrowLeftIcon size={16} className="mr-2" />
              Back to Login
            </Link>
          </div>
        </> : <div className="text-center">
          <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            duration: 0.5,
            type: 'spring'
          }}>
            <CheckCircleIcon size={64} className="text-green-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Password Reset Sent!
          </h2>
          <p className="text-white/70 mb-6">
            We've sent a new password to{' '}
            <strong className="text-white">{email}</strong>
          </p>
          <p className="text-sm text-white/60 mb-6">
            Please check your email inbox (and spam folder) for your new password. Use it to login and change it immediately for security.
          </p>
          <Link to="/login" className="btn-secondary inline-flex">
            Return to Login
          </Link>
        </div>}
      </div>
    </motion.div>
  </div>;
}