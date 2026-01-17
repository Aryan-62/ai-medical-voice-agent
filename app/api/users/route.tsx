import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "No user found" });
  }

  try {
    // ✅ check CURRENT user only
    const users = await db
      .select()
      .from(usersTable)
      .where(
        eq(
          usersTable.email,
          user.primaryEmailAddress.emailAddress
        )
      );

    // ✅ insert only if not exists
    if (users.length === 0) {
      const result = await db
        .insert(usersTable)
        .values({
            
          name: user.fullName || "Unknown",
          email: user.primaryEmailAddress.emailAddress,
          credits: 10,
        })
        .returning();

      return NextResponse.json(result[0]);
    }

    // ✅ return existing user
    return NextResponse.json(users[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB error" });
  }
}