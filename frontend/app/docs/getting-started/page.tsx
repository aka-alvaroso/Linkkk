"use client";
import { TbArrowRight, TbPlus, TbUser, TbUserPlus } from "react-icons/tb";
import Link from "next/link";
import Button from "@/app/components/ui/Button/Button";
import { useTranslations } from "next-intl";

export default function GettingStarted() {
  const t = useTranslations("Docs.gettingStarted");
  const ts = useTranslations("Docs.shared");

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

      {/* What makes it different */}
      <div className="bg-primary/10 rounded-3xl p-6">
        <h2 className="text-xl font-black italic text-dark mb-3">
          {t("differenceTitle")}
        </h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          {t("differenceDesc")}
        </p>
      </div>

      {/* Two ways to start */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">
          {t("waysTitle")}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-dark/10 rounded-3xl p-5 space-y-3">
            <div className="inline-flex p-2 size-10 rounded-3xl bg-warning/10 items-center justify-center">
              <TbUser size={32} className="text-warning" />
            </div>
            <h3 className="font-black italic text-lg">{t("guestTitle")}</h3>
            <p className="text-sm text-dark/60 leading-relaxed">
              {t("guestDesc")}
            </p>
          </div>

          <div className="border border-dark/10 rounded-3xl p-5 space-y-3">
            <div className="inline-flex p-2 size-10 rounded-3xl bg-primary/10 items-center justify-center">
              <TbUserPlus size={32} className="text-primary" />
            </div>
            <h3 className="font-black italic text-lg">{t("registeredTitle")}</h3>
            <p className="text-sm text-dark/60 leading-relaxed">
              {t("registeredDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* Quick start steps */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">
          {t("stepsTitle")}
        </h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-dark text-light inline-flex items-center justify-center text-sm font-black">1</span>
            <div>
              <p className="font-bold text-dark">{t("step1Title")}</p>
              <p className="text-sm text-dark/60">{t("step1Desc")}</p>
            </div>
            <Button
              variant="solid"
              size="sm"
              className="rounded-3xl hover:bg-primary hover:text-dark"
              leftIcon={<TbPlus size={16}/>}
            >
              {t("step1Button")}
            </Button>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-dark text-light inline-flex items-center justify-center text-sm font-black">2</span>
            <div>
              <p className="font-bold text-dark">{t("step2Title")}</p>
              <p className="text-sm text-dark/60">{t("step2Desc")}</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-dark text-light inline-flex items-center justify-center text-sm font-black">3</span>
            <div>
              <p className="font-bold text-dark">{t("step3Title")}</p>
              <p className="text-sm text-dark/60">{t("step3Desc")}</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Next steps */}
      <div className="border-t border-dark/10 pt-6">
        <p className="text-xs font-black italic text-dark/40 uppercase tracking-wider mb-3">
          {ts("next")}
        </p>
        <Link
          href="/docs/links"
          className="flex items-center justify-between p-4 rounded-xl bg-dark/5 hover:bg-dark/10 transition-colors group"
        >
          <div>
            <p className="font-black italic text-dark">{t("navNextTitle")}</p>
            <p className="text-sm text-dark/50">{t("navNextDesc")}</p>
          </div>
          <TbArrowRight size={20} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
