// app/api/preferences/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, userPreferences } from "@/db";
import { eq } from "drizzle-orm";
import { ARXIV_DOMAIN_ABBREVIATIONS } from "@/constants/arxiv";

function validateDomains(domains: string[]): string[] {
  return domains.filter(domain => 
    ARXIV_DOMAIN_ABBREVIATIONS.includes(domain)
  );
}

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  try {
    const [preference] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    
    if (!preference) {
      return NextResponse.json({
        userType: "",
        domains: "[]"
      });
    }
    
    return NextResponse.json({
      userType: preference.userType,
      domains: preference.domains
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  try {
    const { userType, domains } = await request.json();
    
    if (!userType) {
      return NextResponse.json(
        { error: "User type is required" },
        { status: 400 }
      );
    }

    const validDomains = validateDomains(domains || [])
    
    await db
      .insert(userPreferences)
      .values({
        userId: userId,
        userType: userType,
        domains: JSON.stringify(validDomains),
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          userType: userType,
          domains: JSON.stringify(validDomains),
          updatedAt: new Date(),
        },
      });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  try {
    const { userType, domains } = await request.json();
    
    if (!userType) {
      return NextResponse.json(
        { error: "User type is required" }, 
        { status: 400 }
      );
    }

    const validDomains = validateDomains(domains || []);
    
    await db
      .update(userPreferences)
      .set({
        userType: userType,
        domains: JSON.stringify(validDomains),
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" }, 
      { status: 500 }
    );
  }
}