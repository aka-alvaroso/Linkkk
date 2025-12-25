"use client";
import Navigation from "@/app/components/Navigation/Navigation";
import Button from "../components/ui/Button/Button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TbArrowLeft } from "react-icons/tb";

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const t = useTranslations("Legal");
    return (
        <div className="min-h-screen bg-light text-dark">
            <Navigation />
            <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
                <div className="mb-8">
                    <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        rounded="2xl"
                        size="sm"
                        leftIcon={<TbArrowLeft className="size-4" />}
                        expandOnHover="icon"
                    >
                        <span>
                            {t("backToHome")}
                        </span>
                    </Button>
                </div>
                <div className="bg-white p-8 md:p-12 rounded-3xl border border-dark shadow-[8px_8px_0_var(--color-dark)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
