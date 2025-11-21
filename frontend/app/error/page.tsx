"use client";
import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbHome, TbAlertTriangle, TbRefresh } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <RouteGuard type="public" title="Error - Linkkk">
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-danger/5 via-light to-warning/5">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="max-w-xl w-full bg-light rounded-3xl p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.5 }}
          className="w-24 h-24 mx-auto flex items-center justify-center"
        >
          <TbAlertTriangle size={56} className="text-danger" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-4xl md:text-5xl font-black italic mb-4 text-dark"
        >
          Something Went Wrong
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-dark/70 mb-6"
        >
          We encountered an unexpected error while processing your request.
        </motion.p>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-danger/10 border border-danger/20 rounded-2xl p-4 mb-6"
        >
          <p className="text-sm text-dark/80">
            Don&apos;t worry! This error has been logged and we&apos;ll look into it. Please try again in a few moments.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="flex flex-col gap-3"
        >
          <Button
            variant="solid"
            size="lg"
            rounded="2xl"
            leftIcon={<TbRefresh size={22} />}
            onClick={() => router.back()}
            className="w-full bg-secondary border border-dark text-dark hover:bg-secondary/90 hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
          >
            <p className='font-black italic'>
              Try Again
            </p>
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              rounded="2xl"
              leftIcon={<TbHome size={22} />}
              className="w-full border-2 border-dark text-dark hover:bg-dark/5 transition-all"
            >
              <p className='font-black italic'>
                Go to Home
              </p>
            </Button>
          </Link>

          <p className="text-xs text-dark/50 mt-2">
            If the problem persists, please contact support.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="mt-8 pt-6 border-t border-dark/10"
        >
          <p className="text-sm text-dark/50">
            Powered by <span className="font-black italic">Linkkk</span>
          </p>
        </motion.div>
      </motion.div>
      </div>
    </RouteGuard>
  );
}
