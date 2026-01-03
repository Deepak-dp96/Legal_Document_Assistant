import React from 'react';
import { motion } from 'framer-motion';
import { RegisterForm } from '../components/auth/RegisterForm';
export function RegisterPage() {
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
        <RegisterForm />
      </motion.div>
    </div>;
}