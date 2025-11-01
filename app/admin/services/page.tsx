"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, Plus, Edit, Trash2, Clock } from "lucide-react";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
});

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // TODO: Check if user has admin role
  const isAdmin = true; // Temporary for development

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
  });

  useEffect(() => {
    if (!user || !isAdmin) return;

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [user, isAdmin]);

  const handleCreateService = async () => {
    try {
      const validatedData = serviceSchema.parse({
        name: formData.name,
        description: formData.description || undefined,
        duration: parseInt(formData.duration),
      });

      setIsCreating(true);
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (response.ok) {
        const newService = await response.json();
        toast.success("Service created successfully!");
        setServices([...services, newService]);
        setFormData({ name: "", description: "", duration: "" });
        setShowForm(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create service");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Please check your input: " + error.errors[0]?.message);
      } else {
        toast.error("Failed to create service");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration.toString(),
    });
    setShowForm(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      const validatedData = serviceSchema.parse({
        name: formData.name,
        description: formData.description || undefined,
        duration: parseInt(formData.duration),
      });

      setIsCreating(true);
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (response.ok) {
        const updatedService = await response.json();
        toast.success("Service updated successfully!");
        setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
        setFormData({ name: "", description: "", duration: "" });
        setShowForm(false);
        setEditingService(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update service");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Please check your input: " + error.errors[0]?.message);
      } else {
        toast.error("Failed to update service");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Service deleted successfully!");
        setServices(services.filter(s => s.id !== serviceId));
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete service");
      }
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const handleFormSubmit = () => {
    if (editingService) {
      handleUpdateService();
    } else {
      handleCreateService();
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Settings className="mx-auto h-12 w-12 text-red-500 mb-4" />
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
          <h1 className="text-3xl font-bold mb-2">Service Management</h1>
          <p className="text-muted-foreground">
            Manage the services available for booking
          </p>
        </div>

        {/* Service Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingService ? "Edit Service" : "Create New Service"}
              </CardTitle>
              <CardDescription>
                {editingService
                  ? "Update the service details"
                  : "Add a new service to your booking system"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Haircut, Consultation"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the service..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 30"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleFormSubmit}
                  disabled={isCreating}
                >
                  {isCreating
                    ? (editingService ? "Updating..." : "Creating...")
                    : (editingService ? "Update Service" : "Create Service")
                  }
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingService(null);
                    setFormData({ name: "", description: "", duration: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Services
                </CardTitle>
                <CardDescription>
                  Manage the services available for booking
                </CardDescription>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first service to get started
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {service.description || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {service.duration} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
            <a href="/admin/queue">Queue Management</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}