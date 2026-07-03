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

export async function POST() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { start, end } = getWeekRange(new Date())

  // Delete orders first (foreign key dependency), then menu items
  await prisma.order.deleteMany({
    where: { date: { gte: start, lte: end } },
  })

  await prisma.menuItem.deleteMany({
    where: { date: { gte: start, lte: end } },
  })

  return NextResponse.json({ success: true })
}