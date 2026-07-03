import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import PrintButton from "./print-button"

function getWeekRange(date: Date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 4)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function getDayRange(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export default async function CatererSheetPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/signin")
  if ((session.user as any).role !== "ADMIN") redirect("/menu")

  const params = await searchParams
  const view = params.view === "week" ? "week" : "day"
  const baseDate = params.date ? new Date(params.date) : new Date()

  const { start, end } = view === "week" ? getWeekRange(baseDate) : getDayRange(baseDate)

  const orders = await prisma.order.findMany({
    where: { date: { gte: start, lte: end } },
    include: { user: true, menuItem: true },
    orderBy: [{ date: "asc" }, { menuItem: { optionLabel: "asc" } }],
  })

  const dayMap = new Map<string, Map<string, string[]>>()
  for (const order of orders) {
    const dayKey = order.date.toDateString()
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, new Map())
    const dishMap = dayMap.get(dayKey)!
    const dishName = order.menuItem.name
    if (!dishMap.has(dishName)) dishMap.set(dishName, [])
    dishMap.get(dishName)!.push(order.user.name)
  }

  const days = Array.from(dayMap.keys())
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime())

  const prevDate = new Date(baseDate)
  const nextDate = new Date(baseDate)
  if (view === "week") {
    prevDate.setDate(prevDate.getDate() - 7)
    nextDate.setDate(nextDate.getDate() + 7)
  } else {
    prevDate.setDate(prevDate.getDate() - 1)
    nextDate.setDate(nextDate.getDate() + 1)
  }
  const toParam = (d: Date) => d.toISOString().split("T")[0]

  const label =
    view === "week"
      ? `Week of ${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  const totalOrders = orders.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-10 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto">
        {/* Print-only letterhead */}
        <div className="hidden print:block mb-6 pb-4 border-b-2 border-primary">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black">
              <span className="text-primary">HAPPY</span> <span className="text-accent-orange">HOUR</span>
            </p>
            <p className="text-sm text-gray-500">Caterer order sheet</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-1 print:hidden">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-primary">Caterer</span>{" "}
            <span className="text-accent-gold">Sheet</span>
          </h1>
          <div className="flex gap-2">
            <PrintButton />
            <Link
              href={`/api/admin/caterer/export?view=${view}&date=${toParam(baseDate)}`}
              className="bg-accent-aqua text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm shadow-accent-aqua/30 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 3v13m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download CSV
            </Link>
          </div>
        </div>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 print:hidden">
          Who ordered what, ready to send to the caterer.
        </p>

        {/* View toggle + date nav */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="inline-flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
            <Link
              href={`/admin/caterer?view=day&date=${toParam(new Date())}`}
              className={`px-3.5 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                view === "day"
                  ? "bg-white dark:bg-zinc-700 text-primary shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
              }`}
            >
              Day
            </Link>
            <Link
              href={`/admin/caterer?view=week&date=${toParam(new Date())}`}
              className={`px-3.5 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                view === "week"
                  ? "bg-white dark:bg-zinc-700 text-primary shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
              }`}
            >
              Week
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/caterer?view=${view}&date=${toParam(prevDate)}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              ‹
            </Link>
            <p className="text-gray-700 dark:text-gray-200 font-semibold min-w-36 text-center text-sm">
              {label}
            </p>
            <Link
              href={`/admin/caterer?view=${view}&date=${toParam(nextDate)}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              ›
            </Link>
          </div>
        </div>

        {/* Print-only date label */}
        <p className="hidden print:block text-lg font-bold mb-4">{label}</p>

        {/* Summary bar */}
        {orders.length > 0 && (
          <div className="flex items-center justify-between bg-linear-to-r from-primary/10 via-accent-orange/10 to-accent-gold/10 border border-primary/20 rounded-xl px-5 py-3 mb-6 print:hidden">
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-200">
              {days.length} day{days.length !== 1 ? "s" : ""} · {totalOrders} meal{totalOrders !== 1 ? "s" : ""} total
            </span>
            <span className="text-2xl font-black text-primary">{totalOrders}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-10 text-center print:shadow-none print:border">
            <p className="text-gray-500 dark:text-zinc-400 font-medium">No orders for this {view}.</p>
            <p className="text-gray-400 dark:text-zinc-600 text-sm mt-1">Nothing to send the caterer yet.</p>
          </div>
        ) : (
          <div className="space-y-4 print:space-y-3">
            {days.map((day) => {
              const dishMap = dayMap.get(day.toDateString())!
              const dayLabel = day.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
              const dayTotal = Array.from(dishMap.values()).reduce((sum, names) => sum + names.length, 0)

              return (
                <div
                  key={day.toDateString()}
                  className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 print:shadow-none print:rounded-none print:border-0 print:border-b print:border-gray-300 print:pb-4 print:break-inside-avoid"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-zinc-800 print:border-gray-300">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 print:text-base">{dayLabel}</h3>
                    <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full print:bg-transparent print:text-gray-600">
                      {dayTotal} meal{dayTotal !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {Array.from(dishMap.entries()).map(([dish, names]) => (
                      <div key={dish}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{dish}</p>
                          <span className="text-xs font-bold text-white bg-primary rounded-full px-2 py-0.5 min-w-6 text-center print:bg-transparent print:text-gray-900 print:border print:border-gray-400">
                            {names.length}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          {names.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="flex items-center justify-between pt-3 print:pt-4 print:border-t-2 print:border-primary">
              <span className="text-sm text-gray-400 dark:text-zinc-600 print:hidden">
                Generated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span className="text-sm font-bold text-gray-700 dark:text-zinc-200 print:text-base ml-auto">
                Total meals: {totalOrders}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}