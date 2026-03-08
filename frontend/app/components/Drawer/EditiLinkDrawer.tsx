import React, { useState, useEffect, useCallback, useRef } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import { FiCornerDownRight } from 'react-icons/fi';
import { TbCircleDashed, TbCircleDashedCheck, TbCopy, TbList, TbDownload, TbPalette, TbCategory, TbPuzzle, TbQrcode, TbPencil } from 'react-icons/tb';
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
            <div className='flex-1 overflow-auto flex flex-col gap-2 items-center p-4 pb-32'>

                {/* Tabs */}
                <div className='relative z-10 w-full flex gap-2 mb-4 pr-6 overflow-x-auto scrollbar-hide'>
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

                {/* Overview */}
                {tab === 'overview' && (
                    <div className='relative z-0 w-full h-full flex flex-col gap-6'>
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

                                {/* Status */}
                                <div className='flex items-center gap-2'>
                                    <motion.p
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
                                        className='text-sm font-black italic'>
                                        {t('status')}
                                    </motion.p>
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
                                    <div className='flex flex-col items-center gap-2'>
                                        <div className='p-0.5 bg-white rounded-xl shadow-sm border border-dark/5'>
                                            <QRCodePreview url={qrUrl} config={qrConfig} size={100} />
                                        </div>
                                        <div className='flex items-center gap-2 text-dark/60'>
                                            <TbQrcode size={16} />
                                            <span className='text-sm font-medium'>{link.scanCount ?? 0} {t('scans')}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
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
