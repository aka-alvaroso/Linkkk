"use client";
import RouteGuard from "../../components/RouteGuard/RouteGuard";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TbArrowLeft, TbLinkOff } from "react-icons/tb";
import Button from "@/app/components/ui/Button/Button";
import Input from "@/app/components/ui/Input/Input";
import { authService } from "@/app/services/api/authService";
import { useToast } from "@/app/hooks/useToast";
import { HttpError } from "@/app/utils/errors";

// Same rule the server enforces
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export default function ResetPassword() {
  const t = useTranslations("Auth.ResetPassword");
  const router = useRouter();
  const toast = useToast();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [invalidLink, setInvalidLink] = useState(!TOKEN_PATTERN.test(token));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);

    const weak = !PASSWORD_PATTERN.test(password);
    const mismatch = password !== confirm;
    setPasswordError(weak ? t("errorWeakPassword") : undefined);
    setConfirmError(!weak && mismatch ? t("errorMismatch") : undefined);
    if (weak || mismatch) return;

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success(t("successTitle"), { description: t("successBody") });
      router.push("/auth/login");
    } catch (err) {
      if (err instanceof HttpError && err.code === "INVALID_RESET_TOKEN") {
        setInvalidLink(true);
      } else if (err instanceof HttpError && err.code === "INVALID_DATA") {
        setPasswordError(t("errorWeakPassword"));
      } else if (err instanceof HttpError && err.statusCode === 429) {
        setFormError(t("errorTooManyRequests"));
      } else {
        setFormError(t("errorGeneric"));
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

          {invalidLink ? (
            <div role="alert" className="flex flex-col items-center text-center gap-3">
              <div className="size-16 rounded-full bg-warning border border-dark flex items-center justify-center">
                <TbLinkOff size={32} />
              </div>
              <h1 className="text-2xl font-black italic">{t("invalidTitle")}</h1>
              <p className="text-dark/70">{t("invalidBody")}</p>
              <Link href="/auth/forgot-password" className="w-full mt-2">
                <Button
                  variant="solid"
                  size="lg"
                  rounded="xl"
                  className="w-full hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                >
                  <span className="text-xl font-black italic">{t("requestNew")}</span>
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black italic mb-2">{t("title")}</h1>
              <p className="text-dark/70 mb-6">{t("description")}</p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Input
                  id="new-password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  autoFocus
                  label={t("passwordLabel")}
                  description={t("passwordHint")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(undefined);
                  }}
                  error={passwordError}
                  size="lg"
                  rounded="xl"
                />
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  label={t("confirmLabel")}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (confirmError) setConfirmError(undefined);
                  }}
                  error={confirmError}
                  size="lg"
                  rounded="xl"
                />

                <label className="flex items-center gap-3 min-h-11 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="size-5 accent-dark"
                  />
                  <span>{t("showPasswords")}</span>
                </label>

                {formError && (
                  <p role="alert" className="p-3 rounded-xl bg-danger/10 border border-danger text-sm font-medium">
                    {formError}
                  </p>
                )}

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
