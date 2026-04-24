"use client";
import { TbArrowRight, TbArrowLeft, TbPlus } from "react-icons/tb";
import Link from "next/link";
import Button from "@/app/components/ui/Button/Button";
import { useTranslations } from "next-intl";

export default function LinksDoc() {
  const t = useTranslations("Docs.links");
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

      {/* Creating a link */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-black italic text-dark">{t("createTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          {t("createDesc")}
        </p>
        <div className="bg-dark/5 rounded-3xl p-4 text-sm space-y-2">
          <p><strong>{t("createFieldDest")}</strong></p>
          <p><strong>{t("createFieldSuffix")}</strong></p>
        </div>
        <Button
          variant="solid"
          size="lg"
          className="hover:bg-primary hover:text-dark rounded-3xl"
          leftIcon={<TbPlus size={16}/>}
        >
          {t("createButton")}
        </Button>
      </div>

      {/* Custom suffix */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("suffixTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-3">
          {t("suffixDesc")} <code className="bg-dark/10 px-1.5 py-0.5 rounded text-dark font-mono text-xs">linkkk.dev/r/my-offer</code>
        </p>
        <div className="bg-warning/10 rounded-3xl p-4 text-sm text-dark/70">
          {t("suffixNote")}
        </div>
      </div>

      {/* Link states */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("statesTitle")}</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-3xl border border-dark/10">
            <span className="shrink-0 mt-0.5 size-3 rounded-full bg-primary" />
            <div>
              <p className="font-bold text-sm text-dark">{t("stateActiveTitle")}</p>
              <p className="text-xs text-dark/60">{t("stateActiveDesc")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-3xl border border-dark/10">
            <span className="shrink-0 mt-0.5 size-3 rounded-full bg-dark/30" />
            <div>
              <p className="font-bold text-sm text-dark">{t("stateInactiveTitle")}</p>
              <p className="text-xs text-dark/60">{t("stateInactiveDesc")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-3xl border border-dark/10">
            <span className="shrink-0 mt-0.5 size-3 rounded-full bg-danger" />
            <div>
              <p className="font-bold text-sm text-dark">{t("stateExpiredTitle")}</p>
              <p className="text-xs text-dark/60">{t("stateExpiredDesc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Editing and deleting */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("editTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          {t("editDesc")}
        </p>
      </div>

      {/* Limits */}
      <div>
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
                <td className="py-2">{t("tableGuestSuffix")}</td>
              </tr>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">{ts("planStandard")}</td>
                <td className="py-2 pr-4">{t("tableStandardLinks")}</td>
                <td className="py-2 pr-4">{t("tableStandardDuration")}</td>
                <td className="py-2">{t("tableStandardSuffix")}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold">{ts("planPro")}</td>
                <td className="py-2 pr-4">{t("tableProLinks")}</td>
                <td className="py-2 pr-4">{t("tableProDuration")}</td>
                <td className="py-2">{t("tableProSuffix")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/getting-started" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">{ts("previous")}</p>
            <p className="font-black italic text-sm text-dark">{t("navPrevTitle")}</p>
          </div>
        </Link>
        <Link href="/docs/rules" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
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
