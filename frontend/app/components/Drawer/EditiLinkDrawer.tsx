import React, { useState, useEffect, useCallback, useRef } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import { FiCornerDownRight } from 'react-icons/fi';
import { TbChartBar, TbCircleDashed, TbCircleDashedCheck, TbCopy, TbSettings } from 'react-icons/tb';
import Button from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import { useLinks } from '@/app/hooks';
import type { Link } from '@/app/types';
import { AccessesList } from '../Accesses/accessesList';
import { useToast } from '@/app/hooks/useToast';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { RulesManager } from '../LinkRules/RulesManager';
import AnimatedText, { AnimatedTextRef } from '../ui/AnimatedText';

interface EditiLinkDrawerProps {
    open: boolean;
    onClose: () => void;
    link: Link;
}

export default function EditiLinkDrawer({ open, onClose, link }: EditiLinkDrawerProps) {
    const { updateLink, fetchLinks } = useLinks();
    const toast = useToast();
    const [tab, setTab] = useState('settings');
    const [statusBar, setShowStatusBar] = useState("none");
    const [newLink, setNewLink] = useState({...link});
    const [showCopyShortUrlButton, setShowCopyShortUrlButton] = useState(false);
    const [showCopyLongUrlButton, setShowCopyLongUrlButton] = useState(false);

    // Ref for animated text
    const shortUrlTextRef = useRef<AnimatedTextRef>(null);
    const longUrlTextRef = useRef<AnimatedTextRef>(null);
    const statusButtonTextRef = useRef<AnimatedTextRef>(null);

    // Status bar

    // Rules state
    const [hasRulesChanges, setHasRulesChanges] = useState(false);
    const saveRulesRef = useRef<(() => Promise<void>) | null>(null);
    const cancelRulesRef = useRef<(() => void) | null>(null);

    // Sincronizar estado local cuando el prop link cambia
    useEffect(() => {
        setNewLink({...link});
    }, [link]);

    // Handle rules changes callback from RulesManager
    const handleRulesChange = useCallback((
        hasChanges: boolean,
        saveRules: () => Promise<void>,
        cancelRules: () => void
    ) => {
        setHasRulesChanges(hasChanges);
        saveRulesRef.current = saveRules;
        cancelRulesRef.current = cancelRules;
    }, []);

    const handleUpdateLink = useCallback(async () => {
            try {
                // Save link
                const response = await updateLink(link.shortUrl, {
                    longUrl: newLink.longUrl,
                    status: newLink.status,
                });

                if (!response.success) {
                    // Error handling with specific messages
                    if (response.errorCode === 'LINK_NOT_FOUND') {
                        toast.error('Link not found', {
                            description: 'This link no longer exists.',
                        });
                    } else if (response.errorCode === 'LINK_ACCESS_DENIED') {
                        toast.error('Access denied', {
                            description: 'You don\'t have permission to edit this link.',
                        });
                    } else if (response.errorCode === 'UNAUTHORIZED') {
                        toast.error('Session expired', {
                            description: 'Please login again to continue.',
                        });
                    } else {
                        toast.error('Failed to update link', {
                            description: response.error || 'An unexpected error occurred.',
                        });
                    }
                    setShowStatusBar("none");
                    return;
                }

                // Save rules if there are changes
                if (hasRulesChanges && saveRulesRef.current) {
                    await saveRulesRef.current();
                }

                toast.success('Link and rules updated successfully!');
                setShowStatusBar("none");
                onClose();
                await fetchLinks();
            } catch (err) {
                console.error('Failed to save:', err);
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
                toast.error('Failed to save changes', {
                    description: errorMessage,
                });
                setShowStatusBar("none");
            }
    }, [link, newLink, updateLink, fetchLinks, onClose, hasRulesChanges, toast]);
    
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = async (e: KeyboardEvent) => {
            const activeElement = document.activeElement;

            // Manejar Enter para actualizar
            if (e.key === 'Enter' && !e.shiftKey) {
                const hasChanges = link.status !== newLink.status || link.longUrl !== newLink.longUrl;
                if (hasChanges) {
                    e.preventDefault();
                    setShowStatusBar("loading");
                    await handleUpdateLink();
                }
            }

            // Solo manejar shortcuts de teclado cuando no estamos en un input
            if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') return;

            if (e.key === '1') {
                setTab('settings'); //TODO: Change to resume on implementation
            } else if (e.key === '2') {
                setTab('analytics'); //TODO: Change to analytics on implementation
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, link, newLink, handleUpdateLink]);

    useEffect(() => {
        const hasLinkChanges =
            link.status !== newLink.status ||
            link.longUrl !== newLink.longUrl;

        const hasChanges = hasLinkChanges || hasRulesChanges;

        if (hasChanges) {
            setShowStatusBar("confirm");
        } else {
            setShowStatusBar("none");
        }
    }, [newLink, link, hasRulesChanges]);

    return (
        <Drawer
            open={open}
            onClose={onClose}
            modal
            placement='right'
            size='xl'
            rounded='3xl'
            className='h-full overflow-hidden flex flex-col'
        >
            <div className='flex-1 overflow-auto flex flex-col gap-2 items-center p-4 pb-32'>

                {/* Tabs */}
                <div className='w-full flex flex-wrap gap-2 mb-6'>
                    {/* <Button
                        variant='ghost'
                        size='sm'
                        rounded='2xl'
                        leftIcon={<TbTextScan2 size={20} />}
                        className={`rounded-2xl ${tab === 'resume' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                        onClick={() => setTab('resume')}
                    >
                        Resume
                    </Button> */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "backInOut" }}
                        
                    >
                        <Button
                            variant='ghost'
                            size='sm'
                            rounded='2xl'
                            leftIcon={<TbSettings size={20} />}
                            className={`rounded-2xl ${tab === 'settings' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('settings')}
                            >
                            Settings
                        </Button>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05,  duration: 0.4, ease: "backInOut" }}
                        
                    >
                        <Button
                            variant='ghost'
                            size='sm'
                            rounded='2xl'
                            leftIcon={<TbChartBar size={20} />}
                            className={`rounded-2xl ${tab === 'analytics' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('analytics')}
                        >
                            Analytics
                        </Button>
                    </motion.div>
                </div>
 

                <header className='w-full flex flex-col md:flex-row items-start'>
                    <div className='w-full flex-1 flex flex-col gap-1'>
                        <div
                            className='max-w-sm flex flex-col-reverse items-start md:flex-row md:items-center gap-2'
                            onMouseEnter={() => setShowCopyShortUrlButton(true)}
                            onMouseLeave={() => setShowCopyShortUrlButton(false)}
                        >
                            <motion.h1
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1,  duration: 0.4, ease: "backInOut" }}
                                className='text-2xl md:text-3xl italic font-black'
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(`https://linkkk.dev/${newLink.shortUrl}`);
                                    shortUrlTextRef.current?.setText('Copied!');
                                    setTimeout(() => {
                                        shortUrlTextRef.current?.reset();
                                    }, 2000);
                                }}    
                            >
                                <AnimatedText
                                    ref={shortUrlTextRef}
                                    initialText={`linkkk.dev/${newLink.shortUrl}`}
                                    animationType="slide"
                                    triggerMode="none"
                                />
                            </motion.h1>

                            <AnimatePresence>
                                {showCopyShortUrlButton && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                        transition={{ duration: 0.2, ease: "backOut" }}
                                    >
                                        <Button
                                            iconOnly
                                            leftIcon={<TbCopy size={20} />}
                                            variant='solid'
                                            size='sm'
                                            rounded='xl'
                                            className='bg-primary text-dark'
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                navigator.clipboard.writeText(`https://linkkk.dev/${newLink.shortUrl}`);
                                                shortUrlTextRef.current?.setText('Copied!');
                                                setTimeout(() => {
                                                    shortUrlTextRef.current?.reset();
                                                }, 2000);
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.175, duration: 0.3, ease: "backOut" }}
                            className='w-full max-w-sm flex items-center gap-1 text-dark/50'
                            onMouseEnter={() => setShowCopyLongUrlButton(true)}
                            onMouseLeave={() => setShowCopyLongUrlButton(false)}
                        >
                            <FiCornerDownRight size={20} className="flex-shrink-0" />
                            <div
                                className='text-sm md:text-lg overflow-hidden text-ellipsis whitespace-nowrap p-1 flex-1 min-w-0 cursor-pointer text-dark/50'
                                onMouseDown={() => {
                                    navigator.clipboard.writeText(newLink.longUrl);
                                    longUrlTextRef.current?.setText('Copied!');
                                    setTimeout(() => {
                                        longUrlTextRef.current?.reset();
                                    }, 2000);
                                }}
                            >
                                <AnimatedText
                                    ref={longUrlTextRef}
                                    initialText={newLink.longUrl}
                                    animationType="slide"
                                    triggerMode="none"
                                    className="truncate block"
                                />
                            </div>


                            <AnimatePresence>
                                    {showCopyLongUrlButton && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                            transition={{ duration: 0.2, ease: "backOut" }}
                                        >
                                            <Button
                                                iconOnly
                                                leftIcon={<TbCopy size={20} />}
                                                variant='solid'
                                                size='sm'
                                                rounded='xl'
                                                className="bg-primary text-dark flex-shrink-0 inline-flex items-center justify-center rounded-lg"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    navigator.clipboard.writeText(newLink.longUrl);
                                                    longUrlTextRef.current?.setText('Copied!');
                                                    setTimeout(() => {
                                                        longUrlTextRef.current?.reset();
                                                    }, 2000);
                                                }}
                                            >
                                                <TbCopy size={12} />
                                            </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </header>

                {/* Main Content */}
                {/* Resume */}
                {tab === 'resume' && (
                <div className='w-full flex flex-col gap-2 items-center p-4'>         
                </div>
                )}

                {/* Settings */}
                {tab === 'settings' && (
                    <div className='w-full h-full flex flex-col items-center gap-1'>
                        
                        {/* <motion.p 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
                            className='w-full text-2xl font-black flex items-center gap-2'>
                            <TbSettings size={26} />
                            Settings
                        </motion.p> */}

                        {/* Link status */}
                        <div className='w-full flex flex-col md:flex-row items-start md:items-center gap-1'>
                            <motion.p
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25, duration: 0.3, ease: "backOut" }} 
                            className='text-lg font-black italic'>
                                Status
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
                            >
                                <Button
                                    variant='solid'
                                    size='sm'
                                    rounded='xl'
                                    leftIcon={newLink.status ? <TbCircleDashedCheck size={20} /> : <TbCircleDashed size={20} />}
                                    className={`${newLink.status ? 'bg-success text-dark' : 'bg-danger text-light'}`}
                                    onClick={() => {
                                        statusButtonTextRef.current?.setText(newLink.status ? 'Inactive' : 'Active');
                                        setNewLink({ ...newLink, status: !newLink.status })

                                    }}
                                >
                                    <AnimatedText
                                        ref={statusButtonTextRef}
                                        initialText={newLink.status ? 'Active' : 'Inactive'}
                                        animationType="slide"
                                        triggerMode='none'
                                    />
                                </Button>
                            </motion.div>
                        </div>
                        {/* URLs */}
                        <div className='w-full flex flex-col md:flex-row items-start md:items-center gap-4'>
                            <motion.p 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.3, ease: "backOut" }}
                                className='text-lg font-black italic'>
                                    Long URL
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35, duration: 0.3, ease: "backOut" }}
                                className='relative flex items-center gap-1'
                            >
                                <Input
                                    id='longUrl'
                                    value={newLink.longUrl}
                                    onChange={(e) => setNewLink({ ...newLink, longUrl: e.target.value })}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            const hasChanges = link.status !== newLink.status || link.longUrl !== newLink.longUrl;
                                            if (hasChanges) {
                                                e.preventDefault();
                                                setShowStatusBar("loading");
                                                await handleUpdateLink();
                                            }
                                        }
                                    }}
                                    placeholder='https://example.com'
                                    size='md'
                                    rounded='2xl'
                                    className='w-full max-w-md'
                                />
                            </motion.div>
                        </div>


                        {/* Link Rules Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.3, ease: "backOut" }}
                            className='w-full'
                        >
                            <RulesManager
                                shortUrl={newLink.shortUrl}
                                onRulesChange={handleRulesChange}
                            />
                        </motion.div>
                    </div>

                )}

                {/* Analytics */}
                {tab === 'analytics' && (
                <div className='w-full flex flex-col gap-2 items-center p-4'>
                    {
                        <AccessesList shortUrl={link.shortUrl} />
                    }
                </div>
                )}

            </div>

            {/* Status bar - Fixed at bottom */}
            <AnimatePresence>
                {statusBar !== 'none' && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.3, ease: "backOut" }}
                        className='w-full bg-dark/5 border-t p-4'
                    >
                        <div className='flex flex-col gap-3 max-w-4xl mx-auto'>
                            <div className='flex items-start gap-2'>
                                <div className='w-6 h-6 rounded-full bg-primary border flex items-center justify-center flex-shrink-0 mt-0.5'>
                                    <span className='text-dark text-sm font-bold'>!</span>
                                </div>
                                <div className='flex-1'>
                                    <p className='text-lg font-black italic text-dark mb-1'>
                                        Unsaved Changes
                                    </p>
                                    <p className='text-sm text-dark/70'>
                                        You have changes that haven&apos;t been saved yet
                                    </p>
                                </div>
                            </div>
                            <div className='flex gap-2 justify-end'>
                                <Button
                                    variant='outline'
                                    size='md'
                                    rounded='2xl'
                                    className='border-dark/30'
                                    disabled={statusBar === "loading"}
                                    onClick={() => {
                                        setShowStatusBar("none");
                                        setNewLink({...link});
                                        // Cancel rules changes if any
                                        if (cancelRulesRef.current) {
                                            cancelRulesRef.current();
                                        }
                                    }}
                                >
                                    Discard
                                </Button>
                                <Button
                                    variant='solid'
                                    size='md'
                                    rounded='2xl'
                                    className='bg-primary text-dark hover:shadow-[4px_4px_0_var(--color-dark)]'
                                    loading={statusBar === "loading"}
                                    onClick={async () => {
                                        setShowStatusBar("loading");
                                        await handleUpdateLink();
                                    }}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Drawer>
    );
}
