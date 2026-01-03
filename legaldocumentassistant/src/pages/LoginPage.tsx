import React from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from '../components/auth/LoginForm';

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-deep-navy">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 mesh-background"></div>

      {/* Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Holographic Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-royal-blue/10 rounded-full blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          <motion.img
            src="/ChatGPT_Image_Nov_19%2C_2025%2C_09_28_42_AM.png"
            alt="DeepLex Logo"
            className="w-20 h-20 mx-auto mb-6 animate-float"
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(0, 229, 255, 0.5))',
                'drop-shadow(0 0 40px rgba(0, 229, 255, 0.8))',
                'drop-shadow(0 0 20px rgba(0, 229, 255, 0.5))'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h1 className="text-4xl font-bold text-white mb-3 neon-text">
            DeepLex
          </h1>
          <p className="text-neon-cyan text-lg max-w-md mx-auto font-medium">
            Illuminate Legal Intelligence with AI
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative px-4 sm:px-0"
      >
        <LoginForm />
      </motion.div>
    </div>
  );
}