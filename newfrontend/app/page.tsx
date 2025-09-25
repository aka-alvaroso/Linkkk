"use client"
import RouteGuard from "./components/RouteGuard/RouteGuard";
import Navbar from "./components/Navbar/Navbar";

export default function Home() {
  return (
    <RouteGuard type="public" title="Linkkk - Home">
      <Navbar />
      <div className="mt-20 p-2 space-y-8 w-full md:max-w-3/4 md:mx-auto">
      </div>
    </RouteGuard>
  );
}
