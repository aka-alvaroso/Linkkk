import React from 'react';
import { useSidebarStore } from '@/app/stores/sidebarStore';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbInfoCircle, TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbPlus, TbSettings } from 'react-icons/tb';
import { HiCode, HiHome, HiSparkles } from 'react-icons/hi';
import Image from 'next/image';

const DesktopSidebar = () => {
    const { desktopOpen, toggleDesktop } = useSidebarStore();
    const sidebarWidth = desktopOpen ? 'w-64' : 'w-20';

    return (
        <div className={`m-4 h-[calc(100vh-2rem)] hidden md:flex flex-col gap-2 items-center fixed top-0 left-0 ${sidebarWidth} flex-shrink-0 transition-all duration-300 ease-in-out `}>
            
            <div className='w-full  flex-1 flex flex-col gap-2 items-center p-2 bg-dark/5 rounded-xl'>
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
                        onClick={() => {}}
                        size="sm" 
                        rounded="xl" 
                        iconOnly={!desktopOpen}
                        className='w-full'
                        leftIcon={<TbPlus size={20} />}
                    >
                            {desktopOpen ? 
                                <span className='font-black italic text-lg'>New</span> 
                            : null}
                    </Button>
                </div>

                {/* Links */}
                <div className='my-2 w-full flex flex-col gap-2'>
                    <Link href="/">
                        <Button
                            variant='link'
                            size='sm'
                            rounded='xl'
                            className='w-full flex justify-start gap-2 hover:bg-transparent transition-all duration-200 ease-in-out transform hover:translate-x-2 '
                        >
                            <HiHome size={22} />
                            {desktopOpen ? 
                                <span className='font-black italic text-xl'>Home</span> 
                            : null}
                        </Button>
                    </Link>

                    
                    <Link href="/bio">
                        <Button
                            variant='link'
                            size='sm'
                            rounded='xl'
                            className='w-full flex justify-start gap-2 hover:bg-transparent transition-all duration-200 ease-in-out transform hover:translate-x-2 '
                        >
                            <HiSparkles size={22} />
                            {desktopOpen ? 
                                <span className='font-black italic text-xl'>Bio Page</span> 
                            : null}
                        </Button>
                    </Link>

                    
                    <Link href="/api">
                        <Button
                            variant='link'
                            size='sm'
                            rounded='xl'
                            className='w-full flex justify-start gap-2 hover:bg-transparent transition-all duration-200 ease-in-out transform hover:translate-x-2 '
                        >
                            <HiCode size={22} />
                            {desktopOpen ? 
                                <span className='font-black italic text-xl'>API</span> 
                            : null}
                            </Button>
                    </Link>


                </div>
            </div>

            <div className='w-full flex flex-col items-center gap-2 p-1 bg-dark/5 rounded-xl text-light'>
                <div className='w-full h-full flex-1 flex flex-col gap-1 p-2 bg-light rounded-lg'>
                    
                    <Link href="/dashboard">
                        <Button 
                            size='sm' 
                            iconOnly={!desktopOpen}
                            rounded='xl'
                            variant='ghost'
                            className={`w-full ${desktopOpen ? 'justify-start' : 'justify-center'}`}
                            leftIcon={<TbSettings size={20} />}
                        >
                            {
                                desktopOpen ? <span className=''>Settings</span> : null
                            }
                        </Button>
                    </Link>
                    
                    <Link href="/dashboard">
                        <Button 
                            size='sm' 
                            iconOnly={!desktopOpen}
                            rounded='xl'
                            variant='ghost'
                            className={`w-full ${desktopOpen ? 'justify-start' : 'justify-center'}`} 
                            leftIcon={<TbInfoCircle size={20} />}
                        >
                            {
                                desktopOpen ? <span className=''>Help</span> : null
                            }
                        </Button>
                    </Link>

                    <div className='w-full flex justify-between text-dark transition-all duration-200 ease-in-out hover:cursor-pointer hover:bg-dark/5 rounded-xl p-1'>

                        <div className="relative border border-dark rounded-full size-11 overflow-hidden">
                            <Image 
                                src="https://images.unsplash.com/photo-1758621518225-9248e65dbaee?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                                fill
                                alt="User avatar"
                                className="object-cover"
                            />
                        </div>
                        <div className={`flex flex-col flex-1 pl-2 justify-center ${!desktopOpen ? 'hidden' : 'block'}`}>
                            <span className='text-sm'>John Doe</span>
                            <span className='text-sm text-dark/50'>john.doe@example.com</span>
                        </div>


                    </div>

                </div>

                <div className={`text-dark/50 w-full flex justify-start px-2 text-xs ${!desktopOpen ? 'hidden' : 'block'}`}>
                    © {new Date().getFullYear()} Linkkk. Version 2.1.0 Beta
                </div>

            </div>
            
        </div>
    );
};

export default DesktopSidebar;
