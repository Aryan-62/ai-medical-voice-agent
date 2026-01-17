import { db } from "@/config/db";
import { sessionChatTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const { notes, selectedDoctor } = await request.json();
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "User not logged in" }, { status: 401 });
  }

  try {
    // Check if user is paid
    const isPaidUser = user.publicMetadata?.plan === "pro";

    // If doctor requires subscription and user is not paid, block it
    if (selectedDoctor?.subscriptionRequired && !isPaidUser) {
      return NextResponse.json(
        { error: "This doctor requires a premium subscription" },
        { status: 403 }
      );
    }

    // For free doctors and free users, check consultation limit
    if (!selectedDoctor?.subscriptionRequired && !isPaidUser) {
      // Count consultations by fetching all and counting length
      const existingConsultations = await db
        .select()
        .from(sessionChatTable)
        .where(eq(sessionChatTable.createdBy, user.primaryEmailAddress.emailAddress));

      const consultationCount = existingConsultations.length;

      // If they've already done 1 or more consultations, block them
      if (consultationCount >= 1) {
        return NextResponse.json(
          { 
            error: "You've reached your free consultation limit. Please upgrade to continue.",
            limitReached: true 
          },
          { status: 403 }
        );
      }
    }

    // Create the session
    const sessionId = uuidv4();
    const result = await db
      .insert(sessionChatTable)
      .values({
        sessionId,
        createdBy: user.primaryEmailAddress.emailAddress,
        notes,
        selectedDoctor,
        createdOn: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (e) {
    console.error("Session creation error:", e);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "User not logged in" }, { status: 401 });
  }

  try {
    if (sessionId === "all") {
      const result = await db
        .select()
        .from(sessionChatTable)
        .where(eq(sessionChatTable.createdBy, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(sessionChatTable.id));
      return NextResponse.json(result);
    } else {
      // FIXED: Now correctly filters by sessionId instead of just createdBy
      const result = await db
        .select()
        .from(sessionChatTable)
        .where(eq(sessionChatTable.sessionId, sessionId!));
      return NextResponse.json(result[0]);
    }
  } catch (e) {
    console.error("Session fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}