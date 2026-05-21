"use client";
import { useState } from "react";
import { TbCheck, TbSparkles } from "react-icons/tb";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";
import Navigation from "@/app/components/Navigation/Navigation";
import Button from "@/app/components/ui/Button/Button";
import { subscriptionService } from "@/app/services/api/subscriptionService";

const s = (i: number) => ({ delay: 0.05 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const });
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function PricingPage() {
  const t = useTranslations("Pricing");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const handleProCTA = async () => {
    setLoading(true);
    try {
      await subscriptionService.createCheckoutSession(billing);
    } finally {
      setLoading(false);
    }
  };

  const guestFeatures = [
    t("guestFeature1"),
    t("guestFeature2"),
    t("guestFeature3"),
    t("guestFeature4"),
  ];

  const standardFeatures = [
    t("standardFeature1"),
    t("standardFeature2"),
    t("standardFeature3"),
    t("standardFeature4"),
    t("standardFeature5"),
    t("standardFeature6"),
    t("standardFeature7"),
  ];

  const proFeatures = [
    t("proFeature1"),
    t("proFeature2"),
    t("proFeature3"),
    t("proFeature4"),
    t("proFeature5"),
    t("proFeature6"),
  ];

  return (
    <div className="min-h-screen bg-light text-dark">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-20">

        {/* Header */}
        <motion.div {...fadeUp} transition={s(0)} className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black italic text-dark mb-3">{t("title")}</h1>
          <p className="text-dark/60 text-base md:text-lg">{t("subtitle")}</p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div {...fadeUp} transition={s(1)} className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-dark/5">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer ${
                billing === "monthly"
                  ? "bg-dark text-light shadow-sm"
                  : "text-dark/60 hover:text-dark"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer ${
                billing === "yearly"
                  ? "bg-dark text-light shadow-sm"
                  : "text-dark/60 hover:text-dark"
              }`}
            >
              {t("yearly")}
              <span className="text-xs font-black px-1.5 py-0.5 rounded-lg bg-primary text-dark">
                {t("yearlyBadge")}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 items-start">

          {/* Guest */}
          <motion.div {...fadeUp} transition={s(2)}
            className="flex flex-col rounded-3xl border border-dark/10 overflow-hidden"
          >
            <div className="p-6 flex-1">
              <span className="inline-block px-2.5 py-1 rounded-xl bg-dark/5 text-xs font-black text-dark mb-5">
                {t("guestLabel")}
              </span>
              <div className="mb-2">
                <span className="text-3xl font-black italic text-dark">{t("guestPrice")}</span>
              </div>
              <p className="text-sm text-dark/60 mb-6">{t("guestDesc")}</p>
              <ul className="space-y-2.5 mb-6">
                {guestFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-dark/70">
                    <TbCheck size={15} className="text-dark/30 shrink-0" strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 pb-6">
              <Link href="/" className="block">
                <Button variant="outline" size="sm" rounded="xl" className="w-full justify-center">
                  {t("guestCTA")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Standard */}
          <motion.div {...fadeUp} transition={s(3)}
            className="flex flex-col rounded-3xl border border-dark/10 overflow-hidden"
          >
            <div className="p-6 flex-1">
              <span className="inline-block px-2.5 py-1 rounded-xl bg-dark/5 text-xs font-black text-dark mb-5">
                {t("standardLabel")}
              </span>
              <div className="mb-2">
                <span className="text-3xl font-black italic text-dark">{t("standardPrice")}</span>
              </div>
              <p className="text-sm text-dark/60 mb-6">{t("standardDesc")}</p>
              <ul className="space-y-2.5 mb-6">
                {standardFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-dark/70">
                    <TbCheck size={15} className="text-primary shrink-0" strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 pb-6">
              <Link href="/auth/register" className="block">
                <Button variant="outline" size="sm" rounded="xl" className="w-full justify-center">
                  {t("standardCTA")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* PRO */}
          <motion.div {...fadeUp} transition={s(4)}
            className="flex flex-col rounded-3xl border border-dark shadow-[4px_4px_0_var(--color-dark)] overflow-hidden"
          >
            <div className="bg-primary p-6 flex-1">
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-dark text-light text-xs font-black">
                  <TbSparkles size={11} />
                  {t("proLabel")}
                </span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-black italic text-dark">
                  {billing === "monthly" ? t("proPriceMonthly") : t("proPriceYearly")}
                </span>
                <span className="text-sm font-bold text-dark/60 mb-1">{t("proPeriod")}</span>
              </div>
              {billing === "yearly" && (
                <p className="text-xs text-dark/60 mb-3">{t("proAnnualNote")}</p>
              )}
              <p className="text-sm text-dark/70 mb-6">{t("proDesc")}</p>
              <ul className="space-y-2.5 mb-6">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-dark/70">
                    <TbCheck size={15} className="text-dark shrink-0" strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 py-5 bg-primary">
              <Button
                variant="solid"
                size="sm"
                rounded="xl"
                className="w-full justify-center bg-dark text-light hover:bg-dark/80"
                onClick={handleProCTA}
                disabled={loading}
              >
                {loading ? "…" : t("proCTA")}
              </Button>
            </div>
          </motion.div>

        </div>


      </div>
    </div>
  );
}
