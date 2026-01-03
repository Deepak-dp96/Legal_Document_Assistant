import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion } from 'framer-motion';
interface MainLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
}
export function MainLayout({
  children,
  backgroundColor = 'bg-[#0D1A30]'
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return <div className={`flex h-screen ${backgroundColor}`}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar toggleSidebar={toggleSidebar} />
        <motion.main className="flex-1 overflow-auto p-6" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.3
      }}>
          {children}
        </motion.main>
      </div>
    </div>;
}