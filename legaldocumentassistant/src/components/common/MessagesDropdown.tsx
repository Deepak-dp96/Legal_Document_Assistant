import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareTextIcon, XIcon, UserIcon } from 'lucide-react';
export function MessagesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const messages = [{
    id: 1,
    sender: 'Sarah Legal',
    email: 'sarah.legal@example.com',
    message: 'Can you review the NDA document I uploaded? I need your feedback on the confidentiality clauses.',
    time: '10 minutes ago',
    read: false
  }, {
    id: 2,
    sender: 'John Doe',
    email: 'john.doe@example.com',
    message: 'The risk analysis report looks great, thanks! When can we discuss the findings?',
    time: '1 hour ago',
    read: false
  }, {
    id: 3,
    sender: 'Admin Team',
    email: 'admin@deeplex.com',
    message: 'Your monthly usage report is ready. You have processed 187 documents this month.',
    time: '3 hours ago',
    read: true
  }];
  const unreadCount = messages.filter(m => !m.read).length;
  return <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="text-white/70 hover:text-white relative transition-colors">
        <MessageSquareTextIcon size={20} />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-neon-cyan text-deep-navy text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount}
          </span>}
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
        }} className="absolute right-0 mt-2 w-96 glass-card-premium border border-white/20 rounded-xl shadow-2xl z-40 overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white">Messages</h3>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                  <XIcon size={18} />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {messages.map(message => <div key={message.id} className={`p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer ${!message.read ? 'bg-white/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-neon-cyan/20 rounded-full flex items-center justify-center border border-neon-cyan/40">
                          <UserIcon size={18} className="text-neon-cyan" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white">
                            {message.sender}
                          </p>
                          {!message.read && <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>}
                        </div>
                        <p className="text-xs text-white/60">{message.email}</p>
                        <p className="text-sm text-white/80 mt-1 line-clamp-2">
                          {message.message}
                        </p>
                        <p className="text-xs text-white/50 mt-2">
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </div>)}
              </div>

              <div className="p-3 border-t border-white/10">
                <button className="w-full text-center text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors">
                  View All Messages
                </button>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </div>;
}