import React, { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TbClick, TbCopy, TbCircleDashedCheck, TbCircleDashed, TbQrcode, TbSettings, TbShare3, TbTrash, TbFolder } from 'react-icons/tb'
import { FiCornerDownRight } from "react-icons/fi";
import Button from '@/app/components/ui/Button/Button';
import Chip from '@/app/components/ui/Chip/Chip';
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
    const openLink = () => router.push(`/dashboard/links/${encodeURIComponent(data.shortUrl)}`);
    const requestedShortUrl = useLinkDrawerStore((s) => s.requestedShortUrl);
    const clearDrawerRequest = useLinkDrawerStore((s) => s.clearRequest);
    const toast = useToast();

    const displayUrl = `${data.customDomain ? data.customDomain.domain : 'linkkk.dev/r'}/${data.shortUrl}`;

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
                <div className='relative flex group' onClick={openLink}>
                    <div className='absolute top-1/2 left-0 opacity-0 grid grid-cols-2 grid-rows-2 items-center transition transform -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:opacity-100 group-hover:scale-90 group-focus-within:opacity-100 group-focus-within:scale-90'>
                        <Button
                            variant='ghost'
                            iconOnly
                            leftIcon={<TbCopy size={20} />}
                            rounded='xl'
                            size='md'
                            className='text-dark/40 hover:text-info hover:bg-info/10'
                            aria-label={t('copyLinkLabel', { url: displayUrl })}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`https://${displayUrl}`);
                            }}
                        />
                        <Button
                            variant='ghost'
                            iconOnly
                            leftIcon={<TbShare3 size={20} />}
                            rounded='xl'
                            size='md'
                            className='text-dark/40 hover:text-success hover:bg-success/10'
                        />
                        <Button
                            variant='ghost'
                            iconOnly
                            leftIcon={<TbSettings size={20} />}
                            rounded='xl'
                            size='md'
                            className='text-dark/40 hover:text-warning hover:bg-warning/10'
                        />
                        <Button
                            variant='ghost'
                            iconOnly
                            leftIcon={<TbTrash size={20} />}
                            rounded='xl'
                            size='md'
                            className='text-dark/40 hover:text-danger hover:bg-danger/10'
                            ref={deleteButtonRef}
                            aria-label={t('deleteLinkLabel', { url: displayUrl })}
                            onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDelete(true);
                            }}
                        />

                    </div>

                    <div className='w-full flex flex-col gap-4 items-start justify-between py-2 px-4 bg-dark/5 rounded-2xl transition transform hover:cursor-pointer hover:bg-dark/10 group-hover:translate-x-12 group-focus-within:translate-x-12'>

                        <div className='flex flex-col justify-between sm:flex-row gap-2 w-full'>
                            {/* URLs */}
                            <div className='flex flex-col w-full sm:max-w-1/2 gap-1'>
                                <div className='flex items-center gap-2'>
                                    <p className='text-lg italic'>
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
                                <div className='flex items-center gap-2 text-dark/50'>
                                    <FiCornerDownRight size={20} />
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