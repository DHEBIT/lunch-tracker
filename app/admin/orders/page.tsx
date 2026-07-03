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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-primary">Orders</span>{" "}
            <span className="text-accent-gold">Dashboard</span>
          </h1>

          <a
            href={`/api/admin/orders/export?year=${year}&month=${month}`}
            className="bg-accent-aqua text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm shadow-accent-aqua/30 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 3v13m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download CSV
          </a>
        </div>
        <p className="text-gray-500 dark:text-zinc-400 mb-6">
          Monthly order totals, ready for caterer billing.
        </p>

        {/* Month nav */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/admin/orders?month=${prevParam}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Previous month"
          >
            ‹
          </Link>
          <p className="text-gray-700 dark:text-zinc-200 font-semibold min-w-36 text-center">{monthLabel}</p>
          <Link
            href={`/admin/orders?month=${nextParam}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Next month"
          >
            ›
          </Link>
        </div>

       {/* Stat cards */}
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
  <div className="rounded-2xl p-5 bg-primary shadow-md shadow-primary/20">
    <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Total orders</p>
    <p className="text-3xl font-black text-white mt-1">{totalOrders}</p>
  </div>
  <div className="rounded-2xl p-5 bg-accent-orange shadow-md shadow-accent-orange/20">
    <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Total cost</p>
    <p className="text-3xl font-black text-white mt-1">
      {totalCost} <span className="text-base font-semibold text-white/70">GHS</span>
    </p>
  </div>
  <div className="rounded-2xl p-5 bg-accent-aqua shadow-md shadow-accent-aqua/20 col-span-2 sm:col-span-1">
    <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Employees ordered</p>
    <p className="text-3xl font-black text-white mt-1">{users.length}</p>
  </div>
</div>

        {users.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-500 dark:text-zinc-400 font-medium">No orders yet for {monthLabel}.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-zinc-100 sticky left-0 bg-gray-50 dark:bg-zinc-800/50 z-10">
                      Name
                    </th>
                    {days.map((day) => (
                      <th
                        key={day.toDateString()}
                        className="text-center px-3 py-3 font-semibold text-gray-500 dark:text-zinc-400 whitespace-nowrap text-xs uppercase tracking-wide"
                      >
                        {day.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 font-semibold text-gray-900 dark:text-zinc-100">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const userTotal = Array.from(user.ordersByDay.values()).length
                    return (
                      <tr
                        key={user.email}
                        className={`border-b border-gray-100 dark:border-zinc-800/60 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors ${
                          i % 2 === 1 ? "bg-gray-50/50 dark:bg-zinc-800/20" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-900 dark:text-zinc-100 font-medium sticky left-0 bg-inherit whitespace-nowrap">
                          {user.name}
                        </td>
                        {days.map((day) => (
                          <td key={day.toDateString()} className="text-center px-3 py-3">
                            {user.ordersByDay.has(day.toDateString()) ? (
                              <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-accent-aqua/15 text-accent-aqua font-bold text-xs">
                                ✓
                              </span>
                            ) : (
                              <span className="text-gray-200 dark:text-zinc-700">·</span>
                            )}
                          </td>
                        ))}
                        <td className="text-center px-4 py-3 font-bold text-primary">{userTotal}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-zinc-100 sticky left-0 bg-gray-50 dark:bg-zinc-800/50">
                      Total
                    </td>
                    {days.map((day) => {
                      const dayCount = users.filter((u) => u.ordersByDay.has(day.toDateString())).length
                      return (
                        <td key={day.toDateString()} className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-400">
                          {dayCount}
                        </td>
                      )
                    })}
                    <td className="text-center px-4 py-3 font-black text-primary">{totalOrders}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}