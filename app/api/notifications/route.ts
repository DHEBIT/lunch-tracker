import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  })

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id
  const body = await req.json().catch(() => ({}))
  const id = body?.id as string | undefined

  if (id) {
    // Delete a single notification, only if it belongs to this user
    await prisma.notification.deleteMany({
      where: { id, userId },
    })
  } else {
    // Clear all notifications for this user
    await prisma.notification.deleteMany({
      where: { userId },
    })
  }

  return NextResponse.json({ success: true })
}