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
}

export function MetricsFilters({
  onFilterChange,
  onApplyFilters,
  isLoading,
  timeRange,
}: MetricsFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [responsibleParty, setResponsibleParty] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [status, setStatus] = useState<string>("ALL");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRange);

  const handleApplyFilters = () => {
    // Asegurarse de que las fechas estén en el formato correcto YYYY-MM-DD
    const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd") : "";
    const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : "";

    // Asegurarse de que el responsable sea un número si no está vacío
    const formattedResponsible = responsibleParty
      ? responsibleParty.trim()
      : "";

    // Asegurarse de que el ID del pedido no tenga espacios
    const formattedOrderId = orderId ? orderId.trim() : "";

    // Convertir "ALL" a string vacío para el estado
    const formattedStatus = status === "ALL" ? "" : status;

    const newFilters = {
      fecha_inicio: formattedStartDate,
      fecha_fin: formattedEndDate,
      responsable: formattedResponsible,
      pedido_id: formattedOrderId,
      estado: formattedStatus,
      time_range: selectedTimeRange,
    };

    console.log("Aplicando filtros:", newFilters);
    onFilterChange(newFilters);
    onApplyFilters();
  };

  const handleResetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setResponsibleParty("");
    setOrderId("");
    setStatus("ALL");
    setSelectedTimeRange("day");

    const resetFilters = {
      fecha_inicio: "",
      fecha_fin: "",
      responsable: "",
      pedido_id: "",
      estado: "",
      time_range: "day",
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
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Responsable */}
        <div className="space-y-2">
          <Label htmlFor="responsibleParty">Responsable</Label>
          <Input
            id="responsibleParty"
            value={responsibleParty}
            onChange={(e) => setResponsibleParty(e.target.value)}
            placeholder="Nombre del responsable"
          />
        </div>

        {/* ID de Orden */}
        <div className="space-y-2">
          <Label htmlFor="orderId">ID de Orden</Label>
          <Input
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Ej: ORD-12345"
          />
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="RECIBIDO">Recibido</SelectItem>
              <SelectItem value="EN_PREPARACION">En Preparación</SelectItem>
              <SelectItem value="PREPARADO">Preparado</SelectItem>
              <SelectItem value="EN_EMBALAJE">En Embalaje</SelectItem>
              <SelectItem value="EMBALADO">Embalado</SelectItem>
              <SelectItem value="EN_DESPACHO">En Despacho</SelectItem>
              <SelectItem value="DESPACHADO">Despachado</SelectItem>
              <SelectItem value="ENTREGADO">Entregado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rango de tiempo */}
        <div className="space-y-2">
          <Label htmlFor="timeRange">Rango de tiempo</Label>
          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange}
          >
            <SelectTrigger id="timeRange">
              <SelectValue placeholder="Seleccionar rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Diario</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="month">Mensual</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
