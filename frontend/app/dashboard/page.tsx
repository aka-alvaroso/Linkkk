"use client"
import { useState, useEffect } from "react";
import { TbFilterPlus, TbPlus, TbLayoutDashboard, TbPencil, TbCheck } from "react-icons/tb";
import { useRouter, useSearchParams } from "next/navigation";

import { useLinks, useAuth } from "@/app/hooks";
import { useDashboardStore } from "@/app/stores/dashboardStore";

import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import Button from "@/app/components/ui/Button/Button";
import LinkDetails from "@/app/components/LinkList/LinkDetails";
import Navigation from "@/app/components/Navigation/Navigation";
import CreateLinkDrawer from "@/app/components/Drawer/CreateLinkDrawer";
import FilterModal from "@/app/components/Modal/FilterModal";
import SubscriptionSuccessModal from "@/app/components/Modal/SubscriptionSuccessModal";
import Alert from "@/app/components/ui/Alert/Alert";
import DashboardGrid from "@/app/components/Dashboard/DashboardGrid";
import WidgetConfigModal from "@/app/components/Dashboard/WidgetConfigModal";
import * as motion from 'motion/react-client';
import { useTranslations } from 'next-intl';

import { API_CONFIG } from "@/app/config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;

export default function Dashboard() {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filteredLinks, filters, fetchLinks, updateFilters } = useLinks();
  const { isAuthenticated, isGuest, user, checkSession } = useAuth();
  const { isEditing, setEditing } = useDashboardStore();

  const [view] = useState('details');
  const [createLinkDrawerOpen, setCreateLinkDrawerOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [widgetConfigOpen, setWidgetConfigOpen] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "INACTIVE" | "TRIALING";
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null>(null);

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
          const response = await fetch(`${API_BASE_URL}/subscription/status`, {
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
          <div className="flex items-center justify-between">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
              className="text-4xl font-black mb-2 italic">
              {t('title')}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
              className="hidden lg:flex items-center gap-2"
            >
              <Button
                variant={isEditing ? "solid" : "ghost"}
                size="sm"
                rounded="xl"
                leftIcon={isEditing ? <TbCheck size={20} /> : <TbPencil size={20} />}
                onClick={() => setEditing(!isEditing)}
                className={isEditing ? "bg-primary text-dark" : ""}
                expandOnHover="text"
              >
                {isEditing ? t('doneEditing') : t('editLayout')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                rounded="xl"
                leftIcon={<TbLayoutDashboard size={20} />}
                onClick={() => setWidgetConfigOpen(true)}
                expandOnHover="text"
              >
                {t('configure')}
              </Button>
            </motion.div>
          </div>

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
          <DashboardGrid />


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
          <WidgetConfigModal
            open={widgetConfigOpen}
            onClose={() => setWidgetConfigOpen(false)}
          />
        </div>
      </div>
    </RouteGuard>
  );
}
