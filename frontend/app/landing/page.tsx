"use client"
import RouteGuard from "../components/RouteGuard/RouteGuard";
import Navbar from "../components/Navbar/Navbar";
import Button from "../components/ui/Button/Button";
import { useRouter } from "next/navigation";
import { TbRocket, TbChartBar, TbShield } from "react-icons/tb";
import * as motion from "motion/react-client"


export default function Landing() {
  const router = useRouter();

  return (
    <RouteGuard type="public" title="Linkkk - Shorten Your URLs">
      <Navbar />
      
    </RouteGuard>
  );
}
