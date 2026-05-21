"use client";
import { TbArrowRight, TbPlus, TbUser, TbUserPlus } from "react-icons/tb";
import Link from "next/link";
import Button from "@/app/components/ui/Button/Button";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";

const s = (i: number) => ({ delay: 0.05 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const });
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function GettingStarted() {
  const t = useTranslations("Docs.gettingStarted");
  const ts = useTranslations("Docs.shared");

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <motion.div {...fadeUp} transition={s(0)}>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">{t("title")}</h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">{t("subtitle")}</p>
      </motion.div>

      {/* What makes it different */}
      <motion.div {...fadeUp} transition={s(1)} className="bg-primary/10 rounded-2xl p-5">
        <h2 className="text-xl font-black italic text-dark mb-3">{t("differenceTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed">{t("differenceDesc")}</p>
      </motion.div>

      {/* Two ways to start */}
      <motion.div {...fadeUp} transition={s(2)}>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("waysTitle")}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-dark/10 rounded-2xl p-5 space-y-3">
            <div className="inline-flex p-2 size-10 rounded-xl bg-warning/10 items-center justify-center">
              <TbUser size={24} className="text-warning" />
            </div>
            <h3 className="font-black italic text-lg">{t("guestTitle")}</h3>
            <p className="text-sm text-dark/60 leading-relaxed">{t("guestDesc")}</p>
          </div>
          <div className="border border-dark/10 rounded-2xl p-5 space-y-3">
            <div className="inline-flex p-2 size-10 rounded-xl bg-primary/10 items-center justify-center">
              <TbUserPlus size={24} className="text-primary" />
            </div>
            <h3 className="font-black italic text-lg">{t("registeredTitle")}</h3>
            <p className="text-sm text-dark/60 leading-relaxed">{t("registeredDesc")}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick start steps */}
      <motion.div {...fadeUp} transition={s(3)}>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("stepsTitle")}</h2>
        <ol className="space-y-4 mb-6">
          <li className="flex gap-4 items-start">
            <span className="shrink-0 w-8 h-8 rounded-full bg-dark text-light inline-flex items-center justify-center text-sm font-black">1</span>
            <div>
              <p className="font-bold text-dark">{t("step1Title")}</p>
              <p className="text-sm text-dark/60">{t("step1Desc")}</p>
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="shrink-0 w-8 h-8 rounded-full bg-dark text-light inline-flex items-center justify-center text-sm font-black">2</span>
            <div>
              <p className="font-bold text-dark">{t("step2Title")}</p>
              <p className="text-sm text-dark/60">{t("step2Desc")}</p>
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="shrink-0 w-8 h-8 rounded-full bg-dark text-light inline-flex items-center justify-center text-sm font-black">3</span>
            <div>
              <p className="font-bold text-dark">{t("step3Title")}</p>
              <p className="text-sm text-dark/60">{t("step3Desc")}</p>
            </div>
          </li>
        </ol>
        <Button variant="solid" size="sm" rounded="xl" leftIcon={<TbPlus size={16} />}
          className="hover:bg-primary hover:text-dark">
          {t("step1Button")}
        </Button>
      </motion.div>

      {/* Next steps */}
      <motion.div {...fadeUp} transition={s(4)} className="border-t border-dark/10 pt-6">
        <p className="text-xs font-black italic text-dark/40 uppercase tracking-wider mb-3">{ts("next")}</p>
        <Link href="/docs/links"
          className="flex items-center justify-between p-4 rounded-xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <div>
            <p className="font-black italic text-dark">{t("navNextTitle")}</p>
            <p className="text-sm text-dark/50">{t("navNextDesc")}</p>
          </div>
          <TbArrowRight size={20} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </motion.div>

    </div>
  );
}
