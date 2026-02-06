import React, { useState, useEffect, useCallback, useRef } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import { FiCornerDownRight } from 'react-icons/fi';
import { TbCircleDashed, TbCircleDashedCheck, TbCopy, TbList, TbDownload, TbPalette, TbCategory,TbPuzzle } from 'react-icons/tb';
import Button from '../ui/Button/Button';
import Input from '../ui/Input/Input';
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
    const [showCopyShortUrlButton, setShowCopyShortUrlButton] = useState(false);

    // Ref for animated text
    const shortUrlTextRef = useRef<AnimatedTextRef>(null);
    const longUrlTextRef = useRef<AnimatedTextRef>(null);
    const statusButtonTextRef = useRef<AnimatedTextRef>(null);

    // Status bar

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

    // Sincronizar estado local cuando el prop link cambia
    useEffect(() => {
        setNewLink({ ...link });
    }, [link]);

    // Fetch QR config when drawer opens (for non-guests)
    useEffect(() => {
        if (open && !isGuest) {
            fetchQRConfig();
        }
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
        }finally {
            setIsCopyingQR(false);
        }
    };


    // Handle rules changes callback from RulesManager
    const handleRulesChange = useCallback((
        hasChanges: boolean,
        saveRules: () => Promise<void>,
        cancelRules: () => void
    ) => {
        setHasRulesChanges(hasChanges);
        saveRulesRef.current = saveRules;
        cancelRulesRef.current = cancelRules;
    }, []);

    // Handle QR changes callback from QRCodeEditor
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
        try {
            // Save link
            const response = await updateLink(link.shortUrl, {
                longUrl: newLink.longUrl,
                status: newLink.status,
            });

            if (!response.success) {
                // Error handling with specific messages
                if (response.errorCode === 'LINK_NOT_FOUND') {
                    toast.error(t('toastLinkNotFound'), {
                        description: t('toastLinkNotFoundDesc'),
                    });
                } else if (response.errorCode === 'LINK_ACCESS_DENIED') {
                    toast.error(t('toastAccessDenied'), {
                        description: t('toastAccessDeniedDesc'),
                    });
                } else if (response.errorCode === 'UNAUTHORIZED') {
                    toast.error(t('toastSessionExpired'), {
                        description: t('toastSessionExpiredDesc'),
                    });
                } else {
                    toast.error(t('toastUpdateFailed'), {
                        description: response.error || t('toastUnexpectedError'),
                    });
                }
                setShowStatusBar("none");
                return;
            }

            // Save rules if there are changes
            if (hasRulesChanges && saveRulesRef.current) {
                await saveRulesRef.current();
            }

            // Save QR config if there are changes
            if (hasQRChanges && saveQRRef.current) {
                await saveQRRef.current();
            }

            toast.success(t('toastUpdateSuccess'));
            setShowStatusBar("none");
            onClose();
            await fetchLinks();
        } catch (err) {
            console.error('Failed to save:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            toast.error(t('toastSaveFailed'), {
                description: errorMessage,
            });
            setShowStatusBar("none");
        }
    }, [link, newLink, updateLink, fetchLinks, onClose, hasRulesChanges, hasQRChanges, toast, t]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = async (e: KeyboardEvent) => {
            const activeElement = document.activeElement;

            // Manejar Enter para actualizar
            if (e.key === 'Enter' && !e.shiftKey) {
                const hasChanges = link.status !== newLink.status || link.longUrl !== newLink.longUrl;
                if (hasChanges) {
                    e.preventDefault();
                    setShowStatusBar("loading");
                    await handleUpdateLink();
                }
            }

            // Solo manejar shortcuts de teclado cuando no estamos en un input
            if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') return;

            if (e.key === '1') {
                setTab('overview');
            } else if (e.key === '2') {
                setTab('rules');
            } else if (e.key === '3' && !isGuest) {
                // History solo para usuarios registrados
                setTab('history');
            } else if (e.key === '4' && !isGuest) {
                // QR solo para usuarios registrados
                setTab('qr');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, link, newLink, handleUpdateLink, isGuest]);

    useEffect(() => {
        const hasLinkChanges =
            link.status !== newLink.status ||
            link.longUrl !== newLink.longUrl;

        const hasChanges = hasLinkChanges || hasRulesChanges || hasQRChanges;

        if (hasChanges) {
            setShowStatusBar("confirm");
        } else {
            setShowStatusBar("none");
        }
    }, [newLink, link, hasRulesChanges, hasQRChanges]);

    return (
        <Drawer
            open={open}
            onClose={onClose}
            modal
            placement='right'
            size='xl'
            rounded='3xl'
            className='h-full overflow-hidden flex flex-col'
        >
            <div className='flex-1 overflow-auto flex flex-col gap-2 items-center p-4 pb-32'>

                {/* Tabs */}
                <div className='w-full flex flex-wrap gap-2 mb-4'>
                    {/* Overview tab */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "backInOut" }}
                    >
                        <Button
                            variant='ghost'
                            size='sm'
                            rounded='2xl'
                            leftIcon={<TbCategory size={20} />}
                            className={`rounded-2xl ${tab === 'overview' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('overview')}
                        >
                            {t('tabOverview')}
                        </Button>
                    </motion.div>
                    {/* Rules tab */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
                    >
                        <Button
                            variant='ghost'
                            size='sm'
                            rounded='2xl'
                            leftIcon={<TbPuzzle size={20} />}
                            className={`rounded-2xl ${tab === 'rules' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('rules')}
                        >
                            {t('tabRules')}
                        </Button>
                    </motion.div>
                    {/* History tab - Disabled for guests */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
                    >
                        <Button
                            variant='ghost'
                            size='sm'
                            rounded='2xl'
                            leftIcon={<TbList size={20} />}
                            className={`rounded-2xl ${tab === 'history' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('history')}
                            disabled={isGuest}
                        >
                            {t('tabHistory')}
                        </Button>
                    </motion.div>
                    {/* QR Customize tab - Disabled for guests */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }}
                    >
                        <Button
                            variant='ghost'
                            size='sm'
                            rounded='2xl'
                            leftIcon={<TbPalette size={20} />}
                            className={`rounded-2xl ${tab === 'qr' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                            onClick={() => setTab('qr')}
                            disabled={isGuest}
                        >
                            {t('tabQR')}
                        </Button>
                    </motion.div>
                </div>

                {/* Main Content */}
                {/* Overview */}
                {tab === 'overview' && (
                    <div className='w-full h-full flex flex-col gap-6'>
                        {/* Two-column layout: Left = controls, Right = QR */}
                        <div className='w-full flex flex-col md:flex-row md:items-start gap-6'>
                            {/* Left column - Link info + settings */}
                            <div className='flex-1 flex flex-col gap-3'>
                                {/* Short URL */}
                                <div
                                    className='flex flex-col-reverse items-start md:flex-row md:items-center gap-2'
                                    onMouseEnter={() => setShowCopyShortUrlButton(true)}
                                    onMouseLeave={() => setShowCopyShortUrlButton(false)}
                                >
                                    <motion.h1
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
                                        className='text-xl md:text-2xl italic font-black cursor-pointer'
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            navigator.clipboard.writeText(`https://linkkk.dev/r/${newLink.shortUrl}`);
                                            shortUrlTextRef.current?.setText(t('copied'));
                                            setTimeout(() => {
                                                shortUrlTextRef.current?.reset();
                                            }, 2000);
                                        }}
                                    >
                                        <AnimatedText
                                            ref={shortUrlTextRef}
                                            initialText={`linkkk.dev/r/${newLink.shortUrl}`}
                                            animationType="slide"
                                            triggerMode="none"
                                        />
                                    </motion.h1>

                                    <AnimatePresence>
                                        {showCopyShortUrlButton && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                                transition={{ duration: 0.2, ease: "backOut" }}
                                            >
                                                <Button
                                                    iconOnly
                                                    leftIcon={<TbCopy size={16} />}
                                                    variant='solid'
                                                    size='xs'
                                                    rounded='lg'
                                                    className='bg-primary text-dark'
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        navigator.clipboard.writeText(`https://linkkk.dev/r/${newLink.shortUrl}`);
                                                        shortUrlTextRef.current?.setText(t('copied'));
                                                        setTimeout(() => {
                                                            shortUrlTextRef.current?.reset();
                                                        }, 2000);
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Long URL display */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15, duration: 0.3, ease: "backOut" }}
                                    className='group inline-flex items-center gap-2 max-w-sm w-full md:w-fit text-dark/50'
                                >
                                    <FiCornerDownRight size={16} className="flex-shrink-0" />
                                    <div className="inline-flex items-center gap-2 min-w-0 max-w-sm w-full">
                                        <div
                                            className='text-xs md:text-sm truncate whitespace-nowrap min-w-0 max-w-sm cursor-pointer'
                                            title={newLink.longUrl}
                                            onMouseDown={() => {
                                                navigator.clipboard.writeText(newLink.longUrl);
                                                longUrlTextRef.current?.setText(t('copied'));
                                                setTimeout(() => {
                                                    longUrlTextRef.current?.reset();
                                                }, 2000);
                                            }}
                                        >
                                            <AnimatedText
                                                ref={longUrlTextRef}
                                                initialText={newLink.longUrl}
                                                animationType="slide"
                                                triggerMode="none"
                                                className="truncate block"
                                            />
                                        </div>
                                        <Button
                                            iconOnly
                                            leftIcon={<TbCopy size={14} />}
                                            variant='solid'
                                            size='xs'
                                            rounded='lg'
                                            className="bg-primary text-dark flex-shrink-0 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                navigator.clipboard.writeText(newLink.longUrl);
                                                longUrlTextRef.current?.setText(t('copied'));
                                                setTimeout(() => {
                                                    longUrlTextRef.current?.reset();
                                                }, 2000);
                                            }}
                                        />
                                    </div>
                                </motion.div>
                                {/* Link status */}
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
                                                setNewLink({ ...newLink, status: !newLink.status })
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

                                {/* Long URL */}
                                <div className='flex flex-col gap-1'>
                                    <motion.p
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25, duration: 0.3, ease: "backOut" }}
                                        className='text-sm font-black italic'>
                                        {t('longUrl')}
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3, duration: 0.3, ease: "backOut" }}
                                    >
                                        <Input
                                            id='longUrl'
                                            value={newLink.longUrl}
                                            onChange={(e) => setNewLink({ ...newLink, longUrl: e.target.value })}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    const hasChanges = link.status !== newLink.status || link.longUrl !== newLink.longUrl;
                                                    if (hasChanges) {
                                                        e.preventDefault();
                                                        setShowStatusBar("loading");
                                                        await handleUpdateLink();
                                                    }
                                                }
                                            }}
                                            placeholder={t('urlPlaceholder')}
                                            size='sm'
                                            rounded='xl'
                                            className='w-full max-w-xs'
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Right column - QR Code (only for registered users) */}
                            {!isGuest && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
                                    className='flex md:flex-col items-center gap-2'
                                >
                                    <div className='p-2 md:mx-16 bg-white rounded-xl shadow-sm border border-dark/5'>
                                        <QRCodePreview url={qrUrl} config={qrConfig} size={120} />
                                    </div>
                                    <div className='flex items-center gap-2 text-dark/60'>
                                        <TbQrcode size={16} />
                                        <span className='text-sm font-medium'>
                                            {link.scanCount ?? 0} {t('scans')}
                                        </span>
                                    </div>
                                    <div className='flex flex-col md:flex-row gap-2'>
                                        <Button
                                            variant='solid'
                                            size='sm'
                                            rounded='lg'
                                            leftIcon={<TbCopy size={16} />}
                                            className='bg-primary text-dark leading-4'
                                            expandOnHover='text'
                                            onClick={handleCopyQR}
                                            loading={isCopyingQR}
                                        >
                                            {t('copy')}
                                        </Button>
                                        <Button
                                            variant='solid'
                                            size='sm'
                                            rounded='lg'
                                            leftIcon={<TbDownload size={16} />}
                                            className='bg-primary text-dark  leading-4'
                                            expandOnHover='text'
                                            onClick={handleDownloadQR}
                                            loading={isDownloadingQR}
                                        >
                                            {tQR('download')}
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            rounded='lg'
                                            leftIcon={<TbPalette size={16} />}
                                            className='text-dark/60 hover:text-dark  leading-4'
                                            expandOnHover='text'
                                            onClick={() => setTab('qr')}
                                        >
                                            {tQR('customize')}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                    </div>
                )}

                {/* Rules */}
                {tab === 'rules' && (
                    <div className='w-full flex flex-col gap-4 p-4'>
                        <RulesManager
                            shortUrl={newLink.shortUrl}
                            onRulesChange={handleRulesChange}
                        />
                    </div>
                )}

                {/* History */}
                {tab === 'history' && (
                    <div className='w-full flex flex-col gap-4 items-center p-4'>
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

                {/* QR Code Customization */}
                {tab === 'qr' && (
                    <div className='w-full flex flex-col gap-4 p-4'>
                        <QRCodeEditor
                            shortUrl={link.shortUrl}
                            onConfigChange={handleQRChange}
                        />
                    </div>
                )}

            </div>

            {/* Status bar - Fixed at bottom */}
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
                                    <p className='text-lg font-black italic text-dark mb-1'>
                                        {t('unsavedChanges')}
                                    </p>
                                    <p className='text-sm text-dark/70'>
                                        {t('unsavedChangesDesc')}
                                    </p>
                                </div>
                            </div>
                            <div className='flex gap-2 justify-end'>
                                <Button
                                    variant='outline'
                                    size='md'
                                    rounded='2xl'
                                    className='border-dark/30'
                                    disabled={statusBar === "loading"}
                                    onClick={() => {
                                        setShowStatusBar("none");
                                        setNewLink({ ...link });
                                        // Cancel rules changes if any
                                        if (cancelRulesRef.current) {
                                            cancelRulesRef.current();
                                        }
                                        // Cancel QR changes if any
                                        if (cancelQRRef.current) {
                                            cancelQRRef.current();
                                        }
                                    }}
                                >
                                    {t('discard')}
                                </Button>
                                <Button
                                    variant='solid'
                                    size='md'
                                    rounded='2xl'
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
