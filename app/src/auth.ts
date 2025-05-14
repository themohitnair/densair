import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db, users, accounts, sessions, userPreferences } from "@/db"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Github({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET!,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("/signout") || url === `${baseUrl}/signout`) {
        return baseUrl
      }

      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/`
      }
      const userId = url.split("id=")[1]
      if (!userId) return `${baseUrl}/onboard`

      const [pref] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId))

      return pref ? `${baseUrl}/feed` : `${baseUrl}/onboard`
    },
  },
  pages: {
    signIn: "/auth",
    signOut: "/",
    error: "/auth",
  },
})