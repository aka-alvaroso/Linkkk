"use client";
import { TbArrowLeft } from "react-icons/tb";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function SecurityDoc() {
  const t = useTranslations("Docs.security");
  const ts = useTranslations("Docs.shared");

  const dataItems = [
    { titleKey: "dataPasswordTitle", descKey: "dataPasswordDesc" },
    { titleKey: "dataIpTitle", descKey: "dataIpDesc" },
    { titleKey: "dataPaymentTitle", descKey: "dataPaymentDesc" },
    { titleKey: "dataNoSellTitle", descKey: "dataNoSellDesc" },
  ] as const;

  const authItems = [
    { titleKey: "authJwtTitle", descKey: "authJwtDesc" },
    { titleKey: "authOauthTitle", descKey: "authOauthDesc" },
    { titleKey: "authCsrfTitle", descKey: "authCsrfDesc" },
  ] as const;

  const infraItems = [
    { titleKey: "infraHeadersTitle", descKey: "infraHeadersDesc" },
    { titleKey: "infraRateLimitTitle", descKey: "infraRateLimitDesc" },
    { titleKey: "infraCorsTitle", descKey: "infraCorsDesc" },
  ] as const;

  const gdprItems = [
    { labelKey: "gdprAccess", descKey: "gdprAccessDesc" },
    { labelKey: "gdprRectification", descKey: "gdprRectificationDesc" },
    { labelKey: "gdprDeletion", descKey: "gdprDeletionDesc" },
    { labelKey: "gdprPortability", descKey: "gdprPortabilityDesc" },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">
          {t("title")}
        </h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Data protection */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("dataTitle")}</h2>
        <div className="space-y-3">
          {dataItems.map((item) => (
            <div key={item.titleKey} className="p-4 rounded-3xl border border-dark/10">
              <p className="font-bold text-sm text-dark mb-1">{t(item.titleKey)}</p>
              <p className="text-xs text-dark/60">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("authTitle")}</h2>
        <div className="space-y-3">
          {authItems.map((item) => (
            <div key={item.titleKey} className="p-4 rounded-3xl border border-dark/10">
              <p className="font-bold text-sm text-dark mb-1">{t(item.titleKey)}</p>
              <p className="text-xs text-dark/60">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detection */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("detectionTitle")}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-danger/10 rounded-3xl p-5">
            <p className="font-black italic text-dark mb-2">{t("detectionBotTitle")}</p>
            <p className="text-sm text-dark/60">{t("detectionBotDesc")}</p>
          </div>
          <div className="bg-info/10 rounded-3xl p-5">
            <p className="font-black italic text-dark mb-2">{t("detectionVpnTitle")}</p>
            <p className="text-sm text-dark/60">{t("detectionVpnDesc")}</p>
          </div>
        </div>
      </div>

      {/* Infrastructure */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("infraTitle")}</h2>
        <div className="space-y-3">
          {infraItems.map((item) => (
            <div key={item.titleKey} className="p-4 rounded-3xl border border-dark/10">
              <p className="font-bold text-sm text-dark mb-1">{t(item.titleKey)}</p>
              <p className="text-xs text-dark/60">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open source */}
      <div className="bg-primary/10 rounded-3xl p-5">
        <h3 className="font-black italic text-dark mb-2">{t("openSourceTitle")}</h3>
        <p className="text-sm text-dark/70 leading-relaxed">{t("openSourceDesc")}</p>
      </div>

      {/* GDPR */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("gdprTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-3">
          {t("gdprDesc")}
        </p>
        <ul className="space-y-2 text-sm text-dark/70">
          {gdprItems.map((item) => (
            <li key={item.labelKey} className="flex gap-2">
              <strong className="text-dark shrink-0">{t(item.labelKey)}</strong>
              {t(item.descKey)}
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6">
        <Link href="/docs/plans" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">{ts("previous")}</p>
            <p className="font-black italic text-sm text-dark">{t("navPrevTitle")}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
