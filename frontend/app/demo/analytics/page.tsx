"use client";
import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Button from '@/app/components/ui/Button/Button';
import { TbShieldCheck, TbShieldX, TbRobot, TbUser, TbBrowser, TbQrcode, TbClick, TbChartBar, TbArrowRight, TbLocationOff } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface DemoAccess {
  id: number;
  createdAt: string;
  userAgent: string;
  country: string;
  isVPN: boolean;
  isBot: boolean;
  source: string;
}

export default function DemoAnalyticsPage() {
  const t = useTranslations('DemoAnalytics');
  const searchParams = useSearchParams();
  const shortUrl = searchParams.get('shortUrl') || 'demo-detection';

  const [accesses, setAccesses] = useState<DemoAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccesses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accesses/demo/${shortUrl}`);
        const data = await response.json();
        setAccesses(data.data || []);
      } catch (error) {
        console.error('Error fetching demo accesses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccesses();
  }, [shortUrl]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return t('minAgo', { count: diffMins });
    if (diffHours < 24) return t('hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('daysAgo', { count: diffDays });

    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBrowserSlug = (browserName: string): string => {
    const slugMap: Record<string, string> = {
      'Chrome': 'googlechrome',
      'Edge': 'microsoftedge',
    };
    return slugMap[browserName] || browserName.toLowerCase();
  };

  const getBrowserLogoUrl = (browserName: string): string | null => {
    if (browserName === 'Unknown') return null;
    const slug = getBrowserSlug(browserName);
    return `https://cdn.simpleicons.org/${slug}`;
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  return (
    <RouteGuard type="public" title="Live Analytics Demo - Linkkk">
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-warning/5 via-light to-primary/5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 max-w-2xl"
        >
          <div className="inline-block bg-warning px-3 py-1 rounded-full mb-4 text-xs font-black italic uppercase tracking-wide">
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic mb-3">
            {t('title')}
          </h1>
          <p className="text-lg text-dark/60">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-5xl bg-light rounded-3xl p-4 md:p-8 shadow-sm border border-dark/5"
        >
          {isLoading ? (
            <div className="w-full py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-warning border-r-transparent"></div>
              <p className="mt-4 text-dark/50 font-medium">{t('loading')}</p>
            </div>
          ) : accesses.length === 0 ? (
            <div className="w-full py-12 text-center">
              <TbLocationOff size={32} className="mx-auto text-dark/30 mb-3" />
              <h3 className="text-xl font-black italic mb-2">{t('noAccessesYet')}</h3>
              <p className="text-dark/60">{t('noAccessesDescription')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <TbChartBar size={24} />
                <h3 className="text-xl font-black">{t('recentAccesses')} ({accesses.length})</h3>
              </div>

              <div className="w-full overflow-x-auto rounded-2xl scrollbar-hide">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-dark/15">
                      <th className="px-4 py-3 text-left font-black italic text-md">{t('time')}</th>
                      <th className="px-4 py-3 text-center font-black italic text-md">{t('source')}</th>
                      <th className="px-4 py-3 text-left font-black italic text-md">{t('location')}</th>
                      <th className="px-4 py-3 text-left font-black italic text-md">{t('browser')}</th>
                      <th className="px-4 py-3 text-center font-black italic text-md">{t('vpn')}</th>
                      <th className="px-4 py-3 text-center font-black italic text-md">{t('bot')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-light">
                    {accesses.map((access, index) => {
                      const browser = getBrowserInfo(access.userAgent);
                      const isFirst = index === 0;
                      return (
                        <motion.tr
                          key={access.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className={`border-b border-dark/15 transition-colors ${isFirst ? 'bg-warning/10' : 'hover:bg-dark/5'}`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">{formatDate(access.createdAt)}</span>
                                <span className="text-xs text-dark/50">{formatFullDate(access.createdAt)}</span>
                              </div>
                              {isFirst && (
                                <span className="px-2 py-0.5 bg-warning rounded-full text-[10px] font-black uppercase">
                                  {t('youLabel')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              {access.source === 'qr' ? (
                                <div className="px-3 py-1.5 bg-dark text-light rounded-lg flex items-center gap-1.5">
                                  <TbQrcode size={14} />
                                  <span className="text-xs font-black">QR</span>
                                </div>
                              ) : (
                                <div className="px-3 py-1.5 bg-dark/10 rounded-lg flex items-center gap-1.5">
                                  <TbClick size={14} className="text-dark" />
                                  <span className="text-xs font-black text-dark">{t('direct')}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-sm">{access.country}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {getBrowserLogoUrl(browser) ? (
                                <Image
                                  src={getBrowserLogoUrl(browser)!}
                                  alt={browser}
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                  unoptimized
                                />
                              ) : (
                                <TbBrowser size={20} className="text-dark/40" />
                              )}
                              <span className="text-sm font-bold">{browser}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              {access.isVPN ? (
                                <div className="px-3 py-1.5 bg-danger text-light rounded-lg flex items-center gap-1.5">
                                  <TbShieldX size={14} className="text-light" />
                                  <span className="text-xs font-black">{t('yes')}</span>
                                </div>
                              ) : (
                                <div className="px-3 py-1.5 bg-success rounded-lg flex items-center gap-1.5">
                                  <TbShieldCheck size={14} className="text-dark" />
                                  <span className="text-xs font-black">{t('no')}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              {access.isBot ? (
                                <div className="px-3 py-1.5 bg-danger text-light rounded-lg flex items-center gap-1.5">
                                  <TbRobot size={14} className="text-light" />
                                  <span className="text-xs font-black">{t('yes')}</span>
                                </div>
                              ) : (
                                <div className="px-3 py-1.5 bg-success rounded-lg flex items-center gap-1.5">
                                  <TbUser size={14} className="text-dark" />
                                  <span className="text-xs font-black">{t('no')}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-dark/50 mb-3">{t('ctaDescription')}</p>
          <Link href="/dashboard">
            <Button
              variant="solid"
              size="lg"
              rounded="2xl"
              rightIcon={<TbArrowRight size={20} />}
              className="bg-dark text-light hover:shadow-[4px_4px_0_var(--color-warning)] transition-all"
            >
              <span className="font-black italic">{t('cta')}</span>
            </Button>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="mt-6 text-center"
        >
          <Link href="/" className="text-sm text-dark/50">
            Powered by <span className="font-black italic">Linkkk.</span>
          </Link>
        </motion.div>
      </div>
    </RouteGuard>
  );
}
