"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const DAY_ACCENTS: Record<string, string> = {
  Monday: "border-l-primary",
  Tuesday: "border-l-accent-orange",
  Wednesday: "border-l-accent-gold",
  Thursday: "border-l-accent-aqua",
  Friday: "border-l-primary-light",
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

  const monday = getMonday(new Date())

  const [options, setOptions] = useState(
    DAYS.map(() => ({ optionA: "", optionB: "" }))
  )

  const filledDays = options.filter((d) => d.optionA.trim() || d.optionB.trim()).length

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

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-accent-aqua/10 border border-accent-aqua text-gray-800 text-sm rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
          <span className="text-accent-aqua font-bold">✓</span>
          Menu uploaded successfully!
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Week of {monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        <p className="text-sm text-gray-500">
          {filledDays} of {DAYS.length} days filled
        </p>
      </div>

      <div className="space-y-4">
        {DAYS.map((day, index) => {
          const date = new Date(monday)
          date.setDate(monday.getDate() + index)
          const accent = DAY_ACCENTS[day]

          return (
            <div
              key={day}
              className={`bg-white rounded-lg shadow border-l-4 ${accent} p-5`}
            >
              <h3 className="font-bold text-gray-900 mb-3">
                {day}
                <span className="text-gray-400 font-normal text-sm ml-2">
                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Option A
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jollof rice with chicken"
                    value={options[index].optionA}
                    onChange={(e) => updateOption(index, "optionA", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Option B
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Banku with okra stew"
                    value={options[index].optionB}
                    onChange={(e) => updateOption(index, "optionB", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 bg-primary text-white rounded-lg px-3 py-3 hover:bg-primary-dark font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Menu"}
      </button>
    </form>
  )
}