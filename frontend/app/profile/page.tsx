"use client";
import { useState, useEffect } from "react";
import RouteGuard from "@/app/components/RouteGuard/RouteGuard";
import Navbar from "@/app/components/Navbar/Navbar";
import { useAuthStore } from "@/app/stores/authStore";
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
} from "react-icons/tb";
import Input from "../components/ui/Input/Input";
import { getUserAvatarUrl } from "@/app/utils/gravatar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
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
    if (!username.trim()) return toast.error("Username requerido");

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
        toast.success("Username actualizado");
        useAuthStore.getState().setUser({ ...user!, username });
        setIsEditingUsername(false);
      } else {
        toast.error("Error al actualizar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) return toast.error("Email requerido");

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
        toast.success("Email actualizado");
        useAuthStore.getState().setUser({ ...user!, email });
        setIsEditingEmail(false);
      } else {
        toast.error("Error al actualizar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) return toast.error("Completa todos los campos");
    if (newPassword !== confirmPassword) return toast.error("Las contraseñas no coinciden");
    if (newPassword.length < 8) return toast.error("Mínimo 8 caracteres");

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
        toast.success("Contraseña actualizada");
        setNewPassword("");
        setConfirmPassword("");
        setIsEditingPassword(false);
      } else {
        toast.error("Error al actualizar");
      }
    } catch {
      toast.error("Error de conexión");
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
        setShowApiKey(true);
        toast.success("API Key generada");
      } else {
        toast.error("Error al generar API Key");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success("API Key copiada");
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
        toast.success("API Key eliminada");
      } else {
        toast.error("Error al resetear");
      }
    } catch {
      toast.error("Error de conexión");
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
        toast.success("Enlaces eliminados");
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDeleteText !== "DELETE") {
      return toast.error('Escribe "DELETE" para confirmar');
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Cuenta eliminada");
        setTimeout(() => logout(), 2000);
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <RouteGuard type="user-only" title="Profile - Linkkk">
      <Navbar />

      <div className="pt-24 w-full md:w-3/4 mx-auto flex flex-col items-center justify-center gap-8 px-4 pb-16">
        {/* User basic info */}
        <div className="flex w-full items-center justify-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "backInOut" }}
            className="relative size-18 rounded-full overflow-hidden border-2 border-dark shadow-[4px_4px_0_var(--color-dark)]"
          >
            {avatarUrl && (
              <Image
                src={avatarUrl}
                fill
                className="object-cover"
                alt={`${user?.username}'s avatar`}
              />
            )}
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, ease: "backInOut" }}
              className="font-black italic text-2xl max-w-48 md:max-w-96 text-ellipsis overflow-hidden"
            >
              {user?.username}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ease: "backInOut" }}
              className="italic max-w-48 md:max-w-96 text-ellipsis overflow-hidden"
            >
              {user?.email}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ease: "backInOut" }}
            className="ml-auto"
          >
            <Button
              size="lg"
              onClick={logout}
              leftIcon={<TbLogout size={24} />}
              className="bg-danger text-light hover:bg-danger hover:shadow-[_4px_4px_0_var(--color-dark)]"
              rounded="xl"
              iconOnly
            />
          </motion.div>
        </div>

        {/* Username */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: "backInOut" }}
          className="w-full flex flex-col"
        >
          <p className="text-lg font-bold">Username</p>
          <div className="flex items-center justify-between">
          {isEditingUsername ? (
            <div className="flex gap-2">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 rounded-2xl"
              />
              <Button
                size="md"
                rounded="xl"
                onClick={handleUpdateUsername}
                disabled={isUpdating}
                className="bg-primary hover:bg-primary text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
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
                className="border-2"
                iconOnly
              >
                <TbX size={20} />
              </Button>
            </div>
          ) : (
              <p className="">{user?.username}</p>
          )}
            {!isEditingUsername && (
              <Button
                size="xs"
                variant="outline"
                rounded="xl"
                onClick={() => setIsEditingUsername(true)}
                leftIcon={<TbEdit size={16} />}
                className="border-2"
              >
                <p className="font-bold italic">Edit</p>
              </Button>
            )}
          </div>

          
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ease: "backInOut" }}
          className="w-full flex flex-col"
        >
          <p className="text-lg font-bold">Email</p>
          <div className="flex items-center justify-between">
            {isEditingEmail ? (
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-2xl"
                />
                <Button
                  size="md"
                  rounded="xl"
                  onClick={handleUpdateEmail}
                  disabled={isUpdating}
                  className="bg-primary hover:bg-primary text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
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
                  className="border-2"
                  iconOnly
                >
                  <TbX size={20} />
                </Button>
              </div>
            ) : (
              <p className="">{user?.email}</p>
            )}
            {!isEditingEmail && (
              <Button
                size="xs"
                variant="outline"
                rounded="xl"
                onClick={() => setIsEditingEmail(true)}
                leftIcon={<TbEdit size={16} />}
                className="border-2"
              >
                <p className="font-bold italic">Edit</p>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: "backInOut" }}
          className="w-full flex flex-col"
        >
          <p className="text-lg font-bold">Password</p>
          <div className="flex items-center justify-between">
            {isEditingPassword ? (
              <div className="space-y-2 flex-1">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="rounded-2xl flex-1"
                  />
                  <Button
                    size="md"
                    rounded="xl"
                    onClick={handleUpdatePassword}
                    disabled={isUpdating}
                    className="bg-primary hover:bg-primary text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                    iconOnly
                  >
                    <TbCheck size={20} />
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    rounded="xl"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="border-2"
                    iconOnly
                  >
                    <TbX size={20} />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="">••••••••</p>
            )}
            {!isEditingPassword && (
              <Button
                size="xs"
                variant="outline"
                rounded="xl"
                onClick={() => setIsEditingPassword(true)}
                leftIcon={<TbEdit size={16} />}
                className="border-2"
              >
                <p className="font-bold italic">Change</p>
              </Button>
            )}
          </div>
        </motion.div>

        {/* API Key */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, ease: "backInOut" }}
          className="w-full flex flex-col gap-2"
        >
          <p className="text-lg font-bold">API Key</p>

          {apiKey ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="flex-1 font-mono"
                />
                <Button
                  size="md"
                  variant="outline"
                  rounded="xl"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="border-2"
                  iconOnly
                >
                  {showApiKey ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                </Button>
                <Button
                  size="md"
                  rounded="xl"
                  onClick={handleCopyApiKey}
                  className="bg-dark hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                  iconOnly
                >
                  <TbCopy size={20} />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  rounded="xl"
                  onClick={handleGenerateApiKey}
                  leftIcon={<TbRefresh size={16} />}
                  className="border-2"
                >
                  <p className="font-bold italic">Regenerate</p>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  rounded="xl"
                  onClick={handleResetApiKey}
                  leftIcon={<TbTrash size={16} />}
                  className="border-2 border-danger text-danger hover:bg-danger hover:text-light"
                >
                  <p className="font-bold italic">Reset</p>
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="md"
              rounded="xl"
              onClick={handleGenerateApiKey}
              leftIcon={<TbKey size={20} />}
              className="bg-dark hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)] w-fit"
            >
              <p className="font-bold italic">Generate API Key</p>
            </Button>
          )}
        </motion.div>

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: "backInOut" }}
          className="w-full flex flex-col gap-4 pt-8 border-t-2 border-danger/30"
        >
          <p className="text-lg font-bold text-danger">Danger Zone</p>

          {/* Delete Links */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">Delete all links</p>
            <Button
              size="sm"
              variant="outline"
              rounded="xl"
              onClick={handleDeleteLinks}
              disabled={isDeleting}
              leftIcon={<TbTrash size={16} />}
              className="border-2 border-danger text-danger hover:bg-danger hover:text-light w-fit"
            >
              <p className="font-bold italic">Delete All Links</p>
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">Delete account</p>
            <p className="text-xs ">
              Type <span className="font-bold text-danger">DELETE</span> to confirm
            </p>
            <Input
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              placeholder="DELETE"
              className="max-w-xs rounded-2xl"
            />
            <Button
              size="sm"
              rounded="xl"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmDeleteText !== "DELETE"}
              leftIcon={<TbTrash size={16} />}
              className="bg-danger text-light hover:bg-danger/80 disabled:opacity-50 w-fit"
            >
              <p className="font-bold italic">
                {isDeleting ? "Deleting..." : "Delete Account"}
              </p>
            </Button>
          </div>
        </motion.div>
      </div>
    </RouteGuard>
  );
}
