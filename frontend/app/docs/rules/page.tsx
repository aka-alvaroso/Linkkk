"use client";
import { TbArrowRight, TbArrowLeft, TbWorld, TbClick, TbDeviceMobile, TbCalendar, TbRobot, TbShieldLock, TbDots, TbArrowFork, TbForbid2, TbLock, TbWebhook } from "react-icons/tb";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function RulesDoc() {
  const t = useTranslations("Docs.rules");
  const ts = useTranslations("Docs.shared");

  const conditions = [
    { nameKey: "conditionCountryName", icon: <TbWorld size={22} />, color: "bg-primary/10 text-primary", descKey: "conditionCountryDesc", opsKey: "conditionCountryOperators" },
    { nameKey: "conditionDeviceName", icon: <TbDeviceMobile size={22} />, color: "bg-warning/10 text-warning", descKey: "conditionDeviceDesc", opsKey: "conditionDeviceOperators" },
    { nameKey: "conditionVpnName", icon: <TbShieldLock size={22} />, color: "bg-info/10 text-info", descKey: "conditionVpnDesc", opsKey: "conditionVpnOperators" },
    { nameKey: "conditionBotName", icon: <TbRobot size={22} />, color: "bg-danger/10 text-danger", descKey: "conditionBotDesc", opsKey: "conditionBotOperators" },
    { nameKey: "conditionDateName", icon: <TbCalendar size={22} />, color: "bg-secondary/10 text-secondary", descKey: "conditionDateDesc", opsKey: "conditionDateOperators" },
    { nameKey: "conditionIpName", icon: <TbDots size={22} />, color: "bg-dark/10 text-dark", descKey: "conditionIpDesc", opsKey: "conditionIpOperators" },
    { nameKey: "conditionCountName", icon: <TbClick size={22} />, color: "bg-dark/10 text-dark", descKey: "conditionCountDesc", opsKey: "conditionCountOperators" },
  ] as const;

  const actions = [
    { nameKey: "actionRedirectName", icon: <TbArrowFork size={22} />, color: "bg-primary/10 text-primary", descKey: "actionRedirectDesc" },
    { nameKey: "actionBlockName", icon: <TbForbid2 size={22} />, color: "bg-danger/10 text-danger", descKey: "actionBlockDesc" },
    { nameKey: "actionPasswordName", icon: <TbLock size={22} />, color: "bg-warning/10 text-warning", descKey: "actionPasswordDesc" },
    { nameKey: "actionWebhookName", icon: <TbWebhook size={22} />, color: "bg-info/10 text-info", descKey: "actionWebhookDesc" },
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

      {/* How rules work */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("howTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">
          {t("howDesc")}
        </p>
        <div className="bg-dark rounded-3xl p-5 text-light text-sm font-mono space-y-1">
          <p className="text-primary font-bold">{t("codeIf")}</p>
          <p className="pl-4">{t("codeCondition")}</p>
          <p className="text-primary font-bold">{t("codeThen")}</p>
          <p className="pl-4">{t("codeAction")}</p>
          <p className="text-danger font-bold">{t("codeElse")}</p>
          <p className="pl-4">{t("codeElseAction")}</p>
        </div>
      </div>

      {/* Conditions */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("conditionsTitle")}</h2>
        <div className="space-y-3">
          {conditions.map((c) => (
            <div key={c.nameKey} className="flex items-start gap-3 p-4 rounded-3xl border border-dark/10">
              <span className={`p-1 flex items-center justify-center shrink-0 rounded-lg text-xs font-black ${c.color}`}>
                {c.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-dark/70">
                  <span className="text-dark font-black italic mr-2">{t(c.nameKey)}:</span>
                  {t(c.descKey)}
                </p>
                <p className="text-xs text-dark/40 mt-1">{t("conditionOperatorsLabel")}: {t(c.opsKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match logic */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("logicTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">
          {t("logicDesc")}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-primary/10 rounded-3xl p-4">
            <p className="font-black italic text-dark mb-1">{t("logicAndTitle")}</p>
            <p className="text-sm text-dark/60">{t("logicAndDesc")}</p>
          </div>
          <div className="bg-warning/10 rounded-3xl p-4">
            <p className="font-black italic text-dark mb-1">{t("logicOrTitle")}</p>
            <p className="text-sm text-dark/60">{t("logicOrDesc")}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">{t("actionsTitle")}</h2>
        <div className="space-y-3">
          {actions.map((a) => (
            <div key={a.nameKey} className="flex items-start gap-3 p-4 rounded-3xl border border-dark/10">
              <span className={`shrink-0 p-1 rounded-lg text-xs font-black ${a.color}`}>
                {a.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-dark/70">
                  <span className="text-dark font-black italic mr-2">{t(a.nameKey)}:</span>
                  {t(a.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">{t("priorityTitle")}</h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          {t("priorityDesc")}
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
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">{t("tableColRules")}</th>
                <th className="text-left py-2 font-black italic text-dark/50">{t("tableColConditions")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">{ts("planGuest")}</td>
                <td className="py-2 pr-4">{t("tableGuestRules")}</td>
                <td className="py-2">{t("tableGuestConditions")}</td>
              </tr>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">{ts("planStandard")}</td>
                <td className="py-2 pr-4">{t("tableStandardRules")}</td>
                <td className="py-2">{t("tableStandardConditions")}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold">{ts("planPro")}</td>
                <td className="py-2 pr-4">{t("tableProRules")}</td>
                <td className="py-2">{t("tableProConditions")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/links" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">{ts("previous")}</p>
            <p className="font-black italic text-sm text-dark">{t("navPrevTitle")}</p>
          </div>
        </Link>
        <Link href="/docs/analytics" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
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
