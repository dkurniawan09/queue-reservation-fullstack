import { ReservationsList } from "@/components/reservations-list";

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Reservations</h1>
          <p className="text-muted-foreground">
            View and manage your upcoming and past reservations
          </p>
        </div>
        <ReservationsList />
      </div>
    </div>
  );
}