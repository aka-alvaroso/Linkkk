import React, { useEffect, useState } from 'react'
import { TbX } from 'react-icons/tb';
import { cn } from '@/app/utils/cn';

interface DrawerProps {
  open: boolean;
  placement?: 'top-left' | 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
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
    const [show, setShow] = useState(open);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('keydown', handleEsc);

            setShow(true);
            setTimeout(() => setIsAnimating(true), 10);

            return () => {
                document.removeEventListener('keydown', handleEsc);
            };
        } else {
            setIsAnimating(false);
            const timeout = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [open]);

    if (!show) return null;

    const transitionVariants = {
        top: isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0',
        bottom: isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
        left: isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0',
        right: isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0',
    };

    const mainPlacement = placement.includes('top') ? 'top' 
                        : placement.includes('bottom') ? 'bottom'
                        : placement.includes('left') ? 'left' 
                        : 'right';

    const placementClasses = {
        'top-left': 'justify-start items-start',
        top: 'justify-center items-start',
        'top-right': 'justify-end items-start',
        right: 'justify-end items-center',
        'bottom-right': 'justify-end items-end',
        bottom: 'justify-center items-end',
        'bottom-left': 'justify-start items-end',
        left: 'justify-start items-center',
    };
    
    const sizeClasses = {
        xs: 'w-3/12 h-3/12',
        sm: 'w-4/12 h-4/12',
        md: 'w-5/12 h-5/12',
        lg: 'w-6/12 h-6/12',
        xl: 'w-7/12 h-7/12',
        '2xl': 'w-9/12 h-9/12',
        '3xl': 'w-11/12 h-11/12',
        full: 'w-full h-full',
    }

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
        'bg-light z-1002 transition-all duration-300 ease-in-out',
        sizeClasses[size],
        roundedClasses[rounded],
        transitionVariants[mainPlacement],
        className 
    );

    const overlayClasses = cn(
        'absolute inset-0 bg-dark/50 z-1001 transition-opacity duration-300',
        isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none',
        overlayClassName,
    );

    return (
        <div className={`fixed inset-0 flex z-1000 p-6 m-0 transition-all duration-300 ease-in-out ${placementClasses[placement]}`}>
            {modal && <div className={overlayClasses} onClick={open ? onClose : undefined} />}
            <div className={drawerClasses}>
                {children}
            </div>
        </div>
    );
  
}

export default Drawer