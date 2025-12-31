"use client"
import { useState, useEffect, useRef } from "react";
import { TbFilterPlus, TbPlus, TbArrowLeft } from "react-icons/tb";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useLinks, useStats, useAuth } from "@/app/hooks";

import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import Button from "@/app/components/ui/Button/Button";
import LinkDetails from "@/app/components/LinkList/LinkDetails";
import Navigation from "@/app/components/Navigation/Navigation";
import CreateLinkDrawer from "@/app/components/Drawer/CreateLinkDrawer";
import FilterModal from "@/app/components/Modal/FilterModal";
import SubscriptionSuccessModal from "@/app/components/Modal/SubscriptionSuccessModal";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filteredLinks, filters, fetchLinks, updateFilters } = useLinks();
  const { totalLinks, activeLinks, totalClicks } = useStats();
  const { isAuthenticated, isGuest, user, checkSession } = useAuth();

  // Get link limit based on user role
  const getLinkLimit = () => {
    if (isGuest) return 3;
    if (!user) return 3;
    if (user.role === 'PRO') return null; // unlimited
    return 50; // STANDARD
  };

  const linkLimit = getLinkLimit();
  const [view] = useState('details');
  const [createLinkDrawerOpen, setCreateLinkDrawerOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated || isGuest) {
      fetchLinks();
    }
  }, [fetchLinks, isAuthenticated, isGuest]);

  // Fetch subscription info for PRO users
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (user?.role === 'PRO') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscription/status`, {
            method: 'GET',
            credentials: 'include',
          });
          const data = await response.json();
          if (data.success && data.data?.subscription) {
            setSubscriptionInfo(data.data.subscription);
          }
        } catch (error) {
          console.error('Error fetching subscription info:', error);
        }
      }
    };
    fetchSubscriptionInfo();
  }, [user?.role]);

  // Detect payment success from URL
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    if (paymentSuccess === 'true') {
      // Refresh user data to get updated subscription
      checkSession();
      // Show success modal
      setShowSuccessModal(true);
      // Clean URL
      router.replace('/dashboard');
    }
  }, [searchParams, checkSession, router]);

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
              message={t('guestAlert')}
              dismissible={true}
              persistent={false}
              className="p-2"
            />
          )}

          {/* Subscription Cancellation Alert */}
          {user?.role === 'PRO' && subscriptionInfo?.cancelAtPeriodEnd && subscriptionInfo?.currentPeriodEnd && (
            <Alert
              id="subscription-cancellation"
              type="warning"
              message={t('subscriptionCancelAlert', {
                date: new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString(),
                days: Math.ceil(
                  (new Date(subscriptionInfo.currentPeriodEnd).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                ),
              })}
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
              <p className='text-end text-5xl font-black italic flex items-end justify-end gap-1'>
                <AnimatedCounter value={totalLinks} delay={0.15} />
                {linkLimit !== null && (
                  <span className='text-lg text-dark/40 font-normal'>/{linkLimit}</span>
                )}
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
          <SubscriptionSuccessModal
            open={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
          />
        </div>
      </div>
    </RouteGuard>
  );
}