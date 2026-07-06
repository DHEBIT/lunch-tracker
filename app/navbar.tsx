"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import ThemeToggle from "./theme-toggle"
import NotificationBell from "./notification-bell"

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  if (status === "loading") return null
  if (!session?.user) return null
  if (pathname === "/signin" || pathname === "/signup") return null

  const isAdmin = (session.user as any).role === "ADMIN"

  const linkClass = (href: string) =>
    `relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
      pathname === href
        ? "bg-white text-primary shadow-sm"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`

  const mobileLinkClass = (href: string) =>
    `block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      pathname === href
        ? "bg-white text-primary"
        : "text-white/90 hover:bg-white/10"
    }`

  const initials = (session.user.name || session.user.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const links = (
    <>
      <Link href="/menu" className={linkClass("/menu")} onClick={() => setMenuOpen(false)}>
        Menu
      </Link>
      {isAdmin && (
        <>
          <Link href="/admin/menu" className={linkClass("/admin/menu")} onClick={() => setMenuOpen(false)}>
            Upload Menu
          </Link>
          <Link href="/admin/orders" className={linkClass("/admin/orders")} onClick={() => setMenuOpen(false)}>
            Orders
          </Link>
          <Link href="/admin/caterer" className={linkClass("/admin/caterer")} onClick={() => setMenuOpen(false)}>
            Caterer Sheet
            <Link href="/admin/employees" className={linkClass("/admin/employees")} onClick={() => setMenuOpen(false)}>
              Employees
               </Link>
          </Link>
        </>
      )}
    </>
  )

  const mobileLinks = (
    <>
      <Link href="/menu" className={mobileLinkClass("/menu")} onClick={() => setMenuOpen(false)}>
        Menu
      </Link>
      {isAdmin && (
        <>
          <Link href="/admin/menu" className={mobileLinkClass("/admin/menu")} onClick={() => setMenuOpen(false)}>
            Upload Menu
          </Link>
          <Link href="/admin/orders" className={mobileLinkClass("/admin/orders")} onClick={() => setMenuOpen(false)}>
            Orders
          </Link>
          <Link href="/admin/caterer" className={mobileLinkClass("/admin/caterer")} onClick={() => setMenuOpen(false)}>
            Caterer Sheet
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="sticky top-0 z-20 bg-primary shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-2 h-16">
        {/* Logo */}
        <Link href="/menu" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white text-sm font-black backdrop-blur-sm">
            H
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            HAPPY <span className="text-accent-gold">HOUR</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">{links}</div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <div className="text-white [&_button]:text-white/90 [&_button:hover]:text-white [&_button:hover]:bg-white/10">
            <ThemeToggle />
          </div>
          <div className="text-white [&_button]:text-white/90 [&_button:hover]:text-white [&_button:hover]:bg-white/10">
            <NotificationBell />
          </div>

          {/* User chip - desktop only */}
          <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-white/20">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">
              {initials}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="text-xs font-semibold text-white/80 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Brand accent stripe */}
      <div className="h-0.75 w-full bg-linear-to-r from-accent-orange via-accent-gold to-accent-aqua" />

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1 bg-primary-dark">
          {mobileLinks}
          <div className="pt-3 mt-2 border-t border-white/10 flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-xs font-bold shrink-0 backdrop-blur-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="text-xs font-semibold text-white/80 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}