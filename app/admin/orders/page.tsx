import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

const COST_PER_MEAL = 40 // GHS

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await auth()

  if (!session?.user) redirect("/signin")
  if ((session.user as any).role !== "ADMIN") redirect("/menu")

  const params = await searchParams
  const now = new Date()
  const [year, month] = params.month
    ? params.month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1]

  const { start, end } = getMonthRange(year, month - 1)

  // Compute prev/next month values (month is 1-indexed here)
  const prevDate = new Date(year, month - 2, 1)
  const nextDate = new Date(year, month, 1)
  const prevParam = `${prevDate.getFullYear()}-${prevDate.getMonth() + 1}`
  const nextParam = `${nextDate.getFullYear()}-${nextDate.getMonth() + 1}`

  const orders = await prisma.order.findMany({
    where: { date: { gte: start, lte: end } },
    include: { user: true, menuItem: true },
    orderBy: [{ user: { name: "asc" } }, { date: "asc" }],
  })

  // Unique sorted days that have at least one order
  const days = Array.from(
    new Set(orders.map((o: { date: Date }) => o.date.toDateString()))
  )
    .map((d: unknown) => new Date(d as string))
    .sort((a, b) => a.getTime() - b.getTime())

  // Group by user
  const userMap = new Map<string, { name: string; email: string; ordersByDay: Map<string, string> }>()
  for (const order of orders) {
    if (!userMap.has(order.userId)) {
      userMap.set(order.userId, {
        name: order.user.name,
        email: order.user.email,
        ordersByDay: new Map(),
      })
    }
    userMap.get(order.userId)!.ordersByDay.set(order.date.toDateString(), order.menuItem.optionLabel)
  }

  const users = Array.from(userMap.values())
  const totalOrders = orders.length
  const totalCost = totalOrders * COST_PER_MEAL

  const monthLabel = start.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-extrabold">
            <span className="text-primary">Orders</span>{" "}
            <span className="text-accent-gold">Dashboard</span>
          </h1>

          <a
            href={`/api/admin/orders/export?year=${year}&month=${month}`}
            className="bg-accent-aqua text-white px-4 py-2 rounded font-semibold hover:opacity-90 transition-opacity"
          >
            Download CSV
          </a>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/admin/orders?month=${prevParam}`}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            ‹
          </Link>
          <p className="text-gray-500 min-w-35 text-center">{monthLabel}</p>
          <Link
            href={`/admin/orders?month=${nextParam}`}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            ›
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total cost</p>
            <p className="text-2xl font-bold text-accent-orange">{totalCost} GHS</p>
          </div>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-500">No orders yet for {monthLabel}.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Name</th>
                  {days.map((day) => (
                    <th key={day.toDateString()} className="text-center px-3 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {day.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 font-semibold text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userTotal = Array.from(user.ordersByDay.values()).length
                  return (
                    <tr key={user.email} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-900">{user.name}</td>
                      {days.map((day) => (
                        <td key={day.toDateString()} className="text-center px-3 py-3">
                          {user.ordersByDay.has(day.toDateString()) ? (
                            <span className="text-accent-aqua font-bold">1</span>
                          ) : (
                            <span className="text-gray-300">0</span>
                          )}
                        </td>
                      ))}
                      <td className="text-center px-4 py-3 font-semibold text-primary">{userTotal}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}