"use client";
import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbHome, TbAlertTriangle } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
  const searchParams = useSearchParams();
  const shortUrl = searchParams.get('url');
  const t = useTranslations('PageLinkNotFound');

  return (
    <RouteGuard type="public" title={`${t('title')} - Linkkk`}>
      <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="max-w-md w-full bg-light rounded-3xl p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.5 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning border border-dark flex items-center justify-center"
        >
          <TbAlertTriangle size={44} className="text-dark" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-4xl font-black italic mb-4"
        >
          {t('title')}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-dark/70 mb-6"
        >
          {shortUrl
            ? t.rich('descriptionWithLink', {
                link: `/${shortUrl}`,
                b: (chunks) => <span className="font-bold text-dark break-all">{chunks}</span>,
              })
            : t('description')}
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex flex-col gap-3"
        >
          <p className="text-sm text-dark/70">{t('hint')}</p>

          <Link href="/">
            <Button
              variant="solid"
              size="lg"
              rounded="2xl"
              leftIcon={<TbHome size={22} />}
              className="w-full bg-primary border border-dark text-dark hover:bg-primary/90 hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
            >
              <span className="font-black italic">{t('goToHome')}</span>
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
          <Link href="/" className="text-sm text-dark/70">
            {t('poweredBy')} <span className="font-black italic">Linkkk.</span>
          </Link>
        </motion.div>
      </motion.div>
      </div>
    </RouteGuard>
  );
}
