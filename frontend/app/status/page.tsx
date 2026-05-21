"use client";
import { useEffect, useState } from 'react';
import RouteGuard from '@/app/components/RouteGuard/RouteGuard';
import Link from 'next/link';
import { TbCircleCheck, TbCircleX, TbRefresh, TbDatabase, TbServer, TbClock } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import { API_CONFIG } from '@/app/config/api';

interface ServiceStatus {
  status: 'ok' | 'error';
  latency?: number | null;
}

interface StatusData {
  status: 'ok' | 'degraded' | 'error';
  uptime: number;
  timestamp: string;
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
  };
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatusBadge({ status }: { status: 'ok' | 'degraded' | 'error' | 'loading' }) {
  const map = {
    ok: { label: 'All systems operational', color: 'bg-success/10 border-success/20 text-success' },
    degraded: { label: 'Partial outage', color: 'bg-warning/10 border-warning/20 text-warning' },
    error: { label: 'Major outage', color: 'bg-danger/10 border-danger/20 text-danger' },
    loading: { label: 'Checking status...', color: 'bg-dark/5 border-dark/10 text-dark/50' },
  };
  const { label, color } = map[status];
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold ${color}`}>
      <span className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-success animate-pulse' : status === 'loading' ? 'bg-dark/30' : status === 'degraded' ? 'bg-warning' : 'bg-danger'}`} />
      {label}
    </span>
  );
}

function ServiceRow({ name, icon, service, delay }: {
  name: string;
  icon: React.ReactNode;
  service: ServiceStatus | null;
  delay: number;
}) {
  const isOk = service?.status === 'ok';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center justify-between py-4 border-b border-dark/8 last:border-0"
    >
      <div className="flex items-center gap-3">
        <span className="text-dark/50">{icon}</span>
        <span className="font-semibold text-dark">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        {service?.latency != null && (
          <span className="text-xs text-dark/40 font-mono">{service.latency}ms</span>
        )}
        {service === null ? (
          <span className="w-5 h-5 rounded-full bg-dark/10 animate-pulse" />
        ) : isOk ? (
          <TbCircleCheck size={22} className="text-success" />
        ) : (
          <TbCircleX size={22} className="text-danger" />
        )}
      </div>
    </motion.div>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/status`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setApiOk(true);
      } else {
        setApiOk(false);
        setData(null);
      }
    } catch {
      setApiOk(false);
      setData(null);
    } finally {
      setFetchedAt(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const overallStatus = loading ? 'loading' : !apiOk ? 'error' : (data?.status ?? 'error');

  return (
    <RouteGuard type="public" title="System Status - Linkkk">
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-light to-secondary/10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className="max-w-lg w-full bg-light rounded-3xl p-8"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-8"
          >
            <Link href="/" className="text-2xl font-black italic text-dark">
              Linkkk
            </Link>
            <p className="text-dark/50 text-sm mt-1">System Status</p>
          </motion.div>

          {/* Overall badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mb-8"
          >
            <StatusBadge status={overallStatus as 'ok' | 'degraded' | 'error' | 'loading'} />
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="bg-dark/3 rounded-2xl px-5 mb-6"
          >
            <ServiceRow
              name="API"
              icon={<TbServer size={18} />}
              service={loading ? null : apiOk ? { status: 'ok' } : { status: 'error' }}
              delay={0.35}
            />
            <ServiceRow
              name="Database"
              icon={<TbDatabase size={18} />}
              service={loading ? null : (data?.services.database ?? { status: 'error' })}
              delay={0.4}
            />
          </motion.div>

          {/* Meta info */}
          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex items-center gap-5 text-sm text-dark/40 mb-6"
            >
              <span className="flex items-center gap-1.5">
                <TbClock size={15} />
                Uptime {formatUptime(data.uptime)}
              </span>
              {fetchedAt && (
                <span>
                  Updated {fetchedAt.toLocaleTimeString()}
                </span>
              )}
            </motion.div>
          )}

          {/* Refresh */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.3 }}
          >
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-2 text-sm text-dark/50 hover:text-dark transition-colors disabled:opacity-40"
            >
              <TbRefresh size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </motion.div>
        </motion.div>
      </div>
    </RouteGuard>
  );
}
