"use client";

import { FcGoogle } from "react-icons/fc";
import Button from "@/app/components/ui/Button/Button";
import { useTranslations } from 'next-intl';

interface GoogleOAuthButtonProps {
  variant?: "login" | "register";
}

export default function GoogleOAuthButton({ variant = "login" }: GoogleOAuthButtonProps) {
  const t = useTranslations('Auth.OAuth');

  const handleGoogleAuth = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = 'http://localhost:4444/auth/oauth/google';
  };

  return (
    <Button
      variant="outline"
      size="lg"
      rounded="xl"
      onClick={handleGoogleAuth}
      leftIcon={<FcGoogle size={24} />}
      expandOnHover="icon"
      className="w-full transition-all duration-300 ease-in-out hover:bg-dark/5 border-2 border-dark/20 hover:border-dark hover:shadow-[_2px_2px_0_var(--color-dark)]"
    >
      <p className="font-bold">
        {variant === "login" ? t('signInWithGoogle') : t('signUpWithGoogle')}
      </p>
    </Button>
  );
}
