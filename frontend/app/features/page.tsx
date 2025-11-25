"use client";
import RouteGuard from "@/app/components/RouteGuard/RouteGuard";
import Navbar from "@/app/components/Navbar/Navbar";
import * as motion from "motion/react-client";
import {
  TbLink,
  TbChartBar,
  TbSettings,
  TbTags,
  TbUser,
  TbBolt,
  TbRocket,
  TbWorld,
  TbCode,
} from "react-icons/tb";
import Button from "@/app/components/ui/Button/Button";
import Link from "next/link";

export default function FeaturesPage() {
  return (
    <RouteGuard type="public" title="Features - Linkkk">
      <div className="min-h-screen">
        <Navbar />

      <main className="w-full px-4 pt-24 pb-16 md:py-24">
        <article className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 md:mb-24"
          >
            <div className="inline-block mb-6">
              <div className="bg-primary text-dark px-4 py-2 rounded-xl border-2 border-dark shadow-[3px_3px_0_var(--color-dark)]">
                <p className="font-black italic text-sm">FEATURES</p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black italic mb-6 leading-tight">
              More than just a link shortener
            </h1>

            <p className="text-lg md:text-xl text-dark/70 font-medium leading-relaxed">
              Linkkk gives you the tools to create, manage, and understand your links like never before.
              Here&apos;s everything you can do.
            </p>
          </motion.header>

          {/* Link Shortening */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-16 md:mb-20"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: "backOut" }}
              className="flex items-center gap-4 mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 bg-primary rounded-xl border-2 border-dark shadow-[3px_3px_0_var(--color-dark)] flex items-center justify-center"
              >
                <TbLink size={24} className="text-dark" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-black italic">Link Shortening</h2>
            </motion.div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg md:text-xl text-dark/80 font-medium leading-relaxed mb-4">
                At its core, Linkkk makes long, unwieldy URLs short and shareable. But we go beyond just shortening.
              </p>

              <p className="text-lg text-dark/70 leading-relaxed mb-4">
                You can create <strong className="text-dark">custom aliases</strong> for your links, making them memorable
                and on-brand. Instead of a random string like <code className="px-2 py-1 bg-dark/10 rounded text-sm">linkkk.dev/x7k9m</code>,
                you can have <code className="px-2 py-1 bg-dark/10 rounded text-sm">linkkk.dev/summer-sale</code> or <code className="px-2 py-1 bg-dark/10 rounded text-sm">linkkk.dev/portfolio</code>.
              </p>

              <p className="text-lg text-dark/70 leading-relaxed">
                Every URL is validated and sanitized automatically, so you never have to worry about broken links or security issues.
              </p>
            </div>
          </motion.section>

          {/* Link Management */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-16 md:mb-20"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: "backOut" }}
              className="flex items-center gap-4 mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 bg-primary rounded-xl border-2 border-dark shadow-[3px_3px_0_var(--color-dark)] flex items-center justify-center"
              >
                <TbSettings size={24} className="text-dark" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-black italic">Link Management</h2>
            </motion.div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg md:text-xl text-dark/80 font-medium leading-relaxed mb-4">
                Your links aren&apos;t set in stone. Change them, pause them, or delete them whenever you need to.
              </p>

              <p className="text-lg text-dark/70 leading-relaxed mb-4">
                Made a mistake in the destination URL? No problem. You can <strong className="text-dark">edit the long URL</strong> without
                changing your short link. Your audience keeps using the same short link, but it now points to the updated destination.
              </p>

              <p className="text-lg text-dark/70 leading-relaxed">
                Need to temporarily disable a link? <strong className="text-dark">Deactivate it</strong> with one click.
                The short link will show a friendly message instead of redirecting. Reactivate it just as easily when you&apos;re ready.
              </p>
            </div>
          </motion.section>

          {/* Analytics */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-16 md:mb-20"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: "backOut" }}
              className="flex items-center gap-4 mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 bg-primary rounded-xl border-2 border-dark shadow-[3px_3px_0_var(--color-dark)] flex items-center justify-center"
              >
                <TbChartBar size={24} className="text-dark" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-black italic">Access Analytics</h2>
            </motion.div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg md:text-xl text-dark/80 font-medium leading-relaxed mb-4">
                Know exactly who&apos;s clicking your links and where they&apos;re coming from.
              </p>

              <p className="text-lg text-dark/70 leading-relaxed mb-4">
                Every time someone clicks your link, we track detailed information: their <strong className="text-dark">country,
                region, and city</strong>, what <strong className="text-dark">device and browser</strong> they&apos;re using,
                and even what website referred them to your link.
              </p>

              <p className="text-lg text-dark/70 leading-relaxed mb-6">
                All this data is presented in a clean, easy-to-understand dashboard. You&apos;ll see patterns emerge: maybe most of your
                mobile traffic comes from Instagram, or your European audience prefers Firefox. Use these insights to optimize your
                marketing strategy.
              </p>

              <div className="bg-dark/5 border-2 border-dark/10 rounded-2xl p-6">
                <p className="text-base text-dark/70 italic mb-0">
                  &ldquo;I used to wonder where my traffic was coming from. Now I know exactly which platforms drive engagement,
                  and I can focus my efforts there.&rdquo; — Typical Linkkk user
                </p>
              </div>
            </div>
          </motion.section>

          {/* Link Rules */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-16 md:mb-20"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: "backOut" }}
              className="flex items-center gap-4 mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 bg-primary rounded-xl border-2 border-dark shadow-[3px_3px_0_var(--color-dark)] flex items-center justify-center"
              >
                <TbBolt size={24} className="text-dark" />
              </motion.div>
              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-black italic">Link Rules</h2>
                <motion.span
                  initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 10 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4, ease: "backOut" }}
                  className="absolute -top-3 -right-11 inline-block bg-primary text-dark text-xs px-2 py-1 rounded-full border border-dark font-black italic mt-1"
                >
                  NEW
                </motion.span>
              </div>
            </motion.div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg md:text-xl text-dark/80 font-medium leading-relaxed mb-4">
                This is where Linkkk becomes truly powerful. Link Rules let you create smart, conditional redirects based on
                who&apos;s clicking your link and where they&apos;re coming from.
              </p>

              <motion.h3
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="text-2xl font-black italic mt-8 mb-4"
              >
                How it works
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: "backOut" }}
                className="text-lg text-dark/70 leading-relaxed mb-4"
              >
                Think of rules like &ldquo;if this, then that&rdquo; statements. You set a <strong className="text-dark">condition</strong> (like
                &ldquo;if the user is on mobile&rdquo; or &ldquo;if they&apos;re from Spain&rdquo;), and then an <strong className="text-dark">action</strong> (like
                &ldquo;redirect to this specific URL&rdquo; or &ldquo;show a password gate&rdquo;).
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="bg-primary/15 rounded-2xl p-6 my-8 border-2 border-primary/20"
              >
                <p className="text-sm font-black italic text-dark/50 mb-3">EXAMPLE USE CASE</p>
                <p className="text-lg font-medium text-dark/90 mb-4">
                  You&apos;re running an international campaign. You want users from the US to see your English landing page,
                  users from Spain to see the Spanish version, and everyone else to see a generic page.
                </p>
                <p className="text-base text-dark/70">
                  <strong>Rule 1:</strong> If country = US → redirect to english-page.com<br />
                  <strong>Rule 2:</strong> If country = Spain → redirect to spanish-page.com<br />
                  <strong>Default:</strong> redirect to generic-page.com
                </p>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="text-2xl font-black italic mt-8 mb-4"
              >
                Available Conditions
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: "backOut" }}
                className="text-lg text-dark/70 leading-relaxed mb-6"
              >
                You can trigger rules based on any of these visitor characteristics:
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="bg-light border-2 border-dark rounded-2xl overflow-hidden mb-8"
              >
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark text-light">
                      <th className="text-left py-3 px-4 font-black italic">Condition</th>
                      <th className="text-left py-3 px-4 font-black italic">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                      className="border-b-2 border-dark/10 hover:bgtransition-colors"
                    >
                      <td className="py-3 px-4 font-black text-dark">Geographic Location</td>
                      <td className="py-3 px-4 text-dark/70">Match by country, region, or specific city</td>
                    </motion.tr>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                      className="border-b-2 border-dark/10 bg-dark/5 "
                    >
                      <td className="py-3 px-4 font-black text-dark">Device Type</td>
                      <td className="py-3 px-4 text-dark/70">Checks if the visitor is using a Mobile, Desktop, or Tablet</td>
                    </motion.tr>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                      className="border-b-2 border-dark/10 "
                    >
                      <td className="py-3 px-4 font-black text-dark">IP Address</td>
                      <td className="py-3 px-4 text-dark/70">Match an specific IP address</td>
                    </motion.tr>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                      className="border-b-2 border-dark/10 bg-dark/5 "
                    >
                      <td className="py-3 px-4 font-black text-dark">Is VPN</td>
                      <td className="py-3 px-4 text-dark/70">Checks if the visitor is using a VPN</td>
                    </motion.tr>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                      className="border-b-2 border-dark/10 "
                    >
                      <td className="py-3 px-4 font-black text-dark">Is Bot</td>
                      <td className="py-3 px-4 text-dark/70">Checks if the visitor is a robot</td>
                    </motion.tr>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
                      className="border-b-2 border-dark/10 bg-dark/5 "
                    >
                      <td className="py-3 px-4 font-black text-dark">Date & Time</td>
                      <td className="py-3 px-4 text-dark/70">Specific dates or time ranges</td>
                    </motion.tr>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                      className=""
                    >
                      <td className="py-3 px-4 font-black text-dark">Access Count</td>
                      <td className="py-3 px-4 text-dark/70">Compare the number of access to a specific link</td>
                    </motion.tr>
                  </tbody>
                </table>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="text-2xl font-black italic mt-8 mb-4"
              >
                Available Actions
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: "backOut" }}
                className="text-lg text-dark/70 leading-relaxed mb-6"
              >
                When a condition is met, you can choose what happens:
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="bg-light border-2 border-dark rounded-2xl overflow-hidden mb-8"
              >
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark text-light">
                      <th className="text-left py-3 px-4 font-black italic">Action</th>
                      <th className="text-left py-3 px-4 font-black italic">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                      className="border-b-2 border-dark/10 "
                    >
                      <td className="py-3 px-4 font-black text-dark whitespace-nowrap">Redirect to URL</td>
                      <td className="py-3 px-4 text-dark/70">Send visitors to a specific destination.</td>
                    </motion.tr>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                      className="border-b-2 border-dark/10 bg-dark/5"
                    >
                      <td className="py-3 px-4 font-black text-dark whitespace-nowrap">Block access</td>
                      <td className="py-3 px-4 text-dark/70">Block visitors to access the link. You can set block reason.</td>
                    </motion.tr>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                      className="border-b-2 border-dark/10 "
                    >
                      <td className="py-3 px-4 font-black text-dark whitespace-nowrap">Password Gate</td>
                      <td className="py-3 px-4 text-dark/70">Require a password before continue. You can set a specific password for each rule and give visitors a password hint.</td>
                    </motion.tr>
                    <motion.tr
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                      className="bg-dark/5"
                    >
                      <td className="py-3 px-4 font-black text-dark whitespace-nowrap">Notify</td>
                      <td className="py-3 px-4 text-dark/70">Notify via WebHook when a condition is met.</td>
                    </motion.tr>
                  </tbody>
                </table>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="text-lg text-dark/70 leading-relaxed mb-4"
              >
                <strong className="text-dark">You can combine multiple rules</strong> in a single link. For example:
                redirect to a URL <em>and</em> send a webhook notification at the same time.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: "backOut" }}
                className="text-lg text-dark/70 leading-relaxed mb-4"
              >
                Each rule can have <strong className="text-dark">multiple conditions</strong>. An &ldquo;else&rdquo; action can also be added in case the conditions are not met.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: "backOut" }}
                className="text-lg text-dark/70 leading-relaxed"
              >
                Rules are evaluated in order from top to bottom, and the <strong className="text-dark">first matching rule wins</strong>.
                This gives you precise control over exactly how your links behave in different scenarios.
              </motion.p>
            </div>
          </motion.section>

          {/* Coming Soon */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-16 md:mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="bg-primary/15 rounded-3xl p-8 md:p-12 border-2 border-primary/20"
            >
              <motion.h2
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className="text-2xl md:text-3xl font-black italic mb-6"
              >
                What&apos;s coming next
              </motion.h2>

              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -30 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TbLink size={24} className="text-dark/70" />
                    </motion.div>
                    <h3 className="text-2xl font-black italic">Custom Suffix</h3>
                    <span className="text-sm font-black italic text-dark/50">Q1 2025</span>
                  </div>
                  <p className="text-lg text-dark/70">
                    Customize the end of your short links with your own suffix. Make your links even more memorable and on-brand.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -30 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TbTags size={24} className="text-dark/70" />
                    </motion.div>
                    <h3 className="text-2xl font-black italic">Groups & Tags</h3>
                    <span className="text-sm font-black italic text-dark/50">Q2 2025</span>
                  </div>
                  <p className="text-lg text-dark/70">
                    Organize your links with groups, tags, and folders. Perfect for managing hundreds of links across multiple campaigns.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -30 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TbWorld size={24} className="text-dark/70" />
                    </motion.div>
                    <h3 className="text-2xl font-black italic">Custom Domains</h3>
                    <span className="text-sm font-black italic text-dark/50">Q2 2025</span>
                  </div>
                  <p className="text-lg text-dark/70">
                    Use your own domain for branded short links. Instead of linkkk.dev/abc, have yourbrand.com/abc.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -30 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TbUser size={24} className="text-dark/70" />
                    </motion.div>
                    <h3 className="text-2xl font-black italic">Bio Pages</h3>
                    <span className="text-sm font-black italic text-dark/50">Q3 2025</span>
                  </div>
                  <p className="text-lg text-dark/70">
                    Create beautiful link-in-bio pages with custom branding. One short link that showcases all your important links.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-primary text-dark p-8 md:p-12 rounded-3xl border-2 border-dark shadow-[8px_8px_0_var(--color-dark)]">
              <TbRocket size={48} className="mx-auto mb-6" />
              <h3 className="text-3xl md:text-4xl font-black italic mb-4">
                Ready to try Linkkk?
              </h3>
              <p className="text-lg md:text-xl mb-8 font-medium max-w-2xl mx-auto">
                Sign up for free and start creating smarter links in seconds. No credit card required.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    rounded="2xl"
                    className="bg-dark text-light hover:bg-primary hover:text-dark"
                  >
                    <span className="font-black italic">Get Started Free</span>
                  </Button>
                </Link>
                <a href="https://github.com/aka-alvaroso/linkkk" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="lg"
                    rounded="2xl"
                    className="border-2 border-dark"
                  >
                    <span className="font-black italic flex items-center gap-2">
                      <TbCode size={24} />
                      View on GitHub
                    </span>
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>

        </article>
      </main>
      </div>
    </RouteGuard>
  );
}
