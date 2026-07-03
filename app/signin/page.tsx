"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100 dark:placeholder-gray-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-primary text-white rounded px-3 py-2 hover:bg-primary-dark font-semibold transition-colors"
          >
            Sign In
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