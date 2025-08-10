"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { MetricsFilters } from "@/app/components/metrics/metrics-filters";
import { MetricsCharts } from "@/app/components/metrics/metrics-charts";
import { MetricsTable } from "@/app/components/metrics/metrics-table";
import { Button } from "@/app/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getStatusLabel } from "@/app/types/order";
import { OrderPage } from "@/app/types/metrics";
import { useToast } from "@/app/components/ui/use-toast";
import { useApi } from "@/app/hooks/useApi";
import { getArgentinaDayRange } from "@/app/utils/dateAr";

interface Metrics {
  data: Array<{
    date: string;
    orders: number;
    avgTime: number;
    completed: number;
    pending: number;
  }>;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  ordersByUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  ordersByDate: Array<{
    date: string;
    count: number;
  }>;
  orders: OrderPage;
  averageProcessingTime: number;
  ordersAtRisk: number;
  efficiencyByUser: Array<{
    userId: string;
    userName: string;
    efficiency: number;
  }>;
}

export default function MetricsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  // Importar utilidad para fechas en Argentina
  // (al inicio del archivo)
  // import { getArgentinaDayRange } from "@/app/utils/dateAr";
  const { startDate, endDate } = getArgentinaDayRange();
  const [filters, setFilters] = useState({
    fecha_inicio: startDate,
    fecha_fin: endDate,
    responsable: "",
    pedido_id: "",
    estado: "",
    origen: "",
    time_range: "day",
  });
  const [exportFormat, setExportFormat] = useState<"excel" | "csv" | null>(
    null,
  );
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const apiFetch = useApi();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
    } else if (user?.role?.name !== "ADMIN" && user?.role?.name !== "SUPER_ADMIN") {
      router.push("/scan");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && (user.role?.name === "ADMIN" || user.role?.name === "SUPER_ADMIN")) {
      const fetchMetricsOrOrder = async () => {
        setIsLoadingMetrics(true);
        setMetrics(null); // Limpiar métricas anteriores

        try {
          if (filters.pedido_id) {
            // Lógica para buscar un solo pedido
            const response = await apiFetch(
              `https://incredible-charm-production.up.railway.app/orders/manual/${filters.pedido_id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              },
            );

            if (!response.ok) {
              if (response.status === 404) {
                toast({
                  title: "Pedido no encontrado",
                  description: "No se encontró un pedido con el ID proporcionado.",
                  variant: "destructive",
                });
              } else {
                throw new Error("Error al buscar el pedido");
              }
              return;
            }

            const orderData = await response.json();

            // Adaptar el pedido único a la estructura de Metrics
            const singleOrderMetrics: Metrics = {
              data: [],
              totalOrders: 1,
              completedOrders: orderData.status === 'ENTREGADO' ? 1 : 0,
              pendingOrders: orderData.status !== 'ENTREGADO' ? 1 : 0,
              ordersByStatus: [{ status: orderData.status, count: 1 }],
              ordersByUser: [],
              ordersByDate: [],
              orders: {
                content: [orderData],
                totalPages: 1,
                totalElements: 1,
                size: 1,
                number: 0,
                first: true,
                last: true,
                numberOfElements: 1,
                empty: false,
                sort: { empty: true, sorted: false, unsorted: true },
                pageable: {
                  offset: 0,
                  pageNumber: 0,
                  pageSize: 1,
                  paged: true,
                  unpaged: false,
                  sort: { empty: true, sorted: false, unsorted: true },
                },
              },
              averageProcessingTime: 0, // No se calcula para un solo pedido
              ordersAtRisk: 0, // No se calcula para un solo pedido
              efficiencyByUser: [],
            };
            setMetrics(singleOrderMetrics);

          } else {
            // Lógica para buscar métricas generales
            const params = new URLSearchParams();
            if (filters.fecha_inicio) params.append("start_date", filters.fecha_inicio);
            if (filters.fecha_fin) params.append("end_date", filters.fecha_fin);
            if (filters.responsable) params.append("user_id", filters.responsable);
            if (filters.estado) params.append("status", filters.estado);
            if (filters.origen) params.append("origen", filters.origen);
            params.append("page", (currentPage - 1).toString());
            params.append("size", "20");

            const response = await apiFetch(
              `https://incredible-charm-production.up.railway.app/metricas?${params.toString()}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              },
            );

            if (!response.ok) {
              throw new Error("Error al cargar las métricas");
            }

            const data = await response.json();
            setMetrics(data);
          }
        } catch (error) {
          console.error(error);
          toast({
            title: "Error",
            description: "No se pudieron cargar las métricas. Inténtalo de nuevo.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingMetrics(false);
        }
      };

      fetchMetricsOrOrder();
    }
  }, [user, filters, currentPage, toast]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setCurrentPage(1); // Resetear a la primera página con cada nuevo filtro
    console.log("Nuevos filtros recibidos:", newFilters);
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // This function can be left empty for now as setFilters triggers the fetch
  };

  const handleResetFilters = () => {
    const resetFilters = {
      fecha_inicio: "",
      fecha_fin: "",
      responsable: "",
      pedido_id: "",
      estado: "",
      origen: "",
      time_range: "day",
    };
    setFilters(resetFilters);
  };

  const handleExport = async (format: "excel" | "csv") => {
    setExportFormat(format);
    try {
      const queryParams = new URLSearchParams();
      if (filters.fecha_inicio)
        queryParams.append("fecha_inicio", filters.fecha_inicio);
      if (filters.fecha_fin) queryParams.append("fecha_fin", filters.fecha_fin);
      if (filters.responsable)
        queryParams.append("responsable", filters.responsable);
      if (filters.pedido_id) queryParams.append("pedido_id", filters.pedido_id);
      if (filters.estado) queryParams.append("estado", filters.estado);
      if (filters.time_range)
        queryParams.append("time_range", filters.time_range);

      const response = await fetch(
        `https://incredible-charm-production.up.railway.app/metricas/export?${queryParams.toString()}&format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Error al exportar los datos");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `metricas.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setExportFormat(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || (user?.role?.name !== "ADMIN" && user?.role?.name !== "SUPER_ADMIN")) {
    return null; // La redirección se maneja en el useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-akira">MÉTRICAS DE PEDIDOS</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleExport("excel")}
              disabled={isLoadingMetrics || exportFormat === "excel"}
            >
              {exportFormat === "excel" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                "Exportar Excel"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              disabled={isLoadingMetrics || exportFormat === "csv"}
            >
              {exportFormat === "csv" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                "Exportar CSV"
              )}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <MetricsFilters
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            isLoading={isLoadingMetrics}
            timeRange={filters.time_range}
            initialStartDate={filters.fecha_inicio}
            initialEndDate={filters.fecha_fin}
          />
        </div>

        {isLoadingMetrics ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : metrics ? (
          <>
            {!filters.pedido_id && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium mb-2">Total de Pedidos</h3>
                    <p className="text-3xl font-bold text-primary">
                      {metrics.totalOrders}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium mb-2">
                      Pedidos Completados
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      {metrics.completedOrders}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium mb-2">Tiempo Promedio</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {(metrics.averageProcessingTime / 3600).toFixed(1)}h
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium mb-2">Pedidos en Riesgo</h3>
                    <p className="text-3xl font-bold text-red-600">
                      {metrics.ordersAtRisk}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <MetricsCharts
                    data={{
                      ordersByDate: metrics.ordersByDate,
                      ordersByUser: metrics.ordersByUser,
                      ordersByStatus: metrics.ordersByStatus,
                    }}
                    timeRange={filters.time_range}
                  />
                </div>
              </>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium mb-4">
                {filters.pedido_id ? `Resultado para el Pedido #${filters.pedido_id}` : 'Listado de Pedidos'}
              </h2>
              <MetricsTable
                orders={metrics.orders.content}
                totalPages={metrics.orders.totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">
              No hay datos disponibles. Aplica filtros para ver las métricas.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
