"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarDays, Clock, User } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
}

export default function ReservePage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services");
      }
    };

    fetchServices();
  }, []);

  // Fetch time slots when service and date are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedService || !selectedDate) return;

      setIsLoading(true);
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const response = await fetch(`/api/timeslots/${selectedService}?date=${formattedDate}`);

        if (response.ok) {
          const data = await response.json();
          setTimeSlots(data);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast.error("Failed to load time slots");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedService, selectedDate]);

  const handleBookReservation = async () => {
    if (!selectedService || !selectedTimeSlot) {
      toast.error("Please select a service and time slot");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService,
          timeSlotId: selectedTimeSlot,
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Reservation booked successfully!");
        // Reset form
        setSelectedTimeSlot("");
        setNotes("");
        // Optionally refresh the user's reservations
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to book reservation");
      }
    } catch (error) {
      console.error("Error booking reservation:", error);
      toast.error("Failed to book reservation");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Please sign in</h2>
                <p className="text-muted-foreground mb-4">
                  You need to be signed in to make a reservation
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Make a Reservation</h1>
          <p className="text-muted-foreground">
            Book an appointment for our services
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Service</CardTitle>
              <CardDescription>
                Choose the service you'd like to book
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="service">Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-muted-foreground">
                              {service.description}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {service.duration} minutes
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedServiceData && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">{selectedServiceData.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedServiceData.description}
                  </p>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Duration: {selectedServiceData.duration} minutes
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Choose your preferred date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* Time Slots */}
        {selectedService && selectedDate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
              <CardDescription>
                Select an available time slot for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading available slots...</p>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No available time slots for the selected date
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {timeSlots.map((timeSlot) => (
                    <Button
                      key={timeSlot.id}
                      variant={selectedTimeSlot === timeSlot.id ? "default" : "outline"}
                      onClick={() => setSelectedTimeSlot(timeSlot.id)}
                      disabled={timeSlot.availableSpots === 0}
                      className="h-auto p-3"
                    >
                      <div className="text-center">
                        <div className="font-medium">
                          {formatTime(timeSlot.startTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {timeSlot.availableSpots} spots
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {selectedTimeSlot && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Add any notes or special requests (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or notes for your appointment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleBookReservation}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Booking..." : "Book Reservation"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}