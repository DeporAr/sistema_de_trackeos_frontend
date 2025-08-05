"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, RefreshCw } from "lucide-react";

interface MetricsFiltersProps {
  onFilterChange: (filters: {
    fecha_inicio: string;
    fecha_fin: string;
    responsable: string;
    pedido_id: string;
    estado: string;
    time_range: string;
  }) => void;
  onApplyFilters: () => void;
  isLoading: boolean;
  timeRange: string;
  initialStartDate?: string; // YYYY-MM-DD
  initialEndDate?: string;   // YYYY-MM-DD
}

export function MetricsFilters({
  onFilterChange,
  onApplyFilters,
  isLoading,
  timeRange,
  initialStartDate,
  initialEndDate,
}: MetricsFiltersProps) {
  // Inicializar con valores iniciales si están presentes
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialStartDate ? new Date(initialStartDate + 'T00:00:00-03:00') : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialEndDate ? new Date(initialEndDate + 'T23:59:59-03:00') : undefined
  );
  const [status, setStatus] = useState<string>("ALL");
  const [orderId, setOrderId] = useState<string>("");

  const handleApplyFilters = () => {
    // Asegurarse de que las fechas estén en el formato correcto YYYY-MM-DD
    const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd") : "";
    const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : "";

    // Convertir "ALL" a string vacío para el estado
    const formattedStatus = status === "ALL" ? "" : status;

    const newFilters = {
      fecha_inicio: formattedStartDate,
      fecha_fin: formattedEndDate,
      responsable: "",
      pedido_id: orderId,
      estado: formattedStatus,
      time_range: timeRange,
    };

    console.log("Aplicando filtros:", newFilters);
    onFilterChange(newFilters);
    onApplyFilters();
  };

  const handleResetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatus("ALL");
    setOrderId("");

    const resetFilters = {
      fecha_inicio: "",
      fecha_fin: "",
      responsable: "",
      pedido_id: "",
      estado: "",
      time_range: timeRange,
    };

    console.log("Reseteando filtros:", resetFilters);
    onFilterChange(resetFilters);
    onApplyFilters();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-black">Filtros</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha de inicio */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                id="startDate"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate
                  ? format(startDate, "PPP", { locale: es })
                  : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-50">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Fecha de fin */}
        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                id="endDate"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate
                  ? format(endDate, "PPP", { locale: es })
                  : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-50">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent className="bg-gray-50">
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="RECIBIDO">Recibido</SelectItem>
              <SelectItem value="EN_PREPARACION">En Preparación</SelectItem>
              <SelectItem value="EMBALADO">Embalado</SelectItem>
              <SelectItem value="DESPACHADO">Despachado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ID del Pedido */}
      <div className="space-y-2">
        <Label htmlFor="orderId">ID del Pedido</Label>
        <Input
          id="orderId"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Buscar por ID"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          variant="outline"
          onClick={handleResetFilters}
          disabled={isLoading}
        >
          Limpiar filtros
        </Button>
        <Button
          onClick={handleApplyFilters}
          className="bg-primary hover:bg-primary/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : (
            "Aplicar filtros"
          )}
        </Button>
      </div>
    </div>
  );
}
