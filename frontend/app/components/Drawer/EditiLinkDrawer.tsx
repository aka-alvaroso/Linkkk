import React, { useState, useEffect, useCallback, useRef } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import { FiCornerDownRight } from 'react-icons/fi';
import { TbCircleDashed, TbCircleDashedCheck, TbCopy, TbList, TbPalette, TbCategory, TbPuzzle, TbQrcode, TbPencil, TbClick, TbWorld, TbShieldX, TbRobot } from 'react-icons/tb';
import Button from '../ui/Button/Button';
import { useLinks, useAuth } from '@/app/hooks';
import type { Link } from '@/app/types';
import { AccessesList } from '../Accesses/accessesList';
import { useToast } from '@/app/hooks/useToast';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { RulesManager } from '../LinkRules/RulesManager';
import { QRCodePreview, downloadQRCode, QRCodeEditor } from '../QRCode';
import { useQRConfig } from '@/app/hooks/useQRConfig';
import AnimatedText, { AnimatedTextRef } from '../ui/AnimatedText';
import { useTranslations } from 'next-intl';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statsService, type LinkStats, type StatsPeriod } from '@/app/services/api/statsService';

interface EditiLinkDrawerProps {
    open: boolean;
    onClose: () => void;
    link: Link;
}

export default function EditiLinkDrawer({ open, onClose, link }: EditiLinkDrawerProps) {
    const t = useTranslations('EditLinkDrawer');
    const { updateLink, fetchLinks } = useLinks();
    const { isGuest, user } = useAuth();
    const toast = useToast();
    const [tab, setTab] = useState('overview');
    const [statusBar, setShowStatusBar] = useState("none");
    const [newLink, setNewLink] = useState({ ...link });
    // Inline editing
    const [editingShortUrl, setEditingShortUrl] = useState(false);
    const [editingLongUrl, setEditingLongUrl] = useState(false);
    const [suffixError, setSuffixError] = useState('');
    const suffixRegex = /^[a-zA-Z0-9_-]{3,30}$/;

    // Refs for animated text
    const shortUrlTextRef = useRef<AnimatedTextRef>(null);
    const longUrlTextRef = useRef<AnimatedTextRef>(null);
    const statusButtonTextRef = useRef<AnimatedTextRef>(null);

    // Rules state
    const [hasRulesChanges, setHasRulesChanges] = useState(false);
    const saveRulesRef = useRef<(() => Promise<void>) | null>(null);
    const cancelRulesRef = useRef<(() => void) | null>(null);

    // Stats state
    const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('30d');
    const [stats, setStats] = useState<LinkStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // QR state
    const [isDownloadingQR, setIsDownloadingQR] = useState(false);
    const [hasQRChanges, setHasQRChanges] = useState(false);
    const [isCopyingQR, setIsCopyingQR] = useState(false);
    const saveQRRef = useRef<(() => Promise<void>) | null>(null);
    const cancelQRRef = useRef<(() => void) | null>(null);
    const tQR = useTranslations('QRCodeEditor');
    const { config: qrConfig, fetchConfig: fetchQRConfig } = useQRConfig(link.shortUrl);
    const qrUrl = `https://linkkk.dev/r/${link.shortUrl}?src=qr`;

    useEffect(() => {
        setNewLink({ ...link });
        setEditingShortUrl(false);
        setEditingLongUrl(false);
        setSuffixError('');
    }, [link]);

    useEffect(() => {
        if (open && !isGuest) fetchQRConfig();
    }, [open, isGuest, fetchQRConfig]);

    useEffect(() => {
        if (!open || isGuest || tab !== 'overview') return;
        setStatsLoading(true);
        statsService.getLinkStats(link.shortUrl, statsPeriod)
            .then(setStats)
            .catch(console.error)
            .finally(() => setStatsLoading(false));
    }, [open, tab, link.shortUrl, statsPeriod, isGuest]);

    const handleDownloadQR = async () => {
        setIsDownloadingQR(true);
        try {
            await downloadQRCode(qrUrl, qrConfig, `qr-${link.shortUrl}`, 1000);
            toast.success(tQR('downloadSuccess'));
        } catch {
            toast.error(tQR('downloadError'));
        } finally {
            setIsDownloadingQR(false);
        }
    };

    const handleCopyQR = async () => {
        setIsCopyingQR(true);
        try {
            await navigator.clipboard.writeText(qrUrl);
            toast.success(tQR('copySuccess'));
        } catch {
            toast.error(tQR('copyError'));
        } finally {
            setIsCopyingQR(false);
        }
    };

    const handleRulesChange = useCallback((
        hasChanges: boolean,
        saveRules: () => Promise<void>,
        cancelRules: () => void
    ) => {
        setHasRulesChanges(hasChanges);
        saveRulesRef.current = saveRules;
        cancelRulesRef.current = cancelRules;
    }, []);

    const handleQRChange = useCallback((
        hasChanges: boolean,
        saveQR: () => Promise<void>,
        cancelQR: () => void
    ) => {
        setHasQRChanges(hasChanges);
        saveQRRef.current = saveQR;
        cancelQRRef.current = cancelQR;
    }, []);

    const handleUpdateLink = useCallback(async () => {
        if (newLink.shortUrl !== link.shortUrl && !suffixRegex.test(newLink.shortUrl)) {
            setSuffixError(t('customSuffixInvalid'));
            setShowStatusBar("confirm");
            return;
        }

        try {
            const response = await updateLink(link.shortUrl, {
                longUrl: newLink.longUrl,
                status: newLink.status,
                ...(newLink.shortUrl !== link.shortUrl && { newShortUrl: newLink.shortUrl }),
            });

            if (!response.success) {
                if (response.errorCode === 'SHORT_URL_EXISTS') {
                    setNewLink(prev => ({ ...prev, shortUrl: link.shortUrl }));
                    toast.error(t('toastSuffixTaken'), { description: t('toastSuffixTakenDesc') });
                } else if (response.errorCode === 'LINK_NOT_FOUND') {
                    toast.error(t('toastLinkNotFound'), { description: t('toastLinkNotFoundDesc') });
                } else if (response.errorCode === 'LINK_ACCESS_DENIED') {
                    toast.error(t('toastAccessDenied'), { description: t('toastAccessDeniedDesc') });
                } else if (response.errorCode === 'UNAUTHORIZED') {
                    toast.error(t('toastSessionExpired'), { description: t('toastSessionExpiredDesc') });
                } else {
                    toast.error(t('toastUpdateFailed'), { description: response.error || t('toastUnexpectedError') });
                }
                setShowStatusBar("none");
                return;
            }

            if (hasRulesChanges && saveRulesRef.current) await saveRulesRef.current();
            if (hasQRChanges && saveQRRef.current) await saveQRRef.current();

            toast.success(t('toastUpdateSuccess'));
            setShowStatusBar("none");
            setSuffixError('');
            onClose();
            await fetchLinks();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            toast.error(t('toastSaveFailed'), { description: errorMessage });
            setShowStatusBar("none");
        }
    }, [link, newLink, updateLink, fetchLinks, onClose, hasRulesChanges, hasQRChanges, toast, t]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = async (e: KeyboardEvent) => {
            const activeElement = document.activeElement;

            if (e.key === 'Enter' && !e.shiftKey) {
                const hasChanges =
                    link.status !== newLink.status ||
                    link.longUrl !== newLink.longUrl ||
                    link.shortUrl !== newLink.shortUrl;
                if (hasChanges) {
                    e.preventDefault();
                    setShowStatusBar("loading");
                    await handleUpdateLink();
                }
            }

            if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') return;

            if (e.key === '1') setTab('overview');
            else if (e.key === '2') setTab('rules');
            else if (e.key === '3' && !isGuest) setTab('history');
            else if (e.key === '4' && !isGuest) setTab('qr');
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, link, newLink, handleUpdateLink, isGuest]);

    useEffect(() => {
        const hasLinkChanges =
            link.status !== newLink.status ||
            link.longUrl !== newLink.longUrl ||
            link.shortUrl !== newLink.shortUrl;

        const hasChanges = hasLinkChanges || hasRulesChanges || hasQRChanges;

        if (hasChanges) setShowStatusBar("confirm");
        else setShowStatusBar("none");
    }, [newLink, link, hasRulesChanges, hasQRChanges]);

    return (
        <Drawer
            open={open}
            onClose={onClose}
            modal
            placement='right'
            size='md'
            rounded='3xl'
            className='h-full overflow-hidden flex flex-col'
        >
            {/* Tabs — outside scroll container so they never collapse */}
                <div className='bg-light w-full flex gap-2 px-4 pt-4 pb-0 overflow-x-auto scrollbar-hide flex-shrink-0'>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "backInOut" }} className="flex-shrink-0">
                        <Button variant='ghost' size='sm' rounded='2xl' leftIcon={<TbCategory size={20} />}
                            className={`rounded-2xl ${tab === 'overview' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('overview')}
                        >
                            {t('tabOverview')}
                        </Button>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }} className="flex-shrink-0">
                        <Button variant='ghost' size='sm' rounded='2xl' leftIcon={<TbPuzzle size={20} />}
                            className={`rounded-2xl ${tab === 'rules' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('rules')}
                        >
                            {t('tabRules')}
                        </Button>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }} className="flex-shrink-0">
                        <Button variant='ghost' size='sm' rounded='2xl' leftIcon={<TbList size={20} />}
                            className={`rounded-2xl ${tab === 'history' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('history')}
                            disabled={isGuest}
                        >
                            {t('tabHistory')}
                        </Button>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }} className="flex-shrink-0">
                        <Button variant='ghost' size='sm' rounded='2xl' leftIcon={<TbPalette size={20} />}
                            className={`rounded-2xl ${tab === 'qr' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('qr')}
                            disabled={isGuest}
                        >
                            {t('tabQR')}
                        </Button>
                    </motion.div>
                </div>

                <div className='flex-1 overflow-auto flex flex-col gap-2 p-4 pb-32'>

                {/* Overview */}
                {tab === 'overview' && (
                    <div className='relative z-0 w-full flex flex-col gap-6'>
                        <div className='w-full flex flex-col sm:flex-row sm:items-start gap-6 min-w-0'>

                            {/* Left column */}
                            <div className='flex-1 min-w-0 flex flex-col gap-3'>

                                {/* Short URL — editable inline */}
                                {editingShortUrl ? (
                                    <div className='flex flex-col gap-1'>
                                        <div className='flex items-center gap-1'>
                                            <span className='text-xl md:text-2xl italic font-black text-dark/40 whitespace-nowrap'>linkkk.dev/r/</span>
                                            <input
                                                autoFocus
                                                value={newLink.shortUrl}
                                                onChange={(e) => {
                                                    setNewLink({ ...newLink, shortUrl: e.target.value });
                                                    setSuffixError('');
                                                }}
                                                onBlur={() => setEditingShortUrl(false)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') setEditingShortUrl(false);
                                                    if (e.key === 'Escape') {
                                                        setNewLink({ ...newLink, shortUrl: link.shortUrl });
                                                        setSuffixError('');
                                                        setEditingShortUrl(false);
                                                    }
                                                }}
                                                className='text-xl md:text-2xl italic font-black bg-transparent border-b-2 border-dark outline-none min-w-0 w-36'
                                            />
                                        </div>
                                        {suffixError && <p className='text-xs text-danger'>{suffixError}</p>}
                                        <p className='text-xs text-dark/40'>{t('customSuffixHint')}</p>
                                    </div>
                                ) : (
                                    <div className='flex items-start md:flex-row md:items-center gap-2'>
                                        <motion.h1
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
                                            className='text-xl md:text-2xl italic font-black'
                                        >
                                            <AnimatedText
                                                ref={shortUrlTextRef}
                                                initialText={`linkkk.dev/r/${newLink.shortUrl}`}
                                                animationType="slide"
                                                triggerMode="none"
                                            />
                                        </motion.h1>

                                        <div className='flex items-center gap-1'>
                                            <Button
                                                iconOnly
                                                leftIcon={<TbCopy size={14} />}
                                                variant='ghost'
                                                size='xs'
                                                rounded='lg'
                                                className='text-dark/30 hover:text-dark/70'
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    navigator.clipboard.writeText(`https://linkkk.dev/r/${newLink.shortUrl}`);
                                                    shortUrlTextRef.current?.setText(t('copied'));
                                                    setTimeout(() => shortUrlTextRef.current?.reset(), 2000);
                                                }}
                                            />
                                            {!isGuest && (
                                                <Button
                                                    iconOnly
                                                    leftIcon={<TbPencil size={14} />}
                                                    variant='ghost'
                                                    size='xs'
                                                    rounded='lg'
                                                    className='text-dark/30 hover:text-dark/70'
                                                    onClick={() => setEditingShortUrl(true)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Long URL — editable inline */}
                                {editingLongUrl ? (
                                    <div className='flex items-center gap-2 max-w-sm'>
                                        <FiCornerDownRight size={16} className='flex-shrink-0 text-dark/50' />
                                        <input
                                            autoFocus
                                            value={newLink.longUrl}
                                            onChange={(e) => setNewLink({ ...newLink, longUrl: e.target.value })}
                                            onBlur={() => setEditingLongUrl(false)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') setEditingLongUrl(false);
                                                if (e.key === 'Escape') {
                                                    setNewLink({ ...newLink, longUrl: link.longUrl });
                                                    setEditingLongUrl(false);
                                                }
                                            }}
                                            placeholder={t('urlPlaceholder')}
                                            className='text-xs md:text-md text-dark/60 bg-transparent border-b border-dark/30 outline-none w-full'
                                        />
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15, duration: 0.3, ease: "backOut" }}
                                        className='group inline-flex items-center gap-2 max-w-sm w-full md:w-fit text-dark/50'
                                    >
                                        <FiCornerDownRight size={16} className="flex-shrink-0" />
                                        <div className="inline-flex items-center gap-2 min-w-0 max-w-sm w-full">
                                            <div
                                                className='text-xs md:text-md truncate whitespace-nowrap min-w-0 max-w-sm'
                                                title={newLink.longUrl}
                                            >
                                                <AnimatedText
                                                    ref={longUrlTextRef}
                                                    initialText={newLink.longUrl}
                                                    animationType="slide"
                                                    triggerMode="none"
                                                    className="truncate block"
                                                />
                                            </div>
                                            <div className='flex items-center gap-1 flex-shrink-0'>
                                                <Button
                                                    iconOnly
                                                    leftIcon={<TbCopy size={14} />}
                                                    variant='ghost'
                                                    size='xs'
                                                    rounded='lg'
                                                    className="text-dark/30 hover:text-dark/70"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        navigator.clipboard.writeText(newLink.longUrl);
                                                        longUrlTextRef.current?.setText(t('copied'));
                                                        setTimeout(() => longUrlTextRef.current?.reset(), 2000);
                                                    }}
                                                />
                                                <Button
                                                    iconOnly
                                                    leftIcon={<TbPencil size={14} />}
                                                    variant='ghost'
                                                    size='xs'
                                                    rounded='lg'
                                                    className="text-dark/30 hover:text-dark/70"
                                                    onClick={() => setEditingLongUrl(true)}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Status + quick stats */}
                                <div className='flex items-center gap-3 flex-wrap'>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
                                    >
                                        <Button
                                            variant='solid'
                                            size='xs'
                                            rounded='xl'
                                            leftIcon={newLink.status ? <TbCircleDashedCheck size={16} /> : <TbCircleDashed size={16} />}
                                            className={`${newLink.status ? 'bg-success text-dark' : 'bg-danger text-light'}`}
                                            onClick={() => {
                                                statusButtonTextRef.current?.setText(newLink.status ? t('inactive') : t('active'));
                                                setNewLink({ ...newLink, status: !newLink.status });
                                            }}
                                        >
                                            <AnimatedText
                                                ref={statusButtonTextRef}
                                                initialText={newLink.status ? t('active') : t('inactive')}
                                                animationType="slide"
                                                triggerMode='none'
                                                className='cursor-pointer'
                                            />
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25, duration: 0.3, ease: "backOut" }}
                                        className='flex items-center gap-3 text-dark/40'
                                    >
                                        <span className='flex items-center gap-1 text-xs'>
                                            <TbClick size={13} />
                                            <span className='font-bold text-dark/60'>{link.accessCount ?? 0}</span>
                                        </span>
                                        <span className='text-dark/20'>·</span>
                                        <span className='flex items-center gap-1 text-xs'>
                                            <TbQrcode size={13} />
                                            <span className='font-bold text-dark/60'>{link.scanCount ?? 0}</span>
                                        </span>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Right column — QR (non-guests, sm+ only) */}
                            {!isGuest && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
                                    className='flex flex-shrink-0 md:flex-col items-center gap-2'
                                >
                                    <div className='p-0.5 bg-white rounded-xl shadow-sm border border-dark/5'>
                                        <QRCodePreview url={qrUrl} config={qrConfig} size={100} />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* ── Stats section ── */}
                        {!isGuest && (
                            <div className='flex flex-col gap-5 pt-4 border-t border-dark/10'>

                                {/* Period selector */}
                                <div className='flex items-center justify-between'>
                                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className='text-sm font-bold text-dark/50'>{t('stats')}</motion.span>
                                    <div className='flex items-center gap-1 bg-dark/5 rounded-xl p-1'>
                                        {(['7d', '30d', 'all'] as StatsPeriod[]).map((p, i) => (
                                            <motion.button
                                                key={p}
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 + i * 0.06, duration: 0.25, ease: 'easeOut' }}
                                                onClick={() => setStatsPeriod(p)}
                                                disabled={user?.role === 'STANDARD' && p === 'all'}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                    statsPeriod === p
                                                        ? 'bg-dark text-light'
                                                        : 'text-dark/50 hover:text-dark disabled:opacity-30 disabled:cursor-not-allowed'
                                                }`}
                                            >
                                                {p === 'all' ? t('periodAll') : p}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {statsLoading ? (
                                    <div className='flex justify-center py-8'>
                                        <div className='h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent' />
                                    </div>
                                ) : stats ? (
                                    <>
                                        {/* Area chart */}
                                        <div className='bg-dark/5 rounded-2xl p-5'>
                                            <p className='text-xs font-bold text-dark/50 mb-4'>{t('clicksOverTime')}</p>
                                            <ResponsiveContainer width='100%' height={160}>
                                                <AreaChart data={stats.clicksByDay} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id='cg' x1='0' y1='0' x2='0' y2='1'>
                                                            <stop offset='5%' stopColor='#72d763' stopOpacity={0.5} />
                                                            <stop offset='95%' stopColor='#72d763' stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.06)' />
                                                    <XAxis dataKey='date' tickFormatter={(d) => { const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }} tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)' }} interval='preserveStartEnd' axisLine={false} tickLine={false} />
                                                    <YAxis tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)' }} allowDecimals={false} axisLine={false} tickLine={false} />
                                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} labelFormatter={(d) => { const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }} formatter={(v) => [v ?? 0, t('statClicks')]} />
                                                    <Area type='monotone' dataKey='count' stroke='#72d763' strokeWidth={2} fill='url(#cg)' dot={false} activeDot={{ r: 4, fill: '#72d763' }} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Details block */}
                                        <div className='bg-dark/5 rounded-2xl divide-y divide-dark/5 overflow-hidden'>

                                            {/* Countries */}
                                            {stats.topCountries.length > 0 && (
                                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3, ease: 'easeOut' }} className='px-4 py-4 flex items-start gap-3'>
                                                    <TbWorld size={13} className='text-dark/30 mt-0.5 flex-shrink-0' />
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-xs text-dark/40 mb-2.5'>{t('topCountries')}</p>
                                                        <div className='flex flex-col gap-2'>
                                                            {stats.topCountries.map(({ country, count }) => (
                                                                <div key={country} className='flex items-center gap-2'>
                                                                    <img src={`https://flagcdn.com/20x15/${country.toLowerCase()}.png`} alt={country} className='w-4 h-3 object-cover rounded-sm flex-shrink-0' onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                                    <span className='text-xs font-bold w-7 flex-shrink-0 text-dark/70'>{country}</span>
                                                                    {stats.topCountries.length > 1 && (
                                                                        <div className='flex-1 bg-dark/10 rounded-full h-1'>
                                                                            <div className='bg-dark/40 h-1 rounded-full' style={{ width: `${Math.round(count / stats.topCountries[0].count * 100)}%` }} />
                                                                        </div>
                                                                    )}
                                                                    <span className='text-xs text-dark/40 w-5 text-right flex-shrink-0'>{count}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Source */}
                                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }} className='px-4 py-4 flex items-center gap-3'>
                                                <TbClick size={13} className='text-dark/30 flex-shrink-0' />
                                                <p className='text-xs text-dark/40 w-16 flex-shrink-0'>{t('source')}</p>
                                                <div className='flex items-center gap-4 flex-wrap'>
                                                    {[
                                                        { label: 'Direct', count: stats.sourceBreakdown.direct },
                                                        { label: 'QR', count: stats.sourceBreakdown.qr },
                                                    ].map(({ label, count }) => {
                                                        const pct = stats.totalClicks > 0 ? Math.round(count / stats.totalClicks * 100) : 0;
                                                        return (
                                                            <span key={label} className='text-xs text-dark/50'>
                                                                <span className='font-bold text-dark/80'>{count}</span> {label} <span className='text-dark/30'>({pct}%)</span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>

                                            {/* Browsers */}
                                            {stats.browserBreakdown.length > 0 && (
                                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }} className='px-4 py-4 flex items-center gap-3'>
                                                    <TbWorld size={13} className='text-dark/30 flex-shrink-0' />
                                                    <p className='text-xs text-dark/40 w-16 flex-shrink-0'>{t('browsers')}</p>
                                                    <div className='flex items-center gap-3 flex-wrap ml-2'>
                                                        {stats.browserBreakdown.map(({ browser, count }) => (
                                                            <span key={browser} className='text-xs text-dark/50'>
                                                                <span className='font-bold text-dark/80'>{browser}</span>&nbsp;<span className='text-dark/30'>{stats.totalClicks > 0 ? Math.round(count / stats.totalClicks * 100) : 0}%</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* VPN / Bot */}
                                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }} className='px-4 py-4 flex items-center gap-3'>
                                                <TbShieldX size={13} className='text-dark/30 flex-shrink-0' />
                                                <p className='text-xs text-dark/40 w-16 flex-shrink-0'>Flags</p>
                                                <div className='flex items-center gap-4'>
                                                    <span className='flex items-center gap-1.5 text-xs'>
                                                        <TbShieldX size={12} className={stats.vpnCount > 0 ? 'text-danger' : 'text-dark/20'} />
                                                        <span className='text-dark/40'>VPN</span>
                                                        <span className='font-bold text-dark/70'>{stats.vpnCount}</span>
                                                    </span>
                                                    <span className='flex items-center gap-1.5 text-xs'>
                                                        <TbRobot size={12} className={stats.botCount > 0 ? 'text-danger' : 'text-dark/20'} />
                                                        <span className='text-dark/40'>Bot</span>
                                                        <span className='font-bold text-dark/70'>{stats.botCount}</span>
                                                    </span>
                                                </div>
                                            </motion.div>

                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}

                {/* Rules */}
                {tab === 'rules' && (
                    <div className='relative z-0 w-full flex flex-col gap-4'>
                        <RulesManager shortUrl={newLink.shortUrl} onRulesChange={handleRulesChange} />
                    </div>
                )}

                {/* History */}
                {tab === 'history' && (
                    <div className='relative z-0 w-full flex flex-col gap-4 items-center'>
                        {user && user.role === 'STANDARD' && (
                            <div className='w-full bg-dark/5 border border-dark/10 rounded-xl p-2.5'>
                                <p className='text-xs text-dark/60'>
                                    <span className='font-semibold'>{t('limitedViewTitle')}</span> {t('limitedViewMessage')}
                                    <span className='text-dark/50'> {t('limitedViewUpgrade')}</span>
                                </p>
                            </div>
                        )}
                        <AccessesList shortUrl={link.shortUrl} />
                    </div>
                )}

                {/* QR */}
                {tab === 'qr' && (
                    <div className='relative z-0 w-full flex flex-col gap-4 '>
                        <QRCodeEditor shortUrl={link.shortUrl} onConfigChange={handleQRChange} />
                    </div>
                )}
            </div>

            {/* Floating bottom status bar */}
            <AnimatePresence>
                {statusBar !== 'none' && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.3, ease: "backOut" }}
                        className='w-full bg-dark/5 border-t p-4'
                    >
                        <div className='flex flex-col gap-3 max-w-4xl mx-auto'>
                            <div className='flex items-start gap-2'>
                                <div className='w-6 h-6 rounded-full bg-primary border flex items-center justify-center flex-shrink-0 mt-0.5'>
                                    <span className='text-dark text-sm font-bold'>!</span>
                                </div>
                                <div className='flex-1'>
                                    <p className='text-lg font-black italic text-dark mb-1'>{t('unsavedChanges')}</p>
                                    <p className='text-sm text-dark/70'>{t('unsavedChangesDesc')}</p>
                                </div>
                            </div>
                            <div className='flex gap-2 justify-end'>
                                <Button
                                    variant='outline' size='md' rounded='2xl' className='border-dark/30'
                                    disabled={statusBar === "loading"}
                                    onClick={() => {
                                        setShowStatusBar("none");
                                        setNewLink({ ...link });
                                        setSuffixError('');
                                        setEditingShortUrl(false);
                                        setEditingLongUrl(false);
                                        if (cancelRulesRef.current) cancelRulesRef.current();
                                        if (cancelQRRef.current) cancelQRRef.current();
                                    }}
                                >
                                    {t('discard')}
                                </Button>
                                <Button
                                    variant='solid' size='md' rounded='2xl'
                                    className='bg-primary text-dark hover:shadow-[4px_4px_0_var(--color-dark)]'
                                    loading={statusBar === "loading"}
                                    onClick={async () => {
                                        setShowStatusBar("loading");
                                        await handleUpdateLink();
                                    }}
                                >
                                    {t('saveChanges')}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Drawer>
    );
}
