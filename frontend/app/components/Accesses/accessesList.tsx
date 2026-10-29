import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { TbShieldCheck, TbShieldX, TbRobot, TbUser, TbWifi, TbBrowser, TbLocationOff, TbShare3, TbQrcode, TbClick } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import Button from '../ui/Button/Button';
import { useToast } from "@/app/hooks/useToast";
import { useLinkAccessEvent } from "@/app/hooks/useLinkAccessEvent";
import { useTranslations } from 'next-intl';

interface Access {
    id: number;
    linkId: number;
    createdAt: string;
    userAgent: string;
    ip: string;
    country: string;
    isVPN: boolean;
    isBot: boolean;
    source: string;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
}

interface AccessesListProps {
    shortUrl: string;
}

export const AccessesList = ({ shortUrl }: AccessesListProps) => {
    const t = useTranslations('AccessesList');
    const toast = useToast();
    const [accesses, setAccesses] = useState<Access[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getLinkAccesses = async (shortUrl: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accesses/link/${shortUrl}`, {
                credentials: "include",
            });
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching accesses:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const fetchData = useCallback(async () => {
        const d = await getLinkAccesses(shortUrl);
        setAccesses(d);
    }, [shortUrl]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Prepend the new access as soon as it happens instead of waiting for a manual refresh
    useLinkAccessEvent(shortUrl, fetchData);

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

    // Normaliza el nombre del navegador al slug que usa Simple Icons
    const getBrowserSlug = (browserName: string): string => {
        const slugMap: Record<string, string> = {
            'Chrome': 'googlechrome',
            'Edge': 'microsoftedge',
        };

        // Si tiene mapeo específico, lo usa; si no, convierte a minúsculas
        return slugMap[browserName] || browserName.toLowerCase();
    };

    // Genera la URL del logo automáticamente desde el nombre del navegador
    const getBrowserLogoUrl = (browserName: string): string | null => {
        if (browserName === 'Unknown') return null;
        const slug = getBrowserSlug(browserName);
        return `https://cdn.simpleicons.org/${slug}`;
    };

    const anonymizeIp = (ip: string): string => {
        if (ip.includes(':')) {
            // IPv6: mask last two groups
            const parts = ip.split(':');
            return parts.slice(0, -2).join(':') + ':***:***';
        }
        // IPv4: mask last octet
        const parts = ip.split('.');
        return parts.slice(0, 3).join('.') + '.***';
    };

    const getBrowserInfo = (userAgent: string) => {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    };

    // ── Cell pieces shared by the desktop table and the mobile cards ──

    const sourceChip = (access: Access) =>
        access.source === 'qr' ? (
            <div className="px-2 py-1 bg-dark text-light rounded-lg flex items-center gap-1">
                <TbQrcode size={12} />
                <span className="text-xs font-black">QR</span>
            </div>
        ) : (
            <div className="px-2 py-1 bg-dark/10 rounded-lg flex items-center gap-1">
                <TbClick size={12} className="text-dark" />
                <span className="text-xs font-black text-dark">{t('direct')}</span>
            </div>
        );

    const countryLabel = (access: Access) => (
        <div className="flex items-center gap-1.5">
            {access.country && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={`https://flagcdn.com/20x15/${access.country.toLowerCase()}.png`}
                    alt={access.country}
                    className="w-4 h-3 object-cover rounded-sm flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            )}
            <span className="font-bold text-xs">{access.country || '—'}</span>
        </div>
    );

    const browserLabel = (browser: string) => (
        <div className="flex items-center gap-1.5">
            {getBrowserLogoUrl(browser) ? (
                <Image
                    src={getBrowserLogoUrl(browser)!}
                    alt={browser}
                    width={16}
                    height={16}
                    className="object-contain"
                    unoptimized
                />
            ) : (
                <TbBrowser size={16} className="text-dark/40" />
            )}
            <span className="text-xs font-bold">{browser}</span>
        </div>
    );

    const ipLabel = (access: Access) => (
        <code className="px-1.5 py-1 bg-dark/5 rounded-lg text-xs font-mono font-bold border border-dark/10">
            {anonymizeIp(access.ip)}
        </code>
    );

    const flags = (access: Access) => (
        <div className="flex justify-center items-center gap-1.5">
            {access.isVPN ? (
                <div className="px-1.5 py-0.5 bg-danger text-light rounded-lg flex items-center gap-1" title="VPN">
                    <TbShieldX size={11} />
                    <span className="text-xs font-black">VPN</span>
                </div>
            ) : (
                <TbShieldCheck size={14} className="text-dark/20" title="No VPN" />
            )}
            {access.isBot ? (
                <div className="px-1.5 py-0.5 bg-danger text-light rounded-lg flex items-center gap-1" title="Bot">
                    <TbRobot size={11} />
                    <span className="text-xs font-black">Bot</span>
                </div>
            ) : (
                <TbUser size={14} className="text-dark/20" title="No Bot" />
            )}
        </div>
    );

    const hasUtm = (access: Access) => Boolean(access.utmSource || access.utmMedium || access.utmCampaign);
    const anyUtm = accesses.some(hasUtm);

    const campaignLabel = (access: Access) => {
        if (!hasUtm(access)) return <span className="text-xs text-dark/30">—</span>;
        const channel = [access.utmSource, access.utmMedium].filter(Boolean).join(' · ');
        return (
            <div className="flex flex-col min-w-0">
                {access.utmCampaign && <span className="text-xs font-bold truncate">{access.utmCampaign}</span>}
                {channel && <span className="text-[11px] text-dark/50 truncate">{channel}</span>}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="w-full py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-dark/50 font-medium">{t('loadingAccesses')}</p>
            </div>
        );
    }

    // Empty state
    if (accesses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full py-8 md:py-12"
            >
                <div className="md:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-mb-4 ">
                        <TbLocationOff size={32} className="text-secondary" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black italic mb-2">{t('noClicksYet')}</h3>
                    <p className="text-dark/60 text-sm md:text-base">{t('shareYourLink')}</p>
                    <Button
                        variant='solid'
                        size='md'
                        rounded='2xl'
                        leftIcon={<TbShare3 size={20} />}
                        onClick={() => {
                            navigator.clipboard.writeText(`https://linkkk.dev/r/${shortUrl}`);
                            toast.success(t('linkCopied'));
                        }}
                        className='mt-2 hover:bg-primary hover:text-dark'
                    >
                        {t('shareLink')}
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full space-y-3">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 mb-4"
            >
                <TbWifi size={24} className="" />
                <h3 className="text-xl font-black">{t('recentAccesses')} ({accesses.length})</h3>
            </motion.div>

            {/* Desktop: table */}
            <div className="hidden md:block w-full overflow-x-auto rounded-2xl scrollbar-hide">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-dark/15">
                            <th className="px-2 py-2 text-left font-black italic text-xs">
                                {t('time')}
                            </th>
                            <th className="px-2 py-2 text-center font-black italic text-xs">
                                {t('source')}
                            </th>
                            {anyUtm && (
                                <th className="px-2 py-2 text-left font-black italic text-xs">
                                    {t('campaign')}
                                </th>
                            )}
                            <th className="px-2 py-2 text-left font-black italic text-xs">
                                {t('location')}
                            </th>
                            <th className="px-2 py-2 text-left font-black italic text-xs">
                                {t('ipAddress')}
                            </th>
                            <th className="px-2 py-2 text-left font-black italic text-xs">
                                {t('browser')}
                            </th>
                            <th className="px-2 py-2 text-center font-black italic text-xs">
                                {t('flags')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-light">
                        {accesses.map((access, index) => {
                            const browser = getBrowserInfo(access.userAgent);
                            return (
                                <motion.tr
                                    key={access.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(index, 12) * 0.05, duration: 0.3 }}
                                    className="border-b border-dark/15 hover:bg-dark/5 transition-colors"
                                >
                                    <td className="px-2 py-2">
                                        <span className="font-bold text-xs" title={formatFullDate(access.createdAt)}>
                                            {formatDate(access.createdAt)}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2">
                                        <div className="flex justify-center">{sourceChip(access)}</div>
                                    </td>
                                    {anyUtm && <td className="px-2 py-2 max-w-48">{campaignLabel(access)}</td>}
                                    <td className="px-2 py-2">{countryLabel(access)}</td>
                                    <td className="px-2 py-2">{ipLabel(access)}</td>
                                    <td className="px-2 py-2">{browserLabel(browser)}</td>
                                    <td className="px-2 py-2">{flags(access)}</td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile: one compact card per access */}
            <ul className="md:hidden flex flex-col gap-2">
                {accesses.map((access) => (
                    <li key={access.id} className="bg-white border border-dark/10 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm" title={formatFullDate(access.createdAt)}>
                                {formatDate(access.createdAt)}
                            </span>
                            <div className="flex items-center gap-2">
                                {sourceChip(access)}
                                {flags(access)}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            {countryLabel(access)}
                            {browserLabel(getBrowserInfo(access.userAgent))}
                            {ipLabel(access)}
                        </div>
                        {hasUtm(access) && (
                            <div className="pt-2 border-t border-dark/10">{campaignLabel(access)}</div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
