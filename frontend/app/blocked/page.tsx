"use client";
import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbHandStop, TbHome } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import { useTranslations } from 'next-intl';

export default function BlockedPage() {
  const t = useTranslations('PageBlocked');
  const searchParams = useSearchParams();
  const shortUrl = searchParams.get('url');
  const reason = searchParams.get('reason');

  return (
    <RouteGuard type="public" title={`${t('title')} - Linkkk`}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="max-w-xl w-full bg-light rounded-3xl  p-8 text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.5 }}
            className="w-24 h-24 mx-auto flex items-center justify-center"
          >
            <TbHandStop size={56} className="text-danger" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-4xl md:text-5xl font-black italic mb-4 text-dark"
          >
            {t('title')}
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
                {t('restrictedMessage', { link: `linkkk.dev/${shortUrl}` })}
              </p>
            )}

            {reason && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="bg-info/5 border border-info/20 rounded-2xl p-4 flex flex-col items-start"
              >
                <h6 className='font-bold text-info'>{t('reason')}</h6>
                <p className="text-dark/70">{reason}</p>
              </motion.div>
            )}
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
              {t('errorContactOwner')}
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
              {t('poweredBy')} <span className="font-black italic">Linkkk.</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </RouteGuard>
  );
}
