"use client"
import RouteGuard from "../../components/RouteGuard/RouteGuard";
import Navbar from "../../components/Navbar/Navbar";
import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { useState } from "react";
import { useAuth } from "../../stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/app/components/ui/Button/Button";

export default function Login() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Campos requeridos', {
                description: 'Por favor completa todos los campos'
            });
            return;
        }

        const result = await login({ usernameOrEmail: email, password });
        if (result.success) {
            toast.success('¡Bienvenido de nuevo!');
            router.push('/dashboard');
        } else {
            toast.error('Error al iniciar sesión', {
                description: result.error || 'Credenciales incorrectas'
            });
        }
    };

    return (
        <RouteGuard type="public" title="Login - Linkkk">
            <Navbar />
            <main className="w-full h-[calc(100dvh-10rem)] flex items-center justify-center">
                <div className="text-dark bg-light p-8 w-11/12 md:w-3/4 max-w-xl mx-auto rounded-3xl">
                        <h1 className="text-3xl font-black mb-6 italic text-center
                            transition-all duration-300 ease-in-out
                        hover:text-primary
                            hover:text-shadow-[_4px_4px_0_var(--color-dark)]
                        ">
                            Linkkk.
                        </h1>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <div className="flex flex-col">
                                <label htmlFor="email">Email or username</label>
                                <input 
                                    type="text" 
                                    name="email" 
                                    id="email" 
                                    placeholder="Email or username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="transition border-2 border-dark/25 text-dark rounded-xl p-1 px-2 hover:outline-none focus:outline-none focus:border-2 focus:border-dark"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="transition border-2 border-dark/25 text-dark rounded-xl p-1 px-2 hover:outline-none focus:outline-none focus:border-2 focus:border-dark"
                                />
                            </div>
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
                        </form>
                </div>
            </main>
        </RouteGuard>
    );
}