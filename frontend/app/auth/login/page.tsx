"use client"
import RouteGuard from "../../components/RouteGuard/RouteGuard";
import Navbar from "../../components/Navbar/Navbar";
import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { useState } from "react";
import { useAuth } from "@/app/hooks";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/useToast";
import Button from "@/app/components/ui/Button/Button";
import * as motion from "motion/react-client";
import { TbArrowUpRight } from "react-icons/tb";
import Image from "next/image";

export default function Login() {
    const { login } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Required fields', {
                description: 'Please fill in all fields'
            });
            return;
        }

        const result = await login({ usernameOrEmail: email, password });
        if (result.success) {
            toast.success('Welcome back!');
            router.push('/dashboard');
        } else {
            toast.error('Login failed', {
                description: result.error || 'Invalid credentials'
            });
        }
    };

    return (
        <RouteGuard type="public" title="Login - Linkkk">
            <Navbar />
            <main className="w-full h-[calc(100dvh-10rem)] flex items-center justify-center">
                <div className="text-dark bg-light p-8 w-11/12 md:w-3/4 max-w-xl mx-auto rounded-3xl z-120 border">
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

                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <div className="flex flex-col">
                                <motion.label 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, ease: "backInOut" }}
                                    htmlFor="email">
                                    Email or username
                                </motion.label>
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, ease: "backInOut" }}
                                    className="w-full"
                                >
                                <input 
                                    type="text" 
                                    name="email" 
                                    id="email" 
                                    placeholder="Email or username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full transition border-2 border-dark/25 text-dark rounded-xl p-1 px-2 hover:outline-none focus:outline-none focus:border-2 focus:border-dark"
                                />
                                </motion.div>
                            </div>
                            <div className="flex flex-col">
                                <motion.label 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, ease: "backInOut" }}
                                    htmlFor="password">
                                    Password
                                </motion.label>
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, ease: "backInOut" }}
                                    className="w-full"
                                >
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full transition border-2 border-dark/25 text-dark rounded-xl p-1 px-2 hover:outline-none focus:outline-none focus:border-2 focus:border-dark"
                                />
                                </motion.div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, ease: "backInOut" }}
                                className="w-full"
                            >
                            <Button 
                                variant="solid"
                                size="lg"
                                rounded="xl"
                                type="submit" 
                                className="w-full mt-4 transition-all duration-300 ease-in-out hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                            >
                                <p className="text-xl font-black italic">
                                    Log In
                                </p>
                            </Button>
                            </motion.div>
                        </form>
                        

                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, ease: "backInOut" }}
                            className="text-center mt-8"
                        >
                            <Link
                            href="/auth/register"
                            className="relative group inlin"
                            >
                            <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                            <p className="font-black italic z-20 relative inline-flex items-center">
                                Don&apos;t have an account?
                                <span className="underline ml-2">
                                Create one
                                </span>
                                <TbArrowUpRight size={18} className="ml-2" />
                            </p>
                            </Link>
                        </motion.div>
                </div>
            </main>
        </RouteGuard>
    );
}