"use client";

import RouteGuard from "../../components/RouteGuard/RouteGuard";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/hooks/useToast";
import { authService } from "@/app/services/api/authService";
import { useAuthStore } from "@/app/stores/authStore";
import Button from "@/app/components/ui/Button/Button";
import * as motion from "motion/react-client";
import { TbX, TbEye, TbEyeOff, TbLink, TbAlertCircle, TbShieldLock } from "react-icons/tb";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useTranslations } from 'next-intl';

export default function LinkAccount() {
  const t = useTranslations('Auth');
  const tLink = useTranslations('Auth.LinkAccount');
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  // Helper function to get provider icon
  const getProviderIcon = () => {
    if (provider === "google") {
      return <FcGoogle size={32} />;
    } else if (provider === "github") {
      return <FaGithub size={32} />;
    }
    return null;
  };

  // Helper function to get provider display name
  const getProviderName = () => {
    if (provider === "google") return "Google";
    if (provider === "github") return "GitHub";
    return provider;
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const providerParam = searchParams.get('provider');

    if (!emailParam || !providerParam) {
      toast.error(tLink('invalidToken'), {
        description: tLink('pleaseRetry')
      });
      router.push('/auth/login');
      return;
    }

    setEmail(emailParam);
    setProvider(providerParam);
  }, [searchParams, router, toast, tLink]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error(tLink('passwordRequired'));
      return;
    }

    setIsLinking(true);

    try {
      const { user } = await authService.linkOAuthAccount(password);

      // Update auth store with linked user
      setUser(user);

      toast.success(tLink('linkingSuccess'), {
        description: `${tLink('canNowUse')} ${getProviderName()}`
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast.error(tLink('linkingFailed'), {
        description: error.message || tLink('pleaseRetry')
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleCancel = () => {
    router.push('/auth/login');
  };

  if (!email || !provider) {
    return null;
  }

  return (
    <RouteGuard type="public" title="Link Account - Linkkk">
      <main className="w-full min-h-[calc(100dvh-10rem)] flex flex-col items-center justify-center p-2 relative">
        {/* Home Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0, duration: 0.3, ease: "backInOut" }}
          className="absolute top-4 left-4"
        >
          <Link href="/">
            <Button
              variant="ghost"
              size="md"
              rounded="xl"
              leftIcon={<TbX size={22} />}
              expandOnHover="text"
              className="bg-dark/5 hover:bg-dark/10 p-2 leading-5"
            >
              {t('home')}
            </Button>
          </Link>
        </motion.div>

        <div className="text-dark bg-light p-6 md:p-8 w-11/12 md:w-3/4 max-w-xl mx-auto rounded-3xl">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "backInOut" }}
            className="text-3xl font-black mb-6 italic text-center
              transition-all duration-300 ease-in-out
              hover:text-primary
              hover:text-shadow-[_4px_4px_0_var(--color-dark)]"
          >
            {tLink('title')}
          </motion.h1>

          {/* OAuth Provider Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, ease: "backInOut" }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            {getProviderIcon()}
            <span className="font-bold text-lg">{email}</span>
          </motion.div>

          {/* Info Alert */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: "backInOut" }}
            className="bg-info/10 border-2 border-info/20 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <TbAlertCircle size={24} className="text-info flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                {tLink('accountExists')}
                <br />
                <br />
                {tLink('confirmationMessage')}
              </p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, ease: "backInOut" }}
              className="w-full relative"
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder={tLink('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLinking}
                className="w-full transition bg-dark/5 border-2 border-transparent text-dark rounded-xl p-2 px-3 pr-12 hover:outline-none focus:outline-none focus:border-2 focus:border-dark focus:border-dashed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/50 hover:text-info hover:cursor-pointer transition-colors disabled:opacity-50"
                title={tLink('togglePasswordTitle')}
                disabled={isLinking}
              >
                {showPassword ? <TbEyeOff size={20} /> : <TbEye size={20} />}
              </button>
            </motion.div>

            {/* Security Note */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: "backInOut" }}
              className="flex items-center gap-2 text-xs text-dark/60"
            >
              <TbShieldLock size={16} />
              <span>{tLink('securityNote')}</span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, ease: "backInOut" }}
              className="flex flex-col md:flex-row gap-3 mt-4"
            >
              <Button
                variant="outline"
                size="lg"
                rounded="xl"
                type="button"
                onClick={handleCancel}
                disabled={isLinking}
                className="flex-1 transition-all duration-300 ease-in-out hover:bg-dark/5 border-2 border-dark/20 hover:border-dark"
              >
                <p className="font-bold">{tLink('cancelButton')}</p>
              </Button>

              <Button
                variant="solid"
                size="lg"
                rounded="xl"
                type="submit"
                leftIcon={<TbLink size={20} />}
                expandOnHover="icon"
                disabled={isLinking}
                className="flex-1 transition-all duration-300 ease-in-out hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)] disabled:opacity-50"
              >
                <p className="font-bold">
                  {isLinking ? "..." : tLink('linkButton')}
                </p>
              </Button>
            </motion.div>
          </form>
        </div>
      </main>
    </RouteGuard>
  );
}
