"use client"
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TbArrowLeft } from "react-icons/tb";

import { useAuth, useLinks } from "@/app/hooks";
import RouteGuard from "@/app/components/RouteGuard/RouteGuard";
import Navigation from "@/app/components/Navigation/Navigation";
import LinkEditor from "@/app/components/Drawer/LinkEditor";
import type { Link as LinkType } from "@/app/types";

export default function LinkDetailPage() {
  const t = useTranslations("EditLinkDrawer");
  const router = useRouter();
  const params = useParams<{ shortUrl: string }>();
  const shortUrl = decodeURIComponent(params.shortUrl);

  const { links, isLoading, fetchLinks } = useLinks();
  const { isAuthenticated, isGuest } = useAuth();

  useEffect(() => {
    if (isAuthenticated || isGuest) fetchLinks();
  }, [fetchLinks, isAuthenticated, isGuest]);

  const found = links.find((l) => l.shortUrl === shortUrl);

  // Keep showing the last known link while the list refetches after a save
  // (a renamed short URL briefly isn't in the store under its old name).
  const lastLink = useRef<LinkType | null>(null);
  if (found) lastLink.current = found;
  const link = found ?? (lastLink.current?.shortUrl === shortUrl ? lastLink.current : null);

  return (
    <RouteGuard type="guest-or-user" title={`${shortUrl} - Linkkk`}>
      <Navigation />

      <div className="relative p-2 md:p-4 md:mt-20 md:max-w-3/4 mx-auto flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-semibold text-dark/60 hover:text-dark w-fit"
        >
          <TbArrowLeft size={18} />
          {t("backToDashboard")}
        </Link>

        {link ? (
          <LinkEditor
            open
            variant="page"
            link={link}
            onClose={() => router.push("/dashboard")}
            onSaved={(newShortUrl) => {
              if (newShortUrl !== shortUrl) {
                router.replace(`/dashboard/links/${encodeURIComponent(newShortUrl)}`);
              }
            }}
          />
        ) : isLoading || links.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg font-black italic text-dark">{t("linkNotFound")}</p>
            <p className="text-sm text-dark/60">{t("linkNotFoundDesc")}</p>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
