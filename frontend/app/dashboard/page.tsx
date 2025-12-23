"use client"
import { useState, useEffect, useRef } from "react";
import { TbFilterPlus, TbPlus, TbArrowLeft } from "react-icons/tb";
import Link from "next/link";

import { useLinks, useStats, useAuth } from "@/app/hooks";

import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import Button from "@/app/components/ui/Button/Button";
import LinkDetails from "@/app/components/LinkList/LinkDetails";
import Navigation from "@/app/components/Navigation/Navigation";
import CreateLinkDrawer from "@/app/components/Drawer/CreateLinkDrawer";
import FilterModal from "@/app/components/Modal/FilterModal";
import Alert from "@/app/components/ui/Alert/Alert";
import * as motion from 'motion/react-client';
import { useMotionValue, animate } from 'motion/react';
import AnimatedText, { AnimatedTextRef } from "@/app/components/ui/AnimatedText";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Dashboard');
  const { filteredLinks, filters, fetchLinks, updateFilters } = useLinks();
  const { totalLinks, activeLinks, totalClicks } = useStats();
  const { isAuthenticated, isGuest } = useAuth();
  const [view] = useState('details');
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
      <Navigation showCreate={true} />

      <div className="relative p-2 md:p-4 md:mt-20 md:max-w-3/4 mx-auto">
        {/* Dashboard */}
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
            className="text-4xl font-black mb-2 italic">
            {t('title')}
          </motion.h1>

          {/* Guest User Alert */}
          {isGuest && (
            <Alert
              id="guest-link-expiration"
              type="warning"
              // title="Guest Account"
              message={t('guestAlert')}
              dismissible={true}
              persistent={false}
              className="p-2"
            />
          )}

          {/* Widgets */}
          <div className='flex items-center gap-1 py-1 overflow-x-auto scrollbar-hide lg:grid lg:gap-2 lg:grid-cols-4'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
              className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>{t('totalLinks')}</h2>
              <p className='text-end text-5xl font-black italic'>
                <AnimatedCounter value={totalLinks} delay={0.15} />
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
              className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>{t('totalClicks')}</h2>
              <p className='text-end text-5xl font-black italic'>
                <AnimatedCounter value={totalClicks} delay={0.15} />
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }}
              className='p-2 max-w-48 min-w-48 bg-dark/5 rounded-2xl md:max-w-full'>
              <h2 className='text-md'>{t('activeLinks')}</h2>
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
                {t('myLinks')}
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
                  <span>{hasActiveFilters() ? t('filtersActive') : t('filters')}</span>
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
                  {t('newLink')}
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