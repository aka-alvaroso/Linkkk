"use client"
import { useState } from "react";
import RouteGuard from "../components/RouteGuard/RouteGuard";
import Navbar from "../components/Navbar/Navbar";
import Input from "../components/ui/Input/Input";
import Button from "../components/ui/Button/Button";
import { useRouter } from "next/navigation";
import { TbBolt, TbExternalLink } from "react-icons/tb";
import * as motion from "motion/react-client";
import Link from "next/link";

export default function Landing() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const handleShorten = () => {
    // Redirige al dashboard con el URL pre-poblado
    router.push("/dashboard");
  };

  return (
    <RouteGuard type="public" title="Linkkk - Shorten Your URLs">
      <Navbar />

      <section className="w-full h-[calc(100vh-136px)] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full mx-auto space-y-8">

          {/* Headline simple y grande */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black italic text-center "
          >
            Your links,
            <br />
            <span className="text-shadow-[_6px_6px_0_var(--color-primary)]">
              supercharged
            </span>
          </motion.h1>

          {/* Input + Button (Google style) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-xl mx-auto"
          >
            <div className=" flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-3xl shadow-[8px_8px_0_var(--color-dark)] border border-dark">
              <Input
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="flex-1 border-none shadow-none focus:ring-0 text-lg focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleShorten();
                  }
                }}
              />
              <Button
                size="lg"
                rounded="2xl"
                className="bg-dark hover:bg-primary text-light hover:text-dark whitespace-nowrap
                hover:shadow-[_4px_4px_0_var(--color-dark)]"
                leftIcon={<TbBolt size={18} />}
                onClick={handleShorten}
              >
                <p className="font-black italic">
                  Shorten
                </p>
              </Button>
            </div>
          </motion.div>

          {/* Link secundario simple */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <Link
              href="/auth/login"
              className="relative group inline"
            >
              <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
              <p className="font-black italic z-20 relative inline-flex items-center">
                <span className="underline mr-2">
                  Sign in
                </span>
                to get full access
                <TbExternalLink size={18} className="ml-2" />
              </p>
            </Link>
          </motion.div>

        </div>
      </section>

    </RouteGuard>
  );
}
