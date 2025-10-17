"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { listDiscounts, createDiscount, updateDiscount, deleteDiscount } from "../../actions";
import { showError, showSuccess } from "@/app/components/ToasterProvider";

interface DiscountRow {
  id: string;
  code: string;
  percentage: number;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
}

export default function AdminDiscountsClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [discounts, setDiscounts] = useState<DiscountRow[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [percentage, setPercentage] = useState("10");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountRow | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editPercentage, setEditPercentage] = useState("10");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await listDiscounts();
        if (res.success) setDiscounts(res.discounts || []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return discounts;
    return discounts.filter(d => d.code.toLowerCase().includes(q));
  }, [discounts, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Discounts</h2>
          <p className="text-sm md:text-base text-gray-600">Create and manage discount codes.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Search Discounts</CardTitle>
              <CardDescription>Find by code</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer">New Discount</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Discount</DialogTitle>
                  <DialogDescription>Codes are case-insensitive. Leave code empty to auto-generate.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <Input placeholder="Code (optional)" value={code} onChange={(e) => setCode(e.target.value)} />
                  <Input
                    placeholder="Percentage (e.g. 10 for 10%)"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <input id="active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    <label htmlFor="active">Active</label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={async () => {
                      const pctNum = Number(percentage);
                      if (!Number.isFinite(pctNum) || pctNum <= 0 || pctNum > 100) {
                        showError("Enter a valid percentage between 1 and 100");
                        return;
                      }
                      setIsSaving(true);
                      try {
                        const res = await createDiscount({ code: code.trim() || undefined, percentage: pctNum / 100, isActive });
                        if (res.success) {
                          const reload = await listDiscounts();
                          setDiscounts(reload.discounts || []);
                          setCode("");
                          setPercentage("10");
                          setIsActive(true);
                          setIsDialogOpen(false);
                          showSuccess(`Discount created${res.code ? ` (${res.code})` : ''}`);
                        } else {
                          showError(res.error || "Failed to create discount");
                        }
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              placeholder="Search codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Codes</CardTitle>
            <CardDescription>Showing {filtered.length} code{filtered.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="text-center py-10 text-gray-600">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-600">No discounts</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((d) => (
                  <div key={d.id} className="rounded-lg border bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{d.code}</div>
                        <div className="text-sm text-gray-600">{Math.round(d.percentage * 100)}% off</div>
                        <div className="text-xs text-gray-500 mt-1">Used {d.usageCount} time{d.usageCount === 1 ? '' : 's'}</div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingDiscount(d);
                            setEditCode(d.code);
                            setEditPercentage(String(Math.round(d.percentage * 100)));
                            setEditIsActive(d.isActive);
                            setIsEditDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Discount Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Discount</DialogTitle>
              <DialogDescription>Update the discount code, percentage, or active status.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Code</label>
                <Input 
                  placeholder="Discount code" 
                  value={editCode} 
                  onChange={(e) => setEditCode(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Percentage</label>
                <Input
                  placeholder="Percentage (e.g. 10 for 10%)"
                  value={editPercentage}
                  onChange={(e) => setEditPercentage(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input 
                  id="edit-active" 
                  type="checkbox" 
                  checked={editIsActive} 
                  onChange={(e) => setEditIsActive(e.target.checked)} 
                />
                <label htmlFor="edit-active">Active</label>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center">
              <div className="flex gap-2">
                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="cursor-pointer"
                  >
                    Delete
                  </Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600">Are you sure?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (!editingDiscount) return;
                        setIsDeleting(true);
                        try {
                          const res = await deleteDiscount(editingDiscount.id);
                          if (res.success) {
                            const reload = await listDiscounts();
                            setDiscounts(reload.discounts || []);
                            setIsEditDialogOpen(false);
                            setEditingDiscount(null);
                            setShowDeleteConfirm(false);
                            showSuccess('Discount deleted successfully');
                          } else {
                            showError(res.error || "Failed to delete discount");
                          }
                        } finally {
                          setIsDeleting(false);
                        }
                      }}
                      disabled={isDeleting}
                      className="cursor-pointer"
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingDiscount(null);
                    setShowDeleteConfirm(false);
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!editingDiscount) return;
                    
                    const trimmedCode = editCode.trim();
                    if (!trimmedCode || trimmedCode.length < 3) {
                      showError("Code must be at least 3 characters");
                      return;
                    }

                    const pctNum = Number(editPercentage);
                    if (!Number.isFinite(pctNum) || pctNum <= 0 || pctNum > 100) {
                      showError("Enter a valid percentage between 1 and 100");
                      return;
                    }

                    setIsSaving(true);
                    try {
                      const res = await updateDiscount(editingDiscount.id, {
                        code: trimmedCode,
                        percentage: pctNum / 100,
                        isActive: editIsActive
                      });

                      if (res.success) {
                        const reload = await listDiscounts();
                        setDiscounts(reload.discounts || []);
                        setIsEditDialogOpen(false);
                        setEditingDiscount(null);
                        setShowDeleteConfirm(false);
                        showSuccess('Discount updated successfully');
                      } else {
                        showError(res.error || "Failed to update discount");
                      }
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  {isSaving ? "Updating..." : "Update"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


