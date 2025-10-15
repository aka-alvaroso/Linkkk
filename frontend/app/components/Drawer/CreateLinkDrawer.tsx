import React, { useEffect, useState, useCallback } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import Input from '@/app/components/ui/Input/Input';
import Button from '@/app/components/ui/Button/Button';
import { TbCircleDashed, TbCircleDashedCheck, TbLink } from 'react-icons/tb';
import { useLinks } from '@/app/hooks';
import Select from '../ui/Select/Select';
import { FiCornerDownRight } from 'react-icons/fi';
import { useToast } from '@/app/hooks/useToast';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';

interface CreateLinkDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateLinkDrawer({ open, onClose }: CreateLinkDrawerProps) {
    const { createLink } = useLinks();
    const toast = useToast();
    const [statusBar, setShowStatusBar] = useState("none");
    const [newLink, setNewLink] = useState({
        longUrl: '',
        status: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const hasChanges = newLink.longUrl !== '';
        if (hasChanges) {
            setShowStatusBar("confirm")
        } else {
            setShowStatusBar("none");
        }
    }, [newLink]);

    const handleCreateLink = useCallback(async () => {
        if (!newLink.longUrl) {
            toast.error('Long URL is required');
            return;
        }

        setLoading(true);
        setError('');

        const response = await createLink({
            longUrl: newLink.longUrl,
            status: newLink.status,
        });

        if (response.success) {
            toast.success('Link created successfully!', {
                description: `Short URL: ${response.data.shortUrl}`,
            });

            setNewLink({
                longUrl: '',
                status: true,
            });
            onClose();
        } else {
            if (response.errorCode === 'LINK_LIMIT_EXCEEDED') {
                toast.error('Link limit exceeded', {
                    description: 'You\'ve reached your link limit. Upgrade your plan to create more links.',
                    duration: 6000,
                });
            } else if (response.errorCode === 'UNAUTHORIZED') {
                toast.error('Session expired', {
                    description: 'Please login again to continue.',
                });
            } else if (response.errorCode === 'INVALID_DATA') {
                toast.error('Invalid data', {
                    description: response.error || 'Please check your input and try again.',
                });
            } else {
                toast.error('Failed to create link', {
                    description: response.error || 'An unexpected error occurred.',
                });
            }

            setError(response.error || 'Failed to create link');
        }

        setLoading(false);
        setShowStatusBar("none");
    }, [createLink, newLink.longUrl, newLink.status, onClose, toast]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && newLink.longUrl.trim()) {
                e.preventDefault();
                setShowStatusBar("loading");
                await handleCreateLink();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, newLink.longUrl, handleCreateLink]);

    return (
        <Drawer
            open={open}
            onClose={onClose}
            modal
            placement='right'
            size='md'
            rounded='3xl'
            className='h-full overflow-auto'
        >
            <div className='w-full flex flex-col gap-4 p-4'>
                <div className='flex items-center'>
                    <motion.p 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0, duration: 0.4, ease: "backInOut" }}
                        className='text-2xl md:text-3xl font-black italic w-full'>
                        Create a new link
                    </motion.p>
                </div>

                {/* Long URL */}
                <div className='w-full flex flex-col gap-1'>
                    <motion.p 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
                        className='text-lg'>
                        Long URL <span className='text-danger'>*</span>
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
                    >
                        <Input
                            value={newLink.longUrl}
                            onChange={(e) => {setNewLink({ ...newLink, longUrl: e.target.value }); setShowStatusBar("confirm")}}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter' && !e.shiftKey && newLink.longUrl.trim()) {
                                    e.preventDefault();
                                    setShowStatusBar("loading");
                                    await handleCreateLink();
                                }
                            }}
                            placeholder='https://example.com'
                            size='md'
                            rounded='2xl'
                            leftIcon={<TbLink size={20} className='text-info' />}
                            className='w-full'
                            autoFocus
                        />
                    </motion.div>
                </div>

                {/* Status */}
                <div className='w-full flex justify-between items-center gap-1'>
                    <motion.p 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
                        className='text-lg'
                    >
                        Status
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
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

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2, ease: "backOut" }}
                            className='w-full p-3 bg-danger/10 text-danger rounded-2xl text-sm'>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status bar */}
                <AnimatePresence>
                    {statusBar !== 'none' && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: -8, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            transition={{ duration: 0.3, ease: "backOut" }}
                            className='absolute flex flex-col gap-2 p-4 mb-2 bottom-0 left-1/2 w-2/3 -translate-x-1/2 bg-light border border-dark/10 rounded-3xl'
                        >
                            {statusBar === "loading" && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.2 }}
                                    className='text-dark/50'
                                >
                                    Creating link...
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
                                        Do you want to create this link?
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
                                                    setNewLink({
                                                        longUrl: '',
                                                        status: true,
                                                    });
                                                    setShowStatusBar("none");
                                                    onClose();
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
                                                    await handleCreateLink();
                                                }}
                                            >
                                                Create Link
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
        </Drawer>
    );
}