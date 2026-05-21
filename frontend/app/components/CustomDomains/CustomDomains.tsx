"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
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
  TbAlertTriangle,
  TbNetwork,
  TbArrowRight,
  TbArrowLeft,
} from "react-icons/tb";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import Button from "@/app/components/ui/Button/Button";
import Modal from "@/app/components/ui/Modal/Modal";
import { domainService, type CustomDomain } from "@/app/services/api/domainService";
import { HttpError } from "@/app/utils/errors";
import { useToast } from "@/app/hooks/useToast";
import { useAuth } from "@/app/hooks";

const CNAME_TARGET = "linkkk.dev";

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "backOut" as const },
  }),
};

export default function CustomDomains() {
  const t = useTranslations("CustomDomains");
  const toast = useToast();
  const { user } = useAuth();
  const isPro = user?.role === "PRO";

  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Add-domain modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);

  // PRO gate modal

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

  const hasPendingDomains = domains.some((d) => d.status !== "ACTIVE");

  const openModal = () => {
    setNewDomain("");
    setModalStep(1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewDomain("");
    setModalStep(1);
  };

  const handleAdd = async () => {
    if (!newDomain.trim()) return;
    setAdding(true);
    try {
      const created = await domainService.add(newDomain.trim());
      setDomains((prev) => [created, ...prev]);
      closeModal();
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract subdomain label for DNS Name field (e.g. "go.yourdomain.com" → "go")
  const dnsNameLabel = newDomain
    ? newDomain.split(".").slice(0, -2).join(".") || newDomain
    : "go";

  // Shared empty state UI (used for both PRO and non-PRO)
  const EmptyState = ({ onAction }: { onAction: () => void }) => (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, duration: 0.5, ease: "backOut" }}
      >
        <Image
          src="/domains_empty_state.svg"
          alt="No custom domains"
          width={220}
          height={160}
          priority
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: "backOut" }}
        className="text-center space-y-1"
      >
        <p className="font-black italic text-xl">{t("empty")}</p>
        <p className="text-sm text-dark/50">{t("emptyDescription")}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4, ease: "backOut" }}
      >
        <Button
          variant="solid"
          size="md"
          rounded="2xl"
          leftIcon={<TbPlus size={20} />}
          onClick={onAction}
          className="bg-info text-dark border border-dark hover:shadow-[4px_4px_0_var(--color-dark)]"
        >
          {t("emptyAction")}
        </Button>
      </motion.div>
    </div>
  );

  // Non-PRO gate: redirect to pricing page
  if (!isPro) {
    return <EmptyState onAction={() => { window.location.href = "/pricing"; }} />;
  }

  return (
    <div className="space-y-4">

      {/* Pending DNS banner */}
      <AnimatePresence>
        {!loading && hasPendingDomains && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "backOut" }}
            className="flex items-start gap-3 p-4 bg-warning/10 border border-warning rounded-2xl"
          >
            <TbAlertTriangle size={20} className="text-warning flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-bold text-sm">{t("pendingBannerTitle")}</p>
              <p className="text-sm text-dark/60 mt-0.5">{t("pendingBannerDesc")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-dark/40">
          <TbLoader2 className="animate-spin mr-2" size={20} />
          <span>{t("loading")}</span>
        </div>
      ) : domains.length === 0 ? (
        /* ── Empty state ── */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "backOut" }}
        >
          <EmptyState onAction={openModal} />
        </motion.div>
      ) : (
        /* ── Domain list ── */
        <div className="space-y-3">

          {/* "My domains" label */}
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0, duration: 0.4, ease: "backOut" }}
            className="text-sm font-black italic text-dark/50 px-1"
          >
            {t("myDomains")}
          </motion.p>

          {domains.map((domain, i) => {
            const cfg = STATUS_CONFIG[domain.status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={domain.id}
                custom={i + 1}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
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
                    <>
                      <button
                        onClick={() => {
                          setNewDomain(domain.domain);
                          setModalStep(2);
                          setModalOpen(true);
                        }}
                        title={t("btnDnsInfo")}
                        className="p-2 rounded-xl bg-dark/5 hover:bg-info hover:text-dark transition-colors"
                      >
                        <TbNetwork size={16} />
                      </button>
                      <button
                        onClick={() => handleVerify(domain.id)}
                        disabled={verifying === domain.id}
                        title={t("btnVerify")}
                        className="p-2 rounded-xl bg-dark/5 hover:bg-secondary hover:text-light transition-colors disabled:opacity-50"
                      >
                        <TbRefresh size={16} className={verifying === domain.id ? "animate-spin" : ""} />
                      </button>
                    </>
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
              </motion.div>
            );
          })}

          {/* Add button at bottom — dark, compact, hover primary */}
          <motion.div
            custom={domains.length + 1}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-center pt-1"
          >
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-dark text-light font-bold text-sm hover:bg-primary hover:text-dark hover:shadow-[4px_4px_0_var(--color-dark)] border border-dark transition-all duration-200"
            >
              <TbPlus size={18} />
              {t("emptyAction")}
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Add domain modal (2 steps) ── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        size="md"
        position="center"
        rounded="3xl"
        closeOnOverlayClick
        showCloseButton={false}
      >
        <div className="p-6 space-y-5">

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${modalStep >= 1 ? 'bg-info' : 'bg-dark/10'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${modalStep >= 2 ? 'bg-info' : 'bg-dark/10'}`} />
          </div>

          <AnimatePresence mode="wait">
            {modalStep === 1 ? (
              /* ── Step 1: Enter domain ── */
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-info/10 rounded-2xl">
                    <TbWorld size={26} className="text-info" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic">{t("modalStep1Title")}</h2>
                    <p className="text-sm text-dark/50">{t("modalStep1Desc")}</p>
                  </div>
                </div>

                <p className="text-sm text-dark/60">{t("subdomainNote")}</p>

                <input
                  type="text"
                  autoFocus
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && newDomain.trim() && setModalStep(2)}
                  placeholder={t("placeholder")}
                  className="w-full p-3 bg-dark/5 rounded-xl border-2 border-dashed border-transparent focus:border-info outline-none transition-colors font-mono text-sm"
                />

                <div className="flex justify-between items-center pt-1">
                  <Button variant="ghost" size="sm" rounded="xl" onClick={closeModal} className="text-dark/50">
                    {t("dnsModalClose")}
                  </Button>
                  <Button
                    variant="solid"
                    size="sm"
                    rounded="xl"
                    rightIcon={<TbArrowRight size={16} />}
                    disabled={!newDomain.trim()}
                    onClick={() => setModalStep(2)}
                    className="bg-info text-dark border border-dark disabled:opacity-40 hover:shadow-[3px_3px_0_var(--color-dark)]"
                  >
                    {t("modalNext")}
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* ── Step 2: DNS instructions ── */
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-info/10 rounded-2xl">
                    <TbNetwork size={26} className="text-info" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic">{t("dnsModalTitle")}</h2>
                    <p className="text-sm text-dark/50 font-mono">{newDomain}</p>
                  </div>
                </div>

                <p className="text-sm text-dark/60">
                  {t("dnsModalDesc", { domain: newDomain })}
                </p>

                {/* DNS record table */}
                <div className="p-4 bg-dark/5 rounded-2xl border border-dashed border-dark/20 font-mono text-sm grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-dark/40 text-xs mb-1">{t("dnsType")}</p>
                    <p className="font-bold">CNAME</p>
                  </div>
                  <div>
                    <p className="text-dark/40 text-xs mb-1">{t("dnsName")}</p>
                    <p className="font-bold truncate">{dnsNameLabel}</p>
                  </div>
                  <div>
                    <p className="text-dark/40 text-xs mb-1">{t("dnsValue")}</p>
                    <div className="flex items-center gap-1">
                      <p className="font-bold">{CNAME_TARGET}</p>
                      <button
                        onClick={() => handleCopy(CNAME_TARGET)}
                        className="text-dark/40 hover:text-dark transition-colors"
                      >
                        {copied ? <TbCheck size={14} className="text-primary" /> : <TbCopy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-dark/50">{t("dnsModalNote")}</p>

                <div className="flex justify-between items-center pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    rounded="xl"
                    leftIcon={<TbArrowLeft size={16} />}
                    onClick={() => setModalStep(1)}
                    className="text-dark/50"
                  >
                    {t("modalBack")}
                  </Button>
                  <Button
                    variant="solid"
                    size="sm"
                    rounded="xl"
                    leftIcon={adding ? <TbLoader2 size={16} className="animate-spin" /> : <TbPlus size={16} />}
                    disabled={adding}
                    onClick={handleAdd}
                    className="bg-info text-dark border border-dark hover:shadow-[3px_3px_0_var(--color-dark)] disabled:opacity-60"
                  >
                    {t("modalAdd")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </div>
  );
}
