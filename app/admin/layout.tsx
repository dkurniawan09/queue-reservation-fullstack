import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Users, Settings, ArrowLeft, LogOut } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/reserve">Book Appointment</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/queue"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-primary border-b-2 border-transparent hover:border-primary/50"
            >
              <Users className="h-4 w-4" />
              Queue Management
            </Link>
            <Link
              href="/admin/services"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-primary border-b-2 border-transparent hover:border-primary/50"
            >
              <Settings className="h-4 w-4" />
              Services
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}