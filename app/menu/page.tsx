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

const DAY_ACCENTS: Record<string, string> = {
  Monday: "border-l-primary",
  Tuesday: "border-l-accent-orange",
  Wednesday: "border-l-accent-gold",
  Thursday: "border-l-accent-aqua",
  Friday: "border-l-primary-light",
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

  const allOrdered = days.length > 0 && days.every((d) => d.order)

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-1">
          <span className="text-primary">This Week&apos;s</span>{" "}
          <span className="text-accent-orange">Menu</span>
        </h1>
        <p className="text-gray-500 mb-8">
          Welcome back, {session.user.name?.split(" ")[0]} 👋
        </p>

        {allOrdered && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <p className="text-gray-800 font-medium">
              You&apos;re all set for the week — every day is ordered.
            </p>
          </div>
        )}

        {days.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No menu has been set for this week yet.</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day) => {
              const weekday = day.date.toLocaleDateString("en-US", { weekday: "long" })
              const accent = DAY_ACCENTS[weekday] || "border-l-primary"

              return (
                <div
                  key={day.date.toDateString()}
                  className={`bg-white rounded-lg shadow border-l-4 ${accent} p-5`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">
                      {weekday}
                      <span className="text-gray-400 font-normal text-sm ml-2">
                        {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </h3>
                    {day.order && (
                      <span className="text-xs font-semibold text-accent-aqua bg-accent-aqua/10 px-2 py-1 rounded-full">
                        Ordered
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    {day.options.map((item: { id: string; name: string; description?: string | null; optionLabel?: string | null; date: Date }) => {
                      const selected = day.order?.menuItemId === item.id
                      return (
                        <form action="/api/orders" method="POST" key={item.id}>
                          <input type="hidden" name="menuItemId" value={item.id} />
                          <input type="hidden" name="date" value={item.date.toISOString()} />
                          <button
                            type="submit"
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                              selected
                                ? "bg-accent-aqua/10 border-accent-aqua ring-1 ring-accent-aqua"
                                : "border-gray-200 hover:border-primary hover:bg-primary/5"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                  {item.optionLabel}
                                </span>
                                <p className={`text-gray-900 ${selected ? "font-semibold" : ""}`}>
                                  {item.name}
                                </p>
                              </div>
                              {selected && (
                                <span className="text-accent-aqua text-lg">✓</span>
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