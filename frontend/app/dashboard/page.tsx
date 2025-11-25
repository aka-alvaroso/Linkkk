"use client"
import { useState, useEffect, useRef } from "react";
import { TbFilterPlus, TbPlus } from "react-icons/tb";

import { useLinks, useStats, useAuth } from "@/app/hooks";

import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import Button from "@/app/components/ui/Button/Button";
import LinkDetails from "@/app/components/LinkList/LinkDetails";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import CreateLinkDrawer from "@/app/components/Drawer/CreateLinkDrawer";
import FilterModal from "@/app/components/Modal/FilterModal";
import { useSidebarStore } from "@/app/stores/sidebarStore";
import * as motion from 'motion/react-client';
import { useMotionValue, animate } from 'motion/react';
import AnimatedText, { AnimatedTextRef } from "@/app/components/ui/AnimatedText";

function AnimatedCounter({ value, delay = 0 }: { value: number; delay?: number }) {
  const count = useMotionValue(0);
  const textRef = useRef<AnimatedTextRef>(null);
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.1,
      delay,
      ease: "easeOut",
      onUpdate: (latest) => {
        const newValue = Math.round(latest);
        if (newValue !== currentValue) {
          setCurrentValue(newValue);
          textRef.current?.setText(newValue.toString());
        }
      }
    });

    return controls.stop;
  }, [count, value, delay, currentValue]);

  return (
    <AnimatedText
      ref={textRef}
      initialText={currentValue.toString()}
      animationType="slide"
      slideDirection="up"
      triggerMode="none"
    />
  );
}

export default function Dashboard() {
  const { filteredLinks, filters, fetchLinks, updateFilters } = useLinks();
  const { totalLinks, activeLinks, totalClicks } = useStats();
  const { isAuthenticated, isGuest } = useAuth();
  const [view] = useState('details');
  const { desktopOpen } = useSidebarStore();
  const [createLinkDrawerOpen, setCreateLinkDrawerOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated || isGuest) {
      fetchLinks();
    }
  }, [fetchLinks, isAuthenticated, isGuest]);

  const hasActiveFilters = () => {
    return filters.search !== '' ||
           filters.status !== 'all';
  };

  return (
    <RouteGuard type="guest-or-user" title="Dashboard - Linkkk">
      <div className="relative md:flex md:flex-row justify-center p-4 md:gap-11 max-w-[128rem] mx-auto">
        <Sidebar />

        {/* Dashboard */}
        <div className={`transition-all flex-1 md:pr-18 space-y-8 min-w-0 ${desktopOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.4, ease: "backInOut" }}
              className="text-4xl font-black mb-2 italic">
            Dashboard
          </motion.h1>
          
          {/* Widgets */}
          <div className='flex items-center gap-1 overflow-x-auto scrollbar-hide lg:grid lg:gap-2 lg:grid-cols-4'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
            className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>Total links</h2>
              <p className='text-end text-5xl font-black italic'>
                <AnimatedCounter value={totalLinks} delay={0.15} />
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
            className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>Total clicks</h2>
              <p className='text-end text-5xl font-black italic'>
                <AnimatedCounter value={totalClicks} delay={0.15} />
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }}
            className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>Active links</h2>
              <p className='text-end text-5xl font-black italic'>
                <AnimatedCounter value={activeLinks} delay={0.15} />
              </p>
            </motion.div>
            {/* <div className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>API usage</h2>
              <p className='text-end text-5xl font-black italic'>
                {filteredLinks.reduce((total, link) => total + link.apiUsage, 0)}
              </p>
            </div> */}
          </div>


          <div className='flex flex-wrap items-center justify-between gap-4'>

            <div className='flex items-center gap-2 flex-wrap'>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: "backInOut" }}
                className='text-3xl font-black italic'>
                My links
              </motion.h3>

              {/* Filter Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4, ease: "backInOut" }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  rounded="xl"
                  leftIcon={<TbFilterPlus size={20} />}
                  onClick={() => setFilterModalOpen(true)}
                  className={hasActiveFilters() ? 'text-info' : ''}
                >
                  <span>{hasActiveFilters() ? 'Filters active' : 'Filters'}</span>
                </Button>
              </motion.div>
            </div>

            <div className='flex items-center gap-2'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: "backInOut" }}
              >
                <Button variant='solid' size='sm' rounded='xl' leftIcon={<TbPlus size={20} />} onClick={() => setCreateLinkDrawerOpen(true)}
                  className="hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                  >
                    New link
                </Button>
              </motion.div>
            </div>
          </div>

          {view === 'details' && <LinkDetails links={filteredLinks} />}

          <CreateLinkDrawer open={createLinkDrawerOpen} onClose={() => setCreateLinkDrawerOpen(false)} />
          <FilterModal
            open={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            onApplyFilters={updateFilters}
            initialFilters={filters}
          />
        </div>
      </div>
    </RouteGuard>
  );
}