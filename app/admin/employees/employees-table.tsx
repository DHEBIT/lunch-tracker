"use client"

import { useState } from "react"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  department: string | null
}

export default function EmployeesTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)

  function startEdit(user: UserRow) {
    setEditingId(user.id)
    setDraft(user.department || "")
  }

  async function saveEdit(userId: string) {
    setSaving(true)
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, department: draft }),
    })
    setSaving(false)

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, department: draft || null } : u))
      )
      setEditingId(null)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
            <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-zinc-100">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-zinc-100">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-zinc-100">Role</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-zinc-100">Department</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 dark:border-zinc-800/60">
              <td className="px-4 py-3 text-gray-900 dark:text-zinc-100 font-medium">{user.name}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-zinc-400">{user.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    user.role === "ADMIN"
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3">
                {editingId === user.id ? (
                  <input
                   type="text"
                   aria-label={`Department for ${user.name}`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(user.id)}
                    autoFocus
                    className="w-full max-w-40 border border-primary rounded px-2 py-1 text-sm text-gray-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                ) : (
                  <span className="text-gray-700 dark:text-zinc-300">
                    {user.department || <span className="text-gray-300 dark:text-zinc-600">—</span>}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {editingId === user.id ? (
                  <button
                    onClick={() => saveEdit(user.id)}
                    disabled={saving}
                    className="text-xs font-semibold text-accent-aqua hover:underline disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(user)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}