import Link from "next/link";
import Button from "../ui/Button/Button";
import { useAuthStore } from "../../stores/authStore";
import Image from "next/image";

export default function DesktopNavbar() {
  const { user, logout } = useAuthStore();
  return (
    <div className="hidden max-w-3/4 mx-auto md:flex fixed top-2 left-0 right-0 z-50 bg-dark/5 items-center justify-between p-2 rounded-full">
        
        <Link href="/" className="ml-2 text-4xl font-black italic">
            k.
        </Link>

        <ul className="flex gap-4">
            <li>
                <Link href="/" className="hover:underline">Home</Link>
            </li>
            <li>
                <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            </li>
        </ul>

        {!user && (
            <div className="flex gap-2">
                <Button variant="outline" rounded="xl">
                    <Link href="/auth/login">Log In</Link>
                </Button>
                <Button variant="solid" rounded="xl">
                    <Link href="/auth/register">Sign Up</Link>
                </Button>
            </div>   
        )}
        {user && (
            <div className="relative border border-dark rounded-full size-11 overflow-hidden"
            onClick={logout}
            >
               <Image 
                src={"https://images.unsplash.com/photo-1758380742649-7c4063e670b9?q=80&w=684&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                alt="User avatar"
                fill
                className="object-cover"
               />
            </div>
        )}   
    </div>
  );
}