"use client"
import { usePathname } from "next/navigation";
import MobileNavbar from "../Navbar/MobileNavbar";
import MobileBottomNav from "./MobileBottomNav";

/**
 * Smart mobile navigation component
 * Shows Navbar for public pages, Bottom Nav for private pages
 */
export default function MobileNavigation() {
  const pathname = usePathname();

  // Private pages that use Bottom Navigation
  const privatePages = ["/dashboard", "/profile"];
  const isPrivatePage = privatePages.some((page) => pathname.startsWith(page));

  return isPrivatePage ? <MobileBottomNav /> : <MobileNavbar />;
}
