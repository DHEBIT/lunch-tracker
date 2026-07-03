"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const DAY_ACCENTS: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  Monday:    { border: "border-l-primary",       bg: "bg-primary",       text: "text-primary",       ring: "ring-primary" },
  Tuesday:   { border: "border-l-accent-orange",  bg: "bg-accent-orange", text: "text-accent-orange", ring: "ring-accent-orange" },
  Wednesday: { border: "border-l-accent-gold",    bg: "bg-accent-gold",   text: "text-accent-gold",   ring: "ring-accent-gold" },
  Thursday:  { border: "border-l-accent-aqua",    bg: "bg-accent-aqua",   text: "text-accent-aqua",   ring: "ring-accent-aqua" },
  Friday:    { border: "border-l-primary-light",  bg: "bg-primary-light", text: "text-primary-light", ring: "ring-primary-light" },
}

function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function MenuForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [resetting, setResetting] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  const monday = getMonday(new Date())

  const [options, setOptions] = useState(
    DAYS.map(() => ({ optionA: "", optionB: "" }))
  )

  const filledDays = options.filter((d) => d.optionA.trim() || d.optionB.trim()).length
  const fullyFilledDays = options.filter((d) => d.optionA.trim() && d.optionB.trim()).length
  const progressPct = Math.round((filledDays / DAYS.length) * 100)

  function updateOption(dayIndex: number, field: "optionA" | "optionB", value: string) {
    const updated = [...options]
    updated[dayIndex][field] = value
    setOptions(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    const items = options.flatMap((day, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)

      const entries = []
      if (day.optionA.trim()) {
        entries.push({ name: day.optionA, date: date.toISOString(), optionLabel: "Option A" })
      }
      if (day.optionB.trim()) {
        entries.push({ name: day.optionB, date: date.toISOString(), optionLabel: "Option B" })
      }
      return entries
    })

    const res = await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })

    setLoading(false)

    if (res.ok) {
      setSuccess(true)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Something went wrong")
    }
  }

  async function handleReset() {
    setResetting(true)
    setResetMessage("")

    const res = await fetch("/api/admin/menu/reset", { method: "POST" })

    setResetting(false)
    setConfirmingReset(false)

    if (res.ok) {
      setResetMessage("This week's menu and any orders for it were cleared.")
      setOptions(DAYS.map(() => ({ optionA: "", optionB: "" })))
      router.refresh()
    } else {
      setResetMessage("Something went wrong while clearing the menu.")
    }
  }

  return (
    <div className="pb-24">
      {resetMessage && (
        <div className="bg-accent-gold/10 border border-accent-gold/30 text-gray-800 dark:text-zinc-100 text-sm rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
          <span className="text-accent-gold">ⓘ</span>
          {resetMessage}
        </div>
      )}

      {/* Week ticket header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
              Week of
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-zinc-100">
              {monday.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </p>
          </div>

          {confirmingReset ? (
            <div className="flex items-center gap-2 text-sm bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
              <span className="text-gray-600 dark:text-zinc-300">Clear week?</span>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="text-red-600 dark:text-red-400 font-bold hover:underline disabled:opacity-50"
              >
                {resetting ? "Clearing…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Clear week
            </button>
          )}
        </div>

        {/* Progress track */}
        <div className="flex items-center gap-1.5 mb-2">
          {DAYS.map((day, index) => {
            const accent = DAY_ACCENTS[day]
            const isFull = options[index].optionA.trim() && options[index].optionB.trim()
            const isHalf = !isFull && (options[index].optionA.trim() || options[index].optionB.trim())
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`h-1.5 w-full rounded-full transition-colors ${
                    isFull ? accent.bg : isHalf ? `${accent.bg} opacity-40` : "bg-gray-200 dark:bg-zinc-800"
                  }`}
                />
                <span className={`text-[10px] font-bold uppercase ${isFull ? accent.text : "text-gray-300 dark:text-zinc-600"}`}>
                  {day.slice(0, 3)}
                </span>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500 text-center">
          {fullyFilledDays} of {DAYS.length} days complete
          {filledDays > fullyFilledDays && ` · ${filledDays - fullyFilledDays} in progress`}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
            <span className="font-bold">✕</span>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-accent-aqua/10 border border-accent-aqua/30 text-gray-800 dark:text-zinc-100 text-sm rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
            <span className="text-accent-aqua font-bold">✓</span>
            Menu uploaded successfully!
          </div>
        )}

        <div className="space-y-4">
          {DAYS.map((day, index) => {
            const date = new Date(monday)
            date.setDate(monday.getDate() + index)
            const accent = DAY_ACCENTS[day]
            const dayFilled = options[index].optionA.trim() && options[index].optionB.trim()

            return (
              <div
                key={day}
                className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 ${accent.border} p-5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${accent.bg}`} />
                    {day}
                    <span className="text-gray-400 dark:text-zinc-500 font-normal text-sm">
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </h3>
                  {dayFilled && (
                    <span className="text-accent-aqua text-sm font-bold flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-1.5">
                      Option A
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Jollof rice with chicken"
                        value={options[index].optionA}
                        onChange={(e) => updateOption(index, "optionA", e.target.value)}
                        className={`w-full border rounded-lg pl-3 pr-8 py-2.5 text-sm text-gray-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 transition-colors ${
                          options[index].optionA.trim()
                            ? `border-gray-200 dark:border-zinc-700 focus:${accent.ring} focus:border-transparent`
                            : "border-gray-300 dark:border-zinc-700 focus:ring-primary focus:border-transparent"
                        }`}
                      />
                      {options[index].optionA.trim() && (
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${accent.text}`}>●</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-1.5">
                      Option B
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Banku with okra stew"
                        value={options[index].optionB}
                        onChange={(e) => updateOption(index, "optionB", e.target.value)}
                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg pl-3 pr-8 py-2.5 text-sm text-gray-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      />
                      {options[index].optionB.trim() && (
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${accent.text}`}>●</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sticky action bar */}
        <div className="sticky bottom-4 mt-6 z-10">
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 border border-gray-100 dark:border-zinc-800">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 font-medium">
              <div className="w-24 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-accent-orange to-accent-gold rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {progressPct}%
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none sm:min-w-48 bg-primary text-white rounded-lg px-6 py-2.5 hover:bg-primary-dark font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm shadow-primary/30"
            >
              {loading ? "Uploading…" : "Upload Menu"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}