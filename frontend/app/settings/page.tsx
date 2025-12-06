"use client";
import { useState } from "react";
import RouteGuard from "@/app/components/RouteGuard/RouteGuard";
import Navigation from "@/app/components/Navigation/Navigation";
import { useAuth } from "@/app/hooks";
import { useAuthStore } from "@/app/stores/authStore";
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
} from "react-icons/tb";
import { csrfService } from "@/app/services/api/csrfService";

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
  const { user, logout } = useAuth();
  const { setUser } = useAuthStore();
  const toast = useToast();

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

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const csrfToken = await csrfService.getToken();
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        // Update the user in the auth store
        setUser({
          ...user!,
          ...data.data,
        });
        toast.success("Username updated successfully");
      } else {
        toast.error(data.message || "Failed to update username");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const csrfToken = await csrfService.getToken();
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        // Update the user in the auth store
        setUser({
          ...user!,
          ...data.data,
        });
        toast.success("Email updated successfully");
      } else {
        toast.error(data.message || "Failed to update email");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const csrfToken = await csrfService.getToken();
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Password updated successfully");
        setNewPassword("");
        setConfirmPassword("");
        // No need to update user state for password change
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAllLinks = async () => {
    if (!confirm("Are you sure you want to delete all your links? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const csrfToken = await csrfService.getToken();
      const response = await fetch(`${API_BASE_URL}/user/data`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });

      if (response.ok) {
        toast.success("All links deleted successfully");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete links");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone and will delete all your data.")) {
      return;
    }

    setLoading(true);
    try {
      const csrfToken = await csrfService.getToken();
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        logout();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An error occurred");
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
            Settings
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    isActive ? activeColor : bgColor
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
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive ? activeColor : bgColor
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
                      <h3 className="text-xl font-bold">Username</h3>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
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
                      Update Username
                    </Button>
                  </div>

                  {/* Email Section */}
                  <div className="p-4 bg-dark/5 rounded-2xl border-2 border-dashed border-transparent focus-within:border-dark transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <TbMail size={20} />
                      <h3 className="text-xl font-bold">Email</h3>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
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
                      Update Email
                    </Button>
                  </div>

                  {/* Logout Button */}
                  <div className="p-4 bg-dark/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <TbLogout size={20} />
                      <h3 className="text-xl font-bold">Sign Out</h3>
                    </div>
                    <p className="text-sm text-dark/60 mb-3">
                      Sign out of your account on this device
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      rounded="xl"
                      leftIcon={<TbLogout size={20} />}
                      onClick={handleLogout}
                      className="mt-3 bg-dark text-light hover:bg-danger hover:text-light border border-dark"
                    >
                      Logout
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
                      <h3 className="text-xl font-bold">Change Password</h3>
                    </div>

                    <div className="space-y-3">
                      {/* New Password */}
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
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
                          placeholder="Confirm new password"
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
                        Update Password
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
                      <h3 className="text-xl font-bold text-dark">Delete All Links</h3>
                    </div>
                    <p className="text-sm text-dark/70 mb-3">
                      This will permanently delete all your links. This action cannot be undone.
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
                      Delete All Links
                    </Button>
                  </div>

                  {/* Delete Account */}
                  <div className="p-4 bg-danger/5 rounded-2xl border border-danger shadow-[4px_4px_0_var(--color-danger)]">
                    <div className="flex items-center gap-2 mb-3">
                      <TbAlertTriangle size={20} className="text-dark" />
                      <h3 className="text-xl font-bold text-dark">Delete Account</h3>
                    </div>
                    <p className="text-sm text-dark/70 mb-3">
                      This will permanently delete your account and all associated data. This action cannot be undone.
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
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}