import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { queueEntry, reservation } from "@/db/schema/queue";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // For now, allow any authenticated user to advance queue (development)

    // Get the current queue entry to advance
    const [currentEntry] = await db
      .select()
      .from(queueEntry)
      .where(
        and(
          eq(queueEntry.id, params.id),
          eq(queueEntry.status, "waiting"),
          isNull(queueEntry.actualStartTime)
        )
      )
      .limit(1);

    if (!currentEntry) {
      return NextResponse.json(
        { error: "Queue entry not found or not eligible to advance" },
        { status: 404 }
      );
    }

    // Mark current entry as in progress
    const [updatedEntry] = await db
      .update(queueEntry)
      .set({
        status: "in_progress",
        actualStartTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(queueEntry.id, params.id))
      .returning();

    // Update positions of remaining entries in queue
    await db
      .update(queueEntry)
      .set({
        position: queueEntry.position - 1,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(queueEntry.status, "waiting"),
          isNull(queueEntry.actualStartTime),
          eq(queueEntry.position, currentEntry.position + 1)
        )
      );

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error advancing queue:", error);
    return NextResponse.json(
      { error: "Failed to advance queue" },
      { status: 500 }
    );
  }
}