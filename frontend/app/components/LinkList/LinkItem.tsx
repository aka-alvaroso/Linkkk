import React, { useState } from 'react'
import { TbClick, TbCopy, TbCircleDashedCheck, TbCircleDashed, TbQrcode, TbSettings, TbShare3, TbTrash } from 'react-icons/tb'
import { FiCornerDownRight } from "react-icons/fi";
import Button from '@/app/components/ui/Button/Button';
import Chip from '@/app/components/ui/Chip/Chip';
import EditLinkDrawer from '@/app/components/Drawer/EditiLinkDrawer';
import { useLinks } from '@/app/hooks';
import { Link } from '@/app/types';
import { useTranslations } from 'next-intl';



interface LinkItemProps {
    view: string;
    data: Link;
}

export default function LinkItem({ view, data }: LinkItemProps) {
    const t = useTranslations('Dashboard');
    const { deleteLink } = useLinks();
    const [linkDetailsDrawer, setLinkDetailsDrawer] = useState(false);


    if (view === 'list') {
        return <></>;
    }

    if (view === 'details') {
        return (
            <>
                <div className='relative flex group' onClick={() => setLinkDetailsDrawer(true)}>
                    <div className='absolute top-1/2 left-0 opacity-0 grid grid-cols-2 grid-rows-2 items-center transition transform -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:opacity-100 group-hover:scale-90'>
                        <Button
                            variant='ghost'
                            iconOnly
                            leftIcon={<TbCopy size={20} />}
                            rounded='xl'
                            size='md'
                            className='text-dark/40 hover:text-info hover:bg-info/10'
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`https://linkkk.dev/r/${data.shortUrl}`);
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
                            onClick={async (e) => {
                                e.stopPropagation();
                                await deleteLink(data.shortUrl);
                            }}
                        />

                    </div>

                    <div className='w-full flex flex-col gap-4 items-start justify-between py-2 px-4 bg-dark/5 rounded-2xl transition transform hover:cursor-pointer hover:bg-dark/10 group-hover:translate-x-12'>

                        <div className='flex flex-col justify-between sm:flex-row gap-2 w-full'>
                            {/* URLs */}
                            <div className='flex flex-col w-full sm:max-w-1/2'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-lg italic'>linkkk.dev/r/<span className='font-bold'>{data.shortUrl}</span></p>
                                </div>
                                <div className='flex items-center gap-2 text-dark/50'>
                                    <FiCornerDownRight size={20} />
                                    <p className='flex-1 truncate'>{data.longUrl}</p>
                                </div>
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
                <EditLinkDrawer open={linkDetailsDrawer} onClose={() => setLinkDetailsDrawer(false)}
                    link={data}
                />
            </>
        )
    }

    if (view === 'grid') {
        return (
            <></>
        )

    }

}