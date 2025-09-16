"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  getAffiliates,
  type AffiliateListItem,
  createAffiliateAndSendEmail,
} from "../../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { showError, showSuccess } from "@/app/components/ToasterProvider";

export default function AdminAffiliatesClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [affiliates, setAffiliates] = useState<AffiliateListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  // Track pagination metadata if needed later
  const [, setTotalPages] = useState(1);
  const [, setTotalCount] = useState(0);
  const [creatingEmail, setCreatingEmail] = useState("");
  const [creatingName, setCreatingName] = useState("");
  const [creatingPhone, setCreatingPhone] = useState("");
  const [creatingPassword, setCreatingPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await getAffiliates("", 1, 20);
        if (res.success) {
          setAffiliates(res.affiliates || []);
          setTotalCount(res.pagination?.totalCount || 0);
          setTotalPages(res.pagination?.totalPages || 1);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return affiliates;
    const q = search.trim().toLowerCase();
    return affiliates.filter(
      (a) =>
        a.refCode.toLowerCase().includes(q) ||
        a.user.fullName.toLowerCase().includes(q) ||
        a.user.email.toLowerCase().includes(q) ||
        a.user.phoneNumber.includes(q)
    );
  }, [affiliates, search]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * 20;
    return filtered.slice(start, start + 20);
  }, [filtered, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Affiliates
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Track affiliate partners, tickets sold, and commissions.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Search Affiliates</CardTitle>
              <CardDescription>
                Find by ref code, name, email, or phone
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer">New Affiliate</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Affiliate</DialogTitle>
                  <DialogDescription>
                    Enter email to generate a unique referral link. We’ll email
                    the link to the affiliate.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <Input
                    placeholder="Affiliate email"
                    value={creatingEmail}
                    onChange={(e) => setCreatingEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Full name (optional)"
                    value={creatingName}
                    onChange={(e) => setCreatingName(e.target.value)}
                  />
                  <Input
                    placeholder="Phone (optional)"
                    value={creatingPhone}
                    onChange={(e) => setCreatingPhone(e.target.value)}
                  />
                  <Input
                    placeholder="Password (min 6 chars)"
                    type="password"
                    value={creatingPassword}
                    onChange={(e) => setCreatingPassword(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={async () => {
                      if (!creatingEmail) return;
                      if (creatingPassword && creatingPassword.length < 6) {
                        showError("Password must be at least 6 characters");
                        return;
                      }
                      setIsCreating(true);
                      try {
                        const res = await createAffiliateAndSendEmail({
                          email: creatingEmail,
                          fullName: creatingName || undefined,
                          phoneNumber: creatingPhone || undefined,
                          password: creatingPassword || undefined,
                        });
                        if (res.success) {
                          // reload list
                          const reload = await getAffiliates("", 1, 20);
                          if (reload.success) {
                            setAffiliates(reload.affiliates || []);
                            setTotalCount(reload.pagination?.totalCount || 0);
                            setTotalPages(reload.pagination?.totalPages || 1);
                            setCurrentPage(1);
                          }
                          setCreatingEmail("");
                          setCreatingName("");
                          setCreatingPhone("");
                          setCreatingPassword("");
                          setIsDialogOpen(false);
                          showSuccess(`Affiliate created. Ref: ${res.refCode}`);
                        } else {
                          showError(res.error || "Failed to create affiliate");
                        }
                      } catch (e) {
                        console.error(e);
                        showError("Failed to create affiliate");
                      } finally {
                        setIsCreating(false);
                      }
                    }}
                    disabled={isCreating || !creatingEmail}
                  >
                    {isCreating ? "Creating..." : "Create & Send Link"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              placeholder="Search affiliates..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affiliate List</CardTitle>
            <CardDescription>
              Showing {filtered.length} affiliate
              {filtered.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="text-center py-10 text-gray-600">
                Loading affiliates...
              </div>
            ) : pageItems.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                No affiliates found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pageItems.map((a) => (
                  <button
                    key={a.id}
                    onClick={() =>
                      router.push(`/admin-page/affiliates/${a.id}`)
                    }
                    className="text-left rounded-lg border bg-white p-4 hover:shadow cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {a.user.fullName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {a.user.email} • {a.user.phoneNumber}
                        </div>
                        <div className="text-sm text-gray-800 mt-1">
                          Ref Code:{" "}
                          <span className="font-mono font-semibold">
                            {a.refCode}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Orders</div>
                        <div className="text-xl font-bold">
                          {a.stats.successfulOrders}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded bg-gray-50 p-2">
                        <div className="text-gray-600">Tickets</div>
                        <div className="font-semibold">
                          {a.stats.ticketsSold}
                        </div>
                      </div>
                      <div className="rounded bg-gray-50 p-2">
                        <div className="text-gray-600">Subtotal</div>
                        <div className="font-semibold">
                          ₦{a.stats.subtotalRevenue.toLocaleString()}
                        </div>
                      </div>
                      <div className="rounded bg-gray-50 p-2">
                        <div className="text-gray-600">Commission</div>
                        <div className="font-semibold">
                          ₦{a.stats.totalCommission.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {a.stats.byTicketType && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(a.stats.byTicketType).map(
                          ([name, qty]) => (
                            <span
                              key={name}
                              className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium"
                            >
                              {name}: {qty}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Simple pager */}
            {filtered.length > 20 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <div className="text-sm text-gray-600">
                  Page {currentPage} of{" "}
                  {Math.max(1, Math.ceil(filtered.length / 20))}
                </div>
                <Button
                  variant="outline"
                  disabled={currentPage >= Math.ceil(filtered.length / 20)}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
