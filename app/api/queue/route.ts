import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { queueEntry, reservation, timeSlot, service } from "@/db/schema/queue";
import { user } from "@/db/schema/auth";
import { eq, and, isNull } from "drizzle-orm";

export async function GET() {
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
    // For now, allow any authenticated user to view queue

    const queueData = await db
      .select({
        id: queueEntry.id,
        position: queueEntry.position,
        status: queueEntry.status,
        checkInTime: queueEntry.checkInTime,
        estimatedStartTime: queueEntry.estimatedStartTime,
        actualStartTime: queueEntry.actualStartTime,
        completedTime: queueEntry.completedTime,
        createdAt: queueEntry.createdAt,
        reservation: {
          id: reservation.id,
          notes: reservation.notes,
          status: reservation.status,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
        },
        timeSlot: {
          id: timeSlot.id,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
        },
      })
      .from(queueEntry)
      .innerJoin(reservation, eq(queueEntry.reservationId, reservation.id))
      .innerJoin(user, eq(reservation.userId, user.id))
      .innerJoin(timeSlot, eq(reservation.timeSlotId, timeSlot.id))
      .innerJoin(service, eq(reservation.serviceId, service.id))
      .where(
        and(
          eq(queueEntry.status, "waiting"),
          isNull(queueEntry.actualStartTime)
        )
      )
      .orderBy(queueEntry.position);

    return NextResponse.json(queueData);
  } catch (error) {
    console.error("Error fetching queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500 }
    );
  }
}