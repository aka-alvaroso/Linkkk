"use client"
import { useState } from "react";
import { PiList } from "react-icons/pi";
import { AiOutlineClose } from "react-icons/ai";
import Link from "next/link";
import Button from "../ui/Button/Button";
import { useAuthStore } from "../../stores/authStore";

export default function MobileNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuthStore();
    
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

  return (
    <>
      <div className="md:hidden bg-light fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4">
          
          {/* Logo */}
          <Link href="/" className="text-5xl font-black italic leading-10">
              k.
          </Link>

          {/* Hamburger Menu */}
          <Button 
            onClick={toggleMenu}
            variant="ghost"
            iconOnly
            className="md:hidden"
            aria-label="Abrir menú de navegación"
          >
              <PiList size={24} />
          </Button>
        
          <div className={`absolute inset-0 w-screen h-screen bg-light ${isOpen ? 'block' : 'hidden'}`} >
            
            <Button 
                onClick={toggleMenu}
                variant="ghost"
                iconOnly
                className="md:hidden fixed top-5 right-5"
                aria-label="Abrir menú de navegación"
            >
                <AiOutlineClose size={24}/>
            </Button>

            <ul className="p-2 flex flex-col gap-4">
                <li className="text-5xl font-black italic">
                    <Link href="/">Home</Link>   
                </li>
                <li className="text-5xl font-black italic">
                    <Link href="/dashboard">Dashboard</Link>
                </li>
                <p className="text-2xl font-black italic mt-6 text-black/30">Auth</p>
                <li className="text-5xl font-black italic">
                    <Link href="/auth/login">Log In</Link>
                </li>
                <li className="text-5xl font-black italic">
                    <Link href="/auth/register">Sign Up</Link>
                </li>
                {user && (
                    <li className="text-5xl font-black italic">
                        <Button onClick={logout} variant="link" className="text-red-600 !p-0">Log Out</Button>
                    </li>
                )}
            </ul>

          </div>
      </div>

    </>
  );
}
