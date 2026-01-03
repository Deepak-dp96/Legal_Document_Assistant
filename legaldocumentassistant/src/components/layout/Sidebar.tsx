import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, UploadIcon, FileTextIcon, AlertTriangleIcon, SettingsIcon, LogOutIcon, ChevronDownIcon, ChevronLeftIcon, BarChartIcon, BookOpenIcon, BellIcon, HelpCircleIcon, FolderIcon, ActivityIcon, PenToolIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
}
function NavItem({
  icon,
  label,
  to,
  isActive
}: NavItemProps) {
  return <Link to={to} className={isActive ? 'flex items-center space-x-3 p-3 rounded-xl bg-neon-cyan/20 text-neon-cyan font-medium border border-neon-cyan/40 transition-all duration-200' : 'flex items-center space-x-3 p-3 rounded-xl text-white/70 hover:text-neon-cyan hover:bg-white/10 transition-all duration-200'}>
    {icon}
    <span className="flex-1">{label}</span>
  </Link>;
}
export function Sidebar({
  isOpen,
  toggleSidebar
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    logout
  } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['dashboard', 'documents', 'agents', 'reports', 'other']);
  const toggleGroup = (group: string) => {
    if (expandedGroups.includes(group)) {
      setExpandedGroups(expandedGroups.filter(g => g !== group));
    } else {
      setExpandedGroups([...expandedGroups, group]);
    }
  };
  const isGroupExpanded = (group: string) => expandedGroups.includes(group);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return <motion.aside className={`bg-deep-navy/95 backdrop-blur-xl border-r border-white/10 flex flex-col ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 z-20`} initial={false} animate={{
    width: isOpen ? 256 : 80
  }}>
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center space-x-2">
        <img src="/Deeplex%20logo.png" alt="DeepLex Logo" className="w-8 h-8" />
        {isOpen && <h1 className="text-xl font-semibold text-white">DeepLex</h1>}
      </div>
      <button onClick={toggleSidebar} className="text-white/70 hover:text-white focus:outline-none hidden lg:block">
        <ChevronLeftIcon size={20} className={`transform transition-transform ${!isOpen && 'rotate-180'}`} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto py-4 px-3">
      <nav className="space-y-1">
        {/* Dashboard */}
        <div>
          <div className="flex items-center justify-between p-2 text-xs font-medium text-white/60 uppercase cursor-pointer hover:text-white/80 transition-colors" onClick={() => toggleGroup('dashboard')}>
            <span>{isOpen ? 'Dashboard' : ''}</span>
            {isOpen && <ChevronDownIcon size={16} className={`transform transition-transform ${isGroupExpanded('dashboard') ? 'rotate-180' : ''}`} />}
          </div>
          {(!isOpen || isGroupExpanded('dashboard')) && <div className="space-y-1 ml-1">
            <NavItem icon={<HomeIcon size={18} />} label="Home" to="/dashboard" isActive={location.pathname === '/dashboard'} />
            <NavItem icon={<BarChartIcon size={18} />} label="Analytics" to="/analytics" isActive={location.pathname === '/analytics'} />
          </div>}
        </div>

        {/* Documents */}
        <div>
          <div className="flex items-center justify-between p-2 text-xs font-medium text-white/60 uppercase cursor-pointer hover:text-white/80 transition-colors" onClick={() => toggleGroup('documents')}>
            <span>{isOpen ? 'Documents' : ''}</span>
            {isOpen && <ChevronDownIcon size={16} className={`transform transition-transform ${isGroupExpanded('documents') ? 'rotate-180' : ''}`} />}
          </div>
          {(!isOpen || isGroupExpanded('documents')) && <div className="space-y-1 ml-1">
            <NavItem icon={<UploadIcon size={18} />} label="Upload Document" to="/upload-document" isActive={location.pathname === '/upload-document'} />
            <NavItem icon={<FileTextIcon size={18} />} label="My Documents" to="/documents" isActive={location.pathname === '/documents'} />
            <NavItem icon={<FolderIcon size={18} />} label="Recent Uploads" to="/recent" isActive={location.pathname === '/recent'} />
          </div>}
        </div>

        {/* Agents */}
        <div>
          <div className="flex items-center justify-between p-2 text-xs font-medium text-white/60 uppercase cursor-pointer hover:text-white/80 transition-colors" onClick={() => toggleGroup('agents')}>
            <span>{isOpen ? 'AI Agents' : ''}</span>
            {isOpen && <ChevronDownIcon size={16} className={`transform transition-transform ${isGroupExpanded('agents') ? 'rotate-180' : ''}`} />}
          </div>
          {(!isOpen || isGroupExpanded('agents')) && <div className="space-y-1 ml-1">
            <NavItem icon={<FileTextIcon size={18} />} label="Clause Extraction" to="/agents/clause-extraction" isActive={location.pathname === '/agents/clause-extraction'} />
            <NavItem icon={<AlertTriangleIcon size={18} />} label="Risk Detection" to="/agents/risk-detection" isActive={location.pathname === '/agents/risk-detection'} />
            <NavItem icon={<PenToolIcon size={18} />} label="Drafting Agent" to="/agents/drafting" isActive={location.pathname === '/agents/drafting'} />
            <NavItem icon={<BookOpenIcon size={18} />} label="Summary Agent" to="/agents/summary" isActive={location.pathname === '/agents/summary'} />
          </div>}
        </div>

        {/* Reports */}
        <div>
          <div className="flex items-center justify-between p-2 text-xs font-medium text-white/60 uppercase cursor-pointer hover:text-white/80 transition-colors" onClick={() => toggleGroup('reports')}>
            <span>{isOpen ? 'Reports' : ''}</span>
            {isOpen && <ChevronDownIcon size={16} className={`transform transition-transform ${isGroupExpanded('reports') ? 'rotate-180' : ''}`} />}
          </div>
          {(!isOpen || isGroupExpanded('reports')) && <div className="space-y-1 ml-1">
            <NavItem icon={<FileTextIcon size={18} />} label="All Reports" to="/reports" isActive={location.pathname === '/reports'} />
            {/* <NavItem icon={<ActivityIcon size={18} />} label="Export History" to="/export-history" isActive={location.pathname === '/export-history'} /> */}
          </div>}
        </div>

        {/* Other */}
        <div>
          <div className="flex items-center justify-between p-2 text-xs font-medium text-white/60 uppercase">
            <span>{isOpen ? 'Other' : ''}</span>
          </div>
          <div className="space-y-1 ml-1">
            {/* <NavItem icon={<BellIcon size={18} />} label="Notifications" to="/notifications" isActive={location.pathname === '/notifications'} /> */}
            <NavItem icon={<SettingsIcon size={18} />} label="Settings" to="/settings" isActive={location.pathname === '/settings'} />
            <NavItem icon={<HelpCircleIcon size={18} />} label="Help & Support" to="/help" isActive={location.pathname === '/help'} />
          </div>
        </div>
      </nav>
    </div>

    <div className="border-t border-white/10 p-4">
      <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full">
        <LogOutIcon size={18} />
        <span className="flex-1">Logout</span>
      </button>
    </div>
  </motion.aside>;
}