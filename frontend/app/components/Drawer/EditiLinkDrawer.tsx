import React, { useState, useEffect } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import { FiCornerDownRight } from 'react-icons/fi';
import { TbBolt, TbChartBar, TbCircleDashed, TbCircleDashedCheck, TbCopy, TbDotsVertical, TbExternalLink, TbLink, TbLock, TbRefresh, TbSettings, TbSparkles, TbTextScan2 } from 'react-icons/tb';
import Button from '../ui/Button/Button';
import Select from '../ui/Select/Select';
import Chip from '../ui/Chip/Chip';
import Input from '../ui/Input/Input';
import { Link, useLinkStore } from '@/app/stores/linkStore';
import { generateRandomPassword } from '@/app/utils/password';
import { AccessesList } from '../Accesses/accessesList';

interface EditiLinkDrawerProps {
    open: boolean;
    onClose: () => void;
    link: Link;
}

export default function EditiLinkDrawer({ open, onClose, link }: EditiLinkDrawerProps) {
    const { updateLink, getLinks } = useLinkStore();
    const [tab, setTab] = useState('settings');
    const [hasChanges, setHasChanges] = useState(false);
    const [statusBar, setShowStatusBar] = useState("none");
    const [newLink, setNewLink] = useState({...link});
    const [removePassword, setRemovePassword] = useState(false);

    const deepEqual = (a: any, b: any): boolean => {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.constructor !== b.constructor) return false;
    
        if (Array.isArray(a)) {
            return a.length === b.length && a.every((val, i) => deepEqual(val, b[i]));
        }
    
        if (typeof a === 'object') {
            const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
            return keys.every(key => deepEqual(a[key], b[key]));
        }
    
        return false;
    };

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            const activeElement = document.activeElement;

            if (e.key === 'Enter') {
                e.preventDefault();
                setShowStatusBar("loading");
                await handleUpdateLink();
            }

            if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') return;

            if (e.key === '1') {
                setTab('settings'); //TODO: Change to resume on implementation
            } else if (e.key === '2') {
                setTab('analytics'); //TODO: Change to analytics on implementation
            } 
            // else if (e.key === '3') {
            //     setTab('analytics');
            // }
        };
    
        document.addEventListener('keydown', handleKeyDown);
    
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [newLink, link, removePassword]);

    useEffect(() => {
        const passwordChanged = link.hasPassword
            ? (newLink.password !== '' || removePassword)
            : newLink.password !== '';

        const otherFieldsChanged =
            link.status !== newLink.status ||
            link.longUrl !== newLink.longUrl ||
            link.sufix !== newLink.sufix ||
            link.accessLimit !== newLink.accessLimit;

        const hasChanges = passwordChanged || otherFieldsChanged;

        if (hasChanges) {
            setShowStatusBar("confirm")
            setTimeout(() => setHasChanges(true), 200);
        }else{
            setHasChanges(false);
            setTimeout(() => setShowStatusBar("none"), 200);
        }
    }, [newLink, link, removePassword]);

    const handleUpdateLink = async () => {
        try {
            const linkToUpdate = {
                ...newLink,
                password: removePassword ? null : (newLink.password || undefined),
                hasPassword: undefined,
            };
            const d = await updateLink(linkToUpdate);
            if (d.success) {
                setShowStatusBar("none");
                setRemovePassword(false);
                setNewLink({...link});
                onClose();
                getLinks();
            }else{
                setShowStatusBar("error");
            }
        } catch (error) {
            console.error(error);
            setShowStatusBar("error");
        }
    };

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
                </div>
 

                <header className='w-full flex flex-col md:flex-row items-start'>
                    <div className='w-full flex-1 flex flex-col gap-2'>
                        <div className='flex items-center'>
                            <p className='text-2xl md:text-3xl italic font-black'>linkkk.dev/{newLink.sufix || newLink.shortUrl}</p>
                            {
                                newLink.status ? (
                                    <Chip
                                        variant='success'
                                        className='ml-4'
                                        size='md'
                                        leftIcon={<TbCircleDashedCheck size={20} />}
                                    >
                                        Active
                                    </Chip>
                                ) : (
                                    <Chip
                                        variant='danger'
                                        className='ml-4'
                                        size='md'
                                        leftIcon={<TbCircleDashed size={20} />}
                                    >
                                        Inactive
                                    </Chip>
                                )
                            }
                        </div>
                        <div className='w-full flex items-center gap-2 text-dark/50'>
                            <FiCornerDownRight size={20} /> 
                            <p className='text-sm md:text-lg flex-1 truncate'>{newLink.longUrl}</p>
                        </div>
                    </div>
                </header>

                {/* Mobile buttons */}
                <div className='w-full flex gap-2 my-4 md:hidden'>
                    <Button 
                        variant='ghost' 
                        size='sm' 
                        rounded='2xl'
                        className='flex-1 flex-col items-center justify-center border border-info text-info bg-info/5'
                    >
                        <TbCopy size={20} />
                        Copy
                    </Button>
                    <Button 
                        variant='ghost' 
                        size='sm' 
                        rounded='2xl'
                        className='flex-1 flex-col items-center justify-center border border-success text-success bg-success/5'
                    >
                        <TbExternalLink size={20} />
                        Visit
                    </Button>
                    <Button 
                        variant='ghost' 
                        size='sm' 
                        rounded='2xl'
                        className='flex-1 flex-col items-center justify-center border border-dark/50 text-dark/50 bg-dark/5'
                    >
                        <TbDotsVertical size={20} />
                        More
                    </Button>
                </div>

                {/* Main Content */}
                {/* Resume */}
                {tab === 'resume' && (
                <div className='w-full flex flex-col gap-2 items-center p-4'>         
                </div>
                )}

                {/* Settings */}
                {tab === 'settings' && (
                    <div className='w-full h-full flex flex-col gap-2 items-center p-4'>
                        
                        <p className='w-full text-2xl font-black flex items-center gap-2'>
                            <TbSettings size={26} />
                            Settings
                        </p>

                        {/* Link status */}
                        <div className='w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-1'>
                            <p className='text-lg'>Link status</p>
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
                        {/* URLs */}
                        <div className='w-full flex justify-between items-center gap-4'>
                            <div className='w-1/2 flex flex-col gap-1'>
                                <p className='text-lg'>Suffix</p>
                                <div className='w-full relative group'>
                                    <Input
                                        value={newLink.sufix}
                                        onChange={(e) => setNewLink({ ...newLink, sufix: e.target.value })}
                                        placeholder='Suffix'
                                        size='md'
                                        rounded='2xl'
                                        leftIcon={<TbBolt size={20} className='text-info' />}
                                        className='w-full'
                                    />
                                <div className='opacity-0 bg-light pl-2 group-hover:opacity-100 absolute flex gap-2 top-1/2 -translate-y-1/2 right-2 transition-all duration-200 ease-in-out'>
                                        <Button
                                            iconOnly
                                            leftIcon={<TbCopy size={20} />}
                                            variant='ghost'
                                            size='sm'
                                            rounded='md'
                                            className='bg-info/10 text-info hover:bg-info/15'
                                        />
                                        <Button
                                            iconOnly
                                            leftIcon={<TbExternalLink size={20} />}
                                            variant='ghost'
                                            size='sm'
                                            rounded='md'
                                            className='bg-info/10 text-info hover:bg-info/15'
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='w-1/2 flex flex-col gap-1'>
                                <p className='text-lg'>Long URL</p>
                                <div className='w-full relative group'>
                                <Input
                                    value={newLink.longUrl}
                                    onChange={(e) => setNewLink({ ...newLink, longUrl: e.target.value })}
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
                                        />
                                        <Button
                                            iconOnly
                                            leftIcon={<TbExternalLink size={20} />}
                                            variant='ghost'
                                            size='sm'
                                            rounded='md'
                                            className='bg-info/10 text-info hover:bg-info/15'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TODO: Expiration Date */}

                        <p className='w-full text-2xl font-black mt-6 flex items-center gap-2'>
                            <TbSparkles size={26} />
                            Advanced
                        </p>

                        {/* Password */}
                        <div className='w-full flex flex-col gap-2'>
                            <div className='w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-1'>
                                <p className='text-lg'>Password</p>
                                <div className='flex gap-2 md:w-2/5'>
                                    <Button
                                        variant='solid'
                                        size='sm'
                                        leftIcon={<TbRefresh size={20} className='group-hover:-rotate-180 transition-all duration-300' />}
                                        rounded='2xl'
                                        className='flex-1 rounded-2xl bg-info/15 text-info hover:bg-info hover:text-light group'
                                        onClick={() => setNewLink({ ...newLink, password: generateRandomPassword() })}
                                    >
                                        Generate
                                    </Button>
                                    <Input
                                        value={newLink.password}
                                        onChange={(e) => setNewLink({ ...newLink, password: e.target.value })}
                                        placeholder={link.hasPassword ? '••••••••' : 'Enter password'}
                                        size='md'
                                        rounded='2xl'
                                        leftIcon={<TbLock size={20} className='text-info' />}
                                        className='w-full'
                                    />
                                </div>
                            </div>
                            {link.hasPassword && (
                                <div className='w-full flex justify-end'>
                                    <label className='flex items-center gap-2 cursor-pointer text-sm text-dark/70 hover:text-dark'>
                                        <input
                                            type='checkbox'
                                            checked={removePassword}
                                            onChange={(e) => setRemovePassword(e.target.checked)}
                                            className='w-4 h-4 rounded accent-danger'
                                        />
                                        Remove password
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* TODO: Access Limit */}
                        <div className='w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-1'>
                            <p className='text-lg'>Access Limit</p>
                            <div className='w-full md:w-2/5'>
                                <Input
                                    type='number'
                                    min={0}
                                    value={newLink.accessLimit?.toString()}
                                    onChange={(e) => setNewLink({ ...newLink, accessLimit: parseInt(e.target.value) })}
                                    placeholder='Access Limit'
                                    size='md'
                                    rounded='2xl'
                                    leftIcon={<TbLock size={20} className='text-info' />}
                                    className=''
                                />
                            </div>
                        </div>
                        {/* TODO: Blocked Countries */}
                        {/* TODO: Smart Redirection */}
                        {/* TODO: Metadata */}



                        {/* Status bar */}
                        <div className={`absolute flex flex-col gap-2 p-4 mb-2 bottom-0 left-1/2 w-1/2 -translate-x-1/2 bg-light border border-dark/10 rounded-3xl
                            transform transition-all duration-200 ease-in-out
                            ${hasChanges ? 'opacity-100 -translate-y-1/2' : 'opacity-0 translate-y-0'}
                            ${statusBar !== 'none' ? 'block' : 'hidden'}
                            `}>
                                
                                {statusBar === "loading" && (
                                    <p className='text-dark/50'>
                                        Updating link...
                                    </p>
                                )}

                                
                                {statusBar === "confirm" && (
                                    <>
                                        <p className='text-dark/50'>
                                            We detected some changes, do you want to apply them?
                                        </p>
                                        <div className='flex gap-2'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                rounded='2xl'
                                                className='flex-1 rounded-xl border-info text-info hover:bg-info/15 hover:text-info'
                                                onClick={() => {
                                                    setShowStatusBar("none");
                                                    setNewLink({...link});
                                                    setRemovePassword(false);
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
                                                    await handleUpdateLink();
                                                }}
                                            >
                                                Update Link
                                                <span className='ml-2 text-xs border border-light rounded-lg p-1'>
                                                    <FiCornerDownRight size={14} />
                                                </span> 
                                            </Button>
                                        </div>
                                    </>
                                )}
                            
                        </div>
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
