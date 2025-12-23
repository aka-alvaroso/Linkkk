"use client"
import RouteGuard from "../../components/RouteGuard/RouteGuard";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/hooks";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/useToast";
import Button from "@/app/components/ui/Button/Button";
import * as motion from "motion/react-client";
import { TbArrowUpRight, TbX, TbEye, TbEyeOff, TbLogin } from "react-icons/tb";
import { useTranslations } from 'next-intl';

export default function Login() {
    const t = useTranslations('Auth');
    const tLogin = useTranslations('Auth.Login');
    const { login } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error(tLogin('requiredFields'), {
                description: tLogin('pleaseFillAllFields')
            });
            return;
        }

        const result = await login({ usernameOrEmail: email, password });
        if (result.success) {
            toast.success(tLogin('welcomeBack'));
            router.push('/dashboard');
        } else {
            toast.error(tLogin('loginFailed'), {
                description: result.error || tLogin('invalidCredentials')
            });
        }
    };

    return (
        <RouteGuard type="public" title="Login - Linkkk">
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
                        ">
                            Linkkk.
                        </motion.h1>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, ease: "backInOut" }}
                                className="w-full"
                            >
                                <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    placeholder={tLogin('emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full transition bg-dark/5 border-2 border-transparent text-dark rounded-xl p-2 px-3 hover:outline-none focus:outline-none focus:border-2 focus:border-dark focus:border-dashed"
                                />
                            </motion.div>

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
                                    placeholder={tLogin('passwordPlaceholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full transition bg-dark/5 border-2 border-transparent text-dark rounded-xl p-2 px-3 pr-12 hover:outline-none focus:outline-none focus:border-2 focus:border-dark focus:border-dashed"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/50 hover:text-info hover:cursor-pointer transition-colors"
                                    title={tLogin('togglePasswordTitle')}
                                >
                                    {showPassword ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                                </button>
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
                                    leftIcon={<TbLogin size={20} />}
                                    expandOnHover="icon"
                                    className="w-full mt-4 transition-all duration-300 ease-in-out hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                                >
                                    <p className="text-xl font-black italic">{tLogin('loginButton')}</p>
                                </Button>
                            </motion.div>
                        </form>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, ease: "backInOut" }}
                            className="text-center mt-8"
                        >
                            <Link href="/auth/register" className="relative group">
                                <div className="absolute top-0 left-0 w-0 h-full bg-warning z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                                <p className="font-black italic z-20 relative inline-flex flex-col md:flex-row items-center">
                                    {tLogin('noAccount')}
                                    <span className="underline ml-2 flex items-center">
                                        {tLogin('signUp')}
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