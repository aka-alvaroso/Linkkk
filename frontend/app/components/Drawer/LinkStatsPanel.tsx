import { useTranslations } from 'next-intl';
import * as motion from 'motion/react-client';
import { TbClick, TbQrcode, TbWorld, TbShieldX, TbTag } from 'react-icons/tb';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import type { LinkStats, StatsPeriod } from '@/app/services/api/statsService';

// Aggregate daily click data into weekly or monthly buckets when there are many data points
function aggregateClickData(data: { date: string; count: number }[]): { date: string; count: number; isWeekly?: boolean; isMonthly?: boolean }[] {
    if (data.length <= 60) return data;
    if (data.length <= 250) {
        // Group by ISO week (Monday-based)
        const weeks: Record<string, number> = {};
        data.forEach(({ date, count }) => {
            const d = new Date(date + 'T00:00:00');
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(d);
            monday.setDate(diff);
            const key = monday.toISOString().split('T')[0];
            weeks[key] = (weeks[key] || 0) + count;
        });
        return Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count, isWeekly: true }));
    }
    // Group by month
    const months: Record<string, number> = {};
    data.forEach(({ date, count }) => {
        const key = date.slice(0, 7);
        months[key] = (months[key] || 0) + count;
    });
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count, isMonthly: true }));
}

interface LinkStatsPanelProps {
    stats: LinkStats | null;
    loading: boolean;
    period: StatsPeriod;
    onPeriodChange: (period: StatsPeriod) => void;
    /** STANDARD plan can't see the "all time" period */
    isStandardPlan: boolean;
    /** Drop the top divider when the panel sits in a layout that already separates it */
    bare?: boolean;
}

export default function LinkStatsPanel({ stats, loading: statsLoading, period: statsPeriod, onPeriodChange: setStatsPeriod, isStandardPlan, bare = false }: LinkStatsPanelProps) {
    const t = useTranslations('EditLinkDrawer');

    return (
            <div className={bare ? 'flex flex-col gap-4' : 'flex flex-col gap-4 pt-4 border-t border-dark/10'}>

                {/* Header: label + period selector */}
                <div className='flex items-center justify-between'>
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className='text-sm font-bold text-dark/50'>{t('stats')}</motion.span>
                    <div className='flex items-center gap-1  rounded-xl p-1'>
                        {(['7d', '30d', 'all'] as StatsPeriod[]).map((p, i) => (
                            <motion.button
                                key={p}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 + i * 0.06, duration: 0.25, ease: 'easeOut' }}
                                onClick={() => setStatsPeriod(p)}
                                disabled={isStandardPlan && p === 'all'}
                                className={`px-3 py-1.5 rounded-3xl text-xs font-bold transition-all ${
                                    statsPeriod === p
                                        ? 'bg-dark text-light'
                                        : 'text-dark/50 hover:text-dark disabled:opacity-30 disabled:cursor-not-allowed'
                                }`}
                            >
                                {p === 'all' ? t('periodAll') : p}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {statsLoading ? (
                    <div className='flex justify-center py-8'>
                        <div className='h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent' />
                    </div>
                ) : stats ? (
                    <>
                        {/* KPI row */}
                        <motion.div
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}
                            className='grid grid-cols-2 gap-3'
                        >
                            <div className='flex flex-col'>
                                <span className='text-base text-dark font-black italic flex items-center gap-1.5'><TbClick size={22} />{t('statClicks')}</span>
                                <span className='text-4xl font-black italic text-dark tabular-nums'>{stats.totalClicks}</span>
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-base text-dark font-black italic flex items-center gap-1.5'><TbQrcode size={22} />{t('statScans')}</span>
                                <span className='text-4xl font-black italic text-dark tabular-nums'>{stats.totalScans}</span>
                            </div>
                        </motion.div>

                        {/* Line chart — clicks over time */}
                        {(() => {
                            const aggregated = aggregateClickData(stats.clicksByDay);
                            const isWeekly = aggregated[0]?.isWeekly;
                            const isMonthly = aggregated[0]?.isMonthly;
                            const lowData = stats.totalClicks <= 2;
                            const lastIndex = aggregated.length - 1;
                            const renderClicksDot = (dotProps: unknown) => {
                                const { cx, cy, index } = dotProps as { cx?: number; cy?: number; index?: number };
                                if (index !== lastIndex || cx == null || cy == null) {
                                    return <g key={`clicks-dot-${index}`} />;
                                }
                                return <circle key={`clicks-dot-${index}`} cx={cx} cy={cy} r={3.5} fill='#72d763' stroke='#fff' strokeWidth={2} />;
                            };
                            const formatTick = (d: string) => {
                                if (isMonthly) {
                                    const [y, m] = d.split('-');
                                    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                                }
                                const dt = new Date(d + 'T00:00:00');
                                return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            };
                            const formatTooltipLabel = (d: unknown) => {
                                if (typeof d !== 'string') return String(d ?? '');
                                if (isMonthly) {
                                    const [y, m] = d.split('-');
                                    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                }
                                const dt = new Date(d + 'T00:00:00');
                                return isWeekly
                                    ? `Week of ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                    : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            };
                            return (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3, ease: 'easeOut' }} className='bg-white border border-dark/10 rounded-xl p-4'>
                                    <div className='flex items-end justify-between mb-1'>
                                        <div>
                                            <p className='text-xs font-bold text-dark/40 flex items-center gap-1.5'><TbClick size={16} />{t('clicksOverTime')}</p>
                                            {/* <div className='flex items-baseline gap-1.5 mt-0.5'>
                                                <span className='text-2xl font-black text-dark tabular-nums'>{stats.totalClicks}</span>
                                                <span className='text-xs text-dark/40 font-medium'>{t('statClicks').toLowerCase()}</span>
                                            </div> */}
                                        </div>
                                        {(isWeekly || isMonthly) && (
                                            <span className='text-[10px] text-dark/30 font-medium mb-0.5'>{isMonthly ? 'monthly' : 'weekly'}</span>
                                        )}
                                    </div>
                                    {lowData ? (
                                        <div className='flex items-center justify-center text-center' style={{ height: 110 }}>
                                            <p className='text-xs text-dark/60 max-w-[220px]'>{t('lowDataHint', { count: stats.totalClicks })}</p>
                                        </div>
                                    ) : (
                                    <ResponsiveContainer width='100%' height={110}>
                                        <AreaChart data={aggregated} margin={{ top: 8, right: 0, left: -36, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id='lg' x1='0' y1='0' x2='0' y2='1'>
                                                    <stop offset='0%' stopColor='#72d763' stopOpacity={0.3} />
                                                    <stop offset='100%' stopColor='#72d763' stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} stroke='rgba(27,27,27,0.08)' />
                                            <XAxis dataKey='date' tickFormatter={formatTick} tick={{ fontSize: 9, fill: 'rgba(0,0,0,0.3)' }} interval='preserveStartEnd' axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 9, fill: 'rgba(0,0,0,0.3)' }} allowDecimals={false} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: 8, border: '1px solid rgba(27,27,27,0.12)', boxShadow: '2px 2px 0 rgba(27,27,27,0.08)', fontSize: 11, padding: '5px 9px' }}
                                                labelFormatter={formatTooltipLabel}
                                                formatter={(v) => [v ?? 0, t('statClicks')]}
                                                cursor={{ stroke: 'rgba(27,27,27,0.15)', strokeWidth: 1 }}
                                            />
                                            <Area type='monotone' dataKey='count' stroke='#72d763' strokeWidth={1.5} fill='url(#lg)' dot={renderClicksDot} activeDot={{ r: 3, fill: '#72d763', stroke: '#fff', strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    )}
                                </motion.div>
                            );
                        })()}

                        {/* Detail cards */}
                        <div className='flex flex-col gap-3'>

                            {/* Row: Countries (50%) + Traffic donut (50%) */}
                            <div className='grid grid-cols-2 gap-3 items-stretch'>

                                {/* Countries — horizontal bars */}
                                {stats.topCountries.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }} className='bg-white border border-dark/10 rounded-xl px-3 py-3 flex flex-col gap-2.5'>
                                        <p className='text-xs font-bold text-dark/40 flex items-center gap-1.5'><TbWorld size={16} />{t('topCountries')}</p>
                                        <div className='flex flex-col gap-2'>
                                            {stats.topCountries.slice(0, 5).map(({ country, count }, idx) => {
                                                const pct = Math.round(count / stats.topCountries[0].count * 100);
                                                return (
                                                    <div key={country} className='flex items-center gap-1.5'>
                                                        <img src={`https://flagcdn.com/w40/${country.toLowerCase()}.webp`} alt={country} className='w-5 h-4 object-cover rounded-sm flex-shrink-0' onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        <span className='text-xs font-bold w-6 flex-shrink-0 text-dark/70'>{country}</span>
                                                        <div className='flex-1 bg-dark/8 rounded-full h-1.5 overflow-hidden'>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ delay: 0.15 + idx * 0.04, duration: 0.5, ease: 'easeOut' }}
                                                                className={`h-full rounded-full ${idx === 0 ? 'bg-primary' : 'bg-dark/70'}`}
                                                            />
                                                        </div>
                                                        <span className='text-xs font-bold text-dark/50 w-5 text-right flex-shrink-0 tabular-nums'>{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Traffic donut — Human / Bot / VPN */}
                                {(() => {
                                    const humanCount = Math.max(0, stats.totalClicks - stats.vpnCount - stats.botCount);
                                    const total = stats.totalClicks || 1;
                                    const segments = [
                                        { key: 'human', label: t('human'), color: '#72d763', count: humanCount },
                                        { key: 'bot',   label: t('bot'),   color: '#FDC344', count: stats.botCount },
                                        { key: 'vpn',   label: t('vpn'),   color: '#FC4736', count: stats.vpnCount },
                                    ];
                                    const donutData = segments.some(s => s.count > 0)
                                        ? segments.map(s => ({ name: s.label, value: s.count }))
                                        : [{ name: 'empty', value: 1 }];
                                    return (
                                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }} className='bg-white border border-dark/10 rounded-xl px-3 py-3 flex flex-col gap-2'>
                                            <p className='text-xs font-bold text-dark/40 flex items-center gap-1.5'><TbShieldX size={16} />{t('flags')}</p>
                                            <div className='flex flex-col md:flex-row items-center gap-3'>
                                                <div className='flex-shrink-0' style={{ width: 64, height: 64 }}>
                                                    <ResponsiveContainer width='100%' height='100%'>
                                                        <PieChart>
                                                            <Pie data={donutData} cx='50%' cy='50%' innerRadius={17} outerRadius={30} paddingAngle={donutData[0]?.name === 'empty' ? 0 : 2} dataKey='value' stroke='none' startAngle={90} endAngle={-270}>
                                                                {donutData[0]?.name === 'empty'
                                                                    ? <Cell fill='rgba(27,27,27,0.08)' />
                                                                    : segments.map(s => <Cell key={s.key} fill={s.color} />)
                                                                }
                                                            </Pie>
                                                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid rgba(27,27,27,0.12)', boxShadow: '2px 2px 0 rgba(27,27,27,0.08)', fontSize: 11, padding: '4px 8px' }} formatter={(v, name) => [`${Math.round(Number(v) / total * 100)}%`, name]} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className='w-full flex-1 flex flex-col gap-1.5'>
                                                    {segments.map(({ key, label, color, count }) => (
                                                        <div key={key} className='flex items-center justify-between'>
                                                            <span className='flex items-center gap-1.5 text-xs text-dark/50'>
                                                                <span className='w-1.5 h-1.5 rounded-full flex-shrink-0' style={{ backgroundColor: color }} />
                                                                {label}
                                                            </span>
                                                            <div className='flex items-center gap-1'>
                                                                <span className='text-xs font-bold text-dark/60 tabular-nums'>{count}</span>
                                                                <span className='text-[10px] text-dark/30'>({Math.round(count / total * 100)}%)</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })()}
                            </div>

                            {/* Browsers — horizontal stacked bar, full width */}
                            {stats.browserBreakdown.length > 0 && (() => {
                                    const browserColors = ['#72d763', 'rgba(27,27,27,0.7)', 'rgba(27,27,27,0.55)', 'rgba(27,27,27,0.4)', 'rgba(27,27,27,0.25)'];
                                    const total = stats.totalClicks || stats.browserBreakdown.reduce((s, b) => s + b.count, 0);
                                    const barData = [stats.browserBreakdown.reduce((obj, { browser, count }) => ({ ...obj, [browser]: count }), {} as Record<string, number>)];
                                    return (
                                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }} className='bg-white border border-dark/10 rounded-xl px-3 py-3 flex flex-col gap-2'>
                                            <p className='text-xs font-bold text-dark/40 flex items-center gap-1.5'><TbWorld size={16} />{t('browsers')}</p>
                                            <ResponsiveContainer width='100%' height={36}>
                                                <BarChart data={barData} layout='vertical' margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={24}>
                                                    <XAxis type='number' hide domain={[0, total]} />
                                                    <YAxis type='category' hide />
                                                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid rgba(27,27,27,0.12)', boxShadow: '2px 2px 0 rgba(27,27,27,0.08)', fontSize: 11, padding: '4px 8px' }} formatter={(v, name) => [`${Math.round(Number(v) / total * 100)}%`, name]} labelFormatter={() => ''} />
                                                    {stats.browserBreakdown.map(({ browser }, idx) => (
                                                        <Bar key={browser} dataKey={browser} name={browser} stackId='a' fill={browserColors[idx % browserColors.length]}
                                                            radius={idx === 0 ? [3, 0, 0, 3] : idx === stats.browserBreakdown.length - 1 ? [0, 3, 3, 0] : [0, 0, 0, 0]}
                                                        />
                                                    ))}
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div className='flex flex-col gap-1'>
                                                {stats.browserBreakdown.map(({ browser, count }, idx) => {
                                                    const pct = total > 0 ? Math.round(count / total * 100) : 0;
                                                    const slugMap: Record<string, string> = { Chrome: 'googlechrome', Edge: 'microsoftedge' };
                                                    const slug = slugMap[browser] || browser.toLowerCase();
                                                    const logoUrl = browser !== 'Unknown' ? `https://cdn.simpleicons.org/${slug}` : null;
                                                    return (
                                                        <div key={browser} className='flex items-center justify-between'>
                                                            <span className='flex items-center gap-1.5 text-xs text-dark/50 truncate'>
                                                                {logoUrl ? (
                                                                    <img src={logoUrl} alt={browser} width={12} height={12} className='flex-shrink-0 object-contain' style={{ filter: 'grayscale(0.2)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                                ) : (
                                                                    <span className='w-2 h-2 rounded-full flex-shrink-0' style={{ backgroundColor: browserColors[idx % browserColors.length] }} />
                                                                )}
                                                                {browser}
                                                            </span>
                                                            <span className='text-xs font-bold text-dark/60 tabular-nums flex-shrink-0 ml-1'>{pct}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                            {/* Campaigns — utm_campaign / utm_source / utm_medium */}
                            {(() => {
                                const utm = stats.utmBreakdown;
                                const groups = [
                                    { key: 'campaigns', label: t('utmCampaigns'), items: utm?.campaigns ?? [] },
                                    { key: 'sources', label: t('utmSources'), items: utm?.sources ?? [] },
                                    { key: 'mediums', label: t('utmMediums'), items: utm?.mediums ?? [] },
                                ].filter(g => g.items.length > 0);
                                return (
                                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3, ease: 'easeOut' }} className='bg-white border border-dark/10 rounded-xl px-3 py-3 flex flex-col gap-2.5'>
                                        <p className='text-xs font-bold text-dark/40 flex items-center gap-1.5'><TbTag size={16} />{t('utmTitle')}</p>
                                        {groups.length === 0 ? (
                                            <p className='text-xs text-dark/50'>{t('utmEmptyHint')}</p>
                                        ) : (
                                            <>
                                                <p className='text-[10px] text-dark/40'>{t('utmShare', { count: utm.withUtm, total: stats.totalClicks })}</p>
                                                {groups.map(({ key, label, items }) => (
                                                    <div key={key} className='flex flex-col gap-1.5'>
                                                        <p className='text-[10px] font-bold uppercase tracking-wide text-dark/40'>{label}</p>
                                                        {items.slice(0, 5).map(({ value, count }, idx) => {
                                                            const pct = Math.round(count / items[0].count * 100);
                                                            return (
                                                                <div key={value} className='flex items-center gap-1.5'>
                                                                    <span className='text-xs font-bold text-dark/70 w-24 truncate flex-shrink-0' title={value}>{value}</span>
                                                                    <div className='flex-1 bg-dark/8 rounded-full h-1.5 overflow-hidden'>
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${pct}%` }}
                                                                            transition={{ delay: 0.3 + idx * 0.04, duration: 0.5, ease: 'easeOut' }}
                                                                            className={`h-full rounded-full ${idx === 0 ? 'bg-primary' : 'bg-dark/70'}`}
                                                                        />
                                                                    </div>
                                                                    <span className='text-xs font-bold text-dark/50 w-6 text-right flex-shrink-0 tabular-nums'>{count}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </motion.div>
                                );
                            })()}

                        </div>
                    </>
                ) : null}
            </div>
    );
}
