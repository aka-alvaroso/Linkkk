"use client";
import { TbArrowRight, TbArrowLeft, TbCheck, TbX, TbWorld, TbSparkles } from "react-icons/tb";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";

const s = (i: number) => ({ delay: 0.05 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const });
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function LinksDoc() {
  const t = useTranslations("Docs.links");
  const ts = useTranslations("Docs.shared");

  const states = [
    { titleKey: "stateActiveTitle",   descKey: "stateActiveDesc",   color: "bg-primary" },
    { titleKey: "stateInactiveTitle", descKey: "stateInactiveDesc", color: "bg-dark/30" },
    { titleKey: "stateExpiredTitle",  descKey: "stateExpiredDesc",  color: "bg-danger" },
  ] as const;

  return (
    <div className="flex flex-col gap-8">

      <motion.div {...fadeUp} transition={s(0)}>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">{t("title")}</h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">{t("subtitle")}</p>
      </motion.div>

      {/* Create a link */}
      <motion.div {...fadeUp} transition={s(1)}>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("createTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">{t("createDesc")}</p>
        <div className="space-y-2">
          <div className="p-4 rounded-2xl border border-dark/10">
            <p className="text-sm text-dark/70">{t("createFieldDest")}</p>
          </div>
          <div className="p-4 rounded-2xl border border-dark/10">
            <p className="text-sm text-dark/70">{t("createFieldSuffix")}</p>
          </div>
        </div>
      </motion.div>

      {/* Custom suffixes */}
      <motion.div {...fadeUp} transition={s(2)}>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("suffixTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-3">{t("suffixDesc")}</p>
        <div className="bg-dark/5 rounded-2xl p-4 font-mono text-sm">
          <p className="font-bold">linkkk.dev/r/<span className="text-primary">my-offer</span></p>
        </div>
        <p className="text-xs text-dark/40 mt-3 italic">{t("suffixNote")}</p>
      </motion.div>

      {/* Link states */}
      <motion.div {...fadeUp} transition={s(3)}>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("statesTitle")}</h2>
        <div className="space-y-2">
          {states.map((state) => (
            <div key={state.titleKey} className="flex items-center gap-4 p-4 rounded-2xl border border-dark/10">
              <span className={`shrink-0 w-2.5 h-2.5 rounded-full self-center ${state.color}`} />
              <div>
                <p className="font-bold text-sm text-dark">{t(state.titleKey)}</p>
                <p className="text-xs text-dark/60">{t(state.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Edit & delete */}
      <motion.div {...fadeUp} transition={s(4)}>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("editTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed">{t("editDesc")}</p>
      </motion.div>

      {/* Limits */}
      <motion.div {...fadeUp} transition={s(5)}>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("limitsTitle")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark/10">
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">{t("tableColPlan")}</th>
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">{t("tableColLinks")}</th>
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">{t("tableColDuration")}</th>
                <th className="text-left py-2 font-black italic text-dark/50">{t("tableColSuffix")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">{ts("planGuest")}</td>
                <td className="py-2 pr-4">3</td>
                <td className="py-2 pr-4">{t("tableGuestDuration")}</td>
                <td className="py-2"><TbX size={16} className="text-dark/20" /></td>
              </tr>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">{ts("planStandard")}</td>
                <td className="py-2 pr-4">{t("tableStandardLinks")}</td>
                <td className="py-2 pr-4">{t("tableStandardDuration")}</td>
                <td className="py-2"><TbCheck size={16} className="text-primary" strokeWidth={3} /></td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold">{ts("planPro")}</td>
                <td className="py-2 pr-4">{t("tableProLinks")}</td>
                <td className="py-2 pr-4">{t("tableProDuration")}</td>
                <td className="py-2"><TbCheck size={16} className="text-primary" strokeWidth={3} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Custom domains */}
      <motion.div {...fadeUp} transition={s(6)}>
        <div className="flex items-center gap-2 mb-3">
          <TbWorld size={20} className="text-info" />
          <h2 className="text-xl font-black italic text-dark">{t("customDomainsTitle")}</h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/20 text-xs font-black text-dark">
            <TbSparkles size={12} />
            PRO
          </span>
        </div>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">{t("customDomainsDesc")}</p>
        <div className="bg-dark/5 rounded-2xl p-4 font-mono text-sm mb-4">
          <p className="text-dark/40 text-xs mb-1">antes</p>
          <p className="font-bold text-dark/50">linkkk.dev/<span className="text-dark/40">xyz</span></p>
          <p className="text-dark/40 text-xs mt-3 mb-1">con dominio propio</p>
          <p className="font-bold">go.tumarca.com/<span className="text-primary">xyz</span></p>
        </div>
        <h3 className="font-black italic text-dark mb-3">{t("customDomainsSetupTitle")}</h3>
        <ol className="space-y-2">
          {(["customDomainsStep1", "customDomainsStep2", "customDomainsStep3", "customDomainsStep4"] as const).map((key, i) => (
            <li key={key} className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-info/15 text-info text-xs font-black inline-flex items-center justify-center">{i + 1}</span>
              <p className="text-sm text-dark/70 pt-0.5">{t(key)}</p>
            </li>
          ))}
        </ol>
        <p className="text-xs text-dark/40 mt-4 italic">{t("customDomainsNote")}</p>
      </motion.div>

      {/* Groups & Tags */}
      <motion.div {...fadeUp} transition={s(7)}>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("organizeTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">{t("organizeDesc")}</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-dark/10">
            <p className="font-black italic text-dark mb-1">{t("groupsTitle")}</p>
            <p className="text-sm text-dark/60">{t("groupsDesc")}</p>
          </div>
          <div className="p-4 rounded-2xl border border-dark/10">
            <p className="font-black italic text-dark mb-1">{t("tagsTitle")}</p>
            <p className="text-sm text-dark/60">{t("tagsDesc")}</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div {...fadeUp} transition={s(8)} className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/getting-started"
          className="flex items-center gap-2 p-4 rounded-xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">{ts("previous")}</p>
            <p className="font-black italic text-sm text-dark">{t("navPrevTitle")}</p>
          </div>
        </Link>
        <Link href="/docs/rules"
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
