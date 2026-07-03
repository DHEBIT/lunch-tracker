import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const formData = await req.formData()
  const menuItemId = formData.get("menuItemId") as string
  const date = formData.get("date") as string
  if (!menuItemId || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const userId = (session.user as any).id
  const userName = session.user.name
  const orderDate = new Date(date)

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
  })

  await prisma.order.upsert({
    where: {
      userId_date: {
        userId,
        date: orderDate,
      },
    },
    update: {
      menuItemId,
    },
    create: {
      userId,
      menuItemId,
      date: orderDate,
    },
  })

  // Notify all admins that an order was placed
  const dayLabel = orderDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  })

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin: { id: string }) => ({
        userId: admin.id,
        message: `${userName} ordered ${menuItem?.name ?? "a meal"} for ${dayLabel}`,
      })),
    })
  }

  return NextResponse.redirect(new URL("/menu", req.url), 303)
}