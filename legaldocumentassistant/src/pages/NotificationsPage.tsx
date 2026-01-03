import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, AlertTriangleIcon, FileTextIcon, CheckIcon, TrashIcon, FilterIcon } from 'lucide-react';
export function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const notifications = [{
    id: 1,
    type: 'success',
    title: 'Analysis Complete',
    message: 'Risk Detection analysis for Service-Agreement-XYZ-Inc.docx is ready',
    time: '5 minutes ago',
    read: false,
    date: 'Today'
  }, {
    id: 2,
    type: 'info',
    title: 'Document Uploaded',
    message: 'MANISH P Internship Application.pdf has been successfully uploaded',
    time: '30 minutes ago',
    read: false,
    date: 'Today'
  }, {
    id: 3,
    type: 'success',
    title: 'Clause Extraction Complete',
    message: 'NDA-Acme-Corp-2023.pdf analysis completed with 98% confidence',
    time: '1 hour ago',
    read: false,
    date: 'Today'
  }, {
    id: 4,
    type: 'warning',
    title: 'High Risk Detected',
    message: '3 high-risk clauses found in Partnership-Agreement-2024.pdf',
    time: '2 hours ago',
    read: true,
    date: 'Today'
  }, {
    id: 5,
    type: 'info',
    title: 'Processing Started',
    message: 'Employment-Contract-Template.docx is being analyzed by Drafting Agent',
    time: '3 hours ago',
    read: true,
    date: 'Today'
  }, {
    id: 6,
    type: 'success',
    title: 'Report Generated',
    message: 'Monthly analytics report is ready for download',
    time: 'Yesterday',
    read: true,
    date: 'Yesterday'
  }, {
    id: 7,
    type: 'warning',
    title: 'Compliance Alert',
    message: 'New compliance requirements detected in recent uploads',
    time: '2 days ago',
    read: true,
    date: '2 days ago'
  }];
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });
  const unreadCount = notifications.filter(n => !n.read).length;
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon size={24} className="text-green-500" />;
      case 'warning':
        return <AlertTriangleIcon size={24} className="text-yellow-500" />;
      default:
        return <FileTextIcon size={24} className="text-blue-500" />;
    }
  };
  return <MainLayout backgroundColor="bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          {/* Header */}
          <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeftIcon size={20} className="mr-2" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Notifications
              </h1>
              <p className="text-gray-600">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                <CheckIcon size={16} className="mr-2" />
                Mark All Read
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                <TrashIcon size={16} className="mr-2" />
                Clear All
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FilterIcon size={20} className="text-gray-600" />
              <div className="flex space-x-2">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  All
                </button>
                <button onClick={() => setFilter('unread')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Unread ({unreadCount})
                </button>
                <button onClick={() => setFilter('read')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Read
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => <motion.div key={notification.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05,
            duration: 0.3
          }} className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer ${!notification.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mt-2"></div>}
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {notification.time}
                      </p>
                      <div className="flex space-x-2">
                        {!notification.read && <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
                            Mark as read
                          </button>}
                        <button className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>)}
          </div>

          {filteredNotifications.length === 0 && <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileTextIcon size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' ? "You're all caught up!" : 'Try adjusting your filters'}
              </p>
            </div>}
        </motion.div>
      </div>
    </MainLayout>;
}