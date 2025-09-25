"use client"
import { useState } from "react";
import { PiList } from "react-icons/pi";
import { AiOutlineClose } from "react-icons/ai";
import Link from "next/link";
import Button from "../ui/Button/Button";
import { useAuthStore } from "../../stores/authStore";

export default function MobileNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, isAuthenticated } = useAuthStore();
    
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

  return (
    <>
      <div className="md:hidden bg-light fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4">
          
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="text-5xl font-black italic leading-10">
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

            {
            isAuthenticated ? (
                <ul className="p-2 flex flex-col">
                <li className="text-5xl font-black italic mb-4">
                    <Link href="/dashboard">Home</Link>   
                </li>
                <p className="text-2xl font-black italic mt-6 text-black/30">Auth</p>
                <li className="text-5xl font-black italic mb-4">
                    <Link href="/profile">Profile</Link>
                </li>
                <li className="text-5xl font-black italic mb-4">
                    <Button onClick={logout} variant="link" className="!p-0">
                        <p className="text-danger">Log Out</p>
                    </Button>
                </li>
            </ul>
            ) : (
                <ul className="p-2 flex flex-col">
                <li className="text-5xl font-black italic mb-4">
                    <Link href="/">Home</Link>   
                </li>
                <li className="text-5xl font-black italic mb-4">
                    <Link href="/features">Features</Link>
                </li>
                <p className="text-2xl font-black italic mt-6 text-black/30">Auth</p>
                <li className="text-5xl font-black italic mb-4">
                    <Link href="/auth/login">Log In</Link>
                </li>
                <li className="text-5xl font-black italic mb-4">
                    <Link href="/auth/register">Sign Up</Link>
                </li>
            </ul>
            )}

          </div>
      </div>

    </>
  );
}
