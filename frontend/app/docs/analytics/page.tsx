"use client";
import { TbArrowRight, TbArrowLeft } from "react-icons/tb";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";

const s = (i: number) => ({ delay: 0.05 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const });
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function AnalyticsDoc() {
  const t = useTranslations("Docs.analytics");
  const ts = useTranslations("Docs.shared");

  const trackedItems = [
    { labelKey: "trackDate",    descKey: "trackDateDesc" },
    { labelKey: "trackCountry", descKey: "trackCountryDesc" },
    { labelKey: "trackDevice",  descKey: "trackDeviceDesc" },
    { labelKey: "trackBrowser", descKey: "trackBrowserDesc" },
    { labelKey: "trackVpn",     descKey: "trackVpnDesc" },
    { labelKey: "trackBot",     descKey: "trackBotDesc" },
    { labelKey: "trackSource",  descKey: "trackSourceDesc" },
  ] as const;

  const aggregatedStats = [
    { labelKey: "aggregatedClicksDay",    descKey: "aggregatedClicksDayDesc" },
    { labelKey: "aggregatedTopCountries", descKey: "aggregatedTopCountriesDesc" },
    { labelKey: "aggregatedBrowsers",     descKey: "aggregatedBrowsersDesc" },
    { labelKey: "aggregatedDirectVsQr",   descKey: "aggregatedDirectVsQrDesc" },
    { labelKey: "aggregatedVpnBots",      descKey: "aggregatedVpnBotsDesc" },
  ] as const;

  return (
    <div className="flex flex-col gap-8">

      <motion.div {...fadeUp} transition={s(0)}>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">{t("title")}</h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">{t("subtitle")}</p>
      </motion.div>

      {/* What we track */}
      <motion.div {...fadeUp} transition={s(1)}>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("trackTitle")}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {trackedItems.map((item) => (
            <div key={item.labelKey} className="flex items-center gap-3 p-3 rounded-2xl border border-dark/10">
              <span className="shrink-0 size-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-bold text-dark">{t(item.labelKey)}</p>
                <p className="text-xs text-dark/50">{t(item.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Aggregated stats */}
      <motion.div {...fadeUp} transition={s(2)}>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("aggregatedTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">{t("aggregatedDesc")}</p>
        <ul className="space-y-2 text-sm text-dark/70">
          {aggregatedStats.map((item) => (
            <li key={item.labelKey} className="flex gap-2">
              <strong className="text-dark shrink-0">{t(item.labelKey)}</strong>
              {t(item.descKey)}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Retention */}
      <motion.div {...fadeUp} transition={s(3)}>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("retentionTitle")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark/10">
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">{t("tableColPlan")}</th>
                <th className="text-left py-2 font-black italic text-dark/50">{t("tableColHistory")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">{ts("planGuest")}</td>
                <td className="py-2">{t("tableGuestHistory")}</td>
              </tr>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">{ts("planStandard")}</td>
                <td className="py-2">{t("tableStandardHistory")}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold">{ts("planPro")}</td>
                <td className="py-2">{t("tableProHistory")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Privacy note */}
      <motion.div {...fadeUp} transition={s(4)} className="bg-primary/10 rounded-2xl p-5">
        <h3 className="font-black italic text-dark mb-2">{t("privacyTitle")}</h3>
        <p className="text-sm text-dark/70 leading-relaxed">{t("privacyDesc")}</p>
      </motion.div>

      {/* Navigation */}
      <motion.div {...fadeUp} transition={s(5)} className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/rules"
          className="flex items-center gap-2 p-4 rounded-xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">{ts("previous")}</p>
            <p className="font-black italic text-sm text-dark">{t("navPrevTitle")}</p>
          </div>
        </Link>
        <Link href="/docs/qr-codes"
          className="flex items-center gap-2 p-4 rounded-xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
          <div>
            <p className="text-xs text-dark/40">{ts("next")}</p>
            <p className="font-black italic text-sm text-dark">{t("navNextTitle")}</p>
          </div>
          <TbArrowRight size={18} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </motion.div>

    </div>
  );
}
