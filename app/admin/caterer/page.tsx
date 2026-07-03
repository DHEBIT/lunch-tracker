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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-10 print:bg-white print:py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-1 print:hidden">
          <h1 className="text-3xl font-extrabold">
            <span className="text-primary">Caterer</span>{" "}
            <span className="text-accent-gold">Sheet</span>
          </h1>
          <div className="flex gap-2">
            <PrintButton />
            <a
              href={`/api/admin/caterer/export?view=${view}&date=${toParam(baseDate)}`}
              className="bg-accent-aqua text-white px-4 py-2 rounded font-semibold hover:opacity-90 transition-opacity"
            >
              Download CSV
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 print:hidden">
          <Link
            href={`/admin/caterer?view=day&date=${toParam(new Date())}`}
            className={`px-3 py-1.5 rounded text-sm font-semibold ${
              view === "day" ? "bg-primary text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            Day
          </Link>
          <Link
            href={`/admin/caterer?view=week&date=${toParam(new Date())}`}
            className={`px-3 py-1.5 rounded text-sm font-semibold ${
              view === "week" ? "bg-primary text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            Week
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6 print:mb-4">
          <Link
            href={`/admin/caterer?view=${view}&date=${toParam(prevDate)}`}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors print:hidden"
          >
            ‹
          </Link>
          <p className="text-gray-700 dark:text-gray-200 font-semibold min-w-55 text-center print:text-xl print:font-bold">
            {label}
          </p>
          <Link
            href={`/admin/caterer?view=${view}&date=${toParam(nextDate)}`}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors print:hidden"
          >
            ›
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-500">No orders for this {view}.</p>
        ) : (
          <div className="space-y-6">
            {days.map((day) => {
              const dishMap = dayMap.get(day.toDateString())!
              const dayLabel = day.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
              const dayTotal = Array.from(dishMap.values()).reduce((sum, names) => sum + names.length, 0)

              return (
                <div key={day.toDateString()} className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-800 p-5 print:shadow-none print:border print:break-inside-avoid">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{dayLabel}</h3>
                    <span className="text-sm text-gray-500">{dayTotal} meal{dayTotal !== 1 ? "s" : ""}</span>
                  </div>

                  <div className="space-y-4">
                    {Array.from(dishMap.entries()).map(([dish, names]) => (
                      <div key={dish}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{dish}</p>
                          <span className="text-xs font-bold text-white bg-primary rounded-full px-2 py-0.5">
                            {names.length}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {names.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="text-right text-sm text-gray-500 pt-2 print:text-base print:font-semibold">
              Total meals: {totalOrders}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}