"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Calendar } from "@/app/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2, RefreshCw, Download } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { getArgentinaDayRange } from "@/app/utils/dateAr";

// Tipos para los filtros
interface MetricsFilters {
  startDate: string;
  endDate: string;
  responsable: string;
  pedidoId: string;
  estado: string;
  origen: string;
}

// Tipos para el estado local con objetos Date
interface DashboardState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  responsable: string;
  pedidoId: string;
  estado: string;
  origen: string;
}

// Tipos para las métricas
interface MetricsData {
  byStatus: Array<{ name: string; value: number }>;
  byUser: Array<{ name: string; value: number }>;
  byDate: Array<{ date: string; count: number }>;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
}

interface User {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  // Importar utilidad para fechas en Argentina
  const { startDate: startDateStr, endDate: endDateStr } = getArgentinaDayRange();

  // Convertir las fechas string a objetos Date
  const today = new Date();

  // Estado para los campos del calendario
  const [dateState, setDateState] = useState<DashboardState>({
    startDate: new Date(startDateStr + "T00:00:00-03:00"),
    endDate: new Date(endDateStr + "T23:59:59-03:00"),
    responsable: "",
    pedidoId: "",
    estado: "",
    origen: "",
  });

  // Estado para los filtros que se envían a la API
  const [filters, setFilters] = useState<MetricsFilters>({
    startDate: startDateStr,
    endDate: endDateStr,
    responsable: "",
    pedidoId: "",
    estado: "",
    origen: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Colores para los gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Cargar usuarios para el filtro
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://incredible-charm-production.up.railway.app/usuarios",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Error al cargar usuarios");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  // Función para actualizar los filtros de fecha (objetos Date)
  const handleDateChange = (key: 'startDate' | 'endDate', value: Date | undefined) => {
    setDateState((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Actualizar también los filtros de string para la API
    if (value) {
      const formattedDate = format(value, 'yyyy-MM-dd');
      setFilters((prev) => ({
        ...prev,
        [key]: formattedDate,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: '',
      }));
    }
  };

  // Función para actualizar los demás filtros (string)
  const handleFilterChange = (key: keyof Omit<MetricsFilters, 'startDate' | 'endDate'>, value: string) => {
    setDateState((prev) => ({
      ...prev,
      [key]: value,
    }));

    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Función para obtener las métricas
  const fetchMetrics = async () => {
    setIsLoading(true);

    try {
      // Construir query params
      const queryParams = new URLSearchParams();
      if (filters.startDate)
        queryParams.append("fecha_inicio", filters.startDate);
      if (filters.endDate) queryParams.append("fecha_fin", filters.endDate);
      if (filters.responsable)
        queryParams.append("responsable", filters.responsable);
      if (filters.pedidoId) queryParams.append("pedido_id", filters.pedidoId);
      if (filters.estado) queryParams.append("estado", filters.estado);
      if (filters.origen) queryParams.append("origen", filters.origen);

      const response = await fetch(
        `https://incredible-charm-production.up.railway.app/metricas?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al obtener métricas");
      }

      const data = await response.json();
      setMetricsData(data);
    } catch (error) {
      console.error("Error al obtener métricas:", error);
      setMetricsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar métricas iniciales
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Función para exportar datos
  const exportData = () => {
    if (!metricsData) return;

    const dataStr = JSON.stringify(metricsData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr,
    )}`;

    const exportFileDefaultName = `metricas-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Métricas</h1>
        <p className="text-muted-foreground">
          Visualiza y analiza el rendimiento de los pedidos y el equipo
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtra las métricas por diferentes criterios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="startDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateState.startDate
                      ? format(dateState.startDate, "PPP", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-50">
                  <Calendar
                    mode="single"
                    selected={dateState.startDate}
                    onSelect={(date) => handleDateChange("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="endDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateState.endDate
                      ? format(dateState.endDate, "PPP", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-50">
                  <Calendar
                    mode="single"
                    selected={dateState.endDate}
                    onSelect={(date) => handleDateChange("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Select
                value={filters.responsable}
                onValueChange={(value) =>
                  handleFilterChange("responsable", value)
                }
              >
                <SelectTrigger id="responsable">
                  <SelectValue placeholder="Todos los responsables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los responsables</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pedidoId">ID del Pedido</Label>
              <Input
                id="pedidoId"
                value={filters.pedidoId}
                onChange={(e) => handleFilterChange("pedidoId", e.target.value)}
                placeholder="Buscar por ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={filters.estado}
                onValueChange={(value) => handleFilterChange("estado", value)}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="RECIBIDO">Recibido</SelectItem>
                  <SelectItem value="EN_PREPARACION">En Preparación</SelectItem>
                  <SelectItem value="EMBALADO">Embalado</SelectItem>
                  <SelectItem value="DESPACHADO">Despachado</SelectItem>
                  <SelectItem value="ENTREGADO">Entregado</SelectItem>
                  <SelectItem value="EN_FALTANTE">En Faltante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="origen">Origen</Label>
              <Select
                value={dateState.origen}
                onValueChange={(value) => handleFilterChange("origen", value)}
              >
                <SelectTrigger id="origen">
                  <SelectValue placeholder="Seleccionar origen" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50">
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="DUX">DUX</SelectItem>
                  <SelectItem value="TIENDA_NUBE">Tienda Nube</SelectItem>
                  <SelectItem value="MERCADO_LIBRE">Mercado Libre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={fetchMetrics} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {metricsData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metricsData.totalOrders}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pedidos Completados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {metricsData.completedOrders}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pedidos Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">
                  {metricsData.pendingOrders}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="charts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="charts">Gráficos</TabsTrigger>
              <TabsTrigger value="data">Datos</TabsTrigger>
            </TabsList>

            <TabsContent value="charts">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pedidos por Estado</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metricsData.byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {metricsData.byStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pedidos por Responsable</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metricsData.byUser}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Pedidos por Fecha</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metricsData.byDate}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Datos de Métricas</CardTitle>
                    <Button variant="outline" size="sm" onClick={exportData}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Datos
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Pedidos por Estado</h3>
                      <ul className="space-y-1">
                        {metricsData.byStatus.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">
                        Pedidos por Responsable
                      </h3>
                      <ul className="space-y-1">
                        {metricsData.byUser.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Pedidos por Fecha</h3>
                      <ul className="space-y-1">
                        {metricsData.byDate.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{item.date}</span>
                            <span className="font-medium">{item.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
