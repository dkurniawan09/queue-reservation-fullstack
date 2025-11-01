"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Clock, Play, X, ArrowRight } from "lucide-react";

interface QueueEntry {
  id: string;
  position: number;
  status: string;
  checkInTime: string | null;
  estimatedStartTime: string | null;
  actualStartTime: string | null;
  completedTime: string | null;
  createdAt: string;
  reservation: {
    id: string;
    notes: string | null;
    status: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
  };
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

export default function AdminQueuePage() {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState<QueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // TODO: Check if user has admin role
  const isAdmin = true; // Temporary for development

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchQueue = async () => {
      try {
        const response = await fetch("/api/queue");
        if (response.ok) {
          const data = await response.json();
          setQueueData(data);
        }
      } catch (error) {
        console.error("Error fetching queue:", error);
        toast.error("Failed to load queue data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueue();

    // Auto-refresh queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);

    return () => clearInterval(interval);
  }, [user, isAdmin]);

  const handleAdvanceQueue = async (queueEntryId: string) => {
    setActionLoading(queueEntryId);
    try {
      const response = await fetch(`/api/queue/advance/${queueEntryId}`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Queue advanced successfully");
        // Refresh queue data
        const fetchResponse = await fetch("/api/queue");
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setQueueData(data);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to advance queue");
      }
    } catch (error) {
      console.error("Error advancing queue:", error);
      toast.error("Failed to advance queue");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateWaitTime = (checkInTime: string | null) => {
    if (!checkInTime) return "N/A";
    const now = new Date();
    const checkIn = new Date(checkInTime);
    const diffMs = now.getTime() - checkIn.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Please sign in</h2>
                <p className="text-muted-foreground mb-4">
                  You need to be signed in to access the admin dashboard
                </p>
                <Button asChild>
                  <a href="/sign-in">Sign In</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <X className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  You don't have permission to access the admin dashboard
                </p>
                <Button asChild>
                  <a href="/dashboard">Back to Dashboard</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Queue Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage the current queue in real-time
          </p>
        </div>

        {/* Queue Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total in Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueData.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Waiting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {queueData.filter(q => q.status === "waiting").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {queueData.filter(q => q.status === "in_progress").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {queueData.filter(q => q.status === "completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Queue
            </CardTitle>
            <CardDescription>
              Real-time queue status - Auto-refreshes every 30 seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading queue data...</p>
              </div>
            ) : queueData.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Queue is empty</h3>
                <p className="text-muted-foreground">
                  No customers are currently in the queue
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Wait Time</TableHead>
                    <TableHead>Appointment Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">#{entry.position}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {entry.user.name || entry.user.email}
                          </div>
                          {entry.user.name && (
                            <div className="text-sm text-muted-foreground">
                              {entry.user.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.service.duration} min
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {calculateWaitTime(entry.checkInTime)}
                      </TableCell>
                      <TableCell>
                        {formatTime(entry.timeSlot.startTime)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {entry.status === "waiting" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdvanceQueue(entry.id)}
                              disabled={actionLoading === entry.id}
                            >
                              {actionLoading === entry.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Button variant="outline" asChild>
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/reserve">Create Test Reservation</a>
          </Button>
        </div>
      </div>
    </div>
  );
}