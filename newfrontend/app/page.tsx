"use client"
import ProtectedPage from "./components/ProtectedPage/ProtectedPage";
import Navbar from "./components/Navbar/Navbar";

export default function Home() {
  return (
    <ProtectedPage type="public" title="Linkkk - Home">
      <Navbar />
      <div className="mt-20 p-2 space-y-8 w-full md:max-w-3/4 md:mx-auto">
      </div>
    </ProtectedPage>
  );
}
