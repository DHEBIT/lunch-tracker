"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      // In prod you would not expose the link; for local/dev we show it.
      setMessage(data.resetLink ? `Reset link: ${data.resetLink}` : "If an account exists, you will receive a reset link.")
    } else {
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
        <p className="text-center text-sm text-gray-500 mb-6">Enter your account email to receive a reset link.</p>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
          {message ? (
            <p className="text-accent-aqua font-semibold text-center">{message}</p>
          ) : (
            <>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100 dark:placeholder-gray-500"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white rounded px-3 py-2 hover:bg-primary-dark font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Remembered your password?{" "}
                <Link href="/signin" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  )
}