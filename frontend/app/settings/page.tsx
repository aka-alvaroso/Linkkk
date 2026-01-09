"use client";
import { useState, useEffect } from "react";
import RouteGuard from "@/app/components/RouteGuard/RouteGuard";
import Navigation from "@/app/components/Navigation/Navigation";
import { useAuth } from "@/app/hooks";
import { useAuthStore, Subscription } from "@/app/stores/authStore";
import { useToast } from "@/app/hooks/useToast";
import Button from "@/app/components/ui/Button/Button";
import * as motion from "motion/react-client";
import {
  TbLogout,
  TbUser,
  TbMail,
  TbLock,
  TbTrash,
  TbAlertTriangle,
  TbEye,
  TbEyeOff,
  TbStar,
  TbSparkles,
} from "react-icons/tb";
import { csrfService } from "@/app/services/api/csrfService";
import { subscriptionService } from "@/app/services/api/subscriptionService";
import { userService } from "@/app/services/api/userService";
import { useTranslations } from 'next-intl';
import CancelSubscriptionModal from "@/app/components/Modal/CancelSubscriptionModal";
import SelectPlanModal from "@/app/components/Modal/SelectPlanModal";
import { HttpError } from "@/app/utils/errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SettingsTab = "account" | "security" | "danger";

interface SettingsTabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
}

const settingsTabs: SettingsTabConfig[] = [
  { id: "account", label: "Account", icon: TbUser },
  { id: "security", label: "Security", icon: TbLock },
  { id: "danger", label: "Danger Zone", icon: TbAlertTriangle },
];

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  const { user, logout, checkSession } = useAuth();
  const { setUser } = useAuthStore();
  const toast = useToast();

  // Settings tabs with translations
  const settingsTabs: SettingsTabConfig[] = [
    { id: "account", label: t('tabAccount'), icon: TbUser },
    { id: "security", label: t('tabSecurity'), icon: TbLock },
    { id: "danger", label: t('tabDangerZone'), icon: TbAlertTriangle },
  ];

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [loading, setLoading] = useState(false);

  // Account form states
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  // Security form states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cancel subscription modal
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Select plan modal
  const [showSelectPlanModal, setShowSelectPlanModal] = useState(false);

  // Subscription state
  const [subscriptionInfo, setSubscriptionInfo] = useState<Subscription | null>(null);

  // Fetch subscription status on component mount
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (user?.role === "PRO") {
        try {
          const csrfToken = await csrfService.getToken();
          const response = await fetch(`${API_BASE_URL}/subscription/status`, {
            method: "GET",
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            credentials: "include",
          });

          const data = await response.json();

          if (response.ok && data.success && data.data?.subscription) {
            setSubscriptionInfo(data.data.subscription);
          }
        } catch (error) {
          console.error("Error fetching subscription status:", error);
        }
      }
    };

    fetchSubscriptionStatus();
  }, [user?.role]);

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      toast.error(t('toastUsernameEmpty'));
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await userService.updateUser({ username });

      // Update the user in the auth store
      setUser({
        ...user!,
        ...updatedUser,
      });
      toast.success(t('toastUsernameUpdated'));
    } catch (error) {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error(t('toastError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      toast.error(t('toastEmailEmpty'));
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await userService.updateUser({ email });

      // Update the user in the auth store
      setUser({
        ...user!,
        ...updatedUser,
      });
      toast.success(t('toastEmailUpdated'));
    } catch (error) {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error(t('toastError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error(t('toastPasswordRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('toastPasswordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await userService.updateUser({ password: newPassword });

      toast.success(t('toastPasswordUpdated'));
      setNewPassword("");
      setConfirmPassword("");
      // No need to update user state for password change
    } catch (error) {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error(t('toastError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAllLinks = async () => {
    if (!confirm(t('confirmDeleteLinks'))) {
      return;
    }

    setLoading(true);
    try {
      await userService.deleteUserData();
      toast.success(t('toastLinksDeleted'));
    } catch (error) {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error(t('toastError'));
      }
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteAccount = async () => {
    if (!confirm(t('confirmDeleteAccount'))) {
      return;
    }

    setLoading(true);
    try {
      await userService.deleteUserAccount();
        toast.success(t('toastAccountDeleted'));
        logout();

    } catch (error) {

      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error(t('toastError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPro = () => {
    setShowSelectPlanModal(true);
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      // Redirect to Stripe Customer Portal for subscription management
      await subscriptionService.createPortalSession();
      // Note: User will be redirected to Stripe, so loading state doesn't need to be reset
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast.error(t('toastError'));
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancelSubscription = async () => {
    setLoading(true);
    try {
      await subscriptionService.cancelSubscription();

      // Refresh user data
      await checkSession();

      // Refetch subscription status to show updated cancelAtPeriodEnd
      const csrfToken = await csrfService.getToken();
      const response = await fetch(`${API_BASE_URL}/subscription/status`, {
        method: "GET",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok && data.success && data.data?.subscription) {
        setSubscriptionInfo(data.data.subscription);
      }

      toast.success(t('toastCancelSuccess'));
      setShowCancelModal(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(t('toastCancelFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard type="user-only" title="Settings - Linkkk">
      <Navigation showCreate={false} />

      <div className="relative p-2 md:p-4 md:mt-20 md:max-w-3/4 mx-auto">
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
            className="text-4xl font-black mb-2 italic"
          >
            {t('title')}
          </motion.h1>

          {/* Mobile Tab Selector - Above content on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
            className="md:hidden px-2 flex gap-2 overflow-x-auto scrollbar-hide pb-2"
          >
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const bgColor = "bg-dark/5";
              let activeColor = "";

              if (isActive) {
                if (tab.id === "account") {
                  activeColor = "bg-primary text-dark border border-dark shadow-[4px_4px_0_var(--color-dark)]";
                } else if (tab.id === "security") {
                  activeColor = "bg-secondary text-light border border-dark shadow-[4px_4px_0_var(--color-dark)]";
                } else if (tab.id === "danger") {
                  activeColor = "bg-danger text-light border border-dark shadow-[4px_4px_0_var(--color-dark)]";
                }
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${isActive ? activeColor : bgColor
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </motion.div>

          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
              className="hidden md:flex flex-col gap-2 min-w-[200px]"
            >
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const bgColor = "bg-dark/5 hover:bg-dark/10";
                let activeColor = "";

                if (isActive) {
                  if (tab.id === "account") {
                    activeColor = "bg-primary text-dark border border-dark shadow-[4px_4px_0_var(--color-dark)]";
                  } else if (tab.id === "security") {
                    activeColor = "bg-secondary text-light border border-dark shadow-[4px_4px_0_var(--color-dark)]";
                  } else if (tab.id === "danger") {
                    activeColor = "bg-danger text-light border border-dark shadow-[4px_4px_0_var(--color-dark)]";
                  }
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${isActive ? activeColor : bgColor
                      }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Content Area */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "backInOut" }}
              className="flex-1 space-y-6 w-full"
            >
              {activeTab === "account" && (
                <div className="space-y-6">
                  {/* Username Section */}
                  <div className="p-4 bg-dark/5 rounded-2xl border-2 border-dashed border-transparent focus-within:border-dark transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <TbUser size={20} />
                      <h3 className="text-xl font-bold">{t('username')}</h3>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('usernamePlaceholder')}
                      className="w-full p-3 bg-dark/5 rounded-xl border-2 border-dashed border-transparent focus:border-dark outline-none transition-colors"
                    />
                    <Button
                      variant="solid"
                      size="sm"
                      rounded="xl"
                      onClick={handleUpdateUsername}
                      disabled={loading}
                      className="mt-3 bg-dark hover:bg-primary hover:text-dark border border-dark"
                    >
                      {t('updateUsername')}
                    </Button>
                  </div>

                  {/* Email Section */}
                  <div className="p-4 bg-dark/5 rounded-2xl border-2 border-dashed border-transparent focus-within:border-dark transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <TbMail size={20} />
                      <h3 className="text-xl font-bold">{t('email')}</h3>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className="w-full p-3 bg-dark/5 rounded-xl border-2 border-dashed border-transparent focus:border-dark outline-none transition-colors"
                    />
                    <Button
                      variant="solid"
                      size="sm"
                      rounded="xl"
                      onClick={handleUpdateEmail}
                      disabled={loading}
                      className="mt-3 bg-dark hover:bg-secondary hover:text-light border border-dark"
                    >
                      {t('updateEmail')}
                    </Button>
                  </div>

                  {/* Plan Section */}
                  <div className={`p-4 rounded-2xl border-2 ${user?.role === 'PRO' ? 'border-secondary shadow-[4px_4px_0_var(--color-secondary)]' : 'bg-dark/5 border-dashed border-transparent'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {user?.role === 'PRO' ? <TbSparkles size={20} /> : <TbStar size={20} />}
                      <h3 className="text-xl font-bold">{t('plan')}</h3>
                      <span className={`px-2 py-0.5 text-xs font-black italic rounded-full border border-dark shadow-[2px_2px_0_var(--color-dark)] ${user?.role === 'PRO' ? 'bg-secondary text-light' : 'bg-dark/10 text-dark'}`}>
                        {user?.role === 'PRO' ? 'PRO' : 'STANDARD'}
                      </span>
                    </div>
                    {user?.role === 'STANDARD' ? (
                      <Button
                        variant="solid"
                        size="md"
                        rounded="xl"
                        leftIcon={<TbSparkles size={20} />}
                        onClick={handleUpgradeToPro}
                        disabled={loading}
                        className="bg-warning hover:bg-warning/90 text-dark border border-dark hover:shadow-[4px_4px_0_var(--color-dark)] font-bold"
                      >
                        <p className="font-black italic">
                          {t('upgradeToPro')}
                        </p>
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        {/* Subscription Status */}
                        {subscriptionInfo && (
                          <div className="space-y-3">
                            {/* Status Badge */}
                            <div>
                              <p className="text-sm font-bold text-dark/70 mb-2">{t('subscriptionStatus')}</p>
                              <span className={`inline-block px-2 py-0.5 text-xs font-black italic rounded-full border border-dark shadow-[2px_2px_0_var(--color-dark)] ${
                                subscriptionInfo.status === 'ACTIVE' ? 'bg-primary text-dark' :
                                subscriptionInfo.status === 'TRIALING' ? 'bg-info text-light' :
                                subscriptionInfo.status === 'PAST_DUE' ? 'bg-warning text-dark' :
                                subscriptionInfo.status === 'CANCELED' ? 'bg-danger text-light' :
                                'bg-dark/10 text-dark'
                              }`}>
                                {subscriptionInfo.status}
                              </span>
                            </div>

                            {/* Warning for PAST_DUE */}
                            {subscriptionInfo.status === 'PAST_DUE' && (
                              <p className="text-sm text-dark/70">
                                ⚠️ {t('paymentIssue')}
                              </p>
                            )}

                            {/* Cancellation Notice */}
                            {subscriptionInfo.cancelAtPeriodEnd && subscriptionInfo.currentPeriodEnd && (
                              <p className="text-sm text-dark/70">
                                {t('cancellationNoticeBefore')}{' '}
                                <span className="underline decoration-2 underline-offset-2">
                                  {new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}
                                </span>
                                {t('cancellationNoticeAfter')}
                              </p>
                            )}

                            {/* Renewal Information */}
                            {subscriptionInfo.currentPeriodEnd && !subscriptionInfo.cancelAtPeriodEnd && subscriptionInfo.status === 'ACTIVE' && (
                              <div>
                                <p className="text-sm font-bold text-dark/70 mb-1">
                                  {t('renewsOn')}
                                </p>
                                <p className="text-base font-bold">
                                  {new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-dark/60 mt-1">
                                  {t('daysUntilRenewal', {
                                    days: Math.ceil(
                                      (new Date(subscriptionInfo.currentPeriodEnd).getTime() - Date.now()) /
                                        (1000 * 60 * 60 * 24)
                                    ),
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Manage Subscription Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          rounded="xl"
                          onClick={handleManageSubscription}
                          disabled={loading}
                          className="bg-transparent hover:bg-danger hover:text-light border border-dark"
                        >
                          {t('manageSubscription')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="p-4 bg-dark/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <TbLogout size={20} />
                      <h3 className="text-xl font-bold">{t('signOut')}</h3>
                    </div>
                    <p className="text-sm text-dark/60 mb-3">
                      {t('signOutDescription')}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      rounded="xl"
                      leftIcon={<TbLogout size={20} />}
                      onClick={handleLogout}
                      className="mt-3 bg-dark text-light hover:bg-danger hover:text-light border border-dark"
                    >
                      {t('logout')}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  {/* Password Section */}
                  <div className="p-4 bg-dark/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <TbLock size={20} />
                      <h3 className="text-xl font-bold">{t('changePassword')}</h3>
                    </div>

                    <div className="space-y-3">
                      {/* New Password */}
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t('newPassword')}
                          className="w-full p-3 pr-12 bg-dark/5 rounded-xl border-2 border-dashed border-transparent focus:border-dark outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/60 hover:text-dark"
                        >
                          {showNewPassword ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                        </button>
                      </div>

                      {/* Confirm Password */}
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={t('confirmNewPassword')}
                          className="w-full p-3 pr-12 bg-dark/5 rounded-xl border-2 border-dashed border-transparent focus:border-dark outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/60 hover:text-dark"
                        >
                          {showConfirmPassword ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                        </button>
                      </div>

                      <Button
                        variant="solid"
                        size="sm"
                        rounded="xl"
                        onClick={handleUpdatePassword}
                        disabled={loading}
                        className="bg-dark hover:bg-secondary hover:text-light border border-dark"
                      >
                        {t('updatePassword')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "danger" && (
                <div className="space-y-6">
                  {/* Delete All Links */}
                  <div className="p-4 bg-danger/5 rounded-2xl border border-danger shadow-[4px_4px_0_var(--color-danger)]">
                    <div className="flex items-center gap-2 mb-3">
                      <TbTrash size={20} className="text-dark" />
                      <h3 className="text-xl font-bold text-dark">{t('deleteAllLinks')}</h3>
                    </div>
                    <p className="text-sm text-dark/70 mb-3">
                      {t('deleteAllLinksDescription')}
                    </p>
                    <Button
                      variant="solid"
                      size="sm"
                      rounded="xl"
                      leftIcon={<TbTrash size={20} />}
                      onClick={handleDeleteAllLinks}
                      disabled={loading}
                      className="mt-3 bg-danger hover:text-light border border-dark"
                    >
                      {t('deleteAllLinks')}
                    </Button>
                  </div>

                  {/* Delete Account */}
                  <div className="p-4 bg-danger/5 rounded-2xl border border-danger shadow-[4px_4px_0_var(--color-danger)]">
                    <div className="flex items-center gap-2 mb-3">
                      <TbAlertTriangle size={20} className="text-dark" />
                      <h3 className="text-xl font-bold text-dark">{t('deleteAccount')}</h3>
                    </div>
                    <p className="text-sm text-dark/70 mb-3">
                      {t('deleteAccountDescription')}
                    </p>
                    <Button
                      variant="solid"
                      size="sm"
                      rounded="xl"
                      leftIcon={<TbAlertTriangle size={20} />}
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="mt-3 bg-danger hover:text-light border border-dark"
                    >
                      {t('deleteAccount')}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelSubscription}
        loading={loading}
      />

      {/* Select Plan Modal */}
      <SelectPlanModal
        open={showSelectPlanModal}
        onClose={() => setShowSelectPlanModal(false)}
      />
    </RouteGuard>
  );
}