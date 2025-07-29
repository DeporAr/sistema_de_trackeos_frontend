"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MetricsChartsProps {
  data: {
    ordersByDate: Array<{
      date: string;
      count: number;
    }>;
    ordersByUser: Array<{
      userId: string;
      userName: string;
      count: number;
    }>;
    ordersByStatus: Array<{
      status: string;
      count: number;
    }>;
  };
  timeRange: string;
}

export function MetricsCharts({ data, timeRange }: MetricsChartsProps) {
  const formatDate = (date: string) => {
    // The date string from the API (e.g., "2025-07-28") is treated as UTC midnight by new Date().
    // Appending 'T00:00:00' makes it be treated as local time midnight, avoiding timezone shifts.
    const d = new Date(`${date}T00:00:00`);
    return format(d, "dd/MM/yyyy", { locale: es });
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Pedidos por fecha</TabsTrigger>
          <TabsTrigger value="users">Pedidos por usuario</TabsTrigger>
          <TabsTrigger value="status">Estado de los pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos por fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ordersByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label) => formatDate(label)}
                      formatter={(value: number) => [value, "Pedidos"]}
                    />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos por usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ordersByUser}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="userName" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [value, "Pedidos"]}
                    />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Estado de los pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ordersByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ status, percent }) =>
                        `${status}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.ordersByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, "Pedidos"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
