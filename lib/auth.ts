import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { JWT } from "next-auth/jwt"

type ExtendedSessionUser = NonNullable<DefaultSession["user"]> & {
  role?: string
  id?: string
}

type ExtendedSession = DefaultSession & {
  user: ExtendedSessionUser
}

type ExtendedJWT = JWT & {
  role?: string
  id?: string
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const extendedToken = token as ExtendedJWT

      if (user) {
        extendedToken.role = (user as { role?: string }).role
        extendedToken.id = user.id
      }

      return extendedToken
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession
      const extendedToken = token as ExtendedJWT

      if (extendedSession.user) {
        extendedSession.user.role = extendedToken.role
        extendedSession.user.id = extendedToken.id
      }

      return extendedSession
    },
  },
  pages: {
    signIn: "/signin",
  },
})