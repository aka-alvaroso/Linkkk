"use client"
import { useState, useEffect } from "react";
import { TbFilterPlus, TbLayoutGrid, TbBaselineDensitySmall, TbLayoutList , TbSwitchVertical, TbBolt, TbLink, TbTiltShiftFilled, TbCalendarX, TbFolder, TbTags, TbQrcode, TbClick, TbAdjustments} from "react-icons/tb";

import { useLinkStore } from "@/app/stores/linkStore";

import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import Navbar from '@/app/components/Navbar/Navbar';
import Button from "@/app/components/ui/Button/Button";
import LinkList from "@/app/components/LinkList/LinkList";

export default function Dashboard() {
  const { links, getLinks } = useLinkStore();
  const [view, setView] = useState('list');
  const showingProps = [
    {
      key: 'shortUrl',
      show: true,
      label: 'Short url',
      icon: <TbBolt size={20} className="text-dark/40" />
    },
    {
      key: 'longUrl',
      show: true,
      label: 'Final url',
      icon: <TbLink size={20} className="text-dark/40" />
    },
    {
      key: 'status',
      show: true,
      label: 'Status',
      icon: <TbTiltShiftFilled size={20} className="text-dark/40" />
    },
    {
      key: 'dateExpire',
      show: true,
      label: 'Expiration date',
      icon: <TbCalendarX size={20} className="text-dark/40" />
    }
  ];

  useEffect(() => {
    getLinks();
  }, [getLinks]);

  return (
    <RouteGuard type="user-only" title="Dashboard - Linkkk">
      <Navbar />
      <div className="my-20 p-2 space-y-8 w-full md:max-w-3/4 md:mx-auto">
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

        <div className='flex flex-wrap items-center justify-between border-2 border-dark/5 rounded-xl p-1'>

          {/* Filters */}
          <div className='flex items-center gap-2'>
            <Button variant="ghost" className="" size="sm" leftIcon={<TbFilterPlus size={20} />}>
              <span className=''>Add filter</span>
            </Button>
          </div>

          {/* View */}
          <div className='flex items-center justify-between gap-4 w-full sm:w-auto'>
            <Button variant="ghost" className="" size="sm" leftIcon={<TbSwitchVertical size={20} />}>
              <span className=''>Order by</span>
            </Button>
            <div className='flex items-center gap-4'>
              <Button variant={`${view === 'list' ? 'solid' : 'ghost'}`} className={`${view === 'list' ? 'bg-dark text-light' : ''}`} size="sm" iconOnly leftIcon={<TbBaselineDensitySmall size={20} onClick={() => setView('list')} />} />
              <Button variant={`${view === 'details' ? 'solid' : 'ghost'}`} className={`${view === 'details' ? 'bg-dark text-light' : ''}`} size="sm" iconOnly leftIcon={<TbLayoutList size={20} onClick={() => setView('details')} />} />
              <Button variant={`${view === 'grid' ? 'solid' : 'ghost'}`} className={`${view === 'grid' ? 'bg-dark text-light' : ''}`} size="sm" iconOnly leftIcon={<TbLayoutGrid size={20} onClick={() => setView('grid')} />} />
            </div>
          </div>
        </div>

        {view === 'list' && <LinkList showingProps={showingProps.filter((prop) => prop.show)} links={links} view={view} />}
        {/* {view === 'details' && <LinkDetails />}
        {view === 'grid' && <LinkGrid />} */}

      </div>
    </RouteGuard>
  );
}