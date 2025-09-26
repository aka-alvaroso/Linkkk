import React from 'react'
import { Link } from '@/app/stores/linkStore'
import { TbArrowFork, TbCalendarCheck, TbCalendarExclamation, TbCalendarOff, TbCalendarX, TbClick, TbDotsVertical, TbInputCheck, TbLibrary, TbLocation, TbLocationOff, TbLockPassword, TbMapPinOff, TbSettings, TbTrash, TbEdit, TbCopy, TbQrcode, TbChartBar, TbShare } from 'react-icons/tb'
import { FiCornerDownRight } from "react-icons/fi";
import Button from '@/app/components/ui/Button/Button';
import Chip from '@/app/components/ui/Chip/Chip';
import FloatingDropdown from '@/app/components/ui/FloatingDropdown/FloatingDropdown';
import { getExpirationStatus, formatDate } from '@/app/utils/dateUtils';



interface LinkItemProps {
    view: string;
    data: Link;
  }

export default function LinkItem({ view, data }: LinkItemProps) {

    const dateStatus = getExpirationStatus(data.dateExpire);

    // Dropdown menu actions
    const handleCopyShortUrl = () => {
        navigator.clipboard.writeText(`linkkk.dev/${data.shortUrl}`);
        // TODO: Add toast notification
        console.log('Short URL copied to clipboard');
    };

    const handleCopyLongUrl = () => {
        navigator.clipboard.writeText(data.longUrl);
        // TODO: Add toast notification
        console.log('Long URL copied to clipboard');
    };

    const handleModify = () => {
        // TODO: Open edit modal
        console.log('Edit link:', data.id);
    };

    const handleDelete = () => {
        // TODO: Show confirmation dialog
        console.log('Delete link:', data.id);
    };

    // Dropdown menu items
    const dropdownItems = [
        {
            id: 'copyShortUrl',
            label: 'Copy Short URL',
            icon: <TbCopy size={16} />,
            onClick: handleCopyShortUrl,
        },
        {
            id: 'copyLongUrl',
            label: 'Copy Long URL',
            icon: <TbCopy size={16} />,
            onClick: handleCopyLongUrl,
        },
        {
            id: 'modify',
            label: 'Modify link',
            icon: <TbSettings size={16} />,
            onClick: handleModify,
        },
        {
            id: 'delete',
            label: 'Delete link',
            variant: 'danger',
            icon: <TbTrash size={16} />,
            onClick: handleDelete,
        }
    ];
    
    if (view === 'list') {
        return <></>;
    }

    if (view === 'details') {
        return (
            <div className='relative flex group'>
                <div className='absolute h-full top-0 left-0 opacity-0 flex flex-col items-center justify-center transition transform scale-0 group-hover:opacity-100 group-hover:scale-100'>
                    <Button 
                        variant='ghost' 
                        iconOnly 
                        leftIcon={<TbSettings size={20} />} 
                        rounded='xl' 
                        size='sm' 
                        className='w-10 h-8 text-dark/40 hover:text-dark flex-1' 
                    />
                    <Button 
                        variant='ghost' 
                        iconOnly 
                        leftIcon={<TbTrash size={20} />} 
                        rounded='xl' 
                        size='sm' 
                        className='w-10 h-8 text-dark/40 hover:text-danger flex-1' 
                    />

                </div>

                <div className='w-full flex flex-col gap-4 items-start justify-between py-2 px-4 bg-dark/5 rounded-2xl transition transform hover:bg-dark/10 group-hover:translate-x-12'>
                    
                    <div className='flex flex-col justify-between sm:flex-row gap-2 w-full'>
                        {/* URLs */}
                        <div className='flex flex-col w-full sm:max-w-1/2'>
                            <div className='flex items-center justify-between'>
                                <p className='text-lg italic'>linkkk.dev/<span className='font-bold'>{data.shortUrl}</span></p>
                                <FloatingDropdown
                                    trigger={
                                        <Button 
                                            variant='ghost' 
                                            iconOnly 
                                            leftIcon={<TbDotsVertical size={16} className='text-dark/40 hover:text-dark sm:hidden' />} 
                                        />
                                    }
                                    items={dropdownItems}
                                    direction="left"
                                    className='sm:hidden'
                                />
                            </div>
                            <div className='flex items-center gap-2 text-dark/50'>
                                <FiCornerDownRight size={20} /> 
                                <p className='flex-1 truncate'>{data.longUrl}</p>
                            </div>
                        </div>

                        {/* Status & Expiration */}
                        <div className='flex gap-2 sm:flex-col sm:items-end '>
                                {data.status ?
                                    <Chip variant="success" size='sm' leftIcon={<TbLocation size={16} />}>
                                        Active
                                    </Chip>
                                    :
                                    <Chip variant="danger" size='sm' leftIcon={<TbLocationOff size={16} />}>
                                        Inactive
                                    </Chip>
                                }
                                <Chip 
                                    variant={dateStatus === 'expired' ? 'danger' : dateStatus === 'expires-soon' ? 'warning' : dateStatus === 'active' ? 'success' : 'default'}
                                    size="sm"
                                    leftIcon={dateStatus === 'expired' ? <TbCalendarX size={16} /> : dateStatus === 'expires-soon' ? <TbCalendarExclamation size={16} /> : data.dateExpire ? <TbCalendarCheck size={16} /> : <TbCalendarOff size={16} />}
                                    >
                                        {dateStatus === 'expired' ? 'Expired' : data.dateExpire ? formatDate(data.dateExpire) : 'No date'}
                                </Chip>
                        </div> 
                    </div>

                    
                    {/* Advanced */}
                    <div className='flex flex-wrap gap-1 items-center sm:justify-center'>
                        {data.password && (
                            <Chip size='sm' className='bg-blue-400/10 text-blue-400' leftIcon={<TbLockPassword size={16} />}>
                                Protected
                            </Chip>
                        )}
                        
                        {data.accessLimit && (
                            <Chip size='sm' className='bg-blue-400/10 text-blue-400' leftIcon={<TbClick size={16} />}>
                                Limited clicks
                            </Chip>
                        )}

                        {data.sufix && (
                            <Chip size='sm' className='bg-blue-400/10 text-blue-400' leftIcon={<TbInputCheck size={16} />}>
                                Custom suffix
                            </Chip>
                        )}

                        {data.blockedCountries && data.blockedCountries.length > 0 && (
                            <Chip size='sm' className='bg-blue-400/10 text-blue-400' leftIcon={<TbMapPinOff size={16} />}>
                                Blocked countries
                            </Chip>
                        )}
                        {(data.mobileUrl || data.desktopUrl) && (
                            <Chip size='sm' className='bg-blue-400/10 text-blue-400' leftIcon={<TbArrowFork size={16} />}>
                                Smart Redirect
                            </Chip>
                        )}
                        {(data.metadataTitle || data.metadataDescription || data.metadataImage) && (
                            <Chip size='sm' className='bg-blue-400/10 text-blue-400' leftIcon={<TbLibrary size={16} />}>
                                Metadata
                            </Chip>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (view === 'grid') {
        return (
            <></>
        )
        
    }

}