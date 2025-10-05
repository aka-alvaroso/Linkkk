import React, { useEffect, useState } from 'react';
import { useSidebarStore } from '@/app/stores/sidebarStore';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbDirection, TbInfoCircle, TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbPlus, TbSettings } from 'react-icons/tb';
import { HiCode, HiHome, HiSparkles } from 'react-icons/hi';
import Image from 'next/image';
import CreateLinkDrawer from '@/app/components/Drawer/CreateLinkDrawer';

const DesktopSidebar = () => {
    const { desktopOpen, toggleDesktop } = useSidebarStore();
    const [createLinkDrawer, setCreateLinkDrawer] = useState(false);
    const [ selected, setSelected ] = useState('home');
    const sidebarWidth = desktopOpen ? 'w-64' : 'w-20';

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

    return (
        <div className={`m-4 h-[calc(100vh-2rem)] hidden md:flex flex-col gap-2 items-center fixed top-0 left-0 ${sidebarWidth} flex-shrink-0 transition-all duration-300 ease-in-out `}>
            
            <div className='w-full flex flex-col gap-2 items-center p-2 bg-dark/5 rounded-xl'>
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                    {/* Logo */}
                    <Link href="/">
                        <h1 className="text-3xl font-black italic">k.</h1>
                    </Link>

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
                <div className="flex items-center justify-between w-full">
                    <Button 
                        onClick={() => {setCreateLinkDrawer(true)}}
                        size="sm" 
                        rounded="xl" 
                        iconOnly={!desktopOpen}
                        className={`w-full ${desktopOpen ? 'h-12' : 'size-12 mx-auto'}`}
                        leftIcon={<TbPlus size={20} />}
                    >
                            <span className='font-black italic text-lg'>New</span> 
                            <span className='font-black italic text-xs text-info ml-2 border border-info p-1 rounded-lg bg-info/20'>
                            Ctrl+k
                            </span> 
                    </Button>
                    <CreateLinkDrawer open={createLinkDrawer} onClose={() => setCreateLinkDrawer(false)} />
                </div>

                {/* Links */}
                <div className='my-2 w-full flex flex-col gap-2'>
                    <Link href="/dashboard">
                        <Button
                            onClick={() => setSelected('home')}
                            variant='link'
                            size='sm'
                            rounded='xl'
                            className={`p-1 w-full flex gap-2 hover:bg-transparent transition-all duration-200 ease-in-out transform hover:translate-x-2 ${selected === 'home' ? 'text-dark' : 'text-dark/50'} ${desktopOpen ? 'justify-start h-10' : 'size-10 mx-auto'}`}
                        >
                            <HiHome size={22} />
                            {desktopOpen ? 
                                <span className={`font-black text-xl`}>Home</span>
                            : null}
                        </Button>
                    </Link>

                    
                    <Link href="/dashboard">
                        <Button
                            onClick={() => setSelected('bio')}
                            variant='link'
                            size='sm'
                            rounded='xl'
                            className={`p-1 w-full flex gap-2 hover:bg-transparent transition-all duration-200 ease-in-out transform hover:translate-x-2 ${selected === 'bio' ? 'text-dark' : 'text-dark/50'} ${desktopOpen ? 'justify-start h-10' : 'size-10 mx-auto'}`}
                        >
                            <HiSparkles size={22} />
                            {desktopOpen ? 
                                <span className={`font-black text-xl`}>Bio Page</span> 
                            : null}
                        </Button>
                    </Link>

                    
                    <Link href="/dashboard">
                        <Button
                            onClick={() => setSelected('api')}
                            variant='link'
                            size='sm'
                            rounded='xl'
                            className={`p-1 w-full flex gap-2 hover:bg-transparent transition-all duration-200 ease-in-out transform hover:translate-x-2 ${selected === 'api' ? 'text-dark' : 'text-dark/50'} ${desktopOpen ? 'justify-start h-10' : 'size-10 mx-auto'}`}
                        >
                            <HiCode size={22} />
                            {desktopOpen ? 
                                <span className={`font-black text-xl`}>API</span> 
                            : null}
                            </Button>
                    </Link>


                </div>
            </div>

            <div className='mt-auto w-full flex flex-col items-center gap-2 p-1 bg-dark/5 rounded-xl text-light'>

                    <div className='relative w-full flex justify-between text-dark transition-all duration-200 ease-in-out hover:cursor-pointer hover:bg-dark/5 rounded-lg p-1 group'>

                        <div className="relative rounded-full size-11 overflow-hidden">
                            <Image 
                                src="https://images.unsplash.com/photo-1758621518225-9248e65dbaee?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                                fill
                                alt="User avatar"
                                className="object-cover"
                            />
                        </div>
                        <div className={`flex flex-col flex-1 pl-2 justify-center transition-all  duration-200 ease-in-out overflow-hidden text-ellipsis ${!desktopOpen ? 'w-0 h-0 opacity-0' : 'delay-150 w-full h-full opacity-100'}`}>
                            <span className='text-sm'>John Doe</span>
                            <span className='text-sm text-dark/50'>john.doe@example.com</span>
                        </div>

                        <Button 
                            variant='ghost'
                            size='sm'
                            iconOnly
                            leftIcon={<TbDirection size={24} />}
                            rounded='xl'
                            className={`
                                absolute top-1/2 right-0 transform -translate-y-1/2 hover:bg-transparent group-hover:scale-120
                            `}
                        />
                    </div>

            </div>
            
        </div>
    );
};

export default DesktopSidebar;
