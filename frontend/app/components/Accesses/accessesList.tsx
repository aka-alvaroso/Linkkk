import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { TbShieldCheck, TbShieldX, TbRobot, TbUser, TbWifi, TbBrowser, TbLocationOff, TbShare3 } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import Button from '../ui/Button/Button';
import { useToast } from "@/app/hooks/useToast";

interface Access {
    id: number;
    linkId: number;
    createdAt: string;
    userAgent: string;
    ip: string;
    country: string;
    isVPN: boolean;
    isBot: boolean;
}

interface AccessesListProps {
    shortUrl: string;
}

export const AccessesList = ({ shortUrl }: AccessesListProps) => {
    const toast = useToast();
    const [accesses, setAccesses] = useState<Access[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getLinkAccesses = async (shortUrl: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accesses/link/${shortUrl}`, {
                credentials: "include",
            });
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching accesses:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const d = await getLinkAccesses(shortUrl);
            setAccesses(d);
        };
        fetchData();
    }, [shortUrl]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Normaliza el nombre del navegador al slug que usa Simple Icons
    const getBrowserSlug = (browserName: string): string => {
        const slugMap: Record<string, string> = {
            'Chrome': 'googlechrome',
            'Edge': 'microsoftedge',
        };
        
        // Si tiene mapeo específico, lo usa; si no, convierte a minúsculas
        return slugMap[browserName] || browserName.toLowerCase();
    };

    // Genera la URL del logo automáticamente desde el nombre del navegador
    const getBrowserLogoUrl = (browserName: string): string | null => {
        if (browserName === 'Unknown') return null;
        const slug = getBrowserSlug(browserName);
        return `https://cdn.simpleicons.org/${slug}`;
    };

    const getBrowserInfo = (userAgent: string) => {
        console.log(userAgent)
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    };

    if (isLoading) {
        return (
            <div className="w-full py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-dark/50 font-medium">Loading accesses...</p>
            </div>
        );
    }

    // Empty state
    if (accesses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full py-8 md:py-12"
            >
                <div className="md:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-mb-4 ">
                        <TbLocationOff size={32} className="text-secondary" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black italic mb-2">No clicks yet</h3>
                    <p className="text-dark/60 text-sm md:text-base">Share your link and watch the magic happen!</p>
                    <Button
                     variant='solid'
                     size='md'
                     rounded='2xl'
                     leftIcon={<TbShare3 size={20} />}
                     onClick={() => {
                        navigator.clipboard.writeText(`https://linkkk.dev/r/${shortUrl}`);
                        toast.success('Link copied to clipboard!');
                     }}
                     className='mt-2 hover:bg-primary hover:text-dark'
                    >
                        Share Link
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full space-y-3">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 mb-4"
            >
                <TbWifi size={24} className="" />
                <h3 className="text-xl font-black">Recent Accesses ({accesses.length})</h3>
            </motion.div>

            {/* Table - Scrollable on mobile */}
            <div className="w-full overflow-x-auto rounded-2xl scrollbar-hide">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-dark/15">
                            <th className="px-4 py-3 text-left font-black italic text-md">
                                Time
                            </th>
                            <th className="px-4 py-3 text-left font-black italic text-md">
                                Location
                            </th>
                            <th className="px-4 py-3 text-left font-black italic text-md">
                                IP Address
                            </th>
                            <th className="px-4 py-3 text-left font-black italic text-md">
                                Browser
                            </th>
                            <th className="px-4 py-3 text-center font-black italic text-md">
                                VPN
                            </th>
                            <th className="px-4 py-3 text-center font-black italic text-md">
                                Bot
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-light">
                        {accesses.map((access, index) => {
                            const browser = getBrowserInfo(access.userAgent);
                            return (
                                <motion.tr
                                    key={access.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className="border-b border-dark/15 hover:bg-dark/5 transition-colors"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{formatDate(access.createdAt)}</span>
                                            <span className="text-xs text-dark/50">
                                                {formatFullDate(access.createdAt)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* TODO: Flag */}
                                            <span className="font-bold text-sm">{access.country}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <code className="px-2.5 py-1.5 bg-dark/5 rounded-lg text-xs font-mono font-bold border border-dark/10">
                                            {access.ip}
                                        </code>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {getBrowserLogoUrl(browser) ? (
                                                <Image 
                                                    src={getBrowserLogoUrl(browser)!} 
                                                    alt={browser}
                                                    width={20}
                                                    height={20}
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            ) : (
                                                <TbBrowser size={20} className="text-dark/40" />
                                            )}
                                            <span className="text-sm font-bold">{browser}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-center">
                                            {access.isVPN ? (
                                                <div className="px-3 py-1.5 bg-danger text-light rounded-lg flex items-center gap-1.5">
                                                    <TbShieldX size={14} className="text-light" />
                                                    <span className="text-xs font-black">Yes</span>
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1.5 bg-success rounded-lg flex items-center gap-1.5">
                                                    <TbShieldCheck size={14} className="text-dark" />
                                                    <span className="text-xs font-black">No</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-center">
                                            {access.isBot ? (
                                                <div className="px-3 py-1.5 bg-danger text-light rounded-lg flex items-center gap-1.5">
                                                    <TbRobot size={14} className="text-light" />
                                                    <span className="text-xs font-black">Yes</span>
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1.5 bg-success rounded-lg flex items-center gap-1.5">
                                                    <TbUser size={14} className="text-dark" />
                                                    <span className="text-xs font-black">No</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
