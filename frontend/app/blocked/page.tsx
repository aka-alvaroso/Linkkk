"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbHome, TbLock, TbShieldX } from 'react-icons/tb';
import * as motion from 'motion/react-client';

export default function BlockedPage() {
  const searchParams = useSearchParams();
  const shortUrl = searchParams.get('url');
  const reason = searchParams.get('reason');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-danger/5 via-light to-warning/5">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="max-w-md w-full bg-light rounded-3xl border-2 border-dark shadow-[8px_8px_0_var(--color-dark)] p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.5 }}
          className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-danger/10 border-2 border-danger/20 shadow-[4px_4px_0_var(--color-danger)] flex items-center justify-center"
        >
          <TbShieldX size={56} className="text-danger" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-4xl md:text-5xl font-black italic mb-4 text-dark"
        >
          Access Blocked
        </motion.h1>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="space-y-3 mb-6"
        >
          {shortUrl && (
            <p className="text-dark/70">
              Access to <span className="font-bold text-dark px-2 py-1 bg-dark/5 rounded-lg">linkkk.dev/{shortUrl}</span> has been restricted.
            </p>
          )}

          {reason && (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4">
              <p className="text-sm font-semibold text-warning mb-1 flex items-center justify-center gap-2">
                <TbLock size={16} />
                Reason
              </p>
              <p className="text-dark/80">{reason}</p>
            </div>
          )}

          {message && (
            <div className="bg-info/10 border border-info/20 rounded-2xl p-4">
              <p className="text-dark/70 font-medium">{message}</p>
            </div>
          )}

          {!reason && !message && (
            <p className="text-dark/70">
              This link has been blocked based on access rules configured by the owner.
            </p>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-dark/5 rounded-2xl p-4 mb-6"
        >
          <p className="text-sm text-dark/60">
            Possible reasons for blocking:
          </p>
          <ul className="text-sm text-dark/70 mt-2 space-y-1 text-left">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-dark/40"></span>
              Geographic restrictions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-dark/40"></span>
              VPN/Proxy detection
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-dark/40"></span>
              Access limit reached
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-dark/40"></span>
              Device or network restrictions
            </li>
          </ul>
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
              size="md"
              rounded="2xl"
              leftIcon={<TbHome size={20} />}
              className="w-full bg-primary text-dark hover:bg-primary/90 hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
            >
              Go to Home
            </Button>
          </Link>

          <p className="text-xs text-dark/50 mt-2">
            If you believe this is an error, please contact the link owner.
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
            Protected by <span className="font-black italic">Linkkk</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
