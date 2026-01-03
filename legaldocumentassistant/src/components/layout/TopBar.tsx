import React from 'react';
import { SearchIcon, MenuIcon } from 'lucide-react';
import { NotificationsDropdown } from '../common/NotificationsDropdown';
import { ProfileDropdown } from '../common/ProfileDropdown';
interface TopBarProps {
  toggleSidebar: () => void;
}
export function TopBar({
  toggleSidebar
}: TopBarProps) {
  return <header className="bg-deep-navy/95 backdrop-blur-xl border-b border-white/10 py-3 px-4 flex items-center justify-between">
    <div className="flex items-center lg:hidden">
      <button onClick={toggleSidebar} className="text-white/70 hover:text-white focus:outline-none">
        <MenuIcon size={24} />
      </button>
    </div>
    <div className="flex-1 max-w-xl mx-auto lg:mx-0">
      <div className="relative">
        <input type="text" placeholder="Search documents, clauses, risks..." className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan" />
        <div className="absolute left-3 top-2.5 text-white/50">
          <SearchIcon size={18} />
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      {/* <NotificationsDropdown /> */}
      <div className="h-6 w-px bg-white/20"></div>
      <ProfileDropdown />
    </div>
  </header>;
}