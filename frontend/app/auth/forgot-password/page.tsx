"use client";
import RouteGuard from "../../components/RouteGuard/RouteGuard";
import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TbArrowLeft, TbMailCheck } from "react-icons/tb";
import Button from "@/app/components/ui/Button/Button";
import Input from "@/app/components/ui/Input/Input";
import { authService } from "@/app/services/api/authService";
import { HttpError } from "@/app/utils/errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const t = useTranslations("Auth.ForgotPassword");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value)) {
      setError(t("errorInvalidEmail"));
      return;
    }

    setError(undefined);
    setLoading(true);
    try {
      await authService.requestPasswordReset(value, locale);
      setSentTo(value);
    } catch (err) {
      if (err instanceof HttpError && err.statusCode === 429) {
        setError(t("errorTooManyRequests"));
      } else {
        setError(t("errorGeneric"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard type="public" title={`${t("title")} - Linkkk`}>
      <main className="w-full min-h-[calc(100dvh-10rem)] flex flex-col items-center justify-center p-2">
        <div className="text-dark bg-light p-6 md:p-8 w-11/12 md:w-3/4 max-w-xl mx-auto rounded-3xl">
          <p className="text-3xl font-black mb-6 italic text-center">Linkkk.</p>

          {sentTo ? (
            <div role="status" className="flex flex-col items-center text-center gap-3">
              <div className="size-16 rounded-full bg-primary border border-dark flex items-center justify-center">
                <TbMailCheck size={32} />
              </div>
              <h1 className="text-2xl font-black italic">{t("sentTitle")}</h1>
              <p className="text-dark/70">
                {t.rich("sentBody", {
                  email: sentTo,
                  b: (chunks) => <span className="font-bold text-dark break-all">{chunks}</span>,
                })}
              </p>
              <p className="text-sm text-dark/70">{t("sentHint")}</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black italic mb-2">{t("title")}</h1>
              <p className="text-dark/70 mb-6">{t("description")}</p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  label={t("emailLabel")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(undefined);
                  }}
                  error={error}
                  size="lg"
                  rounded="xl"
                />
                <Button
                  variant="solid"
                  size="lg"
                  rounded="xl"
                  type="submit"
                  loading={loading}
                  className="w-full transition-all duration-300 ease-in-out hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                >
                  <span className="text-xl font-black italic">{t("submit")}</span>
                </Button>
              </form>
            </>
          )}

          <div className="text-center mt-8">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 min-h-11 font-black italic underline"
            >
              <TbArrowLeft size={18} />
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}
