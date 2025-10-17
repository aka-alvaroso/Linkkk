"use client";
import Navbar from "@/app/components/Navbar/Navbar";
import * as motion from "motion/react-client";
import {
  TbLink,
  TbChartBar,
  TbSettings,
  TbTags,
  TbApi,
  TbUser,
  TbBolt,
  TbClock,
  TbCheck,
  TbStar,
  TbRocket,
} from "react-icons/tb";
import Button from "@/app/components/ui/Button/Button";
import Link from "next/link";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "live" | "soon";
  quarter?: string;
}

const liveFeatures: Feature[] = [
  {
    icon: <TbLink size={32} />,
    title: "Link Shortening",
    description: "Create short, memorable links in seconds.",
    status: "live",
  },
  {
    icon: <TbChartBar size={32} />,
    title: "Access Analytics",
    description: "Track every click with detailed analytics. See IPs, locations, browsers, and more.",
    status: "live",
  },
  {
    icon: <TbSettings size={32} />,
    title: "Link Management",
    description: "Edit, activate, deactivate, or delete your links anytime.",
    status: "live",
  },
];

const upcomingFeatures: Feature[] = [
  {
    icon: <TbTags size={32} />,
    title: "Groups & Tags",
    description: "Organize your links with groups and tags for better management.",
    status: "soon",
    quarter: "Q1 2025",
  },
  {
    icon: <TbBolt size={32} />,
    title: "Link Rules",
    description: "Advanced routing with conditions, A/B testing, smart redirects, protection, and more.",
    status: "soon",
    quarter: "Q2 2025",
  },
  {
    icon: <TbApi size={32} />,
    title: "Developer API",
    description: "Full REST API for programmatic link management and analytics.",
    status: "soon",
    quarter: "Q2 2025",
  },
  {
    icon: <TbUser size={32} />,
    title: "Bio Pages",
    description: "Create your own link-in-bio page with custom branding.",
    status: "soon",
    quarter: "Q3 2025",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="w-full px-4 py-24">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
              className="inline-block mb-6"
            >
              <div className="bg-primary text-dark px-6 py-3 rounded-2xl border border-dark shadow-[4px_4px_0_var(--color-dark)] transform -rotate-2">
                <p className="font-black italic text-xl flex items-center gap-2">
                  <TbRocket size={24} />
                  Features & Roadmap
                </p>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
              className="text-5xl md:text-7xl font-black italic mb-6"
            >
              What&apos;s Now &{" "}
              <span className="text-primary text-shadow-[6px_6px_0_var(--color-dark)]">
                What&apos;s Next
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "backOut" }}
              className="text-xl md:text-2xl text-light/70 max-w-3xl mx-auto font-medium"
            >
              Building the most powerful link management platform, one feature at a time.
            </motion.p>
          </motion.div>

          {/* Live Features */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "backOut" }}
            className="mb-24"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <motion.div 
                initial={{ opacity: 0.5, scale: 0.8}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 1, ease: "backInOut", repeat: Infinity, repeatType: "reverse"}}

                  className="w-4 h-4 bg-primary shadow-[2px_2px_0_var(--color-dark)] rounded-full animate-pulse"></motion.div>

                <h2 className="text-4xl font-black italic">Live Now</h2>
              </div>
              <div className="flex-1 h-1 bg-dark/20 rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {liveFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4, ease: "backOut" }}
                  className="bg-light text-dark p-6 rounded-3xl border-2 border-dark shadow-[8px_8px_0_var(--color-dark)] hover:shadow-[12px_12px_0_var(--color-dark)] hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl border border-dark shadow-[2px_2px_0_var(--color-dark)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <div className="bg-primary text-dark px-3 py-1 rounded-full border border-dark shadow-[2px_2px_0_var(--color-dark)] flex items-center gap-1">
                      <TbCheck size={16} />
                      <span className="text-xs font-black italic">LIVE</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black italic mb-3">{feature.title}</h3>
                  <p className="text-dark/70 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="text-center mt-8"
            >
              <Link href="/auth/register">
                <Button
                  size="lg"
                  rounded="xl"
                  className="bg-primary border text-dark hover:bg-primary hover:text-dark hover:shadow-[6px_6px_0_var(--color-dark)] hover:-translate-y-1 transition-all"
                >
                  <p className="font-black italic text-xl flex items-center gap-2">
                    <TbRocket size={24} />
                    Start Using Now - It&apos;s Free
                  </p>
                </Button>
              </Link>
            </motion.div>
          </motion.section>

          {/* Coming Soon Features */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "backOut" }}
            className="mb-24"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-warning shadow-[2px_2px_0_var(--color-dark)] rounded-full"></div>
                <h2 className="text-4xl font-black italic">Coming Soon</h2>
              </div>
              <div className="flex-1 h-1 bg-dark/20 rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {upcomingFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4, ease: "backOut" }}
                  className="bg-dark/5 backdrop-blur-sm text-dark p-6 rounded-3xl border-2 border-dark/10 hover:border-warning transition-all group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-warning/15 border border-warning/30 text-dark/50 rounded-2xl flex items-center justify-center group-hover:text-warning group-hover:bg-warning/25 group-hover:border-warning transition-all">
                        {feature.icon}
                      </div>
                      <div className="bg-warning text-dark px-3 py-1 rounded-full border border-dark shadow-[2px_2px_0_var(--color-dark)] flex items-center gap-1">
                        <TbClock size={16} />
                        <span className="text-xs font-black italic">{feature.quarter}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black italic mb-3">{feature.title}</h3>
                    <p className="font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-primary text-dark p-8 rounded-3xl border-2 border-dark shadow-[12px_12px_0_var(--color-dark)]">
              <h3 className="text-3xl font-black italic mb-4">
                Want to influence our roadmap?
              </h3>
              <p className="text-xl mb-6 font-medium">
                Share your ideas and vote on features in our{" "}
                <a
                  href="https://github.com/yourusername/linkkk/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-black hover:opacity-80 transition-opacity"
                >
                  GitHub Discussions
                </a>
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    rounded="xl"
                    className="bg-dark hover:bg-dark text-light hover:shadow-[6px_6px_0_var(--color-dark)] transition-all"
                  >
                    <p className="font-black italic">Get Started Free</p>
                  </Button>
                </Link>
                <a href="https://github.com/anthropics/linkkk" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="lg"
                    rounded="xl"
                    className="border border-dark hover:bg-dark hover:text-light transition-all"
                  >
                    <p className="font-black italic">View on GitHub</p>
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
