"use client";
import { useState, useEffect } from "react";
import RouteGuard from "@/app/components/RouteGuard/RouteGuard";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import { useAuth } from "@/app/hooks";
import { useAuthStore } from "@/app/stores/authStore";
import { useSidebarStore } from "@/app/stores/sidebarStore";
import { useToast } from "@/app/hooks/useToast";
import Button from "@/app/components/ui/Button/Button";
import * as motion from "motion/react-client";
import Image from "next/image";
import {
  TbLogout,
  TbEdit,
  TbCheck,
  TbX,
  TbKey,
  TbCopy,
  TbEye,
  TbEyeOff,
  TbTrash,
  TbRefresh,
  TbUser,
  TbLock,
  TbShieldLock,
  TbAlertTriangle,
} from "react-icons/tb";
import Input from "../components/ui/Input/Input";
import { getUserAvatarUrl } from "@/app/utils/gravatar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Edit states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Form values
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // API Key
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Delete
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Loading
  const [isUpdating, setIsUpdating] = useState(false);

  // Load avatar URL
  useEffect(() => {
    if (user?.email) {
      const url = getUserAvatarUrl(user.avatarUrl, user.email, 200);
      setAvatarUrl(url);
    }
  }, [user?.email, user?.avatarUrl]);

  const handleUpdateUsername = async () => {
    if (!username.trim()) return toast.error("Username required");

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Username updated");
        useAuthStore.getState().setUser({ ...user!, username });
        setIsEditingUsername(false);
      } else {
        toast.error("Failed to update");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) return toast.error("Email required");

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Email updated");
        useAuthStore.getState().setUser({ ...user!, email });
        setIsEditingEmail(false);
      } else {
        toast.error("Failed to update");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) return toast.error("Fill in all fields");
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match");
    if (newPassword.length < 8) return toast.error("Minimum 8 characters");

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Password updated");
        setNewPassword("");
        setConfirmPassword("");
        setIsEditingPassword(false);
      } else {
        toast.error("Failed to update");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/api-key`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApiKey(data.data.apiKey);
        toast.success("API Key generated");
      } else {
        toast.error("Failed to generate API Key");
      }
    } catch {
      toast.error("Connection error");
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success("API Key copied");
    }
  };

  const handleResetApiKey = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/api-key`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApiKey(null);
        toast.success("API Key deleted");
      } else {
        toast.error("Failed to reset");
      }
    } catch {
      toast.error("Connection error");
    }
  };

  const handleDeleteLinks = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/data`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Links deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDeleteText !== "DELETE") {
      return toast.error('Type "DELETE" to confirm');
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Account deleted");
        setTimeout(() => logout(), 2000);
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setIsDeleting(false);
    }
  };

  const { desktopOpen } = useSidebarStore();

  return (
    <RouteGuard type="user-only" title="Profile - Linkkk">
      <div className="relative md:flex md:flex-row justify-center p-4 md:gap-11 max-w-[128rem] mx-auto">
        <Sidebar />

        <div className={`mt-0 transition-all flex-1 md:pr-18 min-w-0 ${desktopOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <div className="w-full max-w-6xl mx-auto pb-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "backInOut" }}
          className="mb-6 flex flex-col md:flex-row items-center gap-6 p-8 bg-light border-2 border-dark rounded-3xl shadow-[8px_8px_0_var(--color-dark)]"
        >
          <div className="relative size-32 rounded-full overflow-hidden border-4 border-dark shadow-[4px_4px_0_var(--color-dark)]">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                fill
                className="object-cover"
                alt={`${user?.username}'s avatar`}
              />
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black italic mb-2">
              {user?.username}
            </h1>
            <p className="text-lg text-dark/70 italic">
              {user?.email}
            </p>
          </div>

          <Button
            size="lg"
            onClick={logout}
            leftIcon={<TbLogout size={24} />}
            className="bg-danger text-light hover:bg-danger hover:shadow-[4px_4px_0_var(--color-dark)]"
            rounded="2xl"
          >
            <span className="font-black italic">Logout</span>
          </Button>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Account Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: "backInOut" }}
            className="p-6 bg-light border-2 border-dark rounded-3xl shadow-[6px_6px_0_var(--color-dark)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-info/20 border-2 border-dark rounded-2xl">
                <TbUser size={28} className="text-info" />
              </div>
              <h2 className="text-2xl font-black italic">Account</h2>
            </div>

            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="text-sm font-bold text-dark/70 mb-2 block">Username</label>
                {isEditingUsername ? (
                  <div className="flex gap-2">
                    <Input
                      value={username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                      className="flex-1 rounded-2xl"
                    />
                    <Button
                      size="md"
                      rounded="xl"
                      onClick={handleUpdateUsername}
                      disabled={isUpdating}
                      className="bg-primary hover:bg-primary text-dark"
                      iconOnly
                    >
                      <TbCheck size={20} />
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      rounded="xl"
                      onClick={() => {
                        setIsEditingUsername(false);
                        setUsername(user?.username || "");
                      }}
                      iconOnly
                    >
                      <TbX size={20} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-dark/5 rounded-2xl">
                    <span className="font-medium">{user?.username}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      rounded="xl"
                      onClick={() => setIsEditingUsername(true)}
                      leftIcon={<TbEdit size={16} />}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-bold text-dark/70 mb-2 block">Email</label>
                {isEditingEmail ? (
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="flex-1 rounded-2xl"
                    />
                    <Button
                      size="md"
                      rounded="xl"
                      onClick={handleUpdateEmail}
                      disabled={isUpdating}
                      className="bg-primary hover:bg-primary text-dark"
                      iconOnly
                    >
                      <TbCheck size={20} />
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      rounded="xl"
                      onClick={() => {
                        setIsEditingEmail(false);
                        setEmail(user?.email || "");
                      }}
                      iconOnly
                    >
                      <TbX size={20} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-dark/5 rounded-2xl">
                    <span className="font-medium">{user?.email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      rounded="xl"
                      onClick={() => setIsEditingEmail(true)}
                      leftIcon={<TbEdit size={16} />}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Security Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ease: "backInOut" }}
            className="p-6 bg-light border-2 border-dark rounded-3xl shadow-[6px_6px_0_var(--color-dark)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-warning/20 border-2 border-dark rounded-2xl">
                <TbLock size={28} className="text-warning" />
              </div>
              <h2 className="text-2xl font-black italic">Security</h2>
            </div>

            <div>
              <label className="text-sm font-bold text-dark/70 mb-2 block">Password</label>
              {isEditingPassword ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="rounded-2xl pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/50 hover:text-dark"
                    >
                      {showPassword ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                    </button>
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="rounded-2xl"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="md"
                      rounded="2xl"
                      onClick={handleUpdatePassword}
                      disabled={isUpdating}
                      className="bg-primary hover:bg-primary text-dark flex-1"
                    >
                      <span className="font-black italic">Save</span>
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      rounded="2xl"
                      onClick={() => {
                        setIsEditingPassword(false);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      <span className="font-black italic">Cancel</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-dark/5 rounded-2xl">
                  <span className="font-medium">••••••••</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    rounded="xl"
                    onClick={() => setIsEditingPassword(true)}
                    leftIcon={<TbEdit size={16} />}
                  >
                    Change
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* API Key Card - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: "backInOut" }}
            className="lg:col-span-2 p-6 bg-light border-2 border-dark rounded-3xl shadow-[6px_6px_0_var(--color-dark)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-success/20 border-2 border-dark rounded-2xl">
                <TbShieldLock size={28} className="text-success" />
              </div>
              <h2 className="text-2xl font-black italic">API Access</h2>
            </div>

            {apiKey ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    readOnly
                    className="flex-1 font-mono rounded-2xl"
                  />
                  <Button
                    size="md"
                    variant="outline"
                    rounded="xl"
                    onClick={() => setShowApiKey(!showApiKey)}
                    iconOnly
                  >
                    {showApiKey ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                  </Button>
                  <Button
                    size="md"
                    rounded="xl"
                    onClick={handleCopyApiKey}
                    className="bg-dark hover:bg-primary hover:text-dark"
                    iconOnly
                  >
                    <TbCopy size={20} />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    rounded="2xl"
                    onClick={handleGenerateApiKey}
                    leftIcon={<TbRefresh size={16} />}
                  >
                    <span className="font-black italic">Regenerate</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    rounded="2xl"
                    onClick={handleResetApiKey}
                    leftIcon={<TbTrash size={16} />}
                    className="border-danger text-danger hover:bg-danger hover:text-light"
                  >
                    <span className="font-black italic">Delete</span>
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="lg"
                rounded="2xl"
                onClick={handleGenerateApiKey}
                leftIcon={<TbKey size={24} />}
                className="bg-dark hover:bg-primary hover:text-dark w-full md:w-auto"
              >
                <span className="font-black italic">Generate API Key</span>
              </Button>
            )}
          </motion.div>

          {/* Danger Zone Card - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, ease: "backInOut" }}
            className="lg:col-span-2 p-6 border-2 border-danger rounded-3xl shadow-[6px_6px_0_var(--color-danger)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-danger/20 border-2 border-danger rounded-2xl">
                <TbAlertTriangle size={28} className="text-danger" />
              </div>
              <h2 className="text-2xl font-black italic text-danger">Danger Zone</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delete Links */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-dark mb-1">Delete All Links</h3>
                  <p className="text-sm text-dark/60">
                    Permanently remove all your shortened links
                  </p>
                </div>
                <Button
                  size="md"
                  variant="outline"
                  rounded="2xl"
                  onClick={handleDeleteLinks}
                  disabled={isDeleting}
                  leftIcon={<TbTrash size={20} />}
                  className="border-2 border-danger text-danger hover:bg-danger hover:text-light w-full"
                >
                  <span className="font-black italic">Delete All Links</span>
                </Button>
              </div>

              {/* Delete Account */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-dark mb-1">Delete Account</h3>
                  <p className="text-sm text-dark/60 mb-2">
                    Type <span className="font-bold text-danger">DELETE</span> to confirm
                  </p>
                </div>
                <Input
                  value={confirmDeleteText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="rounded-2xl"
                />
                <Button
                  size="md"
                  rounded="2xl"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmDeleteText !== "DELETE"}
                  leftIcon={<TbTrash size={20} />}
                  className="bg-danger text-light hover:bg-danger/80 disabled:opacity-50 w-full"
                >
                  <span className="font-black italic">
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
        {/* End Grid Layout */}

          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
