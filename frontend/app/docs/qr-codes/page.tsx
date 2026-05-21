"use client";
import { TbArrowRight, TbArrowLeft } from "react-icons/tb";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";

const s = (i: number) => ({ delay: 0.05 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const });
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

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

  const styles = [
    { labelKey: "styleNormal", descKey: "styleNormalDesc", src: "/qr_normal.png" },
    { labelKey: "styleRounded", descKey: "styleRoundedDesc", src: "/qr_rounded.png" },
    { labelKey: "styleDots", descKey: "styleDotsDesc", src: "/qr_dots.png" },
    { labelKey: "styleColor", descKey: "styleColorDesc", src: "/qr_color.png" },
  ] as const;

  return (
    <div className="flex flex-col gap-8">

      <motion.div {...fadeUp} transition={s(0)}>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">{t("title")}</h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">{t("subtitle")}</p>
      </motion.div>

      {/* Style examples */}
      <motion.div {...fadeUp} transition={s(1)}>
        <h2 className="text-xl font-black italic text-dark mb-2">{t("stylesTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">{t("stylesDesc")}</p>
        <div className="flex flex-wrap gap-3">
          {styles.map((style) => (
            <div key={style.labelKey} className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-dark/10">
              <div className="relative size-20 rounded-xl overflow-hidden bg-white">
                <Image
                  src={style.src}
                  alt={t(style.labelKey)}
                  fill
                  className="object-contain p-1.5"
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-dark">{t(style.labelKey)}</p>
                <p className="text-xs text-dark/50">{t(style.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Customization */}
      <motion.div {...fadeUp} transition={s(2)}>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("customTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">{t("customDesc")}</p>
        <div className="space-y-2">
          {customizations.map((item) => (
            <div key={item.labelKey} className="p-4 rounded-2xl border border-dark/10">
              <p className="font-bold text-sm text-dark">{t(item.labelKey)}</p>
              <p className="text-xs text-dark/60 mt-1">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tracking */}
      <motion.div {...fadeUp} transition={s(3)}>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("trackingTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed">{t("trackingDesc")}</p>
      </motion.div>

      {/* Dynamic QR */}
      <motion.div {...fadeUp} transition={s(4)} className="bg-info/10 rounded-2xl p-5">
        <h3 className="font-black italic text-dark mb-2">{t("dynamicTitle")}</h3>
        <p className="text-sm text-dark/70 leading-relaxed">{t("dynamicDesc")}</p>
      </motion.div>

      {/* Availability */}
      <motion.div {...fadeUp} transition={s(5)}>
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
      </motion.div>

      {/* Navigation */}
      <motion.div {...fadeUp} transition={s(6)} className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/analytics"
          className="flex items-center gap-2 p-4 rounded-xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">{ts("previous")}</p>
            <p className="font-black italic text-sm text-dark">{t("navPrevTitle")}</p>
          </div>
        </Link>
        <Link href="/pricing"
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
