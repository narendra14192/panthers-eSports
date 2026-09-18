import React from 'react';

export const Badge = ({ status, text, size = 'md', className = '' }) => {
  const norm = (status || text || '').toLowerCase();

  let styles = "bg-panther-800 text-gray-300 border-panther-700";
  let dotColor = "bg-gray-400";
  let label = text || status;

  if (norm === 'live') {
    styles = "bg-red-950/80 text-red-400 border-red-600/60 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse";
    dotColor = "bg-red-500 animate-ping";
    label = label || "LIVE NOW";
  } else if (norm === 'upcoming') {
    styles = "bg-amber-950/70 text-amber-300 border-amber-500/50";
    dotColor = "bg-amber-400";
    label = label || "UPCOMING";
  } else if (norm === 'completed') {
    styles = "bg-panther-850 text-gray-400 border-panther-700";
    dotColor = "bg-gray-500";
    label = label || "COMPLETED";
  } else if (norm === 'open') {
    styles = "bg-emerald-950/70 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
    dotColor = "bg-emerald-400";
    label = label || "OPEN";
  } else if (norm === 'booked') {
    styles = "bg-flame-950/70 text-flame-400 border-flame-600/40";
    dotColor = "bg-flame-500";
    label = label || "BOOKED";
  } else if (norm === 'checked_in') {
    styles = "bg-cyan-950/70 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]";
    dotColor = "bg-cyan-400";
    label = label || "CHECKED IN";
  } else if (norm === 'pending' || norm === 'pending_verification') {
    styles = "bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]";
    dotColor = "bg-amber-400 animate-pulse";
    label = label || "PENDING UTR";
  }

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-semibold",
    md: "text-xs px-2.5 py-1 gap-1.5 font-bold",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-extrabold",
  };

  return (
    <span className={`inline-flex items-center uppercase tracking-wider font-rajdhani rounded-sm border ${sizes[size]} ${styles} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};
