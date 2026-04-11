"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/app/components/Navigation/Navigation";
import CreateLinkDrawer from "@/app/components/Drawer/CreateLinkDrawer";
import RouteGuard from "@/app/components/RouteGuard/RouteGuard";
import Button from "@/app/components/ui/Button/Button";
import SplitWords from "@/app/components/Landing/SplitWords";
import UseCaseCard from "@/app/components/Landing/UseCaseCard";
import RulePill from "@/app/components/Landing/RulePill";
import FaqItem from "@/app/components/Landing/FaqItem";
import { useAuth } from "@/app/hooks";
import { subscriptionService } from "@/app/services/api/subscriptionService";
import * as motion from "motion/react-client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  TbClipboard,
  TbAdjustmentsHorizontal,
  TbShare,
  TbArrowUpRight,
  TbWorld,
  TbDeviceMobile,
  TbDots,
  TbShieldLock,
  TbClick,
  TbCalendar,
  TbRobot,
  TbArrowFork,
  TbForbid2,
  TbLock,
  TbWebhook,
  TbUser,
  TbBrandGithub,
  TbAppWindow,
  TbInfoCircle,
  TbChevronDown,
  TbHeartFilled,
  TbMicrophone2,
  TbChartBar,
  TbShoppingBag,
  TbBriefcase,
  TbRocket,
} from "react-icons/tb";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);
  const { isAuthenticated } = useAuth();

  // Hero zoom refs
  const triggerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const controlWordRef = useRef<HTMLSpanElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  // Horizontal scroll refs
  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const sectionTitleRef = useRef<HTMLHeadingElement>(null);

  // Steps section ref
  const stepsSectionRef = useRef<HTMLElement>(null);

  // Use cases section ref
  const useCasesSectionRef = useRef<HTMLElement>(null);

  // Rules section ref
  const rulesSectionRef = useRef<HTMLElement>(null);

  // Bento section ref
  const bentoSectionRef = useRef<HTMLElement>(null);

  // Pricing section ref
  const pricingSectionRef = useRef<HTMLElement>(null);

  // Active pill tooltip
  const [activePill, setActivePill] = useState<string | null>(null);

  // Pricing toggle
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const handleUpgradePro = async () => {
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }
    try {
      await subscriptionService.createCheckoutSession(billingPeriod);
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!controlWordRef.current || !heroContentRef.current || !triggerRef.current || !heroSectionRef.current) return;

      // --- Hero zoom animation ---
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: heroSectionRef.current,
          pinSpacing: false,
        },
      });

      heroTl.to(
        heroContentRef.current.querySelectorAll(".hero-fade"),
        {
          opacity: 0,
          duration: 0.3,
        },
        0
      );

      heroTl.to(
        controlWordRef.current,
        {
          scale: 150,
          duration: 0.7,
          ease: "power2.in",
        },
        0.1
      );

      // --- Horizontal scroll animation ---
      if (!horizontalSectionRef.current || !horizontalTrackRef.current || !sectionTitleRef.current) return;

      const track = horizontalTrackRef.current;
      const totalScrollWidth = track.scrollWidth - window.innerWidth;
      const scrollPadding = window.innerWidth * 0.6;

      const horizontalScroll = gsap.to(track, {
        x: -totalScrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: horizontalSectionRef.current,
          start: "top top",
          end: () => `+=${totalScrollWidth + scrollPadding}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Section title: appears centered, then moves to top
      const titleEl = sectionTitleRef.current;
      const titleWords = titleEl.querySelectorAll(".anim-word");

      ScrollTrigger.create({
        trigger: horizontalSectionRef.current,
        start: "top top",
        onEnter: () => {
          gsap.to(titleWords, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
            stagger: 0.05,
          });
        },
        onLeaveBack: () => {
          gsap.set(titleWords, { opacity: 0, y: 40 });
        },
      });

      gsap.to(titleEl, {
        top: "8%",
        scale: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: horizontalSectionRef.current,
          start: "top top",
          end: () => `+=${window.innerWidth * 0.5}`,
          scrub: 1,
        },
      });

      // Animate words inside each content slide
      const slides = track.querySelectorAll<HTMLElement>(".h-slide");

      slides.forEach((slide) => {
        const words = slide.querySelectorAll(".anim-word");
        const sticker = slide.querySelector(".anim-sticker");

        if (words.length > 0) {
          gsap.to(words, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
            stagger: 0.04,
            scrollTrigger: {
              trigger: slide,
              containerAnimation: horizontalScroll,
              start: "left 50%",
              toggleActions: "play none none reverse",
            },
          });
        }

        if (sticker) {
          gsap.fromTo(
            sticker,
            { opacity: 0, scale: 0.5, rotate: -15 },
            {
              opacity: 1,
              scale: 1,
              rotate: 0,
              duration: 1,
              ease: "back.out(2)",
              scrollTrigger: {
                trigger: slide,
                containerAnimation: horizontalScroll,
                start: "left 50%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      // --- Steps section animations ---
      if (!stepsSectionRef.current) return;
      const stepsEl = stepsSectionRef.current;

      // Title words (SplitWords with .anim-word)
      const stepsTitleWords = stepsEl.querySelectorAll(".steps-title .anim-word");
      if (stepsTitleWords.length > 0) {
        gsap.to(stepsTitleWords, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.05,
          scrollTrigger: {
            trigger: stepsEl.querySelector(".steps-title"),
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Each step card — subtle fade up
      const stepCards = stepsEl.querySelectorAll(".step-card");
      stepCards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // CTA button
      const stepsCta = stepsEl.querySelector(".steps-cta");
      if (stepsCta) {
        gsap.fromTo(
          stepsCta,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: stepsCta,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // --- Use cases section animations (desktop only) ---
      if (!useCasesSectionRef.current) return;
      const useCasesEl = useCasesSectionRef.current;

      // Title
      const useCasesTitleWords = useCasesEl.querySelectorAll(".usecases-title .anim-word");
      if (useCasesTitleWords.length > 0) {
        gsap.to(useCasesTitleWords, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.05,
          scrollTrigger: {
            trigger: useCasesEl.querySelector(".usecases-title"),
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // --- Rules section animations ---
      if (!rulesSectionRef.current) return;
      const rulesEl = rulesSectionRef.current;

      // Title
      const rulesTitleWords = rulesEl.querySelectorAll(".rules-title .anim-word");
      if (rulesTitleWords.length > 0) {
        gsap.to(rulesTitleWords, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.05,
          scrollTrigger: {
            trigger: rulesEl.querySelector(".rules-title"),
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Subtitle fade in
      const rulesSubtitle = rulesEl.querySelector(".rules-subtitle");
      if (rulesSubtitle) {
        gsap.fromTo(
          rulesSubtitle,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rulesSubtitle,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Pill groups stagger in
      const pillGroups = rulesEl.querySelectorAll(".pill-group");
      pillGroups.forEach((group) => {
        const pills = group.querySelectorAll(".rule-pill");
        gsap.fromTo(
          pills,
          { opacity: 0, y: 20, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: group,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // --- Bento section animations ---
      if (!bentoSectionRef.current) return;
      const bentoEl = bentoSectionRef.current;

      // Title
      const bentoTitleWords = bentoEl.querySelectorAll(".bento-title .anim-word");
      if (bentoTitleWords.length > 0) {
        gsap.to(bentoTitleWords, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.05,
          scrollTrigger: {
            trigger: bentoEl.querySelector(".bento-title"),
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Bento cells
      const bentoCells = bentoEl.querySelectorAll(".bento-cell");
      bentoCells.forEach((cell, i) => {
        gsap.fromTo(
          cell,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bentoEl.querySelector(".bento-grid"),
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // --- Pricing section animations ---
      if (!pricingSectionRef.current) return;
      const pricingEl = pricingSectionRef.current;

      const pricingTitleWords = pricingEl.querySelectorAll(".pricing-title .anim-word");
      if (pricingTitleWords.length > 0) {
        gsap.to(pricingTitleWords, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.05,
          scrollTrigger: {
            trigger: pricingEl.querySelector(".pricing-title"),
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const pricingCards = pricingEl.querySelectorAll(".pricing-card");
      pricingCards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pricingEl.querySelector(".pricing-cards"),
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <RouteGuard type="guest-or-user">
      <Navigation />

      {/* ==================== HERO ==================== */}
      <div ref={triggerRef}>
        <section
          ref={heroSectionRef}
          className="h-screen flex flex-col items-center justify-center px-6 md:px-40 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            ref={heroContentRef}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-8xl font-black italic leading-[1.05] tracking-tight text-dark mb-6">
              <span className="hero-fade">Cada clic bajo{" "}</span>
              <br className="md:hidden" />
              <span className="hero-fade">tu </span>
              <span
                ref={controlWordRef}
                className="inline-block will-change-transform"
                style={{ transformOrigin: "45% 60%" }}
              >
                control.
              </span>
            </h1>

            <p className="hero-fade text-xl font-black italic text-dark leading-snug mb-8 max-w-2xl mx-auto">
              Decide qué hacen tus enlaces cuando acceden a ellos. Sin código.
            </p>

            <div className="hero-fade">
              <Button
                variant="solid"
                size="lg"
                rounded="3xl"
                onClick={() => setCreateLinkDrawer(true)}
                className="bg-primary text-dark border-dark shadow-[4px_4px_0_var(--color-dark)] hover:shadow-[6px_6px_0_var(--color-dark)] font-black italic"
              >
                Crea tu primer smart link
              </Button>
            </div>

            <p className="hero-fade text-xs text-dark/50 mt-4">
              Sin registro, gratis y en 30 segundos
            </p>
          </motion.div>
        </section>

        <div className="h-[150vh]" />
      </div>

      {/* ==================== HORIZONTAL SCROLL SECTION ==================== */}
      <div ref={horizontalSectionRef} className="bg-dark overflow-hidden relative pt-px">
        {/* Floating section title */}
        <h2
          ref={sectionTitleRef}
          className="absolute left-1/2 -translate-x-1/2 top-1/2 pt-96 -translate-y-1/2 z-10 text-4xl md:text-6xl font-black italic text-light text-center leading-tight whitespace-nowrap will-change-transform"
        >
          <SplitWords>El problema con los links</SplitWords>{" "}
          <span className="inline-block overflow-hidden">
            <span
              className="anim-word inline-block bg-danger px-2 text-light text-shadow-[4px_4px_0_var(--color-dark)]"
              style={{ opacity: 0, transform: "translateY(40px)" }}
            >
              tontos
            </span>
          </span>
        </h2>

        <div
          ref={horizontalTrackRef}
          className="flex h-screen items-center will-change-transform"
        >
          {/* Spacer: first "screen" is just the title */}
          <div className="flex-shrink-0 w-screen h-full" />

          {/* --- Slide 1: Bots --- */}
          <div className="h-slide flex-shrink-0 w-screen h-full flex items-center px-8 md:px-20 pt-24 md:pt-32">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-5xl mx-auto">
              <div className="anim-sticker flex-shrink-0">
                <Image
                  src="/robot-sticker.png"
                  alt="Robot sticker"
                  width={280}
                  height={280}
                  className="w-40 md:w-72 h-auto drop-shadow-2xl"
                />
              </div>
              <div>
                <p className="font-black italic text-light leading-none mb-2">
                  <SplitWords className="text-5xl md:text-7xl">.01</SplitWords>
                  <SplitWords className="text-2xl md:text-4xl ml-1">
                    Los bots devoran tu presupuesto de ads.
                  </SplitWords>
                </p>
                <p className="font-bold italic text-light/60 text-lg md:text-xl mt-4">
                  <SplitWords>Tus métricas mienten.</SplitWords>
                </p>
              </div>
            </div>
          </div>

          {/* --- Slide 2: Affiliate / Geo --- */}
          <div className="h-slide flex-shrink-0 w-screen h-full flex items-center px-8 md:px-20 pt-24 md:pt-32">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-5xl mx-auto">
              <div className="anim-sticker flex-shrink-0 relative">
                <Image
                  src="/dollar-sticker.png"
                  alt="Dollar sticker"
                  width={200}
                  height={200}
                  className="w-28 md:w-48 h-auto drop-shadow-2xl"
                />
                <Image
                  src="/euro-sticker.png"
                  alt="Euro sticker"
                  width={200}
                  height={200}
                  className="w-28 md:w-48 h-auto drop-shadow-2xl absolute -right-8 md:-right-12 -bottom-4 md:-bottom-6"
                />
              </div>
              <div>
                <p className="font-black italic text-light leading-none mb-2">
                  <SplitWords className="text-5xl md:text-7xl">.02</SplitWords>
                  <SplitWords className="text-2xl md:text-4xl ml-1">
                    Tu oferta de afiliado en EEUU la clica alguien desde Alemania.
                  </SplitWords>
                </p>
                <p className="font-bold italic text-light/60 text-lg md:text-xl mt-4">
                  <SplitWords>Comisión: $0.</SplitWords>
                </p>
              </div>
            </div>
          </div>

          {/* --- Slide 3: Mobile user --- */}
          <div className="h-slide flex-shrink-0 w-screen h-full flex items-center px-8 md:px-20 pt-24 md:pt-32">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-5xl mx-auto">
              <div className="anim-sticker flex-shrink-0">
                <Image
                  src="/mobile-sticker.png"
                  alt="Mobile sticker"
                  width={280}
                  height={280}
                  className="w-36 md:w-64 h-auto drop-shadow-2xl"
                />
              </div>
              <div>
                <p className="font-black italic text-light leading-none mb-2">
                  <SplitWords className="text-5xl md:text-7xl">.03</SplitWords>
                  <SplitWords className="text-2xl md:text-4xl ml-1">
                    Un usuario móvil aterriza en tu versión de escritorio.
                  </SplitWords>
                </p>
                <p className="font-bold italic text-light/60 text-lg md:text-xl mt-4">
                  <SplitWords>Se va antes de que cargue.</SplitWords>
                </p>
              </div>
            </div>
          </div>

          {/* --- Slide 4: Public link --- */}
          <div className="h-slide flex-shrink-0 w-screen h-full flex items-center px-8 md:px-20 pt-24 md:pt-32">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-5xl mx-auto">
              <div className="anim-sticker flex-shrink-0">
                <Image
                  src="/lock-sticker.png"
                  alt="Lock sticker"
                  width={280}
                  height={280}
                  className="w-32 md:w-56 h-auto drop-shadow-2xl"
                />
              </div>
              <div>
                <p className="font-black italic text-light leading-none mb-2">
                  <SplitWords className="text-5xl md:text-7xl">.04</SplitWords>
                  <SplitWords className="text-2xl md:text-4xl ml-1">
                    Compartes un link en público.
                  </SplitWords>
                </p>
                <p className="font-bold italic text-light/60 text-lg md:text-xl mt-4">
                  <SplitWords>Competidores, scrapers y curiosos se sirven solos.</SplitWords>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== STEPS SECTION ==================== */}
      <section ref={stepsSectionRef} className="bg-light min-h-screen flex flex-col items-center justify-center gap-12 py-16 px-6 md:px-20 relative overflow-x-clip">
        <div className="max-w-6xl mx-auto w-full">
          {/* Title */}
          <h2 className="steps-title text-3xl md:text-4xl font-black italic text-dark text-center leading-tight  md:mb-24">
            <SplitWords>Tres pasos. Cero código.</SplitWords>
          </h2>

          {/* Steps — vertical on mobile, horizontal on desktop */}
          <div className="flex flex-col md:flex-row md:items-stretch gap-16 md:gap-8 relative">
            {/* Step 1 */}
            <div className="step-card flex-1 relative bg-dark/5 rounded-2xl p-6">
              <div className="size-9 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                <TbClipboard size={22} className="text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-black italic text-dark mb-2">
                1. Pega tu enlace
              </h3>
              <p className="text-xs md:text-base text-dark/70 leading-relaxed">
                Da igual lo largo, feo o complicado que sea. Nosotros lo convertimos en un enlace <strong>inteligente</strong>.
              </p>
              {/* Arrow to step 2 */}
              <Image
                src="/green-arrow.svg"
                alt=""
                width={32}
                height={32}
                className="absolute hidden md:block rotate-90 w-46 md:-bottom-18 md:left-40 md:rotate-0 md:w-64"
              />
            </div>

            {/* Step 2 */}
            <div className="step-card flex-1 relative bg-dark/5 rounded-2xl p-6">
              <div className="size-9 rounded-full bg-warning/20 flex items-center justify-center mb-4">
                <TbAdjustmentsHorizontal size={22} className="text-warning" />
              </div>
              <h3 className="text-xl md:text-2xl font-black italic text-dark mb-2">
                2. Define las reglas
              </h3>
              <p className="text-xs md:text-base text-dark/70 leading-relaxed">
                País, dispositivo, VPN, bots, horario... Elige <strong>condiciones</strong>. Elige <strong>acciones</strong>. <strong>Combínalas</strong>.
              </p>
              {/* Arrow to step 3 */}
              <Image
                src="/yellow-arrow.svg"
                alt=""
                width={32}
                height={32}
                className="absolute hidden md:block rotate-90 w-46 md:-top-12 md:left-32 md:rotate-0 md:w-56"
              />
            </div>

            {/* Step 3 */}
            <div className="step-card flex-1 bg-dark/5 rounded-2xl p-6">
              <div className="size-9 rounded-full bg-secondary/15 flex items-center justify-center mb-4">
                <TbShare size={22} className="text-secondary" />
              </div>
              <h3 className="text-xl md:text-2xl font-black italic text-dark mb-2">
                3. Comparte y olvídate
              </h3>
              <p className="text-xs md:text-base text-dark/70 leading-relaxed">
                Un solo link que se <strong>adapta</strong> a cada visitante. Tú defines la lógica <strong>una vez</strong>. El link hace el trabajo <strong>siempre</strong>.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="steps-cta flex justify-center mt-16">
            <Button
              variant="outline"
              size="lg"
              rounded="3xl"
              leftIcon={<TbArrowUpRight size={24} strokeWidth={3} className="text-primary group-hover:text-dark transition-all duration-200" />}
              onClick={() => setCreateLinkDrawer(true)}
              className="group bg-primary/25 border-transparent hover:border-dark hover:shadow-[6px_6px_0_var(--color-dark)] hover:bg-primary font-black italic"
            >
              <span className="font-black italic">Pruébalo ahora &bull; ¡Sin cuenta!</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== USE CASES SECTION ==================== */}
      <section ref={useCasesSectionRef} className="bg-light min-h-screen flex flex-col items-center justify-center px-6 md:px-20 py-20 overflow-x-clip">
        {/* Title */}
        <h2 className="usecases-title text-3xl md:text-4xl font-black italic text-dark text-center leading-tight mb-12 md:mb-20">
          <SplitWords>Para quienes les importa a dónde van sus clics</SplitWords>
        </h2>

        {/* Cards — Mobile: horizontal scroll / Desktop: row with GSAP animation */}
        {/* Mobile */}
        <div className="md:hidden w-full overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6">
          <div className="flex gap-4 w-max">
            <UseCaseCard
              color="bg-primary"
              icon={TbMicrophone2}
              role="Creadora de contenido"
              name="Ana"
              description="Un solo link en su bio que manda a YouTube, Spotify o Amazon según lo que busca su seguidor."
              tagline="Menos fricción. Más conversiones."
            />
            <UseCaseCard
              color="bg-warning"
              icon={TbChartBar}
              role="Growth marketer"
              name="Carlos"
              description="Lanza campañas en 5 canales. Sabe exactamente cuál convierte y cuáles son bots."
              tagline="Datos reales. Decisiones reales."
            />
            <UseCaseCard
              color="bg-info"
              icon={TbShoppingBag}
              role="Dueña de ecommerce"
              name="Sofía"
              description="Móvil va a su app. Escritorio va a la web. Sin una línea de código extra."
              tagline="Un link. Dos experiencias."
            />
            <UseCaseCard
              color="bg-danger"
              icon={TbBriefcase}
              role="Freelancer"
              name="David"
              description="Manda su portfolio a un cliente. Sabe cuándo lo abren, desde dónde, y cuántas veces."
              tagline="Nunca más el «¿lo viste ya?»"
            />
            <UseCaseCard
              color="bg-secondary"
              icon={TbRocket}
              role="Indie hacker"
              name="Marta"
              description="Pone una fecha de expiración a su oferta de lanzamiento. Después el link redirige al precio normal."
              tagline="Urgencia real. Sin mentiras."
              light
            />
          </div>
        </div>

        {/* Desktop */}
        <div className="usecases-cards hidden md:flex flex-wrap gap-4 justify-center items-stretch">
          <UseCaseCard
            color="bg-primary"
            icon={TbMicrophone2}
            role="Creadora de contenido"
            name="Ana"
            description="Un solo link en su bio que manda a YouTube, Spotify o Amazon según lo que busca su seguidor."
            tagline="Menos fricción. Más conversiones."
          />
          <UseCaseCard
            color="bg-warning"
            icon={TbChartBar}
            role="Growth marketer"
            name="Carlos"
            description="Lanza campañas en 5 canales. Sabe exactamente cuál convierte y cuáles son bots."
            tagline="Datos reales. Decisiones reales."
          />
          <UseCaseCard
            color="bg-info"
            icon={TbShoppingBag}
            role="Dueña de ecommerce"
            name="Sofía"
            description="Móvil va a su app. Escritorio va a la web. Sin una línea de código extra."
            tagline="Un link. Dos experiencias."
          />
          <UseCaseCard
            color="bg-danger"
            icon={TbBriefcase}
            role="Freelancer"
            name="David"
            description="Manda su portfolio a un cliente. Sabe cuándo lo abren, desde dónde, y cuántas veces."
            tagline="Nunca más el «¿lo viste ya?»"
          />
          <UseCaseCard
            color="bg-secondary"
            icon={TbRocket}
            role="Indie hacker"
            name="Marta"
            description="Pone una fecha de expiración a su oferta de lanzamiento. Después el link redirige al precio normal."
            tagline="Urgencia real. Sin mentiras."
            light
          />
        </div>
      </section>

      {/* ==================== RULES SECTION ==================== */}
      <section ref={rulesSectionRef} className="bg-light min-h-screen flex flex-col items-center justify-center px-6 md:px-20 py-20">
        <div className="max-w-4xl mx-auto w-full text-center">
          {/* Title */}
          <h2 className="rules-title text-3xl md:text-4xl font-black italic text-dark leading-tight mb-4">
            <SplitWords>Si pasa esto, haz aquello. Para tus links.</SplitWords>
          </h2>

          {/* Subtitle */}
          <p className="rules-subtitle text-sm md:text-xl italic font-black text-dark/50 mb-16 md:mb-20 max-w-2xl mx-auto">
            Decide con 7 condiciones y 4 acciones qué hacer cuando tu enlace es visitado. Sin escribir una línea de código.
          </p>

          {/* Condiciones */}
          <div className="pill-group mb-10">
            <h3 className="font-black italic text-base text-dark mb-4 tracking-wide text-left md:text-center">Condiciones</h3>
            <div className="flex flex-wrap justify-center gap-3 relative">
              <RulePill icon={TbWorld} label="País" color="bg-primary text-dark" activePill={activePill} setActivePill={setActivePill} description="Actúa según el país del visitante" />
              <RulePill icon={TbDeviceMobile} label="Dispositivo" color="bg-warning text-dark" activePill={activePill} setActivePill={setActivePill} description="Decide según el tipo de dispositivo" />
              <RulePill icon={TbDots} label="IP" color="bg-info text-light border-dark" activePill={activePill} setActivePill={setActivePill} description="Filtra por dirección IP" />
              <RulePill icon={TbShieldLock} label="VPN" color="bg-secondary text-light border-dark" activePill={activePill} setActivePill={setActivePill} description="Detecta tráfico VPN o proxy" />
              <RulePill icon={TbClick} label="N. Clics" color="bg-info text-light border-dark" activePill={activePill} setActivePill={setActivePill} description="Limita por número de clics" />
              <RulePill icon={TbCalendar} label="Fecha" color="bg-primary text-dark" activePill={activePill} setActivePill={setActivePill} description="Decide según la fecha" />
              <RulePill icon={TbRobot} label="Bot" color="bg-danger text-light border-dark" activePill={activePill} setActivePill={setActivePill} description="Detectar bots" />
            </div>
          </div>

          {/* Acciones */}
          <div className="pill-group">
            <h3 className="font-black italic text-base text-dark mb-4 tracking-wide text-left md:text-center">Acciones</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <RulePill icon={TbArrowFork} label="Redirigir" color="bg-primary text-dark" activePill={activePill} setActivePill={setActivePill} description="Envía al usario a una URL" />
              <RulePill icon={TbForbid2} label="Bloquear" color="bg-danger text-light border-dark" activePill={activePill} setActivePill={setActivePill} description="Bloquea el acceso" />
              <RulePill icon={TbLock} label="Contraseña" color="bg-warning text-dark" activePill={activePill} setActivePill={setActivePill} description="Pide contraseña para acceder" />
              <RulePill icon={TbWebhook} label="Webhooks" color="bg-info text-light border-dark" activePill={activePill} setActivePill={setActivePill} description="Dispara un webhook" />
            </div>
          </div>

          {/* Hint */}
          <p className="text-sm text-dark/30 italic mt-12">
            Pulsa sobre cada una para descubrir qué hace
          </p>
        </div>
      </section>

      {/* ==================== BENTO SECTION ==================== */}
      <section ref={bentoSectionRef} className="bg-light min-h-screen flex flex-col items-center justify-center px-6 md:px-20 py-20">
        <div className="max-w-3xl mx-auto w-full">
          {/* Title */}
          <h2 className="bento-title text-3xl md:text-4xl font-black italic text-dark text-center leading-tight mb-12 md:mb-16">
            <SplitWords>Un enlace único, infinitas formas de conectar.</SplitWords>
          </h2>

          {/* Bento Grid */}
          <div className="bento-grid grid grid-cols-[repeat(3,100px)] auto-rows-[100px] md:grid-cols-[repeat(3,150px)] md:auto-rows-[150px] gap-2 justify-center">

            {/* A tu gusto — tall left */}
            <div className="bento-cell bg-primary rounded-3xl row-span-2 overflow-hidden relative">
              <h3 className="font-black mt-2 ml-2 italic text-sm md:text-2xl text-dark relative z-10">A tu gusto</h3>
              <Image
                src="/bento-image1.svg"
                alt="QR customization panel"
                width={300}
                height={400}
                className="absolute left-0 top-[20%] w-[90%] md:w-[80%]"
              />
              <Image
                src="/bento-image2.svg"
                alt="Rules panel"
                width={300}
                height={200}
                className="absolute right-0 bottom-2 md:bottom-8 w-[90%] md:w-[85%]"
              />
            </div>

            {/* Velocidad — top right */}
            <div className="bento-cell bg-info rounded-3xl p-4 col-span-2 overflow-hidden relative flex flex-col">
              <h3 className="font-black italic text-sm md:text-2xl text-light">Velocidad</h3>
              <div className="flex-1 w-full flex items-center justify-center gap-2 text-light">
                <span className="text-lg"><TbUser className="size-6 md:size-8" strokeWidth={2}/></span>
                <span className="line-through">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span className="font-black italic text-lg">&lt;50ms</span>
                <span className="line-through">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span className="text-lg"><TbAppWindow className="size-6 md:size-8" strokeWidth={2}/></span>
              </div>
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-6xl md:text-8xl font-black italic text-light/15 select-none">&lt;50ms</span>
            </div>

            {/* k. logo — center */}
            <div className="bento-cell bg-light rounded-3xl flex items-center justify-center">
              <span className="text-6xl font-black italic text-dark">k.</span>
            </div>

            {/* Organiza — right middle (folder shape via SVG mask) */}
            <div className="bento-cell relative overflow-hidden">
            
            <svg 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none" 
              className="absolute inset-0 w-full h-full" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M99.9,75.9 L99.7,35.4 C99.7,22.2 89,11.5 75.7,11.5 H61.7 C54.3,11.5 48.4,0 41,0 H24 C10.7,0 0,10.7 0,24 V76 C0,89.3 10.7,100 24,100 H75.9 C89.2,100 100,89.2 99.9,75.9 Z" 
                fill="#FC4736"
              />
            </svg>

              <div className="relative z-10 p-2 h-full flex flex-col gap-1 justify-center">
                <h3 className="font-black italic text-sm md:text-2xl text-light">Organiza</h3>
                <p className="text-xs md:text-base text-light">Con grupos y etiquetas</p>
              </div>
            </div>

            {/* De forma segura — bottom left wide */}
            <div className="bento-cell bg-warning rounded-3xl p-2 col-span-2 relative overflow-hidden">
              <h3 className="font-black italic text-sm md:text-2xl text-dark mb-1">De forma segura</h3>
              <p className="text-xs md:text-base text-dark">Tus datos siempre seguros con:</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-dark/15 text-dark text-xs font-black p-1 rounded-full">Cifrado</span>
                <span className="bg-dark/15 text-dark text-xs font-black p-1 rounded-full">OAuth</span>
              </div>
              <Image
                className="absolute -right-1/2 -bottom-1/2"
                src="/eclipses.svg"
                alt="Eclipses"
                width={300}
                height={300}
              />
            </div>

            {/* Código abierto — bottom right */}
            <div className="bento-cell bg-secondary/10 rounded-3xl p-2 relative overflow-hidden">
              <h3 className="font-black italic text-sm md:text-2xl text-secondary">Código abierto</h3>
              <p className="text-xs md:text-base text-secondary mt-1">Accede al código</p>
              <TbBrandGithub size={100} className="absolute -bottom-4 -right-6 -rotate-28 text-secondary/25" />
            </div>

          </div>
        </div>
      </section>

      {/* ==================== PRICING SECTION ==================== */}
      <section ref={pricingSectionRef} className="bg-light min-h-screen flex flex-col items-center justify-center px-6 md:px-20 py-20">
        <div className="max-w-4xl mx-auto w-full">
          {/* Title */}
          <h2 className="pricing-title text-3xl md:text-4xl font-black italic text-dark text-center leading-tight mb-8">
            <SplitWords>Empieza gratis, escala cuando quieras.</SplitWords>
          </h2>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-dark/5 rounded-full p-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-black italic transition-all duration-200 cursor-pointer ${
                  billingPeriod === "monthly"
                    ? "bg-dark text-light shadow-sm"
                    : "text-dark/60 hover:text-dark"
                }`}
              >
                <span className="font-black italic">Mensual</span>
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-5 py-2 rounded-full text-sm  transition-all duration-200 cursor-pointer ${
                  billingPeriod === "yearly"
                    ? "bg-dark text-light shadow-sm"
                    : "text-dark/60 hover:text-dark"
                }`}
              >
                <span className="font-black italic">Anual</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="pricing-cards flex flex-col md:flex-row gap-6 justify-center items-stretch">

            {/* STANDARD / Free */}
            <div className="pricing-card flex-1 max-w-md bg-dark/10 rounded-3xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm md:text-base font-black italic text-dark/50 uppercase tracking-wider mb-1">Invitado</p>
                <h3 className="text-3xl font-black italic text-dark mb-3">GRATIS</h3>
                <p className="text-xs md:text-sm text-dark/50 mb-6">
                  Para <strong>siempre</strong>, en serio. <strong>Sin tarjeta</strong>, sin cuenta si no quieres.
                </p>

                <p className="text-xs md:text-sm text-dark mb-3">Incluye:</p>
                <ul className="space-y-2 text-xs md:text-sm text-dark">
                  <li>● Hasta <strong>50</strong> links</li>
                  <li>● Links <strong>permanentes</strong></li>
                  <li>● <strong>3</strong> reglas por link</li>
                  <li>● <strong>2</strong> condiciones por regla</li>
                  <li>● Métricas de cada enlace</li>
                  <li>● Historial de últimos <strong>30 días</strong></li>
                  <li>● Slug personalizado</li>
                  <li>● Códigos QR</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <Button
                  variant="solid"
                  size="lg"
                  rounded="3xl"
                  onClick={() => setCreateLinkDrawer(true)}
                  className="flex-1 border-2 border-transparent hover:bg-transparent hover:text-dark hover:border-dark hover:shadow-[4px_4px_0_var(--color-dark)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] font-black italic"
                >
                  <span className="font-black italic">Empezar gratis</span>
                </Button>
              </div>
            </div>

            {/* PRO */}
            <div className="pricing-card flex-1 max-w-md bg-primary rounded-3xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm md:text-base font-black italic text-dark/50 uppercase tracking-wider mb-1">PRO</p>
                <h3 className="text-3xl font-black italic text-dark mb-3">
                  {billingPeriod === "monthly" ? "3.50€" : "2.90€"}
                  <span className="text-lg font-bold text-dark/50 ml-1">/mes</span>
                </h3>
                <p className="text-xs md:text-sm text-dark/50 mb-6">
                  Para cuando 50 links se queden cortos.
                </p>

                <p className="text-xs md:text-sm text-dark mb-3">Incluye:</p>
                <ul className="space-y-2 text-xs md:text-sm text-dark">
                  <li>● Todo lo de gratis</li>
                  <li>● Links <strong>ilimitados</strong></li>
                  <li>● Reglas <strong>ilimitadas</strong></li>
                  <li>● Condiciones <strong>ilimitadas</strong></li>
                  <li>● Historial completo <strong>sin límite</strong></li>
                  <li>● Soporte <strong>prioritario</strong></li>
                </ul>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <Button
                  variant="solid"
                  size="lg"
                  rounded="3xl"
                  onClick={handleUpgradePro}
                  className="flex-1 border-2 border-transparent hover:bg-transparent hover:text-dark hover:border-dark hover:shadow-[4px_4px_0_var(--color-dark)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] font-black italic"
                >
                  <span className="font-black italic">Hazte PRO</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
        <Button
          variant="ghost"
          size="md"
          rounded="3xl"
          onClick={() => { window.location.href = "/docs/plans"; }}
          className="mt-8"
        >
          ¿Tienes dudas sobre los planes?
        </Button>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section className="relative bg-light py-20 md:py-32 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black italic text-dark text-center mb-12">
            Respuestas rápidas
          </h2>

          <div className="flex flex-col gap-3">
            <FaqItem
              question="¿En qué se diferencia esto de Bitly?"
              answer="Bitly acorta URLs. Linkkk les da comportamiento. Puedes definir condiciones (país, dispositivo, VPN, bots, horario) y acciones (redirigir, bloquear, contraseña, webhook). Un link que hace cosas diferentes según quién haga clic."
            />
            <FaqItem
              question="¿Necesito saber programar?"
              answer="No. El motor de reglas es visual: selecciona condiciones, elige acciones, guarda. Si sabes rellenar un formulario, puedes usar Linkkk."
            />
            <FaqItem
              question="¿Qué tan rápidas son las redirecciones?"
              answer="Menos de 50 milisegundos. Tus visitantes no notan ningún retraso. Las redirecciones lentas matan conversiones — las nuestras no lo son."
            />
            <FaqItem
              question="¿Qué pasa si supero los límites de mi plan?"
              answer={<>Recibes un <strong>aviso</strong>. Los links existentes <strong>siguen funcionando</strong>. Nunca rompemos links activos. Puedes subir de plan cuando quieras.</>}
            />
            <FaqItem
              question="¿Y si Linkkk cierra?"
              answer="El código está en GitHub. Puedes auto-alojarlo. Y tus URLs de destino siempre funcionarán independientemente — solo las redirecciones dependen de nosotros, y las hemos diseñado para que puedas migrar si lo necesitas."
            />
            <FaqItem
              question="¿Están seguros mis datos?"
              answer="Contraseñas hasheadas con bcrypt. Datos cifrados. IPs anonimizadas para cumplir GDPR. No vendemos datos a nadie. Punto."
            />
            <FaqItem
              question="¿Puedo probar todo antes de pagar?"
              answer="Sí. El plan gratuito incluye reglas, analytics y QR. PRO solo quita límites. Incluso puedes probar como invitado sin dar tu email."
            />
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative bg-dark py-16 pb-24 md:py-24 px-6 overflow-hidden">
        {/* Decorative watermark */}
        <div className="absolute -bottom-3 md:-bottom-1/12 left-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-8xl md:text-[20rem] font-black italic text-light/[0.03] whitespace-nowrap leading-none">
            Linkkk.
          </span>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Logo */}
          <h2 className="text-4xl font-black italic text-light mb-12 md:mb-16">
            Linkkk.
          </h2>

          {/* Links grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16 mb-16 md:mb-24">
            {/* Producto */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black italic text-light mb-4">Producto</h3>
                <ul className="flex flex-col gap-2">
                  <li>
                    <Link href="/" className="text-sm text-light/60 hover:text-light transition-colors">
                      Comenzar
                    </Link>
                  </li>
                  <li>
                    <a href="/dashboard" className="text-sm text-light/60 hover:text-light transition-colors">
                      Panel
                    </a>
                  </li>
                </ul>
              </div>

              {/* Recursos */}
              <div>
                <h3 className="text-lg font-black italic text-light mb-4">Recursos</h3>
                <ul className="flex flex-col gap-2">
                  <li>
                    <a
                      href="https://github.com/akaAlvaroso/linkkk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-light/60 hover:text-light transition-colors"
                    >
                      Código fuente
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-black italic text-light mb-4">Legal</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <a href="/legal/privacy" className="text-sm text-light/60 hover:text-light transition-colors">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="/legal/terms" className="text-sm text-light/60 hover:text-light transition-colors">
                    Términos y Condiciones
                  </a>
                </li>
                <li>
                  <a href="/legal/cookies" className="text-sm text-light/60 hover:text-light transition-colors">
                    Política de Cookies
                  </a>
                </li>
                <li>
                  <a href="/legal/notice" className="text-sm text-light/60 hover:text-light transition-colors">
                    Aviso legal
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom credit */}
          <div className="flex justify-center">
            <p className="text-xs text-light/50">
              Hecho con{" "}
              <TbHeartFilled className="inline text-primary align-text-bottom" size={16} />
              {" "}por{" "}
              <a
                href="https://twitter.com/aka_alvaroso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline"
              >
                @aka_alvaroso
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Create Link Drawer */}
      <CreateLinkDrawer
        open={createLinkDrawer}
        onClose={() => setCreateLinkDrawer(false)}
      />
    </RouteGuard>
  );
}

