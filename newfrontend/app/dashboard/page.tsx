"use client"
import { useState, useEffect } from "react";
import { TbFilterPlus, TbSwitchVertical, TbEdit, TbPlus} from "react-icons/tb";

import { useLinkStore } from "@/app/stores/linkStore";

import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import Button from "@/app/components/ui/Button/Button";
import LinkDetails from "@/app/components/LinkList/LinkDetails";
import Drawer from "../components/ui/Drawer/Drawer";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import { useSidebarStore } from "@/app/stores/sidebarStore";

export default function Dashboard() {
  const { links, getLinks } = useLinkStore();
  const [view, setView] = useState('details');
  const [createLinkDrawerOpen, setCreateLinkDrawerOpen] = useState(false);
  const { desktopOpen, toggleDesktop } = useSidebarStore();

  useEffect(() => {
    getLinks();
  }, [getLinks]);

  return (
    <RouteGuard type="user-only" title="Dashboard - Linkkk">
      <div className="md:flex md:flex-row justify-center p-4 md:gap-11">
        <Sidebar />

        {/* Dashboard */}
        <div className={`mt-20 md:mt-0 transition-all flex-1 md:pr-18 space-y-8 min-w-0 ${desktopOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <h1 className="text-4xl font-black mb-2 italic">Dashboard</h1>
          
          {/* Widgets */}
          <div className='flex items-center gap-1 overflow-x-auto scrollbar-hide lg:grid lg:gap-2 lg:grid-cols-4'>
            <div className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>Total links</h2>
              <p className='text-end text-5xl font-black italic'>182</p>
            </div>
            <div className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>Total clicks</h2>
              <p className='text-end text-5xl font-black italic'>20.4M</p>
            </div>
            <div className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>Active links</h2>
              <p className='text-end text-5xl font-black italic'>140</p>
            </div>
            <div className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>API usage</h2>
              <p className='text-end text-5xl font-black italic'>85<span className='text-xl text-dark/60'>/100</span></p>
            </div>
          </div>

          
          <div className='flex flex-wrap items-center justify-between'>
            
            <div className='flex items-center gap-2'>
              <h3 className='text-3xl font-black italic'>My links</h3>
              <Button variant="ghost" className="" size="sm" rounded="xl" leftIcon={<TbFilterPlus size={20} />}>
                <span className=''>Add filter</span>
              </Button>
            </div>

              <div className='flex items-center gap-2'>
                  {/* <Button variant='ghost' size='sm' rounded='xl' leftIcon={<TbEdit size={20} />}>
                      Edit view
                  </Button> */}
                  <Button variant="ghost" className="" size="sm" rounded="xl" leftIcon={<TbSwitchVertical size={20} />}>
                    <span className=''>Order by</span>
                  </Button>
                  <Button variant='solid' size='sm' rounded='xl' leftIcon={<TbPlus size={20} />} onClick={() => setCreateLinkDrawerOpen(true)}>
                      New link
                  </Button>
                  <Drawer 
                    open={createLinkDrawerOpen} 
                    rounded="3xl" 
                    onClose={() => setCreateLinkDrawerOpen(false)} 
                    className="p-4 border-2 border-dark rounded-tr-none rounded-br-none border-r-0"
                    modal
                    overlayClassName="bg-black/50"
                    >
                    TEST
                  </Drawer>
              </div>
          </div>

          {view === 'details' && <LinkDetails links={links} />}

        </div>
      </div>
    </RouteGuard>
  );
}