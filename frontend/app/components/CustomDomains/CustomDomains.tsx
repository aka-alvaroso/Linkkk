"use client";
import { useState, useEffect } from "react";
import {
  TbWorld,
  TbPlus,
  TbTrash,
  TbRefresh,
  TbCheck,
  TbX,
  TbCopy,
  TbLoader2,
  TbSparkles,
} from "react-icons/tb";
import { useTranslations } from "next-intl";
import Button from "@/app/components/ui/Button/Button";
import { domainService, type CustomDomain } from "@/app/services/api/domainService";
import { HttpError } from "@/app/utils/errors";
import { useToast } from "@/app/hooks/useToast";
import { useAuth } from "@/app/hooks";

const CNAME_TARGET = "linkkk.dev";

export default function CustomDomains() {
  const t = useTranslations("CustomDomains");
  const toast = useToast();
  const { user } = useAuth();
  const isPro = user?.role === "PRO";

  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const STATUS_CONFIG = {
    PENDING: { label: t("statusPending"), color: "bg-dark/10 text-dark", icon: TbLoader2, spin: false },
    VERIFYING: { label: t("statusVerifying"), color: "bg-secondary/20 text-secondary", icon: TbLoader2, spin: true },
    ACTIVE: { label: t("statusActive"), color: "bg-primary/30 text-dark", icon: TbCheck, spin: false },
    ERROR: { label: t("statusError"), color: "bg-danger/20 text-danger", icon: TbX, spin: false },
  };

  useEffect(() => {
    if (!isPro) { setLoading(false); return; }
    domainService.getAll().then(setDomains).finally(() => setLoading(false));
  }, [isPro]);

  const handleAdd = async () => {
    if (!newDomain.trim()) return;
    setAdding(true);
    try {
      const created = await domainService.add(newDomain.trim());
      setDomains((prev) => [created, ...prev]);
      setNewDomain("");
    } catch (error) {
      toast.error(error instanceof HttpError ? error.message : t("toastAddFailed"));
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async (id: number) => {
    setVerifying(id);
    try {
      const updated = await domainService.verify(id);
      setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
      if (updated.status === "ACTIVE") {
        toast.success(t("toastVerifySuccess"));
      } else {
        toast.error(t("toastVerifyFailed"));
      }
    } catch (error) {
      toast.error(error instanceof HttpError ? error.message : t("toastVerifyFailed"));
    } finally {
      setVerifying(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await domainService.remove(id);
      setDomains((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      toast.error(error instanceof HttpError ? error.message : t("toastRemoveFailed"));
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(CNAME_TARGET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // PRO gate
  if (!isPro) {
    return (
      <div className="p-6 bg-dark/5 rounded-2xl border-2 border-dashed border-dark/20 flex flex-col items-center text-center gap-3">
        <TbSparkles size={32} className="text-primary" />
        <h3 className="text-xl font-bold">{t("title")}</h3>
        <p className="text-dark/60 text-sm">{t("proOnly")}</p>
        <p className="text-dark/40 text-sm">{t("upgradePrompt")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add domain */}
      <div className="p-4 bg-dark/5 rounded-2xl border-2 border-dashed border-transparent focus-within:border-dark transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <TbWorld size={20} />
          <h3 className="text-xl font-bold">{t("title")}</h3>
        </div>
        <p className="text-sm text-dark/60 mb-1">
          {t.rich("description", {
            target: () => (
              <button
                key="cname-target"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 font-mono font-bold text-primary hover:underline"
              >
                {CNAME_TARGET}
                {copied ? <TbCheck size={14} /> : <TbCopy size={14} />}
              </button>
            ),
          })}
        </p>
        <p className="text-xs text-dark/40 mb-4">{t("subdomainNote")}</p>

        {/* DNS instructions box */}
        <div className="mb-4 p-3 bg-dark/5 rounded-xl border border-dashed border-dark/20 font-mono text-sm grid grid-cols-3 gap-2">
          <div>
            <p className="text-dark/40 text-xs mb-1">{t("dnsType")}</p>
            <p className="font-bold">CNAME</p>
          </div>
          <div>
            <p className="text-dark/40 text-xs mb-1">{t("dnsName")}</p>
            <p className="font-bold">go</p>
          </div>
          <div>
            <p className="text-dark/40 text-xs mb-1">{t("dnsValue")}</p>
            <p className="font-bold">{CNAME_TARGET}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={t("placeholder")}
            className="flex-1 p-3 bg-dark/5 rounded-xl border-2 border-dashed border-transparent focus:border-dark outline-none transition-colors font-mono text-sm"
          />
          <Button
            variant="solid"
            size="sm"
            rounded="xl"
            onClick={handleAdd}
            disabled={adding || !newDomain.trim()}
            className="bg-dark hover:bg-primary hover:text-dark border border-dark"
          >
            {adding ? <TbLoader2 className="animate-spin" size={18} /> : <TbPlus size={18} />}
          </Button>
        </div>
      </div>

      {/* Domain list */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-dark/40">
          <TbLoader2 className="animate-spin mr-2" size={20} />
          <span>{t("loading")}</span>
        </div>
      ) : domains.length === 0 ? (
        <p className="text-center text-dark/40 py-6 text-sm">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => {
            const cfg = STATUS_CONFIG[domain.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={domain.id}
                className="flex items-center justify-between gap-3 p-4 bg-dark/5 rounded-2xl"
              >
                <div className="min-w-0">
                  <p className="font-mono font-bold truncate">{domain.domain}</p>
                  {domain.errorMsg && (
                    <p className="text-xs text-danger mt-0.5 truncate">{domain.errorMsg}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${cfg.color}`}>
                    <StatusIcon size={12} className={cfg.spin ? "animate-spin" : ""} />
                    {cfg.label}
                  </span>

                  {domain.status !== "ACTIVE" && (
                    <button
                      onClick={() => handleVerify(domain.id)}
                      disabled={verifying === domain.id}
                      title={t("btnVerify")}
                      className="p-2 rounded-xl bg-dark/5 hover:bg-secondary hover:text-light transition-colors disabled:opacity-50"
                    >
                      <TbRefresh size={16} className={verifying === domain.id ? "animate-spin" : ""} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(domain.id)}
                    disabled={deleting === domain.id}
                    title={t("btnRemove")}
                    className="p-2 rounded-xl bg-dark/5 hover:bg-danger hover:text-light transition-colors disabled:opacity-50"
                  >
                    <TbTrash size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
