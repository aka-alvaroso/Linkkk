import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom';
import { TbArrowLeft } from 'react-icons/tb';
import { cn } from '@/app/utils/cn';
import { useTranslations } from 'next-intl';

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
    onClose = () => { }
}) => {
    const t = useTranslations('Common');
    const [show, setShow] = useState(open);
    const [isAnimating, setIsAnimating] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (open) {
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('keydown', handleEsc);

            // Prevent background scroll
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;

            setShow(true);
            setTimeout(() => setIsAnimating(true), 10);

            return () => {
                document.removeEventListener('keydown', handleEsc);
                // Restore background scroll
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            };
        } else {
            setIsAnimating(false);
            const timeout = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [open, onClose]);

    if (!show || !mounted) return null;

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
        xs: 'w-full md:w-3/12 h-3/12',
        sm: 'w-full md:w-4/12 h-4/12',
        md: 'w-full md:w-5/12 h-5/12',
        lg: 'w-full md:w-6/12 h-6/12',
        xl: 'w-full md:w-7/12 h-7/12',
        '2xl': 'w-full md:w-9/12 h-9/12',
        '3xl': 'w-full md:w-11/12 h-11/12',
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
        'bg-light z-[9999] transition-all duration-300 ease-in-out',
        sizeClasses[size],
        roundedClasses[rounded],
        transitionVariants[mainPlacement],
        className
    );

    const overlayClasses = cn(
        'absolute inset-0 bg-dark/50 z-[9998] transition-opacity duration-300',
        isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none',
        overlayClassName,
    );

    const drawerContent = (
        <div className={`fixed inset-0 flex z-[9997] sm:p-6 m-0 transition-all duration-300 ease-in-out ${placementClasses[placement]}`}>
            {modal && <div className={overlayClasses} onClick={open ? onClose : undefined} />}
            <div className={cn(drawerClasses, 'relative')}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark/5 transition-colors z-10"
                    aria-label={t('closeDrawer')}
                >
                    <TbArrowLeft size={20} className="text-dark" strokeWidth={2.5} />
                </button>
                {children}
            </div>
        </div>
    );

    return createPortal(drawerContent, document.body);
}

export default Drawer