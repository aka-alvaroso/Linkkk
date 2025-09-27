import React from 'react'
import { TbX } from 'react-icons/tb';
import { cn } from '@/app/utils/cn';

interface DrawerProps {
  open: boolean;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  rounded?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  modal?: boolean;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ 
    open = false, 
    placement = 'right', 
    modal = false,
    size = 'md', 
    rounded = 'md',
    children = null, 
    className,
    overlayClassName,
    onClose = () => {} 
}) => {
    if (!open) return null;

    const placementClasses = {
        left: 'left-0 top-1/2 -translate-y-1/2',
        right: 'right-0 top-1/2 -translate-y-1/2',
        top: 'top-0 left-1/2 -translate-x-1/2',
        bottom: 'bottom-0 left-1/2 -translate-x-1/2',
    };
    
    const sizeClasses = {
        sm: 'w-[400px] h-[600px]',
        md: 'w-[500px] h-[700px]',
        lg: 'w-[600px] h-[800px]',
        xl: 'w-[700px] h-[900px]',
        '2xl': 'w-[800px] h-[1000px]',
        '3xl': 'w-[900px] h-[1100px]',
        full: 'w-full h-full',
    };

    const roundedClasses = {
        none: 'rounded-none',
        xs: 'rounded-xs',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        '4xl': 'rounded-4xl',
        full: 'rounded-full',
    };

    const drawerClasses = cn(
        'fixed z-100 bg-light transform', 
        placementClasses[placement],
        sizeClasses[size],
        roundedClasses[rounded],
        className 
    );

    const overlayClasses = cn(
        'fixed inset-0 z-99 bg-black/50',
        overlayClassName
    );

    return (
        <>
            {modal && <div className={overlayClasses} />}
            <div className={drawerClasses}>
                {children}
                <button onClick={onClose} className="absolute top-4 right-4 hover:cursor-pointer">
                    <TbX size={20} />
                </button>
            </div>
        </>
    );
  
}

export default Drawer