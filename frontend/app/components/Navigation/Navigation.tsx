import BottomNavbar from "./BottomNavbar";
import TopNavbar from "./TopNavbar";

/**
 * Main Navigation component
 * Renders both mobile and desktop navigation
 * Visibility controlled by Tailwind breakpoints:
 * - Mobile: BottomNavbar (visible < md)
 * - Desktop: TopNavbar (visible >= md)
 */
interface NavigationProps {
  showCreate?: boolean;
}

export default function Navigation({ showCreate = false }: NavigationProps) {
  return (
    <>
      {/* Mobile Navigation - Bottom Pill */}
      <BottomNavbar />

      {/* Desktop Navigation - Top Bar */}
      <TopNavbar showCreate={showCreate} />
    </>
  );
}
