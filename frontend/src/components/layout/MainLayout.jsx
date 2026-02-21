import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 lg:ml-[260px] p-4 md:p-8 lg:p-10 transition-all duration-300 ease-in-out overflow-x-hidden"
            >
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </motion.main>
        </div>
    );
};

export default MainLayout;
