"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push("/signin"), 2000)
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
        <p className="text-center text-sm text-gray-500 mb-6">Set a new password</p>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
          {success ? (
            <p className="text-accent-aqua font-semibold text-center">Password updated! Redirecting to sign in…</p>
          ) : !token ? (
            <p className="text-red-500 text-sm">
              This reset link is invalid. Please request a new one from {" "}
              <Link href="/forgot-password" className="underline">here</Link>.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100 dark:placeholder-gray-500"
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100 dark:placeholder-gray-500"
                required
                minLength={6}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white rounded px-3 py-2 hover:bg-primary-dark font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
