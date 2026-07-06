import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!resetToken || resetToken.expires < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  })

  // Invalidate the token so it can't be reused
  await prisma.passwordResetToken.delete({ where: { token } })

  return NextResponse.json({ success: true })
}