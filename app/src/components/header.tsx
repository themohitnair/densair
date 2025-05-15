"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const hiddenRoutes = ["/auth", "/onboard"];
  if (hiddenRoutes.includes(pathname)) return null;

  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-background w-full border-b">
      {/* Tailwind container gives you responsive max-widths */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 
                      flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo scales up nicely */}
        <Link
          href={status === "authenticated" ? "/feed" : "/"}
          className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight"
        >
          densAIr
        </Link>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 
                        w-full sm:w-auto justify-center sm:justify-end">
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10">
                  <AvatarImage
                    src={session.user.image || ""}
                    alt={session.user.name || "User avatar"}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    signOut({ redirect: false }).then(() => router.push("/"));
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}