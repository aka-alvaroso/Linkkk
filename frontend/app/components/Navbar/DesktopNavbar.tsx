import { useState } from "react";
import Link from "next/link";
import Button from "../ui/Button/Button";
import CreateLinkDrawer from "../Drawer/CreateLinkDrawer";
import { useAuthStore } from "../../stores/authStore";
import { TbExternalLink, TbPlus } from "react-icons/tb";

export default function DesktopNavbar() {
  const { user, logout } = useAuthStore();
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);


  return (
    <div className="hidden md:flex max-w-3/4 mx-auto fixed gap-4 top-2 left-0 right-0 z-50 p-2 rounded-2xl ">
        
        <Link href="/" className="ml-2 text-5xl font-black italic">
            <span
                className="
                transition-all duration-300 ease-in-out
                hover:text-primary
                hover:text-shadow-[2px_2px_0_var(--color-light),_4px_4px_0_var(--color-dark)]"
            >
                k.
            </span>
        
        </Link>
        
        <div className="flex gap-4 items-center rounded-2xl flex-1 p-2">
            <Button
                variant="solid"
                size="sm"
                rounded="xl"
                className="hover:bg-primary hover:text-dark hover:shadow-[2px_2px_0_var(--color-light),_4px_4px_0_var(--color-dark)]"
                leftIcon={<TbPlus size={18} className="" />}
                onClick={() => {setCreateLinkDrawer(true)}}
            >
                <p className="font-black italic">Create</p>
            </Button>


            {/* Options */}
            {/*
                Home | Features | Blog | Docs 
            */}
            <div className="flex gap-4">
                <Link href="/" className="relative group">
                    <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                    {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full size-1
                      shadow-[0_0_20px_12px_var(--color-primary)] bg-primary z-10
                      scale-0 group-hover:scale-100 transition-all duration-300 ease-in-out" /> */}
                    <p className="font-black italic z-20 relative">Home</p>
                </Link>
                
                <Link href="/features" className="relative group">
                    <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                    {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full size-1
                      shadow-[0_0_20px_12px_var(--color-primary)] bg-primary z-10
                      scale-0 group-hover:scale-100 transition-all duration-300 ease-in-out" /> */}
                    <p className="font-black italic z-20 relative">Features</p>
                </Link>

                
                <Link href="/blog" className="relative group">
                    <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                    {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full size-1
                      shadow-[0_0_20px_12px_var(--color-primary)] bg-primary z-10
                      scale-0 group-hover:scale-100 transition-all duration-300 ease-in-out" /> */}
                    <p className="font-black italic z-20 relative">Blog</p>
                </Link>

                <Link href="/docs" className="relative group">
                    <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                    {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full size-1
                      shadow-[0_0_20px_12px_var(--color-primary)] bg-primary z-10
                      scale-0 group-hover:scale-100 transition-all duration-300 ease-in-out" /> */}
                    <p className="font-black italic z-20 relative">Docs</p>
                </Link>
            </div>

        </div>
        <div className="flex items-center gap-2">

            {
                user ? (
                    <Button
                        variant="solid"
                        size="sm"
                        rounded="xl"
                        className="hover:bg-primary hover:text-dark hover:shadow-[2px_2px_0_var(--color-light),_4px_4px_0_var(--color-dark)]"
                        rightIcon={<TbExternalLink size={18} />}
                        onClick={() => {
                            window.location.href = `/profile`;
                        }}
                    >
                        <p className="font-black italic">
                            {user.username}
                        </p>
                    </Button>
                ) : (
                    <Button
                        variant="solid"
                        size="sm"
                        rounded="xl"
                        className="hover:bg-primary hover:text-dark hover:shadow-[2px_2px_0_var(--color-light),_4px_4px_0_var(--color-dark)]"
                        onClick={() => {
                            window.location.href = `/login`;
                        }}
                    >
                        <p className="font-black italic">Get full access</p>
                    </Button>
                )
            }

        </div>
            

        <CreateLinkDrawer open={createLinkDrawer} onClose={() => setCreateLinkDrawer(false)} />
    </div>
  );
}