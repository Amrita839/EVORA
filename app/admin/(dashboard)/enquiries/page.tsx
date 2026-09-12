import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { EnquiryStatusSelect } from "@/components/admin/enquiry-status-select";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (enquiries.length === 0) {
    return <EmptyState icon={Inbox} title="No enquiries yet" description="Enquiries submitted from the site will appear here." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-beige-100/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Items / Message</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Received</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {enquiries.map((e) => (
            <tr key={e.id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-forest-900">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.phone}</p>
                {e.email && <p className="text-xs text-muted-foreground">{e.email}</p>}
                {e.company && <p className="text-xs text-muted-foreground">{e.company}</p>}
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline">{e.type}</Badge>
              </td>
              <td className="max-w-xs px-4 py-3">
                {e.items.length > 0 && (
                  <ul className="mb-1 text-xs text-charcoal-800">
                    {e.items.map((item) => (
                      <li key={item.id}>
                        {item.notes ?? "Item"} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                )}
                {e.quantity && <p className="text-xs text-muted-foreground">Qty: {e.quantity}</p>}
                {e.message && <p className="line-clamp-2 text-xs text-muted-foreground">{e.message}</p>}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{e.source}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{format(e.createdAt, "MMM d, yyyy")}</td>
              <td className="px-4 py-3">
                <EnquiryStatusSelect id={e.id} status={e.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
