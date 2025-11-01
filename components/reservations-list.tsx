"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Clock, User, X, Check } from "lucide-react";

interface Reservation {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    name: string;
    description: string | null;
    duration: number;
  };
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

export function ReservationsList() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (!user) return;

    const fetchReservations = async () => {
      try {
        const response = await fetch("/api/reservations");
        if (response.ok) {
          const data = await response.json();
          setReservations(data);
        }
      } catch (error) {
        console.error("Error fetching reservations:", error);
        toast.error("Failed to load reservations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Reservation cancelled successfully");
        // Refresh reservations
        setReservations(prev =>
          prev.map(r =>
            r.id === reservationId
              ? { ...r, status: "cancelled" }
              : r
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to cancel reservation");
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error("Failed to cancel reservation");
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString([], {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filterReservations = (reservations: Reservation[]) => {
    const now = new Date();
    switch (filter) {
      case "upcoming":
        return reservations.filter(r => new Date(r.timeSlot.startTime) > now);
      case "past":
        return reservations.filter(r => new Date(r.timeSlot.startTime) <= now);
      default:
        return reservations;
    }
  };

  const filteredReservations = filterReservations(reservations);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Please sign in</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view your reservations
            </p>
            <Button asChild>
              <a href="/sign-in">Sign In</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading your reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({reservations.length})
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming (
            {reservations.filter(r => new Date(r.timeSlot.startTime) > new Date()).length}
          )
        </Button>
        <Button
          variant={filter === "past" ? "default" : "outline"}
          onClick={() => setFilter("past")}
        >
          Past (
            {reservations.filter(r => new Date(r.timeSlot.startTime) <= new Date()).length}
          )
        </Button>
      </div>

      {/* Reservations list */}
      {filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reservations found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === "all"
                  ? "You haven't made any reservations yet."
                  : `No ${filter} reservations found.`
                }
              </p>
              <Button asChild>
                <a href="/reserve">Make a Reservation</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{reservation.service.name}</CardTitle>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </div>
                  {reservation.status === "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardDescription>{reservation.service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDateTime(reservation.timeSlot.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{reservation.service.duration} minutes</span>
                </div>
                {reservation.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notes:</span>
                    <p className="text-muted-foreground">{reservation.notes}</p>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Booked on {formatDateTime(reservation.createdAt)}
                    </span>
                    {reservation.status === "confirmed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Need another reservation?</h3>
            <p className="text-muted-foreground mb-4">
              Book additional appointments for our services
            </p>
            <Button asChild>
              <a href="/reserve">Make Another Reservation</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}