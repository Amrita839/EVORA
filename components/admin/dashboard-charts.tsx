"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DailyCount = { date: string; views: number; enquiries: number; aiMessages: number };

export function DashboardCharts({ data }: { data: DailyCount[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Product Views</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartArea data={data} dataKey="views" color="#43663d" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Enquiries & AI Conversations</CardTitle>
        </CardHeader>
        <CardContent className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2d5b8" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#4a4842" />
              <YAxis tick={{ fontSize: 11 }} stroke="#4a4842" allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="enquiries" stroke="#c9a15e" fill="#f2e6c9" name="Enquiries" />
              <Area type="monotone" dataKey="aiMessages" stroke="#345031" fill="#d7e2d6" name="AI Messages" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ChartArea({ data, dataKey, color }: { data: DailyCount[]; dataKey: string; color: string }) {
  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2d5b8" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#4a4842" />
          <YAxis tick={{ fontSize: 11 }} stroke="#4a4842" allowDecimals={false} />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.15} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
