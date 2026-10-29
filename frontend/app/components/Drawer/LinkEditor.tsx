import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiCornerDownRight } from 'react-icons/fi';
import { TbChevronDown, TbCircleDashed, TbCircleDashedCheck, TbCopy, TbLink, TbPencil, TbRobot, TbSettings } from 'react-icons/tb';
import Button from '../ui/Button/Button';
import { useLinks, useAuth, useTags, useGroups } from '@/app/hooks';
import { domainService, CustomDomain } from '@/app/services/api/domainService';
import Switch from '@/app/components/ui/Switch/Switch';
import UtmBuilder from './UtmBuilder';
import InfoTip from '@/app/components/ui/InfoTip/InfoTip';
import { buildUrlFromParams, paramsFromRows, rowsFromParams, type ParamRow } from '@/app/utils/utm';
import LinkDrawerTabs from './LinkDrawerTabs';
import LinkOrganizeFields from './LinkOrganizeFields';
import { PLAN_LIMITS } from '@/app/constants/limits';
import type { Link } from '@/app/types';
import { AccessesList } from '../Accesses/accessesList';
import { useToast } from '@/app/hooks/useToast';
import { useLinkAccessEvent } from '@/app/hooks/useLinkAccessEvent';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { RulesManager } from '../LinkRules/RulesManager';
import { QRCodePreview, downloadQRCode, QRCodeEditor } from '../QRCode';
import { useQRConfig } from '@/app/hooks/useQRConfig';
import LinkMetadataEditor from '../LinkMetadata/LinkMetadataEditor';
import AnimatedText, { AnimatedTextRef } from '../ui/AnimatedText';
import { useTranslations } from 'next-intl';
import LinkStatsPanel from './LinkStatsPanel';
import { statsService, type LinkStats, type StatsPeriod } from '@/app/services/api/statsService';

interface LinkEditorProps {
    open: boolean;
    onClose: () => void;
    link: Link;
    /** 'drawer' renders inside a Drawer's flex column; 'page' lays out in normal page flow */
    variant?: 'drawer' | 'page';
    /** Called after a successful save, with the (possibly renamed) short URL */
    onSaved?: (shortUrl: string) => void;
}

export default function LinkEditor({ open, onClose, link, variant = 'drawer', onSaved }: LinkEditorProps) {
    const isPage = variant === 'page';
    const t = useTranslations('EditLinkDrawer');
    const { updateLink, fetchLinks } = useLinks();
    const { isGuest, user } = useAuth();
    const toast = useToast();
    const [tab, setTab] = useState('overview');
    // Link settings card is collapsed on small screens (always open from md up)
    const [settingsOpen, setSettingsOpen] = useState(false);
    // Params appended when sharing the link; edited in the Share tab and saved with the link
    const [utmRows, setUtmRows] = useState<ParamRow[]>(() => rowsFromParams(link.utmParams));
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

    // Organize (tags + group) state
    const { tags, fetchTags, assignTagsToLink } = useTags();
    const { groups, fetchGroups, moveLinkToGroup, removeLinkFromGroup } = useGroups();
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>((link.tags ?? []).map(t => t.id));
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(link.group?.id ?? null);
    const organizeLimit = user?.role === 'PRO' ? PLAN_LIMITS.pro : PLAN_LIMITS.user;

    // Custom domain state
    const [activeDomains, setActiveDomains] = useState<CustomDomain[]>([]);

    // QR state
    const [isDownloadingQR, setIsDownloadingQR] = useState(false);
    const [hasQRChanges, setHasQRChanges] = useState(false);
    const [isCopyingQR, setIsCopyingQR] = useState(false);
    const saveQRRef = useRef<(() => Promise<void>) | null>(null);
    const cancelQRRef = useRef<(() => void) | null>(null);
    const tQR = useTranslations('QRCodeEditor');

    // Metadata (social preview) state
    const [hasMetadataChanges, setHasMetadataChanges] = useState(false);
    const saveMetadataRef = useRef<(() => Promise<void>) | null>(null);
    const cancelMetadataRef = useRef<(() => void) | null>(null);
    const { config: qrConfig, fetchConfig: fetchQRConfig } = useQRConfig(link.shortUrl);
    const qrUrl = link.customDomain
        ? `https://${link.customDomain.domain}/${link.shortUrl}?src=qr`
        : `https://linkkk.dev/r/${link.shortUrl}?src=qr`;

    useEffect(() => {
        setNewLink({ ...link });
        setUtmRows(rowsFromParams(link.utmParams));
        setEditingShortUrl(false);
        setEditingLongUrl(false);
        setSuffixError('');
        setSelectedTagIds((link.tags ?? []).map(t => t.id));
        setSelectedGroupId(link.group?.id ?? null);
        // Sync the animated short URL text with the actual link data
        const urlText = link.customDomain
            ? `${link.customDomain.domain}/${link.shortUrl}`
            : `linkkk.dev/r/${link.shortUrl}`;
        shortUrlTextRef.current?.setText(urlText);
    }, [link]);

    useEffect(() => {
        if (open && !isGuest) {
            fetchQRConfig();
            fetchTags();
            fetchGroups();
            if (user?.role === 'PRO') {
                domainService.getAll().then(domains => {
                    setActiveDomains(domains.filter(d => d.status === 'ACTIVE'));
                }).catch(() => {});
            }
        }
    }, [open, isGuest, user?.role, fetchQRConfig, fetchTags, fetchGroups]);



    const fetchStats = useCallback(() => {
        if (isGuest) return;
        setStatsLoading(true);
        statsService.getLinkStats(link.shortUrl, statsPeriod)
            .then(setStats)
            .catch(console.error)
            .finally(() => setStatsLoading(false));
    }, [link.shortUrl, statsPeriod, isGuest]);

    useEffect(() => {
        if (!open || tab !== 'overview') return;
        fetchStats();
    }, [open, tab, fetchStats]);

    // Refresh the chart/breakdown as soon as a new access comes in for this link
    useLinkAccessEvent(open && tab === 'overview' ? link.shortUrl : undefined, fetchStats);

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

    const handleMetadataChange = useCallback((
        hasChanges: boolean,
        saveMetadata: () => Promise<void>,
        cancelMetadata: () => void
    ) => {
        setHasMetadataChanges(hasChanges);
        saveMetadataRef.current = saveMetadata;
        cancelMetadataRef.current = cancelMetadata;
    }, []);

    const handleTagsChange = async (next: (string | number)[]) => {
        if (!link.id) return;
        const atLimit = organizeLimit.tagsPerLink !== null && next.length > organizeLimit.tagsPerLink;
        const bounded = atLimit ? next.slice(0, organizeLimit.tagsPerLink!) : next;
        setSelectedTagIds(bounded as number[]);
        await assignTagsToLink(link.id, bounded as number[]);
        await fetchLinks();
    };

    const handleGroupChange = async (val: string | number | null) => {
        if (!link.id) return;
        if (val === null) {
            if (link.group?.id) await removeLinkFromGroup(link.group.id, link.id);
            setSelectedGroupId(null);
        } else {
            setSelectedGroupId(val as number);
            await moveLinkToGroup(val as number, link.id);
        }
        await fetchLinks();
    };

    const savedUtmParams = link.utmParams ?? [];
    const utmDirty = JSON.stringify(paramsFromRows(utmRows)) !== JSON.stringify(savedUtmParams);

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
                forwardParams: newLink.forwardParams ?? false,
                ...(utmDirty && { utmParams: paramsFromRows(utmRows) }),
                ...(newLink.shortUrl !== link.shortUrl && { newShortUrl: newLink.shortUrl }),
                ...((newLink.customDomain?.id ?? null) !== (link.customDomain?.id ?? null) && {
                    customDomainId: newLink.customDomain?.id ?? null,
                }),
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
            if (hasMetadataChanges && saveMetadataRef.current) await saveMetadataRef.current();

            toast.success(t('toastUpdateSuccess'));
            setShowStatusBar("none");
            setSuffixError('');
            if (!isPage) onClose();
            await fetchLinks();
            onSaved?.(newLink.shortUrl);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            toast.error(t('toastSaveFailed'), { description: errorMessage });
            setShowStatusBar("none");
        }
    }, [link, newLink, utmDirty, utmRows, updateLink, fetchLinks, onClose, isPage, onSaved, hasRulesChanges, hasQRChanges, hasMetadataChanges, toast, t]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = async (e: KeyboardEvent) => {
            const activeElement = document.activeElement;

            if (e.key === 'Enter' && !e.shiftKey) {
                const hasChanges =
                    utmDirty ||
                    link.status !== newLink.status ||
                    (link.forwardParams ?? false) !== (newLink.forwardParams ?? false) ||
                    link.longUrl !== newLink.longUrl ||
                    link.shortUrl !== newLink.shortUrl ||
                    (link.customDomain?.id ?? null) !== (newLink.customDomain?.id ?? null);
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
            else if (e.key === '4' && !isGuest) setTab('share');
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, link, newLink, utmDirty, handleUpdateLink, isGuest]);

    useEffect(() => {
        const hasLinkChanges =
            utmDirty ||
            link.status !== newLink.status ||
            (link.forwardParams ?? false) !== (newLink.forwardParams ?? false) ||
            link.longUrl !== newLink.longUrl ||
            link.shortUrl !== newLink.shortUrl ||
            (link.customDomain?.id ?? null) !== (newLink.customDomain?.id ?? null);

        const hasChanges = hasLinkChanges || hasRulesChanges || hasQRChanges || hasMetadataChanges;

        if (hasChanges) setShowStatusBar("confirm");
        else setShowStatusBar("none");
    }, [newLink, link, utmDirty, hasRulesChanges, hasQRChanges, hasMetadataChanges]);

    // Pieces of the overview, composed differently for the drawer and the page
    const shortUrlBlock = (
        <>
            {editingShortUrl ? (
                <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1'>
                        <span className='text-xl md:text-2xl italic font-black text-dark/60 whitespace-nowrap'>
                            {newLink.customDomain ? newLink.customDomain.domain : 'linkkk.dev/r'}/
                        </span>
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
                    <p className='text-xs text-dark/60'>{t('customSuffixHint')}</p>
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
                            initialText={newLink.customDomain ? `${newLink.customDomain.domain}/${newLink.shortUrl}` : `linkkk.dev/r/${newLink.shortUrl}`}
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
                                const domain = newLink.customDomain?.domain ?? 'linkkk.dev';
                                navigator.clipboard.writeText(`https://${domain}/r/${newLink.shortUrl}`);
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
        </>
    );

    const longUrlBlock = (
        <>
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
                            className='text-xs md:text-base truncate whitespace-nowrap min-w-0 max-w-sm'
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
        </>
    );

    const statusBlock = (
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
    );

    const forwardBlock = (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: "backInOut" }}
            className='flex items-center gap-3 max-w-sm'
        >
            <Switch
                size='sm'
                className='flex-shrink-0'
                checked={newLink.forwardParams ?? false}
                onChange={(checked) => setNewLink({ ...newLink, forwardParams: checked })}
            />
            <div className='flex items-center gap-1.5'>
                <span className='text-xs font-semibold text-dark/70'>{t('forwardParamsLabel')}</span>
                <InfoTip label={t('moreInfo')}>{t('forwardParamsDesc')}</InfoTip>
            </div>
        </motion.div>
    );

    const organizeBlock = (
        <LinkOrganizeFields
            isGuest={isGuest}
            isPro={user?.role === 'PRO'}
            stacked={isPage}
            tags={tags}
            groups={groups}
            activeDomains={activeDomains}
            selectedTagIds={selectedTagIds}
            selectedGroupId={selectedGroupId}
            customDomainId={newLink.customDomain?.id ?? null}
            onTagsChange={handleTagsChange}
            onGroupChange={handleGroupChange}
            onCustomDomainChange={(domain) => setNewLink(prev => ({ ...prev, customDomain: domain }))}
        />
    );

    const utmBaseUrl = link.customDomain
        ? `https://${link.customDomain.domain}/${link.shortUrl}`
        : `https://linkkk.dev/r/${link.shortUrl}`;

    const chipClass = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark/5 hover:bg-dark/10 text-xs font-bold text-dark/70 cursor-pointer';

    // Copy the link with the params saved on it, and jump to where they are configured
    const utmActions = isGuest ? null : (
        <div className='flex items-center gap-1.5'>
            {savedUtmParams.length > 0 && (
                <button
                    type='button'
                    className={chipClass}
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(buildUrlFromParams(utmBaseUrl, savedUtmParams));
                            toast.success(t('utmBuilderCopied'));
                        } catch {
                            toast.error(t('utmBuilderCopyError'));
                        }
                    }}
                >
                    <TbLink size={14} />
                    {t('utmQuickTitle')}
                </button>
            )}
            <button type='button' className={chipClass} onClick={() => setTab('share')} title={t('utmConfigure')}>
                <TbSettings size={14} />
                {savedUtmParams.length > 0 ? <span className='sr-only'>{t('utmConfigure')}</span> : t('utmAddParams')}
            </button>
        </div>
    );

    const qrBlock = (
        <>
            {!isGuest && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
                    className='flex flex-shrink-0 md:flex-col items-center gap-2'
                >
                    <div className='p-1 bg-white rounded-xl border border-dark/5'>
                        <QRCodePreview url={qrUrl} config={qrConfig} size={100} className='rounded-3xl' />
                    </div>
                </motion.div>
            )}
        </>
    );

    const statsBlock = (
        <>
            {!isGuest && (
                <LinkStatsPanel
                    stats={stats}
                    loading={statsLoading}
                    period={statsPeriod}
                    onPeriodChange={setStatsPeriod}
                    isStandardPlan={user?.role === 'STANDARD'}
                    bare={isPage}
                />
            )}
        </>
    );

    return (
        <div className={isPage ? 'flex flex-col min-h-[calc(100dvh-9rem)]' : 'contents'}>
            <LinkDrawerTabs tab={tab} onChange={setTab} isGuest={isGuest} fullWidth={isPage} />

                <div className={isPage ? 'flex-1 flex flex-col gap-2 py-4' : 'flex-1 overflow-auto flex flex-col gap-2 p-4'}>

                {/* Overview */}
                {tab === 'overview' && (isPage ? (
                    <div className='relative z-0 w-full flex flex-col gap-4'>
                        {/* Header card: link identity, status and QR */}
                        <div className='flex items-start justify-between gap-4 bg-white border border-dark/10 rounded-2xl p-4'>
                            <div className='flex-1 min-w-0 flex flex-col gap-3'>
                                {shortUrlBlock}
                                {longUrlBlock}
                                <div className='flex flex-wrap items-center gap-2'>
                                    {statusBlock}
                                    {utmActions}
                                </div>
                            </div>
                            <div className='hidden sm:block'>{qrBlock}</div>
                        </div>

                        <div className='grid xl:grid-cols-[minmax(0,1fr)_20rem] gap-4 items-start'>
                            <div className='min-w-0'>{statsBlock}</div>

                            {/* Link settings: collapsible on small screens */}
                            <section className='bg-white border border-dark/10 rounded-2xl p-4 flex flex-col gap-4 xl:sticky xl:top-24'>
                                <button
                                    type='button'
                                    onClick={() => setSettingsOpen((v) => !v)}
                                    aria-expanded={settingsOpen}
                                    className='flex items-center justify-between gap-2 w-full md:cursor-default cursor-pointer'
                                >
                                    <h2 className='flex items-center gap-2 text-base font-black italic text-dark'>
                                        <TbSettings size={18} />
                                        {t('settingsTitle')}
                                    </h2>
                                    <TbChevronDown size={18} className={`md:hidden transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`${settingsOpen ? 'flex' : 'hidden'} md:flex flex-col gap-4`}>
                                    {forwardBlock}
                                    {organizeBlock}
                                </div>
                            </section>
                        </div>
                    </div>
                ) : (
                    <div className='relative z-0 w-full flex flex-col gap-6'>
                        <div className='w-full flex flex-col sm:flex-row sm:items-start gap-6 min-w-0'>
                            <div className='flex-1 min-w-0 flex flex-col gap-3'>
                                {shortUrlBlock}
                                {longUrlBlock}
                                <div className='flex flex-col gap-3'>
                                    {statusBlock}
                                    {forwardBlock}
                                    {organizeBlock}
                                </div>
                            </div>
                            {qrBlock}
                        </div>
                        {statsBlock}
                    </div>
                ))}

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


                {/* Share: UTM builder, QR code and social preview */}
                {tab === 'share' && (
                    <div className='relative z-0 w-full flex flex-col gap-8'>
                        <section className='flex flex-col gap-3'>
                            <h2 className='text-base font-black italic text-dark'>{t('utmBuilderTitle')}</h2>
                            <UtmBuilder baseUrl={utmBaseUrl} rows={utmRows} onRowsChange={setUtmRows} />
                        </section>

                        <section className='flex flex-col gap-3 pt-6 border-t border-dark/10'>
                            <h2 className='text-base font-black italic text-dark'>{t('tabQR')}</h2>
                            <QRCodeEditor shortUrl={link.shortUrl} onConfigChange={handleQRChange} />
                        </section>

                        <section className='flex flex-col gap-3 pt-6 border-t border-dark/10'>
                            <h2 className='text-base font-black italic text-dark'>{t('tabMetadata')}</h2>
                            <LinkMetadataEditor shortUrl={link.shortUrl} onConfigChange={handleMetadataChange} />
                        </section>
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
                        className={isPage ? 'sticky bottom-24 md:bottom-0 mt-auto z-20 w-full bg-light border border-dark/10 rounded-2xl md:rounded-none md:border-x-0 md:border-b-0 p-4' : 'w-full bg-dark/5 border-t p-4'}
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
                                        setUtmRows(rowsFromParams(link.utmParams));
                                        setSuffixError('');
                                        setEditingShortUrl(false);
                                        setEditingLongUrl(false);
                                        if (cancelRulesRef.current) cancelRulesRef.current();
                                        if (cancelQRRef.current) cancelQRRef.current();
                                        if (cancelMetadataRef.current) cancelMetadataRef.current();
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
        </div>
    );
}
