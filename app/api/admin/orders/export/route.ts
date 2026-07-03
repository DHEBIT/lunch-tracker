import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const COST_PER_MEAL = 40

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const year = Number(searchParams.get("year"))
  const month = Number(searchParams.get("month"))

  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)

  const orders = await prisma.order.findMany({
    where: { date: { gte: start, lte: end } },
    include: { user: true, menuItem: true },
    orderBy: [{ user: { name: "asc" } }, { date: "asc" }],
  })

  const days = Array.from(
    new Set(orders.map((o: { date: Date }) => o.date.toDateString()))
  )
    .map((d: unknown) => new Date(d as string))
    .sort((a, b) => a.getTime() - b.getTime())

  const userMap = new Map<string, { name: string; ordersByDay: Set<string> }>()
  for (const order of orders) {
    if (!userMap.has(order.userId)) {
      userMap.set(order.userId, { name: order.user.name, ordersByDay: new Set() })
    }
    userMap.get(order.userId)!.ordersByDay.add(order.date.toDateString())
  }

  const dayLabels = days.map((d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
  const header = ["Name", ...dayLabels, "Total Meals", "Cost (GHS)"]

  const rows = Array.from(userMap.values()).map((user) => {
    const cells = days.map((day) => (user.ordersByDay.has(day.toDateString()) ? "1" : "0"))
    const total = user.ordersByDay.size
    return [user.name, ...cells, String(total), String(total * COST_PER_MEAL)]
  })

  const totalMeals = rows.reduce((sum, r) => sum + Number(r[r.length - 2]), 0)
  const totalCost = totalMeals * COST_PER_MEAL
  rows.push(["TOTAL", ...days.map(() => ""), String(totalMeals), String(totalCost)])

  const csv = [header, ...rows].map((r) => r.join(",")).join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="lunch-orders-${year}-${month}.csv"`,
    },
  })
}