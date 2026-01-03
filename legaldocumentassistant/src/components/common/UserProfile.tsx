import React from 'react';
import { ChevronDownIcon, UserIcon } from 'lucide-react';
interface UserProfileProps {
  email: string;
}
export function UserProfile({
  email
}: UserProfileProps) {
  return <div className="flex items-center space-x-2 cursor-pointer group">
      <div className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 rounded-full w-8 h-8 flex items-center justify-center">
        <UserIcon size={16} />
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-medium text-white">{email}</p>
      </div>
      <ChevronDownIcon size={16} className="text-white/70 group-hover:text-white transition-colors" />
    </div>;
}