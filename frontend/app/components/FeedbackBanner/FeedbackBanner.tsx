"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { useAuthStore } from "@/app/stores/authStore";
import { authService } from "@/app/services";
import { useToast } from "@/app/hooks/useToast";
import { useTranslations } from "next-intl";
import { TbX, TbMail, TbSend } from "react-icons/tb";

export default function FeedbackBanner() {
  const { isAuthenticated, sessionChecked } = useAuthStore();
  const t = useTranslations("Feedback");
  const toast = useToast();

  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);

  if (!sessionChecked || !isAuthenticated) return null;

  const hasText = message.trim().length > 0;

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await authService.sendFeedback({ message: trimmed, anonymous });
      toast.success(t("success"));
      setMessage("");
      setVisible(false);
    } catch {
      toast.error(t("error"));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && hasText) {
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ type: "spring", stiffness: 320, damping: 28, delay: 1.2 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-40 md:w-md bg-warning rounded-2xl border-2 border-dark shadow-[4px_4px_0_var(--color-dark)] p-5"
        >
          {/* Close */}
          <button
            onClick={() => setVisible(false)}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-dark/10 transition-colors"
            aria-label="Cerrar"
          >
            <TbX size={18} />
          </button>

          {/* Title */}
          <h3 className="font-black text-dark text-base italic leading-5 pr-7">
            {t("title")}
          </h3>

          {/* Description */}
          <p className="text-dark/65 text-xs mt-1 mb-3 leading-relaxed">
            {t("description")}
          </p>

          {/* Input row */}
          <div className="flex gap-2 items-end">
            <motion.textarea
              layout
              transition={{ duration: 0.18, ease: "easeOut" }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder")}
              rows={2}
              maxLength={1000}
              className="flex-1 text-xs bg-dark/10 border-2 border-transparent focus:border-dark rounded-xl p-2 resize-none focus:outline-none transition-colors placeholder:text-dark/40"
            />
            <AnimatePresence>
              {hasText && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onClick={handleSend}
                  disabled={sending}
                  className="bg-dark text-warning p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 shrink-0"
                  title="Cmd+Enter"
                >
                  <TbSend size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Anonymous checkbox */}
          <label className="flex items-center gap-2 mt-2.5 cursor-pointer group w-fit">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-3.5 h-3.5 cursor-pointer accent-dark"
            />
            <span className="text-xs text-dark/60 group-hover:text-dark transition-colors">
              {t("anonymous")}
            </span>
          </label>

          {/* Email button */}
          <a
            href="mailto:help@linkkk.dev"
            className="flex items-center gap-2 text-xs font-bold text-dark border-2 border-dark rounded-xl px-3 py-2 hover:bg-dark hover:text-warning transition-all duration-200 w-fit mt-3"
          >
            <TbMail size={15} />
            {t("emailButton")}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
