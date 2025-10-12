"use client"
import RouteGuard from "../../components/RouteGuard/RouteGuard";
import Navbar from "../../components/Navbar/Navbar";
import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { useState } from "react";
import { useAuth } from "../../stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Register() {
    const { register } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !username || !password) {
            toast.error('Campos requeridos', {
                description: 'Por favor completa todos los campos'
            });
            return;
        }

        if (password.length < 6) {
            toast.error('Contraseña muy corta', {
                description: 'La contraseña debe tener al menos 6 caracteres'
            });
            return;
        }

        const result = await register({ email, username, password });
        if (result.success) {
            toast.success('¡Cuenta creada exitosamente!', {
                description: 'Bienvenido a Linkkk'
            });
            router.push('/dashboard');
        } else {
            toast.error('Error al registrarse', {
                description: result.error || 'No se pudo crear la cuenta'
            });
        }
    };

    return (
        <RouteGuard type="public" title="Register - Linkkk">
            <Navbar />
            <main className="mt-20 w-full h-[calc(100dvh-10rem)] flex items-center justify-center">
                <div className="bg-dark w-11/12 md:w-3/4 max-w-xl mx-auto p-1 text-light rounded-3xl">
                    <div className="w-full text-dark bg-light p-8 rounded-[20px]">
                        <h1 className="text-3xl font-black mb-6 italic text-center">Linkkk.</h1>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <div className="flex flex-col">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="transition border-2 border-dark/25 text-dark rounded-2xl p-1 px-2 hover:outline-none focus:outline-none focus:border-2 focus:border-dark"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    id="username"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="transition border-2 border-dark/25 text-dark rounded-2xl p-1 px-2 hover:outline-none focus:outline-none focus:border-2 focus:border-dark"
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
                                    className="transition border-2 border-dark/25 text-dark rounded-2xl p-1 px-2 hover:outline-none focus:outline-none focus:border-2 focus:border-dark"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full mt-4 bg-dark border-2 border-transparent text-light p-2 rounded-2xl transition hover:bg-transparent hover:border-dark hover:text-dark hover:cursor-pointer">
                                Sign Up
                            </button>
                        </form>
                    </div>
                    <div className="py-4 text-center flex items-center justify-center">
                        <Link href="/auth/login">
                            <p className="flex items-center gap-2 transition hover:text-light/75">
                                Already have an account?
                                <span className="underline flex items-center">
                                    Log In
                                    <LuArrowUpRight size={24}/>
                                </span>
                            </p>
                        </Link>
                    </div>
                </div>
            </main>
        </RouteGuard>
    );
}