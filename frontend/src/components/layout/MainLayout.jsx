import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const MainLayout = ({ children }) => {
    const location = useLocation();
    const isExpediente = location.pathname.startsWith('/expediente');
    const [isCollapsed, setIsCollapsed] = useState(isExpediente);

    // Auto-collapse when entering expediente, expand (if preferred) otherwise or just sync
    useEffect(() => {
        if (isExpediente) {
            setIsCollapsed(true);
        }
    }, [location.pathname, isExpediente]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out overflow-x-hidden p-4 md:p-8 lg:p-10",
                    isCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
                )}
            >
                {children}
            </motion.main>
        </div>
    );
};

export default MainLayout;
