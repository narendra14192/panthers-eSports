import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3 gap-2.5",
    xl: "text-lg px-9 py-4 gap-3",
  };

  const variants = {
    primary: "bg-gradient-to-r from-flame-600 via-flame-500 to-flame-400 text-white shadow-flame-sm hover:shadow-flame-md hover:brightness-110 border-t border-flame-300/40 clip-hud-sm",
    secondary: "bg-panther-800 hover:bg-panther-750 text-gray-200 hover:text-white border border-panther-700/60 hover:border-flame-500/50 clip-hud-sm",
    accent: "bg-gradient-to-r from-amber-gold via-amber-400 to-yellow-500 text-panther-950 font-extrabold shadow-gold-glow hover:brightness-105 clip-hud-sm",
    danger: "bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-lg shadow-red-950/50 border border-red-500/40 clip-hud-sm",
    outline: "bg-transparent border-2 border-flame-500 text-flame-400 hover:bg-flame-500/10 hover:text-flame-300 clip-hud-sm",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-panther-800/60",
    cyan: "bg-gradient-to-r from-cyan-600 to-cyan-400 text-panther-950 font-extrabold shadow-cyan-glow hover:brightness-105 clip-hud-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} transition-transform group-hover:scale-110`} />}
      <span>{children}</span>
    </button>
  );
};
