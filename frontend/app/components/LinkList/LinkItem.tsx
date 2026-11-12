import React, { useEffect, useId, useRef, useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { TbCheck, TbClick, TbCopy, TbCircleDashedCheck, TbCircleDashed, TbCornerDownRight, TbDots, TbExternalLink, TbQrcode, TbShare3, TbTrash, TbFolder } from 'react-icons/tb'
import Button from '@/app/components/ui/Button/Button';
import Chip from '@/app/components/ui/Chip/Chip';
import Dropdown, { DropdownItem } from '@/app/components/ui/Dropdown/Dropdown';
import Modal from '@/app/components/ui/Modal/Modal';
import { useToast } from '@/app/hooks/useToast';
import TagChip from '@/app/components/Tags/TagChip';
import { useLinks } from '@/app/hooks';
import { useLinkDrawerStore } from '@/app/stores/linkDrawerStore';
import { Link } from '@/app/types';
import { useTranslations } from 'next-intl';



interface LinkItemProps {
    view: string;
    data: Link;
}

export default function LinkItem({ view, data }: LinkItemProps) {
    const t = useTranslations('Dashboard');
    const { deleteLink } = useLinks();
    const router = useRouter();
    const detailHref = `/dashboard/links/${encodeURIComponent(data.shortUrl)}`;
    const openLink = () => router.push(detailHref);
    const requestedShortUrl = useLinkDrawerStore((s) => s.requestedShortUrl);
    const clearDrawerRequest = useLinkDrawerStore((s) => s.clearRequest);
    const toast = useToast();

    const displayUrl = `${data.customDomain ? data.customDomain.domain : 'linkkk.dev/r'}/${data.shortUrl}`;
    const fullUrl = `https://${displayUrl}`;

    // Copy is the most repeated action in the product: always visible, and it
    // says so when it worked.
    const [copied, setCopied] = useState(false);
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => {
        if (copiedTimer.current) clearTimeout(copiedTimer.current);
    }, []);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            toast.success(t('rowCopied'), { description: displayUrl });
            if (copiedTimer.current) clearTimeout(copiedTimer.current);
            copiedTimer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t('rowCopyFailed'));
        }
    };

    const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    const shareLink = async () => {
        try {
            await navigator.share({ url: fullUrl });
        } catch {
            // Dismissing the share sheet rejects too; nothing to report.
        }
    };

    // Deleting breaks every place the link is already used (printed QR codes
    // included), so it always goes through a confirmation that names the link.
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const deleteTitleId = useId();

    const closeDeleteConfirm = () => {
        if (isDeleting) return;
        setConfirmingDelete(false);
        deleteButtonRef.current?.focus();
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        const result = await deleteLink(data.shortUrl);
        if (result.success) {
            // The row unmounts with the link; nothing else to reset
            toast.success(t('deleteLinkSuccess'), { description: displayUrl });
            return;
        }
        setIsDeleting(false);
        setConfirmingDelete(false);
        toast.error(t('deleteLinkFailed'), { description: result.error ?? undefined });
    };

    // Lets a realtime toast (or anything outside this row) open this link's page
    useEffect(() => {
        if (requestedShortUrl === data.shortUrl) {
            openLink();
            clearDrawerRequest();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestedShortUrl, data.shortUrl, clearDrawerRequest]);


    if (view === 'list') {
        return <></>;
    }

    if (view === 'details') {
        return (
            <>
                <div className='flex items-stretch bg-dark/5 rounded-2xl transition-colors hover:bg-dark/10 focus-within:bg-dark/10'>
                    <NextLink href={detailHref} className='flex-1 min-w-0 flex flex-col gap-4 items-start justify-between py-2 pl-4 pr-2 rounded-2xl'>

                        <div className='flex flex-col justify-between sm:flex-row gap-2 w-full'>
                            {/* URLs */}
                            <div className='flex flex-col w-full sm:max-w-1/2 gap-1 min-w-0'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <p className='text-lg italic break-all'>
                                        {data.customDomain ? data.customDomain.domain : 'linkkk.dev/r'}/<span className='font-bold'>{data.shortUrl}</span>
                                    </p>
                                    {/* Group badge */}
                                    {data.group && (
                                        <div className='flex items-center gap-1 text-sm px-2 py-1 rounded-full border' style={{ color: data.group.color ?? '#6b7280', backgroundColor: (data.group.color ?? '#6b7280') + '22' }}>
                                            <TbFolder size={16} />
                                            <span className=''>{data.group.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className='flex items-center gap-2 text-dark/70'>
                                    <TbCornerDownRight size={20} className='shrink-0' />
                                    <p className='flex-1 truncate'>{data.longUrl}</p>
                                </div>
                                {/* Tag chips */}
                                {data.tags && data.tags.length > 0 && (
                                    <div className='flex flex-wrap gap-1'>
                                        {data.tags.map(tag => <TagChip key={tag.id} tag={tag} size='xs' />)}
                                    </div>
                                )}
                            </div>

                            {/* Status & Stats */}
                            <div className='flex gap-2 sm:flex-col sm:items-end'>
                                {data.status ?
                                    <Chip variant="success" size='sm' leftIcon={<TbCircleDashedCheck size={16} />}>
                                        {t('active')}
                                    </Chip>
                                    :
                                    <Chip variant="danger" size='sm' leftIcon={<TbCircleDashed size={16} />}>
                                        {t('inactive')}
                                    </Chip>
                                }
                                <div className='flex gap-1'>
                                    <Chip variant="dark" size='sm' leftIcon={<TbClick size={14} />}>
                                        {data.accessCount ?? 0}
                                    </Chip>
                                    <Chip variant="dark" size='sm' leftIcon={<TbQrcode size={14} />}>
                                        {data.scanCount ?? 0}
                                    </Chip>
                                </div>
                            </div>
                        </div>

                    </NextLink>

                    {/* Actions sit in a fixed place and never depend on hover, so
                        they work the same with a finger, a mouse or the keyboard. */}
                    <div className='flex items-center gap-1 pr-2 shrink-0'>
                        <Button
                            variant='ghost'
                            iconOnly
                            leftIcon={copied ? <TbCheck size={22} /> : <TbCopy size={22} />}
                            rounded='xl'
                            size='md'
                            className='size-11 hover:bg-dark/10'
                            aria-label={t('copyLinkLabel', { url: displayUrl })}
                            onClick={copyLink}
                        />
                        <Dropdown
                            placement='bottom-right'
                            trigger={
                                <Button
                                    variant='ghost'
                                    iconOnly
                                    leftIcon={<TbDots size={22} />}
                                    rounded='xl'
                                    size='md'
                                    className='size-11 hover:bg-dark/10'
                                    ref={deleteButtonRef}
                                    aria-haspopup='menu'
                                    aria-label={t('rowActionsLabel', { url: displayUrl })}
                                />
                            }
                            items={[
                                { label: t('rowOpen'), value: 'open', icon: <TbExternalLink size={18} />, onClick: openLink },
                                ...(canShare ? [{ label: t('rowShare'), value: 'share', icon: <TbShare3 size={18} />, onClick: shareLink } as DropdownItem] : []),
                                { label: t('rowDelete'), value: 'delete', icon: <TbTrash size={18} />, separator: true, danger: true, onClick: () => setConfirmingDelete(true) },
                            ]}
                        />
                    </div>
                </div>

                {/* Outside the row on purpose: clicks inside a portal still bubble
                    through React, and the row's onClick would open the link. */}
                <Modal
                    open={confirmingDelete}
                    onClose={closeDeleteConfirm}
                    size='md'
                    showCloseButton={false}
                    closeOnOverlayClick={!isDeleting}
                    labelledBy={deleteTitleId}
                >
                    <div className='flex flex-col gap-4 p-6'>
                        <h2 id={deleteTitleId} className='text-xl font-black italic text-dark'>
                            {t('deleteLinkTitle')}
                        </h2>
                        <p className='text-sm text-dark/80'>
                            <span className='font-bold text-dark break-all'>{displayUrl}</span>{' '}
                            {t('deleteLinkBody')}
                        </p>
                        <p className='text-sm font-bold text-dark'>{t('deleteLinkIrreversible')}</p>
                        <div className='flex flex-col-reverse sm:flex-row gap-2 sm:justify-end'>
                            <Button
                                variant='outline'
                                size='lg'
                                rounded='2xl'
                                autoFocus
                                disabled={isDeleting}
                                onClick={closeDeleteConfirm}
                            >
                                {t('deleteLinkCancel')}
                            </Button>
                            <Button
                                variant='solid'
                                size='lg'
                                rounded='2xl'
                                leftIcon={<TbTrash size={20} />}
                                loading={isDeleting}
                                className='bg-danger border-dark text-dark hover:shadow-[4px_4px_0_var(--color-dark)]'
                                onClick={confirmDelete}
                            >
                                {t('deleteLinkConfirm')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </>
        )
    }

    if (view === 'grid') {
        return (
            <></>
        )

    }

}