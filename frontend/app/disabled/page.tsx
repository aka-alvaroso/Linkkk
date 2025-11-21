"use client";
import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbHome, TbLinkOff } from 'react-icons/tb';
import * as motion from 'motion/react-client';

export default function DisabledPage() {
  return (
    <RouteGuard type="public" title="Link Disabled - Linkkk">
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-warning/5 via-light to-secondary/5">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="max-w-xl w-full bg-light rounded-3xl p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.5 }}
          className="w-24 h-24 mx-auto flex items-center justify-center"
        >
          <TbLinkOff size={56} className="text-warning" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-4xl md:text-5xl font-black italic mb-4 text-dark"
        >
          Link Disabled
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-dark/70 mb-6"
        >
          This link has been temporarily disabled by its owner.
        </motion.p>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-warning/10 border border-warning/20 rounded-2xl p-4 mb-6"
        >
          <p className="text-sm text-dark/80">
            The link owner has paused this short link. It may be re-enabled in the future.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="flex flex-col gap-3"
        >
          <Link href="/">
            <Button
              variant="solid"
              size="lg"
              rounded="2xl"
              leftIcon={<TbHome size={22} />}
              className="w-full bg-primary border border-dark text-dark hover:bg-primary/90 hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
            >
              <p className='font-black italic'>
                Go to Home
              </p>
            </Button>
          </Link>

          <p className="text-xs text-dark/50 mt-2">
            If you&apos;re the link owner, you can re-enable it from your dashboard.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="mt-8 pt-6"
        >
          <Link href="/" className="text-sm text-dark/50">
            Powered by <span className="font-black italic">Linkkk.</span>
          </Link>
        </motion.div>
      </motion.div>
      </div>
    </RouteGuard>
  );
}
