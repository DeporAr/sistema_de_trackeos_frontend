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
import XLSX from "xlsx-js-style";

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
      // Fetch all orders for export (without pagination limit)
      const params = new URLSearchParams();
      if (filters.fecha_inicio) params.append("start_date", filters.fecha_inicio);
      if (filters.fecha_fin) params.append("end_date", filters.fecha_fin);
      if (filters.responsable) params.append("user_id", filters.responsable);
      if (filters.estado) params.append("status", filters.estado);
      if (filters.origen) params.append("origen", filters.origen);
      params.append("page", "0");
      params.append("size", "10000"); // Large size to get all records

      const response = await apiFetch(
        `https://incredible-charm-production.up.railway.app/metricas?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Error al obtener los datos para exportar");

      const data: Metrics = await response.json();

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Define styles
      const titleStyle = {
        font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1F4E79" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      const subtitleStyle = {
        font: { bold: true, sz: 11, color: { rgb: "1F4E79" } },
        alignment: { horizontal: "left", vertical: "center" },
      };

      const headerStyle = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2E75B6" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      const dataStyle = {
        font: { sz: 10 },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "D9D9D9" } },
          bottom: { style: "thin", color: { rgb: "D9D9D9" } },
          left: { style: "thin", color: { rgb: "D9D9D9" } },
          right: { style: "thin", color: { rgb: "D9D9D9" } },
        },
      };

      const dataStyleAlt = {
        ...dataStyle,
        fill: { fgColor: { rgb: "F2F2F2" } },
      };

      // Prepare worksheet data with title rows
      const wsData: (string | number | { v: string | number; s: object })[][] = [];

      // Title row (merged)
      wsData.push([
        { v: "REPORTE DE PEDIDOS - DEPORAR", s: titleStyle },
        { v: "", s: titleStyle },
        { v: "", s: titleStyle },
        { v: "", s: titleStyle },
        { v: "", s: titleStyle },
        { v: "", s: titleStyle },
        { v: "", s: titleStyle },
      ]);

      // Empty row
      wsData.push([]);

      // Info rows
      const dateRangeText = filters.fecha_inicio && filters.fecha_fin
        ? `${filters.fecha_inicio} al ${filters.fecha_fin}`
        : "Todas las fechas";
      wsData.push([{ v: `Período: ${dateRangeText}`, s: subtitleStyle }]);
      wsData.push([{ v: `Generado: ${new Date().toLocaleString("es-AR")}`, s: subtitleStyle }]);
      wsData.push([{ v: `Total de pedidos: ${data.orders.content.length}`, s: subtitleStyle }]);

      // Empty row before headers
      wsData.push([]);

      // Headers
      const headers = ["ID Pedido", "Estado", "Responsable", "Fecha Creación", "Última Actualización", "Origen", "Código Envío"];
      wsData.push(headers.map(h => ({ v: h, s: headerStyle })));

      // Data rows
      data.orders.content.forEach((order, index) => {
        const style = index % 2 === 0 ? dataStyle : dataStyleAlt;
        wsData.push([
          { v: order.orderCode || order.id, s: style },
          { v: getStatusLabel(order.status), s: style },
          { v: order.assignedToName || "Sin asignar", s: style },
          { v: order.createdAt ? new Date(order.createdAt).toLocaleString("es-AR") : "", s: style },
          { v: order.updatedAt ? new Date(order.updatedAt).toLocaleString("es-AR") : "", s: style },
          { v: order.orderOrigin || "", s: style },
          { v: order.shippingCode || "", s: style },
        ]);
      });

      // Create worksheet from array
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);

      // Merge title cells
      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Merge title row
      ];

      // Set column widths
      worksheet["!cols"] = [
        { wch: 15 }, // ID Pedido
        { wch: 18 }, // Estado
        { wch: 25 }, // Responsable
        { wch: 22 }, // Fecha Creación
        { wch: 22 }, // Última Actualización
        { wch: 15 }, // Origen
        { wch: 18 }, // Código Envío
      ];

      // Set row heights
      worksheet["!rows"] = [
        { hpt: 35 }, // Title row height
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");

      // Add summary sheet
      const summaryData: (string | number | { v: string | number; s: object })[][] = [];

      summaryData.push([
        { v: "RESUMEN DE MÉTRICAS", s: titleStyle },
        { v: "", s: titleStyle },
        { v: "", s: titleStyle },
      ]);
      summaryData.push([]);
      summaryData.push([
        { v: "Métrica", s: headerStyle },
        { v: "Valor", s: headerStyle },
      ]);
      summaryData.push([
        { v: "Total de Pedidos", s: dataStyle },
        { v: data.totalOrders, s: dataStyle },
      ]);
      summaryData.push([
        { v: "Pedidos Completados", s: dataStyleAlt },
        { v: data.completedOrders, s: dataStyleAlt },
      ]);
      summaryData.push([
        { v: "Pedidos Pendientes", s: dataStyle },
        { v: data.pendingOrders, s: dataStyle },
      ]);
      summaryData.push([
        { v: "Tiempo Promedio (horas)", s: dataStyleAlt },
        { v: (data.averageProcessingTime / 3600).toFixed(1), s: dataStyleAlt },
      ]);
      summaryData.push([
        { v: "Pedidos en Riesgo", s: dataStyle },
        { v: data.ordersAtRisk, s: dataStyle },
      ]);

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
      summarySheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
      summarySheet["!rows"] = [{ hpt: 35 }];

      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

      // Generate file
      const fileExtension = format === "excel" ? "xlsx" : "csv";
      const fileName = `metricas_${filters.fecha_inicio || "all"}_${filters.fecha_fin || "all"}.${fileExtension}`;

      if (format === "excel") {
        XLSX.writeFile(workbook, fileName);
      } else {
        XLSX.writeFile(workbook, fileName, { bookType: "csv" });
      }

      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${data.orders.content.length} pedidos.`,
      });
    } catch (error) {
      console.error("Error al exportar:", error);
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos. Inténtalo de nuevo.",
        variant: "destructive",
      });
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
