import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FullScreenLoaderProps {
    message?: string;
    subMessage?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
    message = 'Loading...',
    subMessage
}) => {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center max-w-md w-full mx-4"
            >
                <div className="p-4 bg-blue-50 rounded-full mb-6">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{message}</h3>
                {subMessage && (
                    <p className="text-gray-500 text-center">{subMessage}</p>
                )}
            </motion.div>
        </div>
    );
};
