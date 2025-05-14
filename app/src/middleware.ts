import { auth } from "@/auth"
import { db, userPreferences } from "@/db"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { eq } from "drizzle-orm"

export async function middleware(req: NextRequest) {
  const session = await auth()
  const url = req.nextUrl.clone()

  if (!session?.user?.id) {
    if (
      url.pathname.startsWith("/feed") ||
      url.pathname.startsWith("/summarize") ||
      url.pathname.startsWith("/onboard") ||
      url.pathname.startsWith("/chat")
    ) {
      url.pathname = "/auth"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const userId = session.user.id

  try {
    const preference = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).get()

    if (!preference && url.pathname !== "/onboard") {
      url.pathname = "/onboard"
      return NextResponse.redirect(url)
    }

    if (preference && url.pathname === "/onboard") {
      url.pathname = "/feed"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("Error checking user preferences:", error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/feed", "/summarize", "/onboard", "/chat"],
}