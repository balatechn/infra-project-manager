"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Input,
  Badge,
  Modal,
  Spinner,
  EmptyState,
  StatCard,
} from "@/components/ui";
import {
  Plus,
  MapPin,
  Users,
  Tags,
  Trash2,
  Power,
  PowerOff,
  Building2,
  Mail,
  Phone,
  Palette,
  Code,
} from "lucide-react";
import type { MasterLocation, MasterClient, MasterCategory } from "@/types/project-types";

type Tab = "locations" | "clients" | "categories";

export default function MastersPage() {
  const [tab, setTab] = useState<Tab>("locations");
  const [locations, setLocations] = useState<MasterLocation[]>([]);
  const [clients, setClients] = useState<MasterClient[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/masters");
    const data = await res.json();
    setLocations(data.locations || []);
    setClients(data.clients || []);
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    const body: Record<string, string | null> = { type: tab };

    if (tab === "locations") {
      body.name = form.get("name") as string;
      body.city = form.get("city") as string;
      body.state = form.get("state") as string;
    } else if (tab === "clients") {
      body.name = form.get("name") as string;
      body.contactName = form.get("contactName") as string;
      body.email = form.get("email") as string;
      body.phone = form.get("phone") as string;
    } else {
      body.name = form.get("name") as string;
      body.code = form.get("code") as string;
      body.icon = form.get("icon") as string;
      body.color = form.get("color") as string;
    }

    const res = await fetch("/api/admin/masters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setIsCreateOpen(false);
      fetchAll();
    }
    setCreating(false);
  };

  const toggleActive = async (type: Tab, id: string, current: boolean) => {
    await fetch("/api/admin/masters", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, isActive: !current }),
    });
    fetchAll();
  };

  const deleteItem = async (type: Tab, id: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/admin/masters?type=${type}&id=${id}`, { method: "DELETE" });
    fetchAll();
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "locations", label: "Locations", icon: <MapPin className="h-4 w-4" />, count: locations.length },
    { key: "clients", label: "Clients", icon: <Users className="h-4 w-4" />, count: clients.length },
    { key: "categories", label: "Categories", icon: <Tags className="h-4 w-4" />, count: categories.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Masters</h1>
          <p className="text-sm text-navy-500 mt-0.5">Manage locations, clients, and categories</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add {tab === "locations" ? "Location" : tab === "clients" ? "Client" : "Category"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Locations" value={locations.length} color="blue" icon={<MapPin className="w-5 h-5" />} />
        <StatCard title="Clients" value={clients.length} color="green" icon={<Building2 className="w-5 h-5" />} />
        <StatCard title="Categories" value={categories.length} color="purple" icon={<Tags className="w-5 h-5" />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-100 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === t.key
                ? "bg-white text-navy-800 shadow-sm"
                : "text-navy-500 hover:text-navy-700"
            }`}
          >
            {t.icon}
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              tab === t.key ? "bg-navy-100 text-navy-600" : "bg-navy-200/50 text-navy-400"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          {/* Locations Table */}
          {tab === "locations" && (
            locations.length === 0 ? (
              <EmptyState title="No locations" description="Add project locations" action={
                <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Location</Button>
              } />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy-700 text-white">
                        <th className="px-4 py-3 text-left font-bold text-xs">Location</th>
                        <th className="px-4 py-3 text-left font-bold text-xs">City</th>
                        <th className="px-4 py-3 text-left font-bold text-xs">State</th>
                        <th className="px-4 py-3 text-center font-bold text-xs">Status</th>
                        <th className="px-4 py-3 text-right font-bold text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((loc) => (
                        <tr key={loc.id} className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-navy-400" />
                              <span className="font-semibold text-navy-800">{loc.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-navy-600">{loc.city || "—"}</td>
                          <td className="px-4 py-3 text-navy-600">{loc.state || "—"}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={loc.isActive ? "success" : "warning"}>
                              {loc.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => toggleActive("locations", loc.id, loc.isActive)}
                                className="p-1.5 rounded-md hover:bg-navy-100 text-navy-400 hover:text-navy-700 transition-colors"
                              >
                                {loc.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => deleteItem("locations", loc.id)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-navy-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )
          )}

          {/* Clients Table */}
          {tab === "clients" && (
            clients.length === 0 ? (
              <EmptyState title="No clients" description="Add client organizations" action={
                <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Client</Button>
              } />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy-700 text-white">
                        <th className="px-4 py-3 text-left font-bold text-xs">Client</th>
                        <th className="px-4 py-3 text-left font-bold text-xs">Contact</th>
                        <th className="px-4 py-3 text-left font-bold text-xs">Email</th>
                        <th className="px-4 py-3 text-left font-bold text-xs">Phone</th>
                        <th className="px-4 py-3 text-center font-bold text-xs">Status</th>
                        <th className="px-4 py-3 text-right font-bold text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id} className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-navy-400" />
                              <span className="font-semibold text-navy-800">{client.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-navy-600">{client.contactName || "—"}</td>
                          <td className="px-4 py-3">
                            {client.email ? (
                              <div className="flex items-center gap-1 text-navy-600">
                                <Mail className="h-3 w-3 text-navy-400" />
                                <span className="text-xs">{client.email}</span>
                              </div>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {client.phone ? (
                              <div className="flex items-center gap-1 text-navy-600">
                                <Phone className="h-3 w-3 text-navy-400" />
                                <span className="text-xs">{client.phone}</span>
                              </div>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={client.isActive ? "success" : "warning"}>
                              {client.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => toggleActive("clients", client.id, client.isActive)}
                                className="p-1.5 rounded-md hover:bg-navy-100 text-navy-400 hover:text-navy-700 transition-colors"
                              >
                                {client.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => deleteItem("clients", client.id)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-navy-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )
          )}

          {/* Categories Table */}
          {tab === "categories" && (
            categories.length === 0 ? (
              <EmptyState title="No categories" description="Add project categories" action={
                <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
              } />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy-700 text-white">
                        <th className="px-4 py-3 text-left font-bold text-xs">Category</th>
                        <th className="px-4 py-3 text-left font-bold text-xs">Code</th>
                        <th className="px-4 py-3 text-left font-bold text-xs">Color</th>
                        <th className="px-4 py-3 text-center font-bold text-xs">Status</th>
                        <th className="px-4 py-3 text-right font-bold text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id} className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Tags className="h-3.5 w-3.5 text-navy-400" />
                              <span className="font-semibold text-navy-800">{cat.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs font-mono bg-navy-50 px-2 py-1 rounded text-navy-600">{cat.code}</code>
                          </td>
                          <td className="px-4 py-3">
                            {cat.color ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-navy-200" style={{ backgroundColor: cat.color }} />
                                <span className="text-xs text-navy-500">{cat.color}</span>
                              </div>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={cat.isActive ? "success" : "warning"}>
                              {cat.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => toggleActive("categories", cat.id, cat.isActive)}
                                className="p-1.5 rounded-md hover:bg-navy-100 text-navy-400 hover:text-navy-700 transition-colors"
                              >
                                {cat.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => deleteItem("categories", cat.id)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-navy-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={`Add ${tab === "locations" ? "Location" : tab === "clients" ? "Client" : "Category"}`}>
        <form onSubmit={handleCreate} className="space-y-4">
          {tab === "locations" && (
            <>
              <Input name="name" label="Location Name" placeholder="e.g. Mumbai Office" required />
              <div className="grid grid-cols-2 gap-3">
                <Input name="city" label="City" placeholder="Mumbai" />
                <Input name="state" label="State" placeholder="Maharashtra" />
              </div>
            </>
          )}

          {tab === "clients" && (
            <>
              <Input name="name" label="Organization Name" placeholder="e.g. Tata Consultancy" required />
              <Input name="contactName" label="Contact Person" placeholder="Full name" />
              <div className="grid grid-cols-2 gap-3">
                <Input name="email" label="Email" type="email" placeholder="contact@company.com" />
                <Input name="phone" label="Phone" placeholder="+91 9876543210" />
              </div>
            </>
          )}

          {tab === "categories" && (
            <>
              <Input name="name" label="Category Name" placeholder="e.g. Structured Cabling" required />
              <Input name="code" label="Code" placeholder="e.g. CABLING" required />
              <div className="grid grid-cols-2 gap-3">
                <Input name="icon" label="Icon (optional)" placeholder="e.g. cable" />
                <Input name="color" label="Color (optional)" placeholder="e.g. #3B82F6" />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
