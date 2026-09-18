import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-panther-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Cyber HUD Container */}
      <div className={`relative w-full ${maxWidth} bg-panther-900 border border-panther-700/80 shadow-card-dark clip-hud my-8 z-10 animate-in fade-in zoom-in-95 duration-150`}>
        {/* Top flame glow line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-flame-500 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-panther-800 bg-panther-850/50">
          <div>
            <h3 className="text-xl sm:text-2xl font-orbitron font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span className="w-2 h-5 bg-flame-500 inline-block clip-hud-sm" />
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-gray-400 font-sans">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded bg-panther-800/80 hover:bg-flame-500/20 hover:border-flame-500 border border-transparent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
