import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { getEventTypeCounts, getTopSearchQueries, getDailyCounts, getPopularProducts } from "@/lib/db/admin-stats";

const LABELS: Record<string, string> = {
  PAGE_VIEW: "Page Views",
  PRODUCT_VIEW: "Product Views",
  PRODUCT_CLICK: "Product Clicks",
  SEARCH: "Searches",
  AI_MESSAGE: "AI Conversations",
  ADD_TO_ENQUIRY: "Added to Enquiry",
  WHATSAPP_CLICK: "WhatsApp Clicks",
  ENQUIRY_SUBMITTED: "Enquiries Submitted",
  CORPORATE_QUOTE: "Corporate Quote Requests",
  NEWSLETTER_SIGNUP: "Newsletter Signups",
};

export default async function AdminAnalyticsPage() {
  const [eventCounts, topSearches, dailyCounts, popularProducts] = await Promise.all([
    getEventTypeCounts(30),
    getTopSearchQueries(10),
    getDailyCounts(14),
    getPopularProducts(8),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {eventCounts.map((e) => (
          <Card key={e.type}>
            <CardContent className="p-4">
              <p className="text-2xl font-semibold text-forest-950">{e.count}</p>
              <p className="text-xs text-muted-foreground">{LABELS[e.type] ?? e.type}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts data={dailyCounts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Searches</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {topSearches.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No searches recorded yet.</p>
            ) : (
              topSearches.map((s) => (
                <div key={s.query} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-charcoal-800">{s.query}</span>
                  <span className="text-sm text-muted-foreground">{s.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Viewed Products</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {popularProducts.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No product views recorded yet.</p>
            ) : (
              popularProducts.map(({ product, views }) => (
                <div key={product.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-charcoal-800">{product.name}</span>
                  <span className="text-sm text-muted-foreground">{views} views</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
