"use client";
import RouteGuard from "../../components/RouteGuard/RouteGuard";
import Navbar from "../../components/Navbar/Navbar";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../stores/authStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/useToast";
import Button from "@/app/components/ui/Button/Button";
import * as motion from "motion/react-client";
import { TbArrowUpRight } from "react-icons/tb";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username || !password) {
      toast.error("Campos requeridos", {
        description: "Por favor completa todos los campos",
      });
      return;
    }

    if (password.length < 8) {
      toast.error("Contraseña muy corta", {
        description: "La contraseña debe tener al menos 8 caracteres",
      });
      return;
    }

    const result = await register({ email, username, password });
    if (result.success) {
      toast.success("¡Cuenta creada exitosamente!", {
        description: "Bienvenido a Linkkk",
      });
      router.push("/dashboard");
    } else {
      toast.error("Error al registrarse", {
        description: result.error || "No se pudo crear la cuenta",
      });
    }
  };

  return (
    <RouteGuard type="public" title="Register - Linkkk">
      <Navbar />
      <main className="w-full h-[calc(100dvh-10rem)] flex items-center justify-center">
        <div className="text-dark bg-light p-8 w-11/12 md:w-3/4 max-w-xl mx-auto rounded-3xl">
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex flex-col">
              <motion.label
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ease: "backInOut" }}
                htmlFor="email"
              >
                Email
              </motion.label>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, ease: "backInOut" }}
                className="w-full"
              >
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
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
                transition={{ delay: 0.15, ease: "backInOut" }}
                htmlFor="username"
              >
                Username
              </motion.label>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ease: "backInOut" }}
                className="w-full"
              >
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full transition border-2 border-dark/25 text-dark rounded-xl p-1 px-2 hover:outline-none focus:outline-none focus:border-2 focus:border-dark"
                />
              </motion.div>
            </div>

            <div className="flex flex-col">
              <motion.label
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ease: "backInOut" }}
                htmlFor="password"
              >
                Password
              </motion.label>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, ease: "backInOut" }}
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
              transition={{ delay: 0.3, ease: "backInOut" }}
              className="w-full"
            >
              <Button
                variant="solid"
                size="lg"
                rounded="xl"
                type="submit"
                className="w-full mt-4 transition-all duration-300 ease-in-out hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
              >
                <p className="text-xl font-black italic">Sign Up</p>
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
              <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
              <p className="font-black italic z-20 relative inline-flex items-center">
                Already have an account?
                <span className="underline ml-2">Log In</span>
                <TbArrowUpRight size={18} className="ml-2" />
              </p>
            </Link>
          </motion.div>
        </div>
      </main>
    </RouteGuard>
  );
}
