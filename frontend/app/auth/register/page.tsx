"use client";
import RouteGuard from "../../components/RouteGuard/RouteGuard";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/hooks";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/useToast";
import Button from "@/app/components/ui/Button/Button";
import GoogleOAuthButton from "@/app/components/auth/GoogleOAuthButton";
import OAuthDivider from "@/app/components/auth/OAuthDivider";
import * as motion from "motion/react-client";
import { TbArrowUpRight, TbX, TbEye, TbEyeOff, TbRefresh, TbPlus } from "react-icons/tb";
import { useTranslations } from 'next-intl';

export default function Register() {
  const t = useTranslations('Auth');
  const tSignup = useTranslations('Auth.Signup');
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const generatePassword = () => {
    // Backend requirements: min 8 chars, at least 1 letter, 1 number, 1 special char
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specials = "!@#$%^&*";
    const allChars = letters + numbers + specials;

    const length = 16;
    let newPassword = "";

    // Ensure at least one of each required type
    newPassword += letters.charAt(Math.floor(Math.random() * letters.length));
    newPassword += numbers.charAt(Math.floor(Math.random() * numbers.length));
    newPassword += specials.charAt(Math.floor(Math.random() * specials.length));

    // Fill the rest with random characters
    for (let i = 3; i < length; i++) {
      newPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to randomize positions
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');

    setPassword(newPassword);
    setShowPassword(true);
    toast.success(tSignup('passwordGenerated'), {
      description: tSignup('securePasswordGenerated')
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username || !password) {
      toast.error(tSignup('requiredFields'), {
        description: tSignup('pleaseFillAllFields'),
      });
      return;
    }

    if (password.length < 8) {
      toast.error(tSignup('passwordTooShort'), {
        description: tSignup('passwordMinLength'),
      });
      return;
    }

    const result = await register({ email, username, password });
    if (result.success) {
      toast.success(tSignup('accountCreated'), {
        description: tSignup('welcomeToLinkkk'),
      });
      router.push("/dashboard");
    } else {
      toast.error(tSignup('registrationFailed'), {
        description: result.error || tSignup("couldNotCreateAccount"),
      });
    }
  };

  return (
    <RouteGuard type="public" title="Register - Linkkk">
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
                            hover:text-shadow-[_4px_4px_0_var(--color-dark)]
                        "
          >
            Linkkk.
          </motion.h1>

          {/* OAuth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, ease: "backInOut" }}
            className="w-full"
          >
            <GoogleOAuthButton variant="register" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.075, ease: "backInOut" }}
          >
            <OAuthDivider />
          </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ease: "backInOut" }}
              className="w-full"
            >
              <input
                type="email"
                name="email"
                id="email"
                placeholder={tSignup('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full transition bg-dark/5 border-2 border-transparent text-dark rounded-xl p-2 px-3 hover:outline-none focus:outline-none focus:border-2 focus:border-dark focus:border-dashed"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, ease: "backInOut" }}
              className="w-full"
            >
              <input
                type="text"
                name="username"
                id="username"
                placeholder={tSignup('usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full transition bg-dark/5 border-2 border-transparent text-dark rounded-xl p-2 px-3 hover:outline-none focus:outline-none focus:border-2 focus:border-dark focus:border-dashed"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: "backInOut" }}
              className="w-full relative"
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder={tSignup('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full transition bg-dark/5 border-2 border-transparent text-dark rounded-xl p-2 px-3 pr-24 hover:outline-none focus:outline-none focus:border-2 focus:border-dark focus:border-dashed"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-dark/50 hover:text-secondary transition-colors hover:cursor-pointer"
                  title={tSignup('generatePasswordTitle')}
                >
                  <TbRefresh size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-dark/50 hover:text-info transition-colors hover:cursor-pointer"
                  title={tSignup('togglePasswordTitle')}
                >
                  {showPassword ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ease: "backInOut" }}
              className="w-full"
            >
              <Button
                variant="solid"
                size="lg"
                rounded="xl"
                type="submit"
                leftIcon={<TbPlus size={20} />}
                expandOnHover="icon"
                className="w-full mt-4 transition-all duration-300 ease-in-out hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
              >
                <p className="text-xl font-black italic">{tSignup('signUpButton')}</p>
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, ease: "backInOut" }}
            className="text-center mt-8"
          >
            <Link href="/auth/login" className="relative group">
              <div className="absolute top-0 left-0 w-0 h-full bg-warning z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
              <p className="font-black italic z-20 relative inline-flex flex-col md:flex-row items-center">
                {tSignup('alreadyHaveAccount')}
                <span className="underline ml-2 flex items-center">{tSignup('logIn')}
                <TbArrowUpRight size={18} className="ml-2" />
                </span>
              </p>
            </Link>
          </motion.div>
        </div>
      </main>
    </RouteGuard>
  );
}
