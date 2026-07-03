import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

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

const DAY_ACCENTS: Record<string, { border: string; dot: string; ring: string; bg: string }> = {
  Monday:    { border: "border-l-primary",       dot: "bg-primary",       ring: "ring-primary",       bg: "bg-primary/5" },
  Tuesday:   { border: "border-l-accent-orange",  dot: "bg-accent-orange", ring: "ring-accent-orange", bg: "bg-accent-orange/5" },
  Wednesday: { border: "border-l-accent-gold",    dot: "bg-accent-gold",   ring: "ring-accent-gold",   bg: "bg-accent-gold/5" },
  Thursday:  { border: "border-l-accent-aqua",    dot: "bg-accent-aqua",   ring: "ring-accent-aqua",   bg: "bg-accent-aqua/5" },
  Friday:    { border: "border-l-primary-light",  dot: "bg-primary-light", ring: "ring-primary-light", bg: "bg-primary-light/5" },
}

export default async function MenuPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  const { start, end } = getWeekRange(new Date())
  const userId = (session.user as any).id

  const menuItems = await prisma.menuItem.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  })

  const existingOrders = await prisma.order.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    include: { menuItem: true },
  })

  const days = Array.from(new Set(menuItems.map((item: { date: Date }) => item.date.toDateString()))).map((dateStr: unknown) => {
    const dayDate = dateStr as string
    const date = new Date(dayDate)
    const options = menuItems.filter((item: { date: Date }) => item.date.toDateString() === dayDate)
    const order = existingOrders.find((o: { date: Date }) => o.date.toDateString() === dayDate)
    return { date, options, order }
  })

  const orderedCount = days.filter((d) => d.order).length
  const allOrdered = days.length > 0 && orderedCount === days.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1 tracking-tight">
            <span className="text-primary">This Week&apos;s</span>{" "}
            <span className="text-accent-orange">Menu</span>
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 mb-5">
            Welcome back, {session.user.name?.split(" ")[0]} 👋
          </p>

          {/* Week progress */}
          {days.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {days.map((day) => {
                  const weekday = day.date.toLocaleDateString("en-US", { weekday: "long" })
                  const accent = DAY_ACCENTS[weekday] || DAY_ACCENTS.Monday
                  return (
                    <span
                      key={day.date.toDateString()}
                      className={`h-1.5 w-8 rounded-full transition-colors ${
                        day.order ? accent.dot : "bg-gray-200 dark:bg-zinc-800"
                      }`}
                      title={weekday}
                    />
                  )
                })}
              </div>
              <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
                {orderedCount}/{days.length} ordered
              </span>
            </div>
          )}
        </div>

        {allOrdered && (
          <div className="bg-linear-to-r from-primary/10 via-accent-orange/10 to-accent-gold/10 border border-primary/20 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <p className="text-gray-800 dark:text-zinc-100 font-medium">
              You&apos;re all set for the week — every day is ordered.
            </p>
          </div>
        )}

        {days.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-500 dark:text-zinc-400 font-medium">No menu has been set for this week yet.</p>
            <p className="text-gray-400 dark:text-zinc-600 text-sm mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day) => {
              const weekday = day.date.toLocaleDateString("en-US", { weekday: "long" })
              const accent = DAY_ACCENTS[weekday] || DAY_ACCENTS.Monday

              return (
                <div
                  key={day.date.toDateString()}
                  className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 ${accent.border} p-5`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                      {weekday}
                      <span className="text-gray-400 dark:text-zinc-500 font-normal text-sm">
                        {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </h3>
                    {day.order ? (
                      <span className="text-xs font-semibold text-accent-aqua bg-accent-aqua/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Ordered
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                        Not yet
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {day.options.map((item: { id: string; name: string; description?: string | null; optionLabel?: string | null; date: Date }) => {
                      const selected = day.order?.menuItemId === item.id
                      return (
                        <form action="/api/orders" method="POST" key={item.id}>
                          <input type="hidden" name="menuItemId" value={item.id} />
                          <input type="hidden" name="date" value={item.date.toISOString()} />
                          <button
                            type="submit"
                            className={`w-full h-full text-left px-4 py-3 rounded-lg border transition-all ${
                              selected
                                ? `${accent.bg} border-accent-aqua ring-1 ${accent.ring} ring-accent-aqua`
                                : "border-gray-200 dark:border-zinc-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                                  {item.optionLabel}
                                </span>
                                <p className={`text-gray-900 dark:text-zinc-100 mt-0.5 ${selected ? "font-semibold" : ""}`}>
                                  {item.name}
                                </p>
                              </div>
                              {selected && (
                                <span className="text-accent-aqua text-lg shrink-0">✓</span>
                              )}
                            </div>
                          </button>
                        </form>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}