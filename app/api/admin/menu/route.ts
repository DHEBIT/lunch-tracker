import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { items } = await req.json()

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No menu items provided" }, { status: 400 })
  }

  // Clear any existing menu items for these specific dates first,
// so re-uploading a week replaces it instead of duplicating
const dates = items.map((item: any) => new Date(item.date))
await prisma.menuItem.deleteMany({
  where: { date: { in: dates } },
})

await prisma.menuItem.createMany({
  data: items.map((item: any) => ({
    name: item.name,
    description: item.description || null,
    date: new Date(item.date),
    optionLabel: item.optionLabel,
  })),
})

  // Figure out the week label from the first item's date
  const firstDate = new Date(items[0].date)
  const weekLabel = firstDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  // Notify every employee that a new menu is up
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true },
  })

  if (employees.length > 0) {
    await prisma.notification.createMany({
      data: employees.map((emp: { id: string }) => ({
        userId: emp.id,
        message: `New menu uploaded for week of ${weekLabel}`,
      })),
    })
  }

  return NextResponse.json({ success: true })
}