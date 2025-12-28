"use client"
import React, { useState, useRef } from "react";
import Link from "next/link";
import Navigation from "@/app/components/Navigation/Navigation";
import Button from "@/app/components/ui/Button/Button";
import Input from "@/app/components/ui/Input/Input";
import RouteGuard from "@/app/components/RouteGuard/RouteGuard";
import AnimatedText from "@/app/components/ui/AnimatedText/AnimatedText";
import CreateLinkDrawer from "@/app/components/Drawer/CreateLinkDrawer";
import InlineSelect from "@/app/components/ui/InlineSelect/InlineSelect";
import * as motion from "motion/react-client";
import { useScroll, useTransform } from "motion/react";
import {
  TbWorld,
  TbDeviceMobile,
  TbShieldCheck,
  TbCalendar,
  TbUsers,
  TbBolt,
  TbCheck,
  TbRocket,
  TbSparkles,
  TbClick,
  TbEye,
  TbLock,
  TbInfoCircle,
  TbCode,
  TbArrowUpRight,
  TbBrandGithub,
  TbMail,
  TbArrowRight,
  TbUserPlus,
  TbChartBar,
  TbTarget,
  TbX,
  TbRobot,
  TbNetwork,
  TbWebhook,
  TbChecklist,
  TbPlus
} from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useLinks } from "@/app/hooks/useLinks";
import { useToast } from "@/app/hooks/useToast";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useAuth } from "@/app/hooks/useAuth";
import { RiLoader5Fill } from "react-icons/ri";
import { useTranslations } from 'next-intl';


// Feature Card Component for stacked animation
const FeatureCard = ({
  scrollProgress,
  index,
  total,
  icon: Icon,
  iconColor,
  title,
  description,
  bgColor,
  tags,
  textLight = false
}: {
  scrollProgress: any;
  index: number;
  total: number;
  icon: any;
  iconColor: string;
  title: string;
  description: string;
  bgColor?: string;
  tags: string[];
  textLight?: boolean;
}) => {
  // Ajustamos para que las animaciones ocupen solo el 70% del scroll
  // dejando 30% al final para ver la última card
  const maxProgress = 0.7;
  const cardProgress = (index / total) * maxProgress;
  const nextCardProgress = ((index + 1) / total) * maxProgress;

  const y = useTransform(
    scrollProgress,
    [cardProgress, nextCardProgress],
    [1200, 0]
  );


  return (
    <motion.div
      style={{
        y,
        zIndex: index + 10,
      }}
      className="absolute inset-0"
    >
      <div
        className={`h-full p-4 md:p-8 ${bgColor} rounded-3xl border-3 border-dark shadow-[4px_4px_0_var(--color-dark)]`}
      >
        <div className="flex flex-col h-full justify-start gap-4 md:justify-between">
          <div>
            <div className="size-20 rounded-2xl bg-dark flex items-center justify-center mb-4">
              <Icon size={40} className={iconColor} />
            </div>
            <h3 className={`text-4xl font-black italic mb-3 ${textLight ? 'text-light' : ''}`}>
              {title}
            </h3>
            <p className={`text-sm md:text-lg ${textLight ? 'text-light/90' : 'text-dark/80'}`}>
              {description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            {tags.map((tag, i) => (
              <div key={i} className="px-4 py-2 bg-dark text-light rounded-xl">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Landing() {
  const router = useRouter();
  const { createLink } = useLinks();
  const toast = useToast();
  const { currentLocale, changeLanguage } = useLanguage();
  const { isAuthenticated, isGuest } = useAuth();
  const t = useTranslations('Landing.Hero');
  const tDemos = useTranslations('Landing.Demos');
  const tRules = useTranslations('Landing.Rules');
  const tCarousel = useTranslations('Landing.Carousel');
  const tFeatures = useTranslations('Landing.Features');
  const tGettingStarted = useTranslations('Landing.GettingStarted');
  const tFinalCTA = useTranslations('Landing.FinalCTA');
  const tFooter = useTranslations('Landing.Footer');
  const [url, setUrl] = useState("");
  const [isShortening, setIsShortening] = useState(false);

  // Ref for the stacked cards section
  const featuresRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"]
  });

  // Rules Engine Examples State
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);

  // Create Link Drawer State
  const [isCreateLinkDrawerOpen, setIsCreateLinkDrawerOpen] = useState(false);

  // Billing Period State (monthly/yearly)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const ruleExamples = [
    {
      textCondition: tRules('example1Condition'),
      textAction: tRules('example1Action'),
      conditions: [tRules('conditionDevice')],
      actions: [tRules('actionRedirect')],
      color1: "bg-secondary text-light",
      color2: "bg-primary"
    },
    {
      textCondition: tRules('example2Condition'),
      textAction: tRules('example2Action'),
      conditions: [tRules('conditionCountry')],
      actions: [tRules('actionRedirect')],
      color1: "bg-primary",
      color2: "bg-primary"
    },
    {
      textCondition: tRules('example3Condition'),
      textAction: tRules('example3Action'),
      conditions: [tRules('conditionVPN')],
      actions: [tRules('actionBlock')],
      color1: "bg-info",
      color2: "bg-danger"
    },
    {
      textCondition: tRules('example4Condition'),
      textAction: tRules('example4Action'),
      conditions: [tRules('conditionDevice')],
      actions: [tRules('actionPassword')],
      color1: "bg-secondary text-light",
      color2: "bg-warning"
    },
    {
      textCondition: tRules('example5Condition'),
      textAction: tRules('example5Action'),
      conditions: [tRules('conditionBot')],
      actions: [tRules('actionWebhook')],
      color1: "bg-danger",
      color2: "bg-info"
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveExampleIndex((prev) => (prev + 1) % ruleExamples.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ruleExamples.length]);

  const handleShorten = async () => {
    if (!url) return;

    setIsShortening(true);
    const response = await createLink({ longUrl: url });

    if (response.success) {
      toast.success("Link created successfully!");
      setIsShortening(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 400);
    } else {
      if (response.errorCode === 'LINK_LIMIT_EXCEEDED') {
        toast.error('Link limit exceeded', {
          description: 'You\'ve reached your link limit. Upgrade your plan to create more links.',
          duration: 6000,
        });
      } else if (response.errorCode === 'UNAUTHORIZED') {
        toast.error('Session expired', {
          description: 'Please login again to continue.',
        });
      } else if (response.errorCode === 'INVALID_DATA') {
        toast.error('Invalid data', {
          description: 'Please check your input and try again.',
        });
      } else {
        toast.error('Failed to create link', {
          description: response.error || 'An unexpected error occurred.',
        });
      }
      setIsShortening(false);
    }
  };

  return (
    <RouteGuard type="public" title="Linkkk - Smart URL Shortener">
      <Navigation />

      <div className="min-h-screen md:pb-0">
        {/* Hero Section - Input First */}
        <section className="relative h-[100dvh] flex items-center justify-center px-4 pt-0 pb-10 overflow-hidden">

          <div className="relative z-10 max-w-4xl mx-auto text-center w-full">
            {/* App Icon - Mobile Only */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="md:hidden mb-12 flex justify-center"
            >
              <img
                src="/k-logo-noBg.svg"
                alt={t('logoAlt')}
                className="w-8 h-auto"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black italic mb-4"
            >
              {t('title')}
              <br />
              <span className="text-shadow-[_4px_4px_0_var(--color-primary)] md:text-shadow-[_8px_8px_0_var(--color-primary)]">
                {t('titleHighlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-md md:text-lg text-dark/60 mb-12 max-w-3xl mx-auto"
            >
              {t('description')}
            </motion.p>

            {/* Main Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="relative flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-3xl shadow-[8px_8px_0_var(--color-dark)] border border-dark overflow-hidden">
                <motion.div
                  animate={{
                    opacity: isShortening ? 0 : 1,
                    x: isShortening ? -20 : 0,
                    paddingRight: url && !isShortening ? "140px" : "0px"
                  }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex-1"
                >
                  <Input
                    autoFocus
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                    placeholder={t('inputPlaceholder')}
                    className="bg-transparent border-none shadow-none focus:ring-0 text-md focus:outline-none"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' && url) {
                        handleShorten();
                      }
                    }}
                    disabled={isShortening}
                  />
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{
                    width: isShortening ? "calc(100% - 1rem)" : url ? "auto" : 0,
                    opacity: url || isShortening ? 1 : 0,
                    scale: url || isShortening ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 overflow-hidden"
                >
                  <Button
                    size="lg"
                    rounded="2xl"
                    className="w-full h-full bg-dark hover:bg-primary text-light hover:text-dark whitespace-nowrap hover:shadow-[_0_0_0_var(--color-dark)]"
                    leftIcon={isShortening ? <RiLoader5Fill size={18} className="animate-spin" /> : <TbBolt size={18} />}
                    onClick={handleShorten}
                    disabled={isShortening}
                  >
                    <p className="font-black italic">
                      {isShortening ? t('buttonCreating') : t('buttonShorten')}
                    </p>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Interactive Demos Section */}
        <section className="min-h-[100dvh] flex items-center justify-center py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block bg-primary px-2 py-1 rounded-full mb-4 text-xs font-black italic uppercase tracking-wide transition-all hover:shadow-[2px_2px_0_var(--color-dark)]">
                {tDemos('badge')}
              </div>
              <h2 className="text-5xl md:text-6xl font-black italic mb-4">
                {tDemos('title')} <span className="text-light bg-danger text-shadow-[_4px_4px_0_var(--color-dark)]">{tDemos('titleHighlight')}</span>
              </h2>
              <div className="inline text-2xl">
                <p className="z-20 relative inline-flex flex-col md:flex-row items-center">
                  {tDemos('subtitle')}
                </p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Demo 1: Device Detection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative group p-4 md:p-8 bg-primary rounded-2xl md:border-2 border-dark shadow-[0px_0px_0_var(--color-dark)] hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
              >
                {/* <div className="size-20 rounded-2xl bg-dark flex items-center justify-center mb-6">
                  <TbDeviceMobile size={40} className="text-primary" />
                </div> */}
                <h3 className="text-3xl md:text-4xl font-black italic mb-3">{tDemos('demo1Title')}</h3>
                <p className="text-lg md:text-xl mb-8">
                  {tDemos('demo1Description')}
                </p>
                <a href="/r/demo-device" target="_blank" rel="noopener noreferrer">
                  <div className="absolute flex flex-col items-center justify-center inset-1 bg-primary rounded-xl origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out">
                    <p className="text-4xl text-dark font-black italic">{tDemos('tryDemo')}</p>
                    <TbArrowUpRight size={64} />
                  </div>
                </a>

                <a className="block md:hidden" href="/r/demo-device" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    rounded="2xl"
                    className="w-full bg-primary text-dark shadow-[4px_4px_0_var(--color-dark)]"
                    rightIcon={<TbArrowUpRight size={32} />}
                  >
                    <p className="font-black italic text-xl">
                      {tDemos('tryDemo')}
                    </p>
                  </Button>
                </a>
              </motion.div>

              {/* Demo 2: Password Protection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative group p-4 md:p-8 bg-secondary text-light rounded-2xl md:border-2 border-dark shadow-[0px_0px_0_var(--color-dark)] hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
              >
                {/* <div className="size-20 rounded-2xl bg-dark flex items-center justify-center mb-6">
                  <TbLock size={40} className="text-secondary" />
                </div> */}
                <h3 className="text-3xl md:text-4xl font-black italic mb-3">{tDemos('demo2Title')}</h3>
                <p className="text-lg md:text-xl mb-8">
                  {tDemos('demo2Description')}
                </p>
                <a href="/r/demo-password" target="_blank" rel="noopener noreferrer">
                  <div className="absolute flex flex-col items-center justify-center inset-1 bg-secondary rounded-xl origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out">
                    <p className="text-4xl text-light font-black italic">{tDemos('tryDemo')}</p>
                    <TbArrowUpRight size={64} className="text-light" />
                  </div>
                </a>

                <a className="block md:hidden" href="/r/demo-password" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    rounded="2xl"
                    className="w-full bg-secondary text-light shadow-[4px_4px_0_var(--color-dark)]"
                    rightIcon={<TbArrowUpRight size={32} />}
                  >
                    <p className="font-black italic text-xl">
                      {tDemos('tryDemo')}
                    </p>
                  </Button>
                </a>
              </motion.div>

              {/* Demo 3: Detection Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative group p-4 md:p-8 bg-warning rounded-2xl md:border-2 border-dark shadow-[0px_0px_0_var(--color-dark)] hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
              >
                {/* <div className="size-20 rounded-2xl bg-dark flex items-center justify-center mb-6">
                  <TbEye size={40} className="text-warning" />
                </div> */}
                <h3 className="text-3xl md:text-4xl font-black italic mb-3">{tDemos('demo3Title')}</h3>
                <p className="text-lg md:text-xl mb-8">
                  {tDemos('demo3Description')}
                </p>
                <a href="/r/demo-detection" target="_blank" rel="noopener noreferrer">
                  <div className="absolute flex flex-col items-center justify-center inset-1 bg-warning rounded-xl origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out">
                    <p className="text-4xl text-dark font-black italic">{tDemos('tryDemo')}</p>
                    <TbArrowUpRight size={64} />
                  </div>
                </a>

                <a className="block md:hidden" href="/r/demo-detection" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    rounded="2xl"
                    className="w-full bg-warning text-dark shadow-[4px_4px_0_var(--color-dark)]"
                    rightIcon={<TbArrowUpRight size={32} />}
                  >
                    <p className="font-black italic text-xl">
                      {tDemos('tryDemo')}
                    </p>
                  </Button>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Rules Engine Section - Carousel Pills */}
        <section className="min-h-[100dvh] flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block bg-warning px-2 py-1 rounded-full mb-4 text-xs font-black italic uppercase tracking-wide transition-all hover:shadow-[2px_2px_0_var(--color-dark)]">
                {tRules('badge')}
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic mb-4">
                {tRules('title')} <span className="text-light bg-info text-shadow-[_4px_4px_0_var(--color-dark)]">{tRules('titleHighlight')}</span>
              </h2>
              <p className="text-xl text-dark/60">
                {tRules('subtitle')}
              </p>
            </motion.div>


            {/* Example Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mb-8 text-center"
            >
              <div className="inline-block">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="font-black text-lg md:text-xl italic">{tRules('if')}</span>
                  <div className="inline-block">
                    <AnimatedText
                      key={`condition-${activeExampleIndex}`}
                      initialText={ruleExamples[activeExampleIndex].textCondition}
                      triggerMode="none"
                      animationType="slide"
                      slideDirection="up"
                      duration={0.5}
                      className={`font-black text-lg md:text-xl italic ${ruleExamples[activeExampleIndex].color1}`}
                    />
                  </div>
                  <span className="font-black text-lg md:text-xl italic -ml-">{tRules('then')}</span>
                  <div className="inline-block">
                    <AnimatedText
                      key={`action-${activeExampleIndex}`}
                      initialText={ruleExamples[activeExampleIndex].textAction}
                      triggerMode="none"
                      animationType="slide"
                      slideDirection="up"
                      duration={0.5}
                      className={`font-black text-lg md:text-xl italic ${ruleExamples[activeExampleIndex].color2}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* IF Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="px-4 py-2 bg-dark text-light rounded-xl font-black italic text-sm">
                  {tRules('conditionsLabel')}
                </div>
                <div className="h-px flex-1 bg-dark/20" />
              </div>

              {/* Conditions Pills */}
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { icon: TbWorld, label: tRules('conditionCountry'), color: "bg-primary" },
                  { icon: TbDeviceMobile, label: tRules('conditionDevice'), color: "bg-secondary text-light" },
                  { icon: TbNetwork, label: tRules('conditionIP'), color: "bg-warning" },
                  { icon: TbShieldCheck, label: tRules('conditionVPN'), color: "bg-info" },
                  { icon: TbRobot, label: tRules('conditionBot'), color: "bg-danger" },
                  { icon: TbCalendar, label: tRules('conditionDateTime'), color: "bg-success" },
                  { icon: TbChartBar, label: tRules('conditionAccessCount'), color: "bg-info" },
                ].map((item, i) => {
                  const textRef = React.useRef<any>(null);
                  const isActive = ruleExamples[activeExampleIndex].conditions.includes(item.label);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      onMouseEnter={() => textRef.current?.setText(item.label)}
                      onMouseLeave={() => textRef.current?.reset()}
                      className={`flex items-center gap-2 px-4 py-3 ${item.color} ${isActive ? `border-dark shadow-[2px_2px_0_var(--color-dark)]` : `border-transparent`} rounded-full border-2 border-dark cursor-pointer transition-all duration-300`}
                    >
                      <item.icon size={20} className="" />
                      <AnimatedText
                        ref={textRef}
                        initialText={item.label}
                        triggerMode="none"
                        animationType="slide"
                        slideDirection="up"
                        duration={0.3}
                        className="font-black text-sm whitespace-nowrap"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* THEN Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="px-4 py-2 bg-dark text-light rounded-xl font-black italic text-sm">
                  {tRules('actionsLabel')}
                </div>
                <div className="h-px flex-1 bg-dark/20" />
              </div>

              {/* Actions Pills */}
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { icon: TbArrowRight, label: tRules('actionRedirect'), color: "bg-primary" },
                  { icon: TbX, label: tRules('actionBlock'), color: "bg-danger" },
                  { icon: TbLock, label: tRules('actionPassword'), color: "bg-warning" },
                  { icon: TbWebhook, label: tRules('actionWebhook'), color: "bg-info" },
                ].map((item, i) => {
                  const textRef = React.useRef<any>(null);
                  const isActive = ruleExamples[activeExampleIndex].actions.includes(item.label);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      onMouseEnter={() => textRef.current?.setText(item.label)}
                      onMouseLeave={() => textRef.current?.reset()}
                      className={`flex items-center gap-2 px-4 py-3 ${item.color} ${isActive ? `border-dark shadow-[2px_2px_0_var(--color-dark)]` : `border-transparent`} rounded-full border-2 border-dark cursor-pointer transition-all duration-300`}
                    >
                      <item.icon size={20} className="text-dark" />
                      <AnimatedText
                        ref={textRef}
                        initialText={item.label}
                        triggerMode="none"
                        animationType="slide"
                        slideDirection="up"
                        duration={0.3}
                        className="font-black text-sm whitespace-nowrap text-dark"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

          </div>
        </section>

        {/* Motivational Carousel Separator */}
        <section className="py-4 px-4 bg-dark overflow-hidden">
          <div className="relative">
            <motion.div
              className="flex gap-8 whitespace-nowrap"
              animate={{
                x: [0, -1500],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {[
                tCarousel('phrase1'),
                tCarousel('phrase2'),
                tCarousel('phrase3'),
                tCarousel('phrase4'),
                tCarousel('phrase5'),
                tCarousel('phrase6'),
                tCarousel('phrase7'),
                tCarousel('phrase8'),
                // Duplicate for seamless loop
                tCarousel('phrase1'),
                tCarousel('phrase2'),
                tCarousel('phrase3'),
                tCarousel('phrase4'),
                tCarousel('phrase5'),
                tCarousel('phrase6'),
                tCarousel('phrase7'),
                tCarousel('phrase8'),
              ].map((message, i) => (
                <div
                  key={i}
                  className="text-3xl md:text-5xl font-black italic text-warning flex-shrink-0"
                >
                  {message}
                  <span className="text-light mx-4">•</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* General Features - Stacked Scroll Animation */}
        <section ref={featuresRef} className="relative h-auto md:h-[400vh]">
          <div className="relative md:sticky md:top-0 h-auto md:h-screen md:overflow-hidden flex items-center">
            <div className="w-full px-4 md:px-8">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center">
                {/* Left Side - Sticky Text */}
                <div className="flex flex-col">
                  <div className="inline-block bg-warning px-2 py-1 rounded-full mb-4 text-xs font-black italic uppercase tracking-wide w-fit">
                    {tFeatures('badge')}
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black italic mb-4">
                    {tFeatures('title')}
                  </h2>
                  <p className="text-xl text-dark/60 mb-6 md:mb-8">
                    {tFeatures('subtitle')}
                  </p>
                  <Button
                    variant="solid"
                    size="lg"
                    rounded="xl"
                    leftIcon={<TbPlus size={20} />}
                    expandOnHover="icon"
                    className="w-fit bg-dark hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                    onClick={() => setIsCreateLinkDrawerOpen(true)}
                  >
                    <p className="font-black italic">
                      {tFeatures('createLinkButton')}
                    </p>
                  </Button>
                  <div className="space-y-4 hidden">
                    <div className="flex items-start gap-3">
                      <div className="size-8 mt-1 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <TbUserPlus size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Guest Mode</h4>
                        <p className="text-dark/60">Start instantly without signup</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="size-8 mt-1 rounded-lg bg-warning flex items-center justify-center flex-shrink-0">
                        <TbTarget size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Link Rules</h4>
                        <p className="text-dark/60">Conditional logic for your links</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="size-8 mt-1 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <TbChartBar size={20} className="text-light" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Access tracking</h4>
                        <p className="text-dark/60">Track every visitor detail</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Mobile: Horizontal Scroll, Desktop: Stacked Cards */}

                {/* Mobile Version - Horizontal Scroll */}
                <div className="md:hidden overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4">
                  <div className="flex gap-4" style={{ width: 'max-content' }}>
                    {/* Card 1: Guest Mode */}
                    <div className="snap-center" style={{ width: '85vw', maxWidth: '400px' }}>
                      <div className="h-[500px] p-6 bg-primary rounded-3xl border-4 border-dark shadow-[4px_4px_0_var(--color-dark)]">
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <div className="size-16 md:size-20 rounded-2xl bg-dark flex items-center justify-center mb-4">
                              <TbUserPlus size={40} className="text-primary" />
                            </div>
                            <h3 className="text-2xl md:text-4xl font-black italic mb-3">{tFeatures('card1Title')}</h3>
                            <p className="text-md md:text-lg text-dark/80">
                              {tFeatures('card1DescriptionShort')}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm font-bold">
                            <div className="px-4 py-2 bg-dark text-light rounded-xl">{tFeatures('card1Tag1')}</div>
                            <div className="px-4 py-2 bg-dark text-light rounded-xl">{tFeatures('card1Tag2')}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Smart Rules */}
                    <div className="snap-center" style={{ width: '85vw', maxWidth: '400px' }}>
                      <div className="h-[500px] p-6 bg-warning rounded-3xl border-4 border-dark shadow-[4px_4px_0_var(--color-dark)]">
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <div className="size-16 md:size-20 rounded-2xl bg-dark flex items-center justify-center mb-4">
                              <TbTarget size={40} className="text-warning" />
                            </div>
                            <h3 className="text-2xl md:text-4xl font-black italic mb-3">{tFeatures('card2Title')}</h3>
                            <p className="text-md md:text-lg text-dark/80">
                              {tFeatures('card2DescriptionShort')}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm font-bold">
                            <div className="px-4 py-2 bg-dark text-light rounded-xl">{tFeatures('card2Tag1')}</div>
                            <div className="px-4 py-2 bg-dark text-light rounded-xl">{tFeatures('card2Tag2')}</div>
                            <div className="px-4 py-2 bg-dark text-light rounded-xl">{tFeatures('card2Tag3')}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Analytics */}
                    <div className="snap-center" style={{ width: '85vw', maxWidth: '400px' }}>
                      <div className="h-[500px] p-6 bg-secondary rounded-3xl border-4 border-dark shadow-[4px_4px_0_var(--color-dark)]">
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <div className="size-16 md:size-20 rounded-2xl bg-dark flex items-center justify-center mb-4">
                              <TbChartBar size={40} className="text-secondary" />
                            </div>
                            <h3 className="text-2xl md:text-4xl font-black italic mb-3 text-light">{tFeatures('card3Title')}</h3>
                            <p className="text-md md:text-lg text-light/90">
                              {tFeatures('card3DescriptionShort')}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm font-bold">
                            <div className="px-4 py-2 bg-dark text-light rounded-xl">{tFeatures('card3Tag1')}</div>
                            <div className="px-4 py-2 bg-dark text-light rounded-xl">{tFeatures('card3Tag2')}</div>
                            <div className="px-4 py-2 bg-dark text-light rounded-xl">{tFeatures('card3Tag3')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Version - Stacked Cards */}
                <div className="relative h-[500px] hidden md:flex items-center justify-center">
                  {/* Card 1: Guest Mode */}
                  <FeatureCard
                    scrollProgress={scrollYProgress}
                    index={0}
                    total={3}
                    icon={TbUserPlus}
                    iconColor="text-primary"
                    bgColor="bg-primary"
                    title={tFeatures('card1Title')}
                    description={tFeatures('card1DescriptionLong')}
                    tags={[tFeatures('card1Tag1'), tFeatures('card1Tag2')]}
                  />

                  {/* Card 2: Smart Rules */}
                  <FeatureCard
                    scrollProgress={scrollYProgress}
                    index={1}
                    total={3}
                    icon={TbTarget}
                    iconColor="text-warning"
                    bgColor="bg-warning"
                    title={tFeatures('card2Title')}
                    description={tFeatures('card2DescriptionLong')}
                    tags={[tFeatures('card2Tag1'), tFeatures('card2Tag2'), tFeatures('card2Tag3')]}
                  />

                  {/* Card 3: Analytics */}
                  <FeatureCard
                    scrollProgress={scrollYProgress}
                    index={2}
                    total={3}
                    icon={TbChartBar}
                    iconColor="text-secondary"
                    bgColor="bg-secondary"
                    title={tFeatures('card3Title')}
                    description={tFeatures('card3DescriptionLong')}
                    tags={[tFeatures('card3Tag1'), tFeatures('card3Tag2'), tFeatures('card3Tag3')]}
                    textLight
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="min-h-[100dvh] py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="inline-block bg-info text-light px-2 py-1 rounded-full mb-4 text-xs font-black italic uppercase tracking-wide">
                {tGettingStarted('badge')}
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic mb-4">
                {tGettingStarted('title')} <span className="bg-primary">{tGettingStarted('titleHighlight')}</span>
              </h2>
              <p className="text-xl text-dark/60 mb-6">
                {tGettingStarted('subtitle')}
              </p>

              {/* Billing Period Toggle */}
              <div className="inline-flex gap-1 p-1 bg-dark/5 rounded-2xl">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 rounded-xl italic text-sm transition-all duration-200 ${
                    billingPeriod === 'monthly'
                      ? 'bg-dark text-light'
                      : 'text-dark/60 hover:text-dark hover:cursor-pointer'
                  }`}
                >
                  <p className="font-black">
                    {tGettingStarted('billingToggleMonthly')}
                  </p>
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-4 py-2 rounded-xl italic text-sm transition-all duration-200 ${
                    billingPeriod === 'yearly'
                      ? 'bg-dark text-light'
                      : 'text-dark/60 hover:text-dark hover:cursor-pointer'
                  }`}
                >
                  <p className="font-black">
                  {tGettingStarted('billingToggleYearly')}
                  </p>
                </button>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Guest */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col p-8 bg-dark/5 rounded-3xl transition-all duration-200 border-2 border-transparent hover:border-dark hover:shadow-[6px_6px_0_var(--color-dark)]"
              >
                <div className="text-sm font-bold text-dark/60 mb-2">{tGettingStarted('guestLabel')}</div>
                <div className="text-4xl font-black mb-2">{tGettingStarted('guestPrice')}</div>
                <div className="text-dark/60 mb-6">{tGettingStarted('guestSubtitle')}</div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-success mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('guestFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-success mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('guestFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-success mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('guestFeature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-success mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('guestFeature4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-success mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('guestFeature5')}</span>
                  </li>
                </ul>

                <Button
                  variant="outline"
                  size="lg"
                  rounded="xl"
                  rightIcon={<TbArrowUpRight size={24} />}
                  expandOnHover="icon"
                  className="mt-auto w-full hover:bg-warning"
                  onClick={() => setIsCreateLinkDrawerOpen(true)}
                >
                  <p className="font-black italic">
                    {tGettingStarted('guestButton')}
                  </p>
                </Button>
              </motion.div>

              {/* Free Account - Popular */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col p-8 bg-primary rounded-3xl border-2 border-dark relative shadow-[6px_6px_0_var(--color-dark)]"
              >
                {/* <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-dark text-light rounded-full text-xs font-black">
                  MOST POPULAR
                </div> */}

                <div className="text-sm font-bold text-dark mb-2">{tGettingStarted('freeLabel')}</div>
                <div className="text-4xl font-black text-dark mb-2">{tGettingStarted('freePrice')}</div>
                <div className="text-dark/60 mb-6">{tGettingStarted('freeSubtitle')}</div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-dark mt-1 flex-shrink-0" />
                    <span className="text-dark">{tGettingStarted('freeFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-dark mt-1 flex-shrink-0" />
                    <span className="text-dark">{tGettingStarted('freeFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-dark mt-1 flex-shrink-0" />
                    <span className="text-dark">{tGettingStarted('freeFeature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-dark mt-1 flex-shrink-0" />
                    <span className="text-dark">{tGettingStarted('freeFeature4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-dark mt-1 flex-shrink-0" />
                    <span className="text-dark">{tGettingStarted('freeFeature5')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-dark mt-1 flex-shrink-0" />
                    <span className="text-dark">{tGettingStarted('freeFeature6')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbCheck className="text-dark mt-1 flex-shrink-0" />
                    <span className="text-dark">{tGettingStarted('freeFeature7')}</span>
                  </li>
                </ul>

                <Link href="/auth/register" className="mt-auto">
                  <Button
                    variant="solid"
                    size="lg"
                    rounded="xl"
                    rightIcon={<TbRocket size={24} />}
                    expandOnHover="icon"
                    className="w-full bg-dark hover:text-dark hover:bg-primary"
                  >
                    <p className="font-black italic">
                      {tGettingStarted('freeButton')}
                    </p>
                  </Button>
                </Link>
              </motion.div>

              {/* PRO Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden flex flex-col p-8 bg-dark/5 rounded-3xl transition-all duration-200 border-2 border-transparent hover:border-dark hover:shadow-[6px_6px_0_var(--color-dark)]"
              >
                <div className="text-sm font-bold text-dark/60 mb-2">{tGettingStarted('proLabel')}</div>
                <div className="text-4xl font-black mb-2">
                  <span className="text-secondary">
                    <AnimatedText
                      key={`price-${billingPeriod}`}
                      initialText={billingPeriod === 'monthly' ? tGettingStarted('proPriceMonthly') : tGettingStarted('proPriceYearly')}
                      animationType="slide"
                      slideDirection="up"
                      duration={0.3}
                    />
                  </span>
                  <span className="text-lg text-dark/60">
                    <AnimatedText
                      key={`period-${billingPeriod}`}
                      initialText={billingPeriod === 'monthly' ? tGettingStarted('proPeriodMonthly') : tGettingStarted('proPeriodYearly')}
                      animationType="slide"
                      slideDirection="up"
                      duration={0.3}
                    />
                  </span>
                </div>
                <div className="text-dark/60 mb-6">{tGettingStarted('proSubtitle')}</div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <TbSparkles className="text-secondary mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('proFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbSparkles className="text-secondary mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('proFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbSparkles className="text-secondary mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('proFeature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbSparkles className="text-secondary mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('proFeature4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TbSparkles className="text-secondary mt-1 flex-shrink-0" />
                    <span>{tGettingStarted('proFeature5')}</span>
                  </li>
                </ul>

                {isAuthenticated && !isGuest ? (
                  <Button
                    variant="solid"
                    size="lg"
                    rounded="xl"
                    rightIcon={<TbRocket size={24} />}
                    expandOnHover="icon"
                    className="w-full bg-dark hover:bg-secondary mt-auto"
                    onClick={() => {
                      // TODO: Navigate to Stripe checkout
                      toast.info('Stripe integration coming soon!');
                    }}
                  >
                    <p className="font-black italic">
                      {tGettingStarted('proButton')}
                    </p>
                  </Button>
                ) : (
                  <Link href="/auth/login" className="mt-auto">
                    <Button
                      variant="solid"
                      size="lg"
                      rounded="xl"
                      rightIcon={<TbRocket size={24} />}
                      expandOnHover="icon"
                      className="w-full bg-dark hover:bg-secondary"
                    >
                      <p className="font-black italic">
                        {tGettingStarted('proButton')}
                      </p>
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA with creative separator */}
        <section className="min-h-[60dvh] relative bg-primary flex items-center justify-center ">
          {/* Creative wavy separator */}
          <div className="px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-4xl md:text-6xl font-black italic mb-6">
                {tFinalCTA('title')}
              </h2>
              <p className="text-xl text-dark/80 mb-8">
                {tFinalCTA('subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button
                    variant="solid"
                    size="xl"
                    rounded="2xl"
                    rightIcon={<TbRocket size={24} />}
                    expandOnHover="icon"
                    className="bg-dark text-light hover:bg-warning hover:text-dark"
                  >
                    {tFinalCTA('button1')}
                  </Button>
                </Link>
                <Button
                  variant="solid"
                  size="xl"
                  rounded="2xl"
                  rightIcon={<TbPlus size={24} />}
                  expandOnHover="icon"
                  className="bg-primary text-dark hover:bg-secondary hover:text-light"
                  onClick={() => setIsCreateLinkDrawerOpen(true)}
                >
                  {tFinalCTA('button2')}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-dark text-light py-16 px-4 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              {/* Brand */}
              <div>
                <div className="text-4xl font-black italic mb-4">
                  <Link href="/" className="text-4xl font-black italic z-10">
                    <span className="text-light transition-all duration-300 ease-in-out hover:text-primary hover:text-shadow-[_4px_4px_0_var(--color-light)]">
                      k.
                    </span>
                  </Link>
                </div>
                <p className="text-light/60 text-sm">
                  {tFooter('brandDescription')}
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-black italic mb-4">{tFooter('productHeading')}</h4>
                <ul className="space-y-2 text-sm text-light/60">
                  <li>
                    <Link href="/" className="relative hover:text-dark transition-colors group">
                      <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                      <p className="text-sm z-20 relative inline-flex flex-col md:flex-row items-center">
                        {tFooter('productLink1')}
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="relative hover:text-dark transition-colors group">
                      <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                      <p className="text-sm z-20 relative inline-flex flex-col md:flex-row items-center">
                        {tFooter('productLink2')}
                      </p>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-black italic mb-4">{tFooter('resourcesHeading')}</h4>
                <ul className="space-y-2 text-sm text-light/60">
                  <li><a href="https://github.com/aka-alvaroso/linkkk" target="_blank" rel="noopener noreferrer" className="
                  relative group hover:text-dark transition-colors inline-flex items-center">
                    <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                    <p className="text-sm z-20 relative inline-flex flex-col md:flex-row md:gap-1 items-center">
                      <TbBrandGithub size={16} /> GitHub
                    </p>
                  </a></li>
                  {/* <li>
                    <Link href="/features" className="relative hover:text-dark transition-colors group">
                        <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                        <p className="text-sm z-20 relative inline-flex flex-col md:flex-row items-center">
                          Documentation
                        </p>
                    </Link>
                  </li> */}
                </ul>
              </div>

              {/* Legal */}
              {/* Legal */}
              <div>
                <h4 className="font-black italic mb-4">{tFooter('legalHeading')}</h4>
                <ul className="space-y-2 text-sm text-light/60">
                  <li>
                    <Link href="/legal/privacy-policy" className="relative hover:text-dark transition-colors group">
                      <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                      <p className="text-sm z-20 relative inline-flex flex-col md:flex-row items-center">
                        {tFooter('privacyPolicy')}
                      </p>
                    </Link>
                  </li>
                  <li><Link href="/legal/terms-of-service" className="relative hover:text-dark transition-colors group">
                      <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                      <p className="text-sm z-20 relative inline-flex flex-col md:flex-row items-center">
                        {tFooter('termsOfService')}
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/cookies" className="relative hover:text-dark transition-colors group">
                      <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                      <p className="text-sm z-20 relative inline-flex flex-col md:flex-row items-center">
                        {tFooter('cookiePolicy')}
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/legal-notice" className="relative hover:text-dark transition-colors group">
                      <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                      <p className="text-sm z-20 relative inline-flex flex-col md:flex-row items-center">
                        {tFooter('legalNotice')}
                      </p>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-light/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-light/40">
                &copy; {new Date().getFullYear()} Linkkk. {tFooter('copyright')} <a href="https://alvaroso.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">@alvaroso</a>
              </p>
              <InlineSelect
                options={[
                  {
                    label: 'Español',
                    value: 'es',
                    rightIcon: currentLocale === 'es' ? <TbCheck size={16} /> : undefined
                  },
                  {
                    label: 'English',
                    value: 'en',
                    rightIcon: currentLocale === 'en' ? <TbCheck size={16} /> : undefined
                  }
                ]}
                value={currentLocale}
                onChange={(value) => changeLanguage(value as 'es' | 'en')}
              />
            </div>
          </div>
        </footer>
      </div >

      {/* Create Link Drawer */}
      <CreateLinkDrawer
        open={isCreateLinkDrawerOpen}
        onClose={() => setIsCreateLinkDrawerOpen(false)}
        onSuccess={() => router.push('/dashboard')}
      />
    </RouteGuard >
  );
}
