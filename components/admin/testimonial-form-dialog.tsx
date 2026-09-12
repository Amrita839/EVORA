"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Testimonial } from "@prisma/client";

export function TestimonialFormDialog({ testimonial, trigger }: { testimonial?: Testimonial; trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    authorName: testimonial?.authorName ?? "",
    authorRole: testimonial?.authorRole ?? "",
    company: testimonial?.company ?? "",
    content: testimonial?.content ?? "",
    rating: testimonial?.rating ?? 5,
    imageUrl: testimonial?.imageUrl ?? "",
    isPublished: testimonial?.isPublished ?? true,
    sortOrder: testimonial?.sortOrder ?? 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(testimonial ? `/api/admin/testimonials/${testimonial.id}` : "/api/admin/testimonials", {
        method: testimonial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(testimonial ? "Testimonial updated" : "Testimonial added");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{testimonial ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-author">Author Name</Label>
              <Input id="t-author" required value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-role">Role</Label>
              <Input id="t-role" value={form.authorRole} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-company">Company</Label>
            <Input id="t-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-content">Testimonial</Label>
            <Textarea id="t-content" required rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-rating">Rating</Label>
            <Select value={String(form.rating)} onValueChange={(v) => setForm({ ...form, rating: Number(v) })}>
              <SelectTrigger id="t-rating">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r} stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-charcoal-800">
            <Checkbox checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v === true })} />
            Published
          </label>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
