import MobileNavigation from "../Navigation/MobileNavigation";
import DesktopNavbar from "./DesktopNavbar";

/**
 * Main Navbar component
 * Desktop: Always shows DesktopNavbar
 * Mobile: Intelligently switches between Hamburger (public) and Bottom Nav (private)
 */
export default function Navbar() {
  return (
    <>
      <MobileNavigation />
      <DesktopNavbar />
    </>
  );
}