import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  isLoading = false, 
  className = '', 
  disabled, 
  ...props 
}) => {
  const baseStyles = "font-body font-normal transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "btn-primary",
    secondary: "bg-cream border border-sand text-charcoal hover:bg-sand/20 rounded-lg",
    outline: "bg-transparent border border-gold text-gold hover:bg-gold/5 rounded-lg",
    ghost: "text-brown hover:text-charcoal bg-transparent"
  };

  const sizes = {
    default: "px-6 py-4 text-sm tracking-wide",
    sm: "px-4 py-2 text-xs",
    lg: "px-8 py-5 text-base"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading} 
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : children}
    </button>
  );
};

export default Button;
