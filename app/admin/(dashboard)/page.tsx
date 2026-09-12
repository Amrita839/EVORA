import { Package, CheckCircle2, Inbox, MessageCircle } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { getDashboardOverview, getPopularProducts, getTopCategories, getDailyCounts } from "@/lib/db/admin-stats";

export default async function AdminOverviewPage() {
  const [stats, popularProducts, topCategories, dailyCounts] = await Promise.all([
    getDashboardOverview(),
    getPopularProducts(5),
    getTopCategories(5),
    getDailyCounts(14),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} />
        <StatCard icon={CheckCircle2} label="Active Products" value={stats.activeProducts} />
        <StatCard icon={Inbox} label="New Enquiries" value={stats.newEnquiries} />
        <StatCard icon={MessageCircle} label="WhatsApp Leads" value={stats.whatsappLeads} />
      </div>

      <DashboardCharts data={dailyCounts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {popularProducts.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No product views recorded yet.</p>
            ) : (
              popularProducts.map(({ product, views }) => (
                <div key={product.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-forest-900">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{views} views</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {topCategories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-3">
                <p className="font-medium text-forest-900">{cat.name}</p>
                <span className="text-sm text-muted-foreground">
                  {cat._count.products} {cat._count.products === 1 ? "product" : "products"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
