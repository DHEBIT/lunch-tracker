import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
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

function getDayRange(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const view = searchParams.get("view") === "week" ? "week" : "day"
  const dateParam = searchParams.get("date")
  const baseDate = dateParam ? new Date(dateParam) : new Date()

  const { start, end } = view === "week" ? getWeekRange(baseDate) : getDayRange(baseDate)

  const orders = await prisma.order.findMany({
    where: { date: { gte: start, lte: end } },
    include: { user: true, menuItem: true },
    orderBy: [{ date: "asc" }, { menuItem: { optionLabel: "asc" } }],
  })

  const rows: string[][] = [["Date", "Dish", "Employee"]]
  for (const order of orders) {
    rows.push([
      order.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      order.menuItem.name,
      order.user.name,
    ])
  }

  const csv = rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="caterer-sheet-${view}-${baseDate.toISOString().split("T")[0]}.csv"`,
    },
  })
}