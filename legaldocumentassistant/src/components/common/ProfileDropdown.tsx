import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserIcon, SettingsIcon, LogOutIcon, ChevronDownIcon, HelpCircleIcon } from 'lucide-react';
export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {
    user,
    logout
  } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return <div className="relative">
    <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 cursor-pointer group">
      <div className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 rounded-full w-8 h-8 flex items-center justify-center">
        <UserIcon size={16} />
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-medium text-white">
          {user?.email || 'user@example.com'}
        </p>
      </div>
      <ChevronDownIcon size={16} className={`text-white/70 group-hover:text-white transition-all ${isOpen ? 'rotate-180' : ''}`} />
    </button>

    <AnimatePresence>
      {isOpen && <>
        <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
        <motion.div initial={{
          opacity: 0,
          y: 10,
          scale: 0.95
        }} animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }} exit={{
          opacity: 0,
          y: 10,
          scale: 0.95
        }} transition={{
          duration: 0.2
        }} className="absolute right-0 mt-2 w-64 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-40">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 rounded-full w-12 h-12 flex items-center justify-center">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-white/60">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button onClick={() => {
              navigate('/settings');
              setIsOpen(false);
            }} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-white">
              <SettingsIcon size={18} className="text-white/70" />
              <span className="text-sm">Settings</span>
            </button>
            <button onClick={() => {
              navigate('/help');
              setIsOpen(false);
            }} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-white">
              <HelpCircleIcon size={18} className="text-white/70" />
              <span className="text-sm">Help & Support</span>
            </button>
          </div>

          <div className="p-2 border-t border-white/10">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-500/10 transition-colors text-red-400">
              <LogOutIcon size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </motion.div>
      </>}
    </AnimatePresence>
  </div>;
}