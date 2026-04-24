"use client";
import { TbArrowRight, TbArrowLeft } from "react-icons/tb";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function QRCodesDoc() {
  const t = useTranslations("Docs.qrCodes");
  const ts = useTranslations("Docs.shared");

  const customizations = [
    { labelKey: "customFgColor", descKey: "customFgColorDesc" },
    { labelKey: "customBgColor", descKey: "customBgColorDesc" },
    { labelKey: "customLogo", descKey: "customLogoDesc" },
    { labelKey: "customDotStyle", descKey: "customDotStyleDesc" },
    { labelKey: "customCornerStyle", descKey: "customCornerStyleDesc" },
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

      {/* Customization */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("customTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">
          {t("customDesc")}
        </p>
        <div className="space-y-3">
          {customizations.map((item) => (
            <div key={item.labelKey} className="p-4 rounded-3xl border border-dark/10">
              <p className="font-bold text-sm text-dark">{t(item.labelKey)}</p>
              <p className="text-xs text-dark/60 mt-1">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("trackingTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          {t("trackingDesc")}
        </p>
      </div>

      {/* Dynamic QR */}
      <div className="bg-info/10 rounded-3xl p-5">
        <h3 className="font-black italic text-dark mb-2">{t("dynamicTitle")}</h3>
        <p className="text-sm text-dark/70 leading-relaxed">
          {t("dynamicDesc")}
        </p>
      </div>

      {/* Availability */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("availabilityTitle")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark/10">
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">{t("tableColPlan")}</th>
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">{t("tableColBasicQr")}</th>
                <th className="text-left py-2 font-black italic text-dark/50">{t("tableColCustom")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">{ts("planGuest")}</td>
                <td className="py-2 pr-4">{t("tableGuestBasic")}</td>
                <td className="py-2">{t("tableGuestCustom")}</td>
              </tr>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">{ts("planStandard")}</td>
                <td className="py-2 pr-4">{t("tableStandardBasic")}</td>
                <td className="py-2">{t("tableStandardCustom")}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold">{ts("planPro")}</td>
                <td className="py-2 pr-4">{t("tableProBasic")}</td>
                <td className="py-2">{t("tableProCustom")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/analytics" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">{ts("previous")}</p>
            <p className="font-black italic text-sm text-dark">{t("navPrevTitle")}</p>
          </div>
        </Link>
        <Link href="/docs/plans" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
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
