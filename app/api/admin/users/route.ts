import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, department: true },
  })

  return NextResponse.json({ users })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { userId, department } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { department: department || null },
  })

  return NextResponse.json({ success: true })
}