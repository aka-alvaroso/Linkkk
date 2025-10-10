import React, { useEffect, useState } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import Input from '@/app/components/ui/Input/Input';
import Button from '@/app/components/ui/Button/Button';
import { TbCircleDashed, TbCircleDashedCheck, TbLink } from 'react-icons/tb';
import { useLinkStore } from '@/app/stores/linkStore';
import Select from '../ui/Select/Select';
import { FiCornerDownRight } from 'react-icons/fi';

interface CreateLinkDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateLinkDrawer({ open, onClose }: CreateLinkDrawerProps) {
    const { createLink, getLinks } = useLinkStore();
    const [statusBar, setShowStatusBar] = useState("none");
    const [hasChanges, setHasChanges] = useState(false);
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
            setTimeout(() => setHasChanges(true), 200);
        }else{
            setHasChanges(false);
            setTimeout(() => setShowStatusBar("none"), 200);
        }
    }, [newLink]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (newLink.longUrl.trim()) {
                    setShowStatusBar("loading");
                    handleCreateLink();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [newLink.longUrl]);

    const handleCreateLink = async () => {
        if (!newLink.longUrl) {
            setError('Long URL is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await createLink({
                longUrl: newLink.longUrl,
                status: newLink.status,
            });

            if (response.success) {
                setNewLink({
                    longUrl: '',
                    status: true,
                });
                await getLinks();
                onClose();
            } else {
                setError(response.message || 'Failed to create link');
            }
        } catch (err) {
            setError('An error occurred while creating the link');
            console.error(err);
        } finally {
            setLoading(false);
            setShowStatusBar("none");
        }
    };

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
                    <p className='text-2xl md:text-3xl font-black italic w-full'>Create a new link</p>
                </div>

                {/* Long URL */}
                <div className='w-full flex flex-col gap-1'>
                    <p className='text-lg'>Long URL <span className='text-danger'>*</span></p>
                    <Input
                        value={newLink.longUrl}
                        onChange={(e) => {setNewLink({ ...newLink, longUrl: e.target.value }); setShowStatusBar("confirm")}}
                        placeholder='https://example.com'
                        size='md'
                        rounded='2xl'
                        leftIcon={<TbLink size={20} className='text-info' />}
                        className='w-full'
                        autoFocus
                    />
                </div>

                {/* Status */}
                <div className='w-full flex justify-between items-center gap-1'>
                    <p className='text-lg'>Status</p>
                    <Select
                        options={[
                            {
                                label: 'Active',
                                value: 'active',
                                leftIcon: <TbCircleDashedCheck size={16} />,
                                customClassName: 'text-success hover:bg-success/10',
                                selectedClassName: 'bg-success/15'
                            },
                            {
                                label: 'Inactive',
                                value: 'inactive',
                                leftIcon: <TbCircleDashed size={16} />,
                                customClassName: 'mt-1 text-danger hover:bg-danger/10',
                                selectedClassName: 'bg-danger/15'
                            },
                        ]}
                        value={newLink.status ? 'active' : 'inactive'}
                        onChange={(v) => setNewLink({ ...newLink, status: v === 'active' })}
                        listClassName='rounded-2xl p-1 shadow-none'
                        buttonClassName="rounded-2xl border-dark/10"
                        optionClassName='rounded-xl '
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className='w-full p-3 bg-danger/10 text-danger rounded-2xl text-sm'>
                        {error}
                    </div>
                )}

                {/* Status bar */}
                <div className={`absolute flex flex-col gap-2 p-4 mb-2 bottom-0 left-1/2 w-2/3 -translate-x-1/2 bg-light border border-dark/10 rounded-3xl
                            transform transition-all duration-200 ease-in-out
                            ${hasChanges ? 'opacity-100 -translate-y-1/2' : 'opacity-0 translate-y-0'}
                            ${statusBar !== 'none' ? 'block' : 'hidden'}
                            `}>
                                
                                {statusBar === "loading" && (
                                    <p className='text-dark/50'>
                                        Creating link...
                                    </p>
                                )}

                                
                                {statusBar === "confirm" && (
                                    <>
                                        <p className='text-dark/50'>
                                            Do you want to create this link?
                                        </p>
                                        <div className='flex gap-2'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                rounded='2xl'
                                                className='flex-1 rounded-xl border-info text-info hover:bg-info/15 hover:text-info'
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
                                            <Button
                                                variant='solid'
                                                size='sm'
                                                rounded='2xl'
                                                className='flex-1 rounded-xl bg-info hover:bg-info/80'
                                                onClick={async () => {
                                                    setShowStatusBar("loading");
                                                    await handleCreateLink();
                                                }}
                                            >
                                                Create Link
                                                <span className='ml-2 text-xs border border-light rounded-lg p-1'>
                                                    <FiCornerDownRight size={14} />
                                                </span>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            
                </div>
            </div>
        </Drawer>
    );
}