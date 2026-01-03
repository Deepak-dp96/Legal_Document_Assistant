import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, CheckCircleIcon, AlertTriangleIcon, FileTextIcon, XIcon } from 'lucide-react';
export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = [{
    id: 1,
    type: 'success',
    title: 'Analysis Complete',
    message: 'Risk Detection analysis for Service-Agreement-XYZ-Inc.docx is ready',
    time: '5 minutes ago',
    read: false
  }, {
    id: 2,
    type: 'info',
    title: 'Document Uploaded',
    message: 'MANISH P Internship Application.pdf has been successfully uploaded',
    time: '30 minutes ago',
    read: false
  }, {
    id: 3,
    type: 'success',
    title: 'Clause Extraction Complete',
    message: 'NDA-Acme-Corp-2023.pdf analysis completed with 98% confidence',
    time: '1 hour ago',
    read: false
  }, {
    id: 4,
    type: 'warning',
    title: 'High Risk Detected',
    message: '3 high-risk clauses found in Partnership-Agreement-2024.pdf',
    time: '2 hours ago',
    read: true
  }, {
    id: 5,
    type: 'info',
    title: 'Processing Started',
    message: 'Employment-Contract-Template.docx is being analyzed by Drafting Agent',
    time: '3 hours ago',
    read: true
  }];
  const unreadCount = notifications.filter(n => !n.read).length;
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon size={20} className="text-green-400" />;
      case 'warning':
        return <AlertTriangleIcon size={20} className="text-yellow-400" />;
      default:
        return <FileTextIcon size={20} className="text-blue-400" />;
    }
  };
  return <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="text-white/70 hover:text-white relative transition-colors">
        <BellIcon size={20} />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount}
          </span>}
      </button>

      <AnimatePresence>
        {isOpen && <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
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
        }} className="absolute right-0 mt-2 w-96 bg-[#0D1A30] border-2 border-white/30 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-white/20 flex items-center justify-between bg-[#0a1628]">
                <h3 className="font-semibold text-white text-lg">
                  Notifications
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                  <XIcon size={18} />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto bg-[#0D1A30]">
                {notifications.map(notification => <div key={notification.id} className={`p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer ${!notification.read ? 'bg-white/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-white/80 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-white/60 mt-2">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                        </div>}
                    </div>
                  </div>)}
              </div>

              <div className="p-3 border-t border-white/20 bg-[#0a1628]">
                <button className="w-full text-center text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors font-medium">
                  View All Notifications
                </button>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </div>;
}