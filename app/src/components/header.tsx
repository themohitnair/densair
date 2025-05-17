"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Menu, Moon, Sun, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const hiddenRoutes = ["/auth", "/onboard"]

  if (hiddenRoutes.includes(pathname)) return null

  const getInitials = () => {
    if (!session?.user?.name) return "U"
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="bg-background w-full border-b sticky top-0 z-50">
      {/* Desktop and tablet navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={status === "authenticated" ? "/feed" : "/"}
          className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight"
        >
          densAIr
        </Link>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="https://github.com/themohitnair/densair?tab=readme-ov-file#densair-"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || "User avatar"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
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
                    e.preventDefault()
                    signOut({ redirect: false }).then(() => router.push("/"))
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="lg">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 border-t bg-background">
          <div className="flex flex-col space-y-4">
            <Link
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark")
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </Button>

              {status === "authenticated" ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    signOut({ redirect: false }).then(() => {
                      router.push("/")
                      setMobileMenuOpen(false)
                    })
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <Button asChild size="sm" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}