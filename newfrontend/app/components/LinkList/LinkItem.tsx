import React, { useState } from 'react'
import { Link } from '@/app/stores/linkStore'
import { TbArrowFork, TbCalendarCheck, TbCalendarExclamation, TbCalendarOff, TbCalendarX, TbClick, TbCopy, TbDotsVertical, TbInputCheck, TbLibrary, TbLocation, TbLocationOff, TbLockPassword, TbMapPinOff, TbSettings, TbShare3, TbTrash } from 'react-icons/tb'
import { FiCornerDownRight } from "react-icons/fi";
import Button from '@/app/components/ui/Button/Button';
import Chip from '@/app/components/ui/Chip/Chip';
import { getExpirationStatus, formatDate } from '@/app/utils/dateUtils';
import EditLinkDrawer from '@/app/components/Drawer/EditiLinkDrawer';
import { useLinkStore } from '@/app/stores/linkStore';



interface LinkItemProps {
    view: string;
    data: Link;
  }

export default function LinkItem({ view, data }: LinkItemProps) {
    const { deleteLink, getLinks } = useLinkStore();    
    const [linkDetailsDrawer, setLinkDetailsDrawer] = useState(false);

    const dateStatus = getExpirationStatus(data.dateExpire);
    
    if (view === 'list') {
        return <></>;
    }

    if (view === 'details') {
        return (
            <>
            <div className='relative flex group' onClick={() => setLinkDetailsDrawer(true)}>
                <div className='absolute top-1/2 left-0 opacity-0 grid grid-cols-2 grid-rows-2 items-center transition transform -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:opacity-100 group-hover:scale-100'>
                    <Button 
                        variant='ghost' 
                        iconOnly 
                        leftIcon={<TbCopy size={20} />} 
                        rounded='xl' 
                        size='md' 
                        className='text-dark/40 hover:text-info hover:bg-info/10' 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`https://linkkk.dev/${data.sufix || data.shortUrl}`);
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
                            await getLinks();
                        }}
                    />

                </div>

                <div className='w-full flex flex-col gap-4 items-start justify-between py-2 px-4 bg-dark/5 rounded-2xl transition transform hover:cursor-pointer hover:bg-dark/10 group-hover:translate-x-12'>
                    
                    <div className='flex flex-col justify-between sm:flex-row gap-2 w-full'>
                        {/* URLs */}
                        <div className='flex flex-col w-full sm:max-w-1/2'>
                            <div className='flex items-center justify-between'>
                                <p className='text-lg italic'>linkkk.dev/<span className='font-bold'>{data.sufix || data.shortUrl}</span></p>
                            </div>
                            <div className='flex items-center gap-2 text-dark/50'>
                                <FiCornerDownRight size={20} /> 
                                <p className='flex-1 truncate'>{data.longUrl}</p>
                            </div>
                        </div>

                        {/* Status & Expiration */}
                        <div className='flex gap-2 sm:flex-col sm:items-end'>
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
                    <div className='flex flex-wrap gap-1 items-center'>
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
                                Custom Metadata
                            </Chip>
                        )}
                    </div>
                </div>
            </div>
                <EditLinkDrawer open={linkDetailsDrawer} onClose={() => setLinkDetailsDrawer(false)} 
                    link={{
                        
                        ...data, 
                        password: '', 
                        sufix: data.sufix || '',
                        hasPassword: data.password ? true : false,
                    }} 
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