import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const DragDropZone = ({
    onFilesSelected,
    accept = "*",
    multiple = false,
    label = "Arrastra y suelta tus archivos aquí",
    subLabel = "O haz clic para seleccionar (PDF, JPG, PNG)",
    className
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onFilesSelected(multiple ? files : files[0]);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onFilesSelected(multiple ? files : files[0]);
            e.target.value = null; // Reset for next selection
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={cn(
                "relative group cursor-pointer transition-all duration-300",
                "border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center text-center",
                isDragging
                    ? "border-indigo-500 bg-indigo-50/50 scale-[1.01] shadow-xl shadow-indigo-100/50"
                    : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-white hover:shadow-lg hover:shadow-slate-100",
                className
            )}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
            />

            <div className={cn(
                "h-20 w-20 rounded-3xl flex items-center justify-center transition-all duration-500 mb-6",
                isDragging
                    ? "bg-indigo-500 text-white rotate-12 scale-110"
                    : "bg-white text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 shadow-sm"
            )}>
                {isDragging ? <CheckCircle2 size={40} /> : <Upload size={40} />}
            </div>

            <div className="space-y-2">
                <h3 className={cn(
                    "text-lg font-black tracking-tight transition-colors",
                    isDragging ? "text-indigo-600" : "text-slate-800"
                )}>
                    {label}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {subLabel}
                </p>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-200 group-hover:border-indigo-300 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-200 group-hover:border-indigo-300 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-200 group-hover:border-indigo-300 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-200 group-hover:border-indigo-300 rounded-br-lg" />
        </div>
    );
};

export default DragDropZone;
