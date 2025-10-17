"use client";
import Link from "next/link";
import Button from "@/app/components/ui/Button/Button";
import { TbHome, TbAlertTriangle, TbArrowLeft, TbDashboard } from "react-icons/tb";
import * as motion from "motion/react-client";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="max-w-lg w-full p-8 text-center"
      >
        {/* 404 Number */}
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
          className="text-9xl font-black italic text-primary leading-none text-shadow-[_6px_6px_0_var(--color-dark)] mb-6">
            <motion.span
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: "backOut" }}
            >
              4
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
            >
              0
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: "backOut" }}
            >
              4
            </motion.span>
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: "backOut" }}
          className="text-3xl font-black italic mb-4"
        >
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: "backOut" }}
          className="text-dark/70 mb-8 font-medium"
        >
          Oops! The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease: "backOut" }}
          className="flex flex-col gap-3"
        >
          <Link href="/">
            <Button
              variant="solid"
              size="lg"
              rounded="xl"
              leftIcon={<TbHome size={20} />}
              className="w-full bg-dark text-light hover:bg-primary hover:text-dark hover:shadow-[6px_6px_0_var(--color-dark)] transition-all"
            >
              <p className="font-black italic">Go to Home</p>
            </Button>
          </Link>

          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button
                variant="outline"
                size="md"
                rounded="xl"
                leftIcon={<TbDashboard size={20} />}
                className="w-full border-2 border-dark text-dark hover:text-dark hover:bg-transparent hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
              >
                <p className="font-bold italic">Dashboard</p>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="md"
              rounded="xl"
              leftIcon={<TbArrowLeft size={20} />}
              onClick={() => window.history.back()}
              className="flex-1 border-2 border-dark text-dark hover:text-dark hover:bg-transparent hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
            >
              <p className="font-bold italic">Go Back</p>
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-8 pt-6 border-t-2 border-dark/10"
        >
          <p className="text-sm text-dark/50 font-medium">
            Powered by{" "}
            <Link href="/" className="font-black italic hover:underline">
              Linkkk
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
