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

  await prisma.menuItem.createMany({
    data: items.map((item: any) => ({
      name: item.name,
      description: item.description || null,
      date: new Date(item.date),
      optionLabel: item.optionLabel,
    })),
  })

  return NextResponse.json({ success: true })
}