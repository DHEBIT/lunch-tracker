"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, department }),
    })

    if (res.ok) {
      router.push("/signin")
    } else {
      const data = await res.json()
      setError(data.error || "Something went wrong")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-extrabold text-center mb-1">
          <span className="text-primary">HAPPY</span>{" "}
          <span className="text-accent-orange">HOUR</span>
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Create your account to get started, or sign in if you already have one.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create Your Account</h2>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100 dark:placeholder-gray-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100 dark:placeholder-gray-500"
            required
          />
          <input
            type="text"
            placeholder="Department (e.g. Finance, Underwriting)"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100 dark:placeholder-gray-500"
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
            Sign Up
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}