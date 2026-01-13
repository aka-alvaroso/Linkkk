"use client";

import { FcGoogle } from "react-icons/fc";
import Button from "@/app/components/ui/Button/Button";
import { useTranslations } from 'next-intl';
import { API_CONFIG } from "@/app/config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;



export default function GoogleOAuthButton() {
  const t = useTranslations('Auth.OAuth');

  const handleGoogleAuth = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/oauth/google`;
  };

  return (
    <Button
      variant="outline"
      size="lg"
      rounded="xl"
      onClick={handleGoogleAuth}
      leftIcon={<FcGoogle size={24} />}
      expandOnHover="text"
      className="transition-all duration-300 ease-in-out hover:bg-dark/5 border border-dark/20 hover:border-dark hover:shadow-[_2px_2px_0_var(--color-dark)]"
    >
      <p className="leading-5">
        {t('google')}
      </p>
    </Button>
  );
}
