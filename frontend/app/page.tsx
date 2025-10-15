"use client"
import { useState } from "react";
import RouteGuard from "@/app/components/RouteGuard/RouteGuard";
import Navbar from "@/app/components/Navbar/Navbar";
import Input from "@/app/components/ui/Input/Input";
import Button from "@/app/components/ui/Button/Button";
import { useRouter } from "next/navigation";
import { TbBolt, TbArrowUpRight } from "react-icons/tb";
import * as motion from "motion/react-client";
import Link from "next/link";
import { useLinks } from "@/app/hooks/useLinks";
import { RiLoader5Fill } from "react-icons/ri";
import { useToast } from "@/app/hooks/useToast";

export default function Landing() {
  const { createLink } = useLinks();
  const router = useRouter();
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [isShortening, setIsShortening] = useState(false);

  const handleShorten = async () => {
    setIsShortening(true);
    const response = await createLink({ longUrl: url });

    if (response.success) {
      toast.success("Link created successfully!");
      setIsShortening(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 400);
    } else{
        
      if (response.errorCode === 'LINK_LIMIT_EXCEEDED') {
        toast.error('Link limit exceeded', {
            description: 'You\'ve reached your link limit. Upgrade your plan to create more links.',
            duration: 6000,
        });
      } else if (response.errorCode === 'UNAUTHORIZED') {
          toast.error('Session expired', {
              description: 'Please login again to continue.',
          });
      } else if (response.errorCode === 'INVALID_DATA') {
          toast.error('Invalid data', {
              description: 'Please check your input and try again.',
          });
      } else {
          toast.error('Failed to create link', {
              description: response.error || 'An unexpected error occurred.',
          });
      }

      setIsShortening(false);
    }
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
            transition={{ delay: 0.2, ease: "backInOut" }}
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
            transition={{ delay: 0.4, ease: "backInOut" }}
            className="w-full max-w-xl mx-auto"
          >
            <div className="relative flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-3xl shadow-[8px_8px_0_var(--color-dark)] border border-dark overflow-hidden">
              <motion.div
                animate={{
                  opacity: isShortening ? 0 : 1,
                  x: isShortening ? -20 : 0
                }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <Input
                  autoFocus
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  className="border-none shadow-none focus:ring-0 text-lg focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleShorten();
                    }
                  }}
                  disabled={isShortening}
                />
              </motion.div>
              <motion.div
                animate={{
                  width: isShortening ? "calc(100% - 1rem)" : "auto"
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Button
                  size="lg"
                  rounded="2xl"
                  className="
                  w-full h-full
                  bg-dark hover:bg-primary text-light hover:text-dark whitespace-nowrap
                  hover:shadow-[_4px_4px_0_var(--color-dark)]
                  disabled:bg-primary disabled:text-dark disabled:opacity-30 disabled:cursor-not-allowed
                  "
                  leftIcon={isShortening ? <RiLoader5Fill size={18} className="animate-spin" /> : <TbBolt size={18} />}
                  onClick={handleShorten}
                  disabled={isShortening || !url}
                >
                  <p className="font-black italic">
                    {isShortening ? "Generating..." : "Shorten"}
                  </p>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Link secundario simple */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: "backInOut" }}
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
                <TbArrowUpRight size={18} className="ml-2" />
              </p>
            </Link>
          </motion.div>
          
        </div>

      </section>


    </RouteGuard>
  );
}
