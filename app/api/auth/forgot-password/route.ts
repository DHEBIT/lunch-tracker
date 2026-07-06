import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: "No account found with that email" }, { status: 404 })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expires },
    })

    const resetLink = `${new URL(req.url).origin}/reset-password?token=${token}`

    return NextResponse.json({ resetLink })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
