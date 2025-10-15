"use client"
import React, { useEffect, useState } from 'react';
import { useSidebarStore } from '@/app/stores/sidebarStore';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import Dropdown from '@/app/components/ui/Dropdown/Dropdown';
import type { DropdownItem } from '@/app/components/ui/Dropdown/Dropdown';
import { TbDirection, TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbPlus, TbSettings, TbLogout, TbUser, TbLogin } from 'react-icons/tb';
import { HiHome } from 'react-icons/hi';
import Image from 'next/image';
import CreateLinkDrawer from '@/app/components/Drawer/CreateLinkDrawer';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/stores/authStore';
import * as motion from 'motion/react-client';

const DesktopSidebar = () => {
    const router = useRouter();
    const { desktopOpen, toggleDesktop } = useSidebarStore();
    const { user, logout, isAuthenticated } = useAuth();
    const [createLinkDrawer, setCreateLinkDrawer] = useState(false);
    const [ selected, setSelected ] = useState('dashboard');

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            setCreateLinkDrawer(true);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const userMenuItems: DropdownItem[] = [
        {
            label: 'Profile',
            value: 'profile',
            icon: <TbUser size={18} />,
            onClick: () => {
                // Navigate to profile page
                window.location.href = '/profile';
            },
        },
        {
            label: 'Settings',
            value: 'settings',
            icon: <TbSettings size={18} />,
            onClick: () => {
                // Navigate to settings page
                window.location.href = '/settings';
            },
        },
        {
            label: 'Logout',
            value: 'logout',
            icon: <TbLogout size={18} />,
            separator: true,
            onClick: async () => {
                await logout();
            },
            customClassName: 'text-danger hover:bg-danger/5'
        },
    ];

    return (
        <motion.div
            animate={{
                width: desktopOpen ? 256 : 80 // w-64 = 256px, w-20 = 80px
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="m-4 h-[calc(100vh-2rem)] hidden md:flex flex-col gap-2 items-center fixed top-0 left-0 flex-shrink-0"
        >

            <div className='w-full flex flex-col gap-2 items-center p-2 bg-dark/5 rounded-xl'>
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0, duration: 0.4, ease: "backInOut" }}
                        >
                        <Link href="/" className="ml-2 text-4xl font-black italic">
                            <span
                                className="
                                transition-all duration-300 ease-in-out
                                hover:text-primary
                                hover:text-shadow-[_4px_4px_0_var(--color-dark)]"
                            >
                                k.
                            </span>
                        </Link>
                    </motion.div>

                    <Button 
                        onClick={() => toggleDesktop()} 
                        variant="ghost" 
                        size="sm" 
                        rounded="lg" 
                        iconOnly
                        className='hover:bg-info/5 hover:text-info'
                        leftIcon={desktopOpen ? <TbLayoutSidebarLeftCollapse size={20} /> : <TbLayoutSidebarLeftExpand size={20} />}
                    />
                </div>

                {/* New Link Button */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
                    className="flex items-center justify-between w-full">
                    <Button
                        onClick={() => {setCreateLinkDrawer(true)}}
                        size="sm"
                        rounded="xl"
                        iconOnly={!desktopOpen}
                        className={`group w-full ${desktopOpen ? 'h-12' : 'size-12 mx-auto'} hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]`}
                        leftIcon={<TbPlus size={20} />}
                    >
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{
                                opacity: desktopOpen ? 1 : 0,
                                width: desktopOpen ? "auto" : 0
                            }}
                            transition={{ duration: 0.2 }}
                            className='font-black italic text-lg overflow-hidden'
                        >
                            New
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{
                                opacity: desktopOpen ? 1 : 0,
                                width: desktopOpen ? "auto" : 0
                            }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className='font-black italic text-xs text-primary/75 ml-2 overflow-hidden group-hover:text-dark'
                        >
                            Ctrl+k
                        </motion.span>
                    </Button>
                    <CreateLinkDrawer open={createLinkDrawer} onClose={() => setCreateLinkDrawer(false)} />
                </motion.div>

                {/* Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }} 
                    className='my-2 w-full flex flex-col gap-2'>
                    
                    <Link href="/dashboard">
                        <motion.div
                            whileHover={{ x: 8 }}
                            transition={{ duration: 0.1, ease: "easeIn"}}
                        >
                            <Button
                                onClick={() => setSelected('dashboard')}
                                variant='link'
                                size='sm'
                                rounded='xl'
                                className={`p-1 w-full flex gap-2 hover:bg-transparent ${selected === 'dashboard' ? 'text-dark' : 'text-dark/50'} ${desktopOpen ? 'justify-start h-10' : 'size-10 mx-auto'}`}
                            >
                                <HiHome size={22} />
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{
                                        opacity: desktopOpen ? 1 : 0,
                                        width: desktopOpen ? "auto" : 0
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className='font-black text-xl overflow-hidden'
                                >
                                    Dashboard
                                </motion.span>
                            </Button>
                        </motion.div>
                    </Link>


                </motion.div>
            </div>

                    
            {
                isAuthenticated ? (
                    <Dropdown
                    trigger={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.4, ease: "backInOut" }} 
                            className='relative w-full flex justify-between text-dark bg-dark/5 hover:cursor-pointer rounded-xl p-2 group'>
                            <div className="relative rounded-full size-11 overflow-hidden flex-shrink-0">
                                <Image
                                    src="https://images.unsplash.com/photo-1758621518225-9248e65dbaee?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    fill
                                    alt="User avatar"
                                    className="object-cover"
                                />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{
                                    opacity: desktopOpen ? 1 : 0,
                                    width: desktopOpen ? "auto" : 0,
                                    height: desktopOpen ? "auto" : 0
                                }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="flex flex-col flex-1 pl-2 justify-center overflow-hidden"
                            >
                                <span className='text-sm font-medium truncate'>{user?.username}</span>
                                <span className='text-xs text-dark/50 truncate'>{user?.email}</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{
                                    opacity: desktopOpen ? 1 : 0,
                                    width: desktopOpen ? 24 : 0
                                }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-center overflow-hidden"
                            >
                                <TbDirection size={20} className='text-dark/50' />
                            </motion.div>
                        </motion.div>
                    }
                    items={userMenuItems}
                    placement="top-right"
                    className='mt-auto w-full'
                    menuClassName='p-2 shadow-none w-full'
                    itemClassName='text-dark hover:cursor-pointer rounded-xl'
                />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4, ease: "backInOut" }}
                        className={`mt-auto w-full ${desktopOpen ? 'h-12' : 'size-12 mx-auto'}`}
                    >
                        <Button
                            variant='solid'
                            size='sm'
                            rounded='xl'
                            iconOnly={!desktopOpen}
                            className={`w-full bg-dark text-light hover:text-dark hover:bg-primary hover:shadow-[4px_4px_0_0_var(--color-dark)] ${desktopOpen ? 'h-12' : 'size-12 mx-auto'}`}
                            leftIcon={<TbLogin size={22} />}
                            onClick={() => {
                                router.push('/auth/login');
                            }}
                        >
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{
                                    opacity: desktopOpen ? 1 : 0,
                                    width: desktopOpen ? "auto" : 0
                                }}
                                transition={{ duration: 0.2 }}
                                className='font-black italic text-lg overflow-hidden'
                            >
                                Login
                            </motion.span>
                        </Button>
                    </motion.div>
                )
            }

        </motion.div>
    );
};

export default DesktopSidebar;
