"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/menu")
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/menu" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-extrabold text-center mb-1">
          <span className="text-primary">HAPPY</span>{" "}
          <span className="text-accent-orange">HOUR</span>
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Lunch, sorted every week.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Sign In</h2>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100 dark:placeholder-gray-500"
            required
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100 dark:placeholder-gray-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l18 18" strokeLinecap="round" />
                  <path d="M10.6 10.6a2.5 2.5 0 003.4 3.4" strokeLinecap="round" />
                  <path d="M9.88 5.08A10.8 10.8 0 0112 5c4.5 0 8.3 2.6 10 7a12.7 12.7 0 01-2.3 3.7" strokeLinecap="round" />
                  <path d="M6.61 6.61A12.7 12.7 0 001.99 12c1.7 4.4 5.5 7 10 7 1.4 0 2.7-.2 3.9-.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white rounded px-3 py-2 hover:bg-primary-dark font-semibold transition-colors"
          >
            Log In
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
            <span className="text-xs text-gray-400 dark:text-gray-500">OR</span>
            <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-zinc-700 rounded px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.5 35.4 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.6 5.4C41.5 36.2 44 30.6 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}