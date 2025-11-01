import React, { useEffect, useState } from 'react';
import Chip from '../ui/Chip/Chip';
import { TbShieldCheck, TbShieldX, TbRobot, TbUser, TbWorld, TbClock, TbWifi, TbBrowser } from 'react-icons/tb';
import * as motion from 'motion/react-client';

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

    const getBrowserInfo = (userAgent: string) => {
        if (userAgent.includes('Chrome')) return { name: 'Chrome', icon: '🌐' };
        if (userAgent.includes('Firefox')) return { name: 'Firefox', icon: '🦊' };
        if (userAgent.includes('Safari')) return { name: 'Safari', icon: '🧭' };
        if (userAgent.includes('Edge')) return { name: 'Edge', icon: '🔷' };
        return { name: 'Unknown', icon: '❓' };
    };

    if (isLoading) {
        return (
            <div className="w-full py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-dark/50 font-medium">Loading accesses...</p>
            </div>
        );
    }

    if (accesses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full py-16 text-center"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark/5 mb-4">
                    <TbWifi size={40} className="text-dark/30" />
                </div>
                <p className="text-xl font-bold text-dark/70">No accesses yet</p>
                <p className="text-dark/50 mt-2">When someone visits your link, it will appear here</p>
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

            {/* Desktop Table */}
            <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-dark/10">
                            <th className="px-4 py-3 text-left font-bold text-sm text-dark/60">
                                <div className="flex items-center gap-2">
                                    <TbClock size={16} />
                                    Time
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left font-bold text-sm text-dark/60">
                                <div className="flex items-center gap-2">
                                    <TbWorld size={16} />
                                    Location
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left font-bold text-sm text-dark/60">
                                <div className="flex items-center gap-2">
                                    <TbWifi size={16} />
                                    IP
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left font-bold text-sm text-dark/60">
                            <div className="flex items-center gap-2">
                                    <TbBrowser size={16} />
                                    Browser
                                </div>
                            </th>
                            <th className="px-4 py-3 text-center font-bold text-sm text-dark/60">
                                <div className="flex items-center justify-center gap-2">
                                    <TbShieldCheck size={16} />
                                    VPN
                                </div>
                            </th>
                            <th className="px-4 py-3 text-center font-bold text-sm text-dark/60">
                                <div className="flex items-center justify-center gap-2">
                                    <TbRobot size={16} />
                                    Bot
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {accesses.map((access, index) => {
                            const browser = getBrowserInfo(access.userAgent);
                            return (
                                <motion.tr
                                    key={access.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className="border-b border-dark/5 hover:bg-primary/5 transition-colors group"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{formatDate(access.createdAt)}</span>
                                            <span className="text-xs text-dark/50 group-hover:text-dark/70 transition-colors">
                                                {formatFullDate(access.createdAt)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{access.country === 'Unknown' ? '🌍' : '🚩'}</span>
                                            <span className="font-medium">{access.country}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <code className="px-2 py-1 bg-dark/5 rounded-lg text-sm font-mono">
                                            {access.ip}
                                        </code>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span>{browser.icon}</span>
                                            <span className="text-sm font-medium">{browser.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {access.isVPN ? (
                                            <Chip variant='danger' size='sm'>
                                                <p className='flex items-center gap-2'>
                                                    <TbShieldX size={14} />
                                                    Yes
                                                </p>
                                            </Chip>
                                        ) : (
                                            <Chip variant='success' size='sm'>
                                                <p className='flex items-center gap-2'>
                                                    <TbShieldCheck size={14} />
                                                    No
                                                </p>
                                            </Chip>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {access.isBot ? (
                                            <Chip variant='danger' size='sm'>
                                                <p className='flex items-center gap-2'>
                                                    <TbRobot size={14} />
                                                    Yes
                                                </p>
                                            </Chip>
                                        ) : (
                                            <Chip variant='success' size='sm'>
                                            <p className='flex items-center gap-2'>
                                                <TbUser size={14} />
                                                No
                                            </p>
                                            </Chip>
                                        )}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {accesses.map((access, index) => {
                    const browser = getBrowserInfo(access.userAgent);
                    return (
                        <motion.div
                            key={access.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="bg-light border-2 border-dark/10 rounded-2xl p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TbClock size={16} className="text-dark/50" />
                                    <span className="text-sm font-medium">{formatDate(access.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{access.country === 'Unknown' ? '🌍' : '🚩'}</span>
                                    <span className="font-bold text-sm">{access.country}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span>{browser.icon}</span>
                                <span className="text-sm font-medium flex-1">{browser.name}</span>
                                <code className="px-2 py-1 bg-dark/5 rounded-lg text-xs font-mono">
                                    {access.ip}
                                </code>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <p className="text-xs text-dark/50 mb-1">VPN</p>
                                    {access.isVPN ? (
                                        <Chip variant='danger' size='sm' className="w-full justify-center">
                                            <TbShieldX size={14} />
                                            Yes
                                        </Chip>
                                    ) : (
                                        <Chip variant='success' size='sm' className="w-full justify-center">
                                            <TbShieldCheck size={14} />
                                            No
                                        </Chip>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-dark/50 mb-1">Bot</p>
                                    {access.isBot ? (
                                        <Chip variant='danger' size='sm' className="w-full justify-center">
                                            <TbRobot size={14} />
                                            Yes
                                        </Chip>
                                    ) : (
                                        <Chip variant='success' size='sm' className="w-full justify-center">
                                            <TbUser size={14} />
                                            No
                                        </Chip>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-dark/10">
                                <p className="text-xs text-dark/50 truncate" title={access.userAgent}>
                                    {access.userAgent}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
