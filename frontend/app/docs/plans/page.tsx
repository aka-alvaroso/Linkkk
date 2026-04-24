"use client";
import { TbArrowRight, TbArrowLeft, TbCheck, TbX } from "react-icons/tb";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function PlansDoc() {
  const t = useTranslations("Docs.plans");
  const ts = useTranslations("Docs.shared");

  type RowValue = string | boolean;

  const rows: { featureKey: string; guest: RowValue; standard: RowValue; pro: RowValue }[] = [
    { featureKey: "featureLinks", guest: t("guestLinks"), standard: t("standardLinks"), pro: t("proLinks") },
    { featureKey: "featureDuration", guest: t("guestDuration"), standard: t("standardDuration"), pro: t("proDuration") },
    { featureKey: "featureRules", guest: t("guestRules"), standard: t("standardRules"), pro: t("proRules") },
    { featureKey: "featureConditions", guest: t("guestConditions"), standard: t("standardConditions"), pro: t("proConditions") },
    { featureKey: "featureAnalytics", guest: t("guestAnalytics"), standard: t("standardAnalytics"), pro: t("proAnalytics") },
    { featureKey: "featureSuffix", guest: false, standard: true, pro: true },
    { featureKey: "featureQr", guest: false, standard: true, pro: true },
    { featureKey: "featureQrCustom", guest: false, standard: true, pro: true },
    { featureKey: "featureCharts", guest: false, standard: true, pro: true },
    { featureKey: "featureOAuth", guest: false, standard: true, pro: true },
    { featureKey: "featureSupport", guest: false, standard: false, pro: true },
  ];

  const faqs = [
    { qKey: "faq1Q", aKey: "faq1A" },
    { qKey: "faq2Q", aKey: "faq2A" },
    { qKey: "faq3Q", aKey: "faq3A" },
    { qKey: "faq4Q", aKey: "faq4A" },
  ] as const;

  const renderCell = (val: RowValue, colIndex: number) => {
    if (typeof val === "boolean") {
      return val
        ? <TbCheck size={18} className="text-primary mx-auto" strokeWidth={3} />
        : <TbX size={18} className="text-dark/20 mx-auto" strokeWidth={3} />;
    }
    return <span className={`text-sm ${colIndex === 2 ? "font-bold text-dark" : "text-dark/70"}`}>{val}</span>;
  };

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

      {/* Plan comparison */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("comparisonTitle")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dark/20">
                <th className="text-left py-3 pr-4 font-black italic text-dark">{t("tableColFeature")}</th>
                <th className="text-center py-3 px-3 font-black italic text-dark/50">{t("tableColGuest")}</th>
                <th className="text-center py-3 px-3 font-black italic text-dark/50">{t("tableColStandard")}</th>
                <th className="text-center py-3 px-3 font-black italic text-primary">{t("tableColPro")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.featureKey} className="border-b border-dark/5">
                  <td className="py-2.5 pr-4 font-medium text-dark">{t(row.featureKey as Parameters<typeof t>[0])}</td>
                  {([row.guest, row.standard, row.pro] as RowValue[]).map((val, i) => (
                    <td key={i} className="py-2.5 px-3 text-center">
                      {renderCell(val, i)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("pricingTitle")}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl border border-dark/10">
            <p className="text-dark/50 text-xs font-black italic uppercase tracking-wider mb-1">{t("monthlyLabel")}</p>
            <p className="text-3xl font-black italic text-dark">{t("monthlyPrice")}<span className="text-base font-bold text-dark/40 ml-1">{t("monthlyPer")}</span></p>
          </div>
          <div className="p-5 rounded-3xl border border-primary bg-primary/5">
            <p className="text-primary text-xs font-black italic uppercase tracking-wider mb-1">{t("annualLabel")}</p>
            <p className="text-3xl font-black italic text-dark">{t("annualPrice")}<span className="text-base font-bold text-dark/40 ml-1">{t("annualPer")}</span></p>
            <p className="text-xs text-dark/50 mt-1">{t("annualBilled")}</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("faqTitle")}</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.qKey}>
              <p className="font-bold text-sm text-dark mb-1">{t(faq.qKey)}</p>
              <p className="text-sm text-dark/60">{t(faq.aKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/qr-codes" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">{ts("previous")}</p>
            <p className="font-black italic text-sm text-dark">{t("navPrevTitle")}</p>
          </div>
        </Link>
        <Link href="/docs/security" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
          <div>
            <p className="text-xs text-dark/40">{ts("next")}</p>
            <p className="font-black italic text-sm text-dark">{t("navNextTitle")}</p>
          </div>
          <TbArrowRight size={18} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
