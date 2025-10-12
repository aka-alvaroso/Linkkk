import React, { useEffect, useState } from 'react';
import Chip from '../ui/Chip/Chip';
import { TbCircleDashed, TbCircleDashedCheck } from 'react-icons/tb';

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

    const getLinkAccesses = async (shortUrl: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accesses/link/${shortUrl}`, {
            credentials: "include",
        });
        const data = await response.json();
        return data.data
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
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse border border-dark/10">
                <thead>
                    <tr className="bg-dark/5">
                        <th className="border-y border-dark/10 px-4 py-2 text-left">Fecha</th>
                        <th className="border-y border-dark/10 px-4 py-2 text-left">IP</th>
                        <th className="border-y border-dark/10 px-4 py-2 text-left">País</th>
                        <th className="border-y border-dark/10 px-4 py-2 text-left">User Agent</th>
                        <th className="border-y border-dark/10 px-4 py-2 text-center">VPN</th>
                        <th className="border-y border-dark/10 px-4 py-2 text-center">Bot</th>
                    </tr>
                </thead>
                <tbody>
                    {accesses.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="border border-dark/10 px-4 py-8 text-center text-dark/50">
                                No hay accesos registrados
                            </td>
                        </tr>
                    ) : (
                        accesses.map((access) => (
                            <tr key={access.id} className="hover:bg-dark/5 transition-al duration-200">
                                <td className="border-y border-dark/10 px-4 py-2">{formatDate(access.createdAt)}</td>
                                <td className="border-y border-dark/10 px-4 py-2 font-mono text-sm">{access.ip}</td>
                                <td className="border-y border-dark/10 px-4 py-2">{access.country}</td>
                                <td className="border-y border-dark/10 px-4 py-2 text-sm max-w-md truncate" title={access.userAgent}>
                                    {access.userAgent}
                                </td>
                                <td className="border-y border-dark/10 px-4 py-2 text-center">
                                    {
                                        access.isVPN ? (
                                            <Chip
                                                variant='danger'
                                                size='md'
                                            >
                                                Sí
                                            </Chip>
                                        ) : (
                                            <Chip
                                                variant='success'
                                                size='md'
                                            >
                                                No
                                            </Chip>
                                        )
                                    }
                                </td>
                                <td className="border-y border-dark/10 px-4 py-2 text-center">
                                    {
                                        access.isBot ? (
                                            <Chip
                                                variant='danger'
                                                size='md'
                                            >
                                                Sí
                                            </Chip>
                                        ) : (
                                            <Chip
                                                variant='success'
                                                size='md'
                                            >
                                                No
                                            </Chip>
                                        )
                                    }
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};