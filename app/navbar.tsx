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
    `block px-3 py-2 rounded font-medium transition-colors ${
      pathname === href
        ? "bg-primary text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`

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
          <Link href="/admin/caterer" className={linkClass("/admin/caterer")}>
           Caterer Sheet
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <Link href="/menu" className="text-xl font-extrabold">
          <span className="text-primary">HAPPY</span>{" "}
          <span className="text-accent-orange">HOUR</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">{links}</div>
          <ThemeToggle />
          <NotificationBell />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-zinc-800 px-4 py-3 space-y-1">
          {links}
          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-zinc-800">
            <p className="px-3 text-sm text-gray-500 dark:text-gray-400 mb-1">{session.user.name}</p>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="w-full text-left px-3 py-2 rounded font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}