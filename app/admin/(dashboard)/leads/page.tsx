import { Users } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { prisma } from "@/lib/db/prisma";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { lastActivityAt: "desc" }, take: 100 });

  if (leads.length === 0) {
    return <EmptyState icon={Users} title="No leads yet" description="Leads are created automatically from enquiries and opted-in contacts." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-beige-100/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">WhatsApp</th>
            <th className="px-4 py-3">Products Viewed</th>
            <th className="px-4 py-3">Last Activity</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="px-4 py-3">
                <p className="font-medium text-forest-900">{lead.name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{lead.phone}</p>
                {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{lead.source ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge variant={lead.whatsappOptIn ? "default" : "muted"}>{lead.whatsappOptIn ? "Opted in" : "No consent"}</Badge>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{lead.productsViewed.length}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{format(lead.lastActivityAt, "MMM d, yyyy")}</td>
              <td className="px-4 py-3">
                <LeadStatusSelect id={lead.id} status={lead.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
