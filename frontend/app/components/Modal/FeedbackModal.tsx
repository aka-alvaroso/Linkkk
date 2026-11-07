"use client";

import { useState } from "react";
import Modal from "@/app/components/ui/Modal/Modal";
import Button from "@/app/components/ui/Button/Button";
import { authService } from "@/app/services";
import { useToast } from "@/app/hooks/useToast";
import { useTranslations } from "next-intl";
import { TbMail, TbSend } from "react-icons/tb";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const t = useTranslations("Feedback");
  const toast = useToast();

  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);

  const hasText = message.trim().length > 0;

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await authService.sendFeedback({ message: trimmed, anonymous });
      toast.success(t("success"));
      setMessage("");
      onClose();
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
    <Modal open={open} onClose={onClose} size="md" className="p-6">
      <h3 className="font-black text-dark text-xl italic leading-6 pr-10">
        {t("title")}
      </h3>
      <p className="text-dark/65 text-sm mt-2 mb-4 leading-relaxed">
        {t("description")}
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("placeholder")}
        rows={4}
        maxLength={1000}
        aria-label={t("title")}
        className="w-full text-sm bg-dark/5 border-2 border-transparent focus:border-dark rounded-xl p-3 resize-none focus:outline-none transition-colors placeholder:text-dark/50"
      />

      <label className="flex items-center gap-2 mt-3 cursor-pointer group w-fit">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="w-4 h-4 cursor-pointer accent-dark"
        />
        <span className="text-sm text-dark/60 group-hover:text-dark transition-colors">
          {t("anonymous")}
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <a
          href="mailto:help@linkkk.dev"
          className="flex items-center gap-2 text-sm font-bold text-dark hover:underline underline-offset-2"
        >
          <TbMail size={16} />
          {t("emailButton")}
        </a>
        <Button
          variant="solid"
          size="md"
          rounded="xl"
          leftIcon={<TbSend size={18} />}
          onClick={handleSend}
          disabled={!hasText || sending}
          className="bg-primary text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
        >
          {sending ? t("sending") : t("send")}
        </Button>
      </div>
    </Modal>
  );
}
