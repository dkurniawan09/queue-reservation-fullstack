import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { queueEntry, reservation } from "@/db/schema/queue";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const checkInSchema = z.object({
  reservationId: z.string().uuid(),
});

export async function POST(request: Request) {
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

    const body = await request.json();
    const { reservationId } = checkInSchema.parse(body);

    // Verify the reservation belongs to the user
    const [reservationData] = await db
      .select()
      .from(reservation)
      .where(
        and(
          eq(reservation.id, reservationId),
          eq(reservation.userId, session.user.id),
          eq(reservation.status, "confirmed")
        )
      )
      .limit(1);

    if (!reservationData) {
      return NextResponse.json(
        { error: "Reservation not found or not eligible for check-in" },
        { status: 404 }
      );
    }

    // Check if already checked in
    const [existingQueueEntry] = await db
      .select()
      .from(queueEntry)
      .where(eq(queueEntry.reservationId, reservationId))
      .limit(1);

    if (existingQueueEntry) {
      return NextResponse.json(
        { error: "Already checked in" },
        { status: 400 }
      );
    }

    // Get the next position in queue
    const [lastPosition] = await db
      .select({ position: queueEntry.position })
      .from(queueEntry)
      .where(eq(queueEntry.status, "waiting"))
      .orderBy(queueEntry.position)
      .limit(1);

    const nextPosition = lastPosition ? lastPosition.position + 1 : 1;

    // Create queue entry
    const [queueEntryData] = await db
      .insert(queueEntry)
      .values({
        reservationId,
        position: nextPosition,
        status: "waiting",
        checkInTime: new Date(),
        estimatedStartTime: new Date(), // This would be calculated based on service durations
      })
      .returning();

    return NextResponse.json(queueEntryData, { status: 201 });
  } catch (error) {
    console.error("Error checking in:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
}