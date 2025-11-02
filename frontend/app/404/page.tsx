"use client";
import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbHome, TbAlertTriangle } from 'react-icons/tb';
import * as motion from 'motion/react-client';

export default function NotFoundPage() {
  const searchParams = useSearchParams();
  const shortUrl = searchParams.get('url');

  return (
    <RouteGuard type="public" title="404 - Link Not Found">
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark/5 to-info/10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="max-w-md w-full bg-light rounded-3xl shadow-2xl p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.5 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center"
        >
          <TbAlertTriangle size={48} className="text-warning" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-4xl font-black italic mb-4"
        >
          Link Not Found
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-dark/70 mb-6"
        >
          {shortUrl ? (
            <>
              The short link <span className="font-bold text-dark">/{shortUrl}</span> doesn't exist or has been deleted.
            </>
          ) : (
            "The link you're looking for doesn't exist or has been deleted."
          )}
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex flex-col gap-3"
        >
          <Link href="/">
            <Button
              variant="solid"
              size="md"
              rounded="2xl"
              leftIcon={<TbHome size={20} />}
              className="w-full bg-info hover:bg-info/80"
            >
              Go to Home
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant="outline"
              size="md"
              rounded="2xl"
              className="w-full border-dark/20 text-dark/70 hover:bg-dark/5"
            >
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
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
