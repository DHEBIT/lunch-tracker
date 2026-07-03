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
  const orderDate = new Date(date)

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

  return NextResponse.redirect(new URL("/menu", req.url))
}