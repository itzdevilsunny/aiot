import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'copilot' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5"
  };

  const variantStyles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-xs border border-slate-900 active:scale-[0.99]",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80 active:scale-[0.99]",
    copilot: "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-sm border border-indigo-500/30 active:scale-[0.99]",
    outline: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-xs active:scale-[0.99]",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-xs border border-red-600 active:scale-[0.99]"
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
