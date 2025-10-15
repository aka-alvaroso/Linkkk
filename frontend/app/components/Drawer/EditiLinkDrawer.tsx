import React, { useState, useEffect, useCallback } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import { FiCornerDownRight } from 'react-icons/fi';
import { TbChartBar, TbCircleDashed, TbCircleDashedCheck, TbCopy, TbExternalLink, TbLink, TbSettings, TbTrash } from 'react-icons/tb';
import Button from '../ui/Button/Button';
import Select from '../ui/Select/Select';
import Chip from '../ui/Chip/Chip';
import Input from '../ui/Input/Input';
import { useLinks } from '@/app/hooks';
import type { Link } from '@/app/types';
import { AccessesList } from '../Accesses/accessesList';
import { useToast } from '@/app/hooks/useToast';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';

interface EditiLinkDrawerProps {
    open: boolean;
    onClose: () => void;
    link: Link;
}

export default function EditiLinkDrawer({ open, onClose, link }: EditiLinkDrawerProps) {
    const { updateLink, fetchLinks, deleteLink } = useLinks();
    const toast = useToast();
    const [tab, setTab] = useState('settings');
    const [statusBar, setShowStatusBar] = useState("none");
    const [newLink, setNewLink] = useState({...link});

    // Sincronizar estado local cuando el prop link cambia
    useEffect(() => {
        setNewLink({...link});
    }, [link]);

    const handleUpdateLink = useCallback(async () => {
            const response = await updateLink(link.shortUrl, {
                longUrl: newLink.longUrl,
                status: newLink.status,
            });

            if (response.success) {
                toast.success('Link updated successfully!');
                setShowStatusBar("none");
                // No need to update newLink here, fetchLinks() will update the parent
                onClose();
                await fetchLinks();
            } else {
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
            }
    }, [link, newLink, updateLink, fetchLinks, onClose]);
    
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
        const hasChanges =
            link.status !== newLink.status ||
            link.longUrl !== newLink.longUrl;

        if (hasChanges) {
            setShowStatusBar("confirm");
        } else {
            setShowStatusBar("none");
        }
    }, [newLink, link]);

    return (
        <Drawer
            open={open}
            onClose={onClose}
            modal
            placement='right'
            size='xl'
            rounded='3xl'
            className='h-full overflow-auto'
        >
            <div className='flex flex-col gap-2 items-center p-4'>

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
                    <div className='w-full flex-1 flex flex-col gap-2'>
                        <div className='flex flex-col-reverse items-start md:flex-row md:items-center'>
                            <motion.h1
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1,  duration: 0.4, ease: "backInOut" }} 
                                className='text-2xl md:text-3xl italic font-black'>
                                linkkk.dev/{newLink.shortUrl}
                            </motion.h1>
                            {
                                newLink.status ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15, duration: 0.3, ease: "backOut" }}
                                    >
                                        <Chip
                                        variant='success'
                                        className='md:ml-4'
                                        size='md'
                                        leftIcon={<TbCircleDashedCheck size={20} />}
                                        >
                                            Active
                                        </Chip>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15, duration: 0.3, ease: "backOut" }}
                                    >
                                        <Chip
                                        variant='danger'
                                        className='md:ml-4'
                                        size='md'
                                        leftIcon={<TbCircleDashed size={20} />}
                                        >
                                            Inactive
                                        </Chip>
                                    </motion.div>
                                )
                            }
                        </div>
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.175, duration: 0.3, ease: "backOut" }}
                            className='w-full flex items-center gap-2 text-dark/50'
                        >
                            <FiCornerDownRight size={20} /> 
                            <p className='text-sm md:text-lg flex-1 truncate'>{newLink.longUrl}</p>
                        </motion.div>
                    </div>
                </header>

                {/* Mobile buttons */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.175, duration: 0.3, ease: "backOut" }}
                    className='w-full flex gap-2 my-4 md:hidden'
                >
                    <Button 
                        variant='ghost' 
                        size='sm' 
                        rounded='2xl'
                        className='flex-1 flex-col items-center justify-center border border-info text-info bg-info/5'
                        onClick={() => navigator.clipboard.writeText(`https://linkkk.dev/${newLink.shortUrl}`)}
                    >
                        <TbCopy size={20} />
                        Copy
                    </Button>
                    <Button 
                        variant='ghost' 
                        size='sm' 
                        rounded='2xl'
                        className='flex-1 flex-col items-center justify-center border border-success text-success bg-success/5'
                        onClick={() => window.open(`https://linkkk.dev/${newLink.shortUrl}`, '_blank')}
                    >
                        <TbExternalLink size={20} />
                        Visit
                    </Button>
                    <Button
                        variant='ghost'
                        size='sm'
                        rounded='2xl'
                        className='flex-1 flex-col items-center justify-center border border-danger text-danger bg-danger/5'
                        onClick={async () => {
                            const result = await deleteLink(link.shortUrl);
                            if (result.success) {
                                toast.success('Link deleted successfully');
                                onClose();
                                await fetchLinks();
                            } else {
                                toast.error('Failed to delete link', {
                                    description: result.error || 'An unexpected error occurred.',
                                });
                            }
                        }}
                    >
                        <TbTrash size={20} />
                        Delete
                    </Button>
                </motion.div >

                {/* Main Content */}
                {/* Resume */}
                {tab === 'resume' && (
                <div className='w-full flex flex-col gap-2 items-center p-4'>         
                </div>
                )}

                {/* Settings */}
                {tab === 'settings' && (
                    <div className='w-full h-full flex flex-col gap-2 items-center p-4'>
                        
                        <motion.p 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
                            className='w-full text-2xl font-black flex items-center gap-2'>
                            <TbSettings size={26} />
                            Settings
                        </motion.p>

                        {/* Link status */}
                        <div className='w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-1'>
                            <motion.p
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25, duration: 0.3, ease: "backOut" }} 
                            className='text-lg'>
                                Link status
                            </motion.p>
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.275, duration: 0.3, ease: "backOut" }}
                                className='w-xs'
                            >
                                <Select
                                    options={[
                                        { 
                                            label: 'Active', 
                                            value: 'active', 
                                            leftIcon: <TbCircleDashedCheck size={16} />,
                                            customClassName: 'text-dark bg-success/50 hover:bg-success',
                                            selectedClassName: 'bg-success'
                                        },
                                        { 
                                            label: 'Inactive', 
                                            value: 'inactive', 
                                            leftIcon: <TbCircleDashed size={16} />,
                                            customClassName: 'mt-1 text-light bg-danger/50 hover:bg-danger',
                                            selectedClassName: 'bg-danger'
                                        },
                                    ]}
                                    value={newLink.status ? 'active' : 'inactive'}
                                    onChange={(v) => setNewLink({ ...newLink, status: v === 'active' })}
                                    listClassName='rounded-2xl p-1 shadow-none'
                                    buttonClassName="rounded-2xl border-dark/10"
                                    optionClassName='rounded-xl '
                                />
                            </motion.div>
                        </div>
                        {/* URLs */}
                        <div className='w-full flex justify-between items-center gap-4'>
                            <div className='w-1/2 flex flex-col gap-1'>
                                <motion.p 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.3, ease: "backOut" }}
                                    className='text-lg'>
                                        Long URL
                                </motion.p>
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35, duration: 0.3, ease: "backOut" }}
                                    className='w-full relative group'>
                                    <Input
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
                                        leftIcon={<TbLink size={20} className='text-info' />}
                                        className='w-full transition-all duration-100 ease-in-out text-ellipsis overflow-hidden'
                                    />
                                
                                    <div className='opacity-0 bg-light pl-2 group-hover:opacity-100 absolute flex gap-2 top-1/2 -translate-y-1/2 right-2 transition-all duration-200 ease-in-out'>
                                        <Button
                                            iconOnly
                                            leftIcon={<TbCopy size={20} />}
                                            variant='ghost'
                                            size='sm'
                                            rounded='md'
                                            className='bg-info/10 text-info hover:bg-info/15'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(newLink.longUrl);
                                            }}
                                        />
                                        <Button
                                            iconOnly
                                            leftIcon={<TbExternalLink size={20} />}
                                            variant='ghost'
                                            size='sm'
                                            rounded='md'
                                            className='bg-info/10 text-info hover:bg-info/15'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(newLink.longUrl, '_blank');
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        </div>


                        {/* Status bar */}
                        <AnimatePresence>
                            {statusBar !== 'none' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: -8, scale: 1 }}
                                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                                    transition={{ duration: 0.3, ease: "backOut" }}
                                    className='absolute flex flex-col gap-2 p-4 mb-2 bottom-0 left-1/2 w-1/2 -translate-x-1/2 bg-light border border-dark/10 rounded-3xl'
                                >
                                    {statusBar === "loading" && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1, duration: 0.2 }}
                                            className='text-dark/50'
                                        >
                                            Updating link...
                                        </motion.p>
                                    )}

                                    {statusBar === "confirm" && (
                                        <>
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05, duration: 0.2 }}
                                                className='text-dark/50'
                                            >
                                                We detected some changes, do you want to apply them?
                                            </motion.p>
                                            <div className='flex gap-2'>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1, duration: 0.2, ease: "backOut" }}
                                                    className='flex-1'
                                                >
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        rounded='2xl'
                                                        className='w-full rounded-xl border-danger text-danger hover:bg-danger/15 hover:text-danger'
                                                        onClick={() => {
                                                            setShowStatusBar("none");
                                                            setNewLink({...link});
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.15, duration: 0.2, ease: "backOut" }}
                                                    className='flex-1'
                                                >
                                                    <Button
                                                        variant='solid'
                                                        size='sm'
                                                        rounded='2xl'
                                                        className='w-full rounded-xl hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]'
                                                        onClick={async () => {
                                                            setShowStatusBar("loading");
                                                            await handleUpdateLink();
                                                        }}
                                                    >
                                                        Update Link
                                                        <span className='ml-2 text-xs'>
                                                            <FiCornerDownRight size={14} />
                                                        </span>
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
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
        </Drawer>
    );
}
