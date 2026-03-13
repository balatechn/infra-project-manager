"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  Modal,
  Spinner,
  EmptyState,
  Avatar,
} from "@/components/ui";
import { Plus, Search, Star, Phone, Mail } from "lucide-react";
import type { Vendor } from "@/types/project-types";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/vendors?${params}`);
    const data = await res.json();
    setVendors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, [search]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        contactName: form.get("contactName"),
        email: form.get("email"),
        phone: form.get("phone"),
        category: form.get("category"),
      }),
    });
    if (res.ok) {
      setIsCreateOpen(false);
      fetchVendors();
    }
    setCreating(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 mt-1">Manage vendor relationships and contracts</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      ) : vendors.length === 0 ? (
        <EmptyState
          title="No vendors found"
          description="Add vendors to manage your partnerships"
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar name={vendor.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                    <p className="text-sm text-gray-500">{vendor.contactName}</p>
                    <Badge className="mt-1">{vendor.category}</Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{vendor.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-0.5">{renderStars(vendor.rating)}</div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">SLA Score</p>
                    <p className={`text-sm font-semibold ${vendor.slaScore >= 90 ? "text-green-600" : vendor.slaScore >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                      {vendor.slaScore}%
                    </p>
                  </div>
                </div>

                {vendor.projects && vendor.projects.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-1">
                      Assigned to {vendor.projects.length} project(s)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {vendor.projects.slice(0, 3).map((pv) => (
                        <Badge key={pv.id} variant="info">
                          {pv.project?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Vendor Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Vendor">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input name="name" label="Company Name" placeholder="e.g. NetServe Solutions" required />
          <Input name="contactName" label="Contact Person" placeholder="Full name" required />
          <div className="grid grid-cols-2 gap-3">
            <Input name="email" label="Email" type="email" placeholder="email@company.com" required />
            <Input name="phone" label="Phone" placeholder="+91 9876543210" required />
          </div>
          <Input name="category" label="Category" placeholder="e.g. Networking, CCTV, Cabling" required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Adding..." : "Add Vendor"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
