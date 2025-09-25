import React from 'react'
import { Link } from '@/app/stores/linkStore'
import { TbClipboard, TbDotsVertical, TbLocation, TbLocationOff, TbSettings } from 'react-icons/tb'
import Button from '@/app/components/ui/Button/Button';
import Chip from '@/app/components/ui/Chip/Chip';
import { getExpirationStatus, formatDate } from '@/app/utils/dateUtils';

interface ShowingProp {
    key: string;
    show: boolean;
    label: string;
    icon: React.ReactNode;
  }

interface LinkItemProps {
    props: ShowingProp[];
    view: string;
    data: Link;
  }

export default function LinkItem({ props, view, data }: LinkItemProps) {

    const dateStatus = getExpirationStatus(data.dateExpire);
    
    if (view === 'list') {
        return (
            <div className='relative flex items-center justify-between py-2 px-4 rounded-2xl transition hover:bg-dark/5 group/item'>
                {props.map((prop) => {
                    return (
                        <div key={prop.key} className='relative flex min-w-64 max-w-64 items-center justify-start group/url'>
                            {
                                prop.key === "shortUrl" && (
                                    <p>linkkk.dev/<span className='font-bold'>{data.shortUrl}</span></p>
                                )
                            }
                            {
                                prop.key === "longUrl" && (
                                    <p className='w-10/12 truncate'>{data.longUrl}</p>
                                )
                            }
                            {
                                (prop.key === 'shortUrl' || prop.key === 'longUrl') && (
                                    <Button 
                                        variant='ghost' 
                                        iconOnly 
                                        leftIcon={<TbClipboard size={20} />} 
                                        size='sm'
                                        className='text-dark/40 opacity-0 absolute right-4 size-8 rounded-md flex items-center justify-center transform -translate-x-12 transition group-hover/url:opacity-100 group-hover/url:translate-x-0 hover:cursor-pointer hover:text-dark' 
                                    />
                                )
                            }
                            {
                                prop.key === "status" && (
                                    data.status ?
                                      <Chip variant="success" size='sm' leftIcon={<TbLocation size={16} />}>
                                        Active
                                      </Chip>
                                      :
                                      <Chip variant="danger" size='sm' leftIcon={<TbLocationOff size={16} />}>
                                        Inactive
                                      </Chip>
                                )
                            }
                            {
                                prop.key === "dateExpire" && (
                                    <div className='flex items-center'>
                                        <Chip 
                                            variant={dateStatus === 'expired' ? 'danger' : dateStatus === 'expires-soon' ? 'warning' : dateStatus === 'active' ? 'success' : 'default'}
                                            size="sm"
                                        >
                                            {dateStatus === 'expired' ? 'Expirado' : formatDate(data.dateExpire)}
                                        </Chip>
                                    </div>
                                )
                            }
                        </div>
                    );
                })}
                <Button 
                    variant='ghost' 
                    iconOnly 
                    leftIcon={<TbSettings size={20} />}
                    rounded='xl'
                    className='text-dark/40 absolute right-0 opacity-0 group-hover/item:opacity-100 group-hover/item:transform group-hover/item:translate-x-12' 
                />
                
            </div>
        )
    }

    if (view === 'details') {
        return (
            <div className='flex items-center justify-between py-2 px-4 bg-dark/5 rounded-2xl'>
                
            </div>
        )
    }

    if (view === 'grid') {
        return (
            <div className='flex items-center justify-between py-2 px-4 bg-dark/5 rounded-2xl'>
                
            </div>
        )
        
    }

}