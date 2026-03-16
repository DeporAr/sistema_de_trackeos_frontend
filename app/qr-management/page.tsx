"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { useApi } from "@/app/hooks/useApi";
import { useToast } from "@/app/components/ui/use-toast";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { getStatusLabel, getStatusColor } from "@/app/types/order";
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { jsPDF } from "jspdf";

interface OrderItem {
  id: number;
  orderCode: string;
  shippingCode: string | null;
  orderOrigin: string;
  status: string;
  recipientName?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

interface OrdersResponse {
  content: OrderItem[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface LabelData {
  shippingCode: string;
  orderCode: string;
  qrCodeImage: string;
  recipientName: string;
  address: string;
  postalCode: string;
  orderOrigin: string;
}

const ORIGINS = ["DUX", "TIENDA_NUBE", "MANUAL"];

export default function QRManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const apiFetch = useApi();
  const { toast } = useToast();

  // Filters state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [origin, setOrigin] = useState<string>("");

  // Data state
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // Selection state
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Download state
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);

  // Auth redirect
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Set default dates to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona un rango de fechas",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSelectedOrders(new Set());
    setSelectAll(false);

    try {
      const params = new URLSearchParams();
      params.append("start_date", startDate);
      params.append("end_date", endDate);
      if (origin && origin !== "all") {
        params.append("origin", origin);
      }
      params.append("page", currentPage.toString());
      params.append("size", pageSize.toString());

      const response = await apiFetch(
        `https://incredible-charm-production.up.railway.app/api/orders?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los pedidos");
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, origin, currentPage, apiFetch, toast]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(0);
    fetchOrders();
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allShippingCodes = new Set(
        orders
          .filter((order) => order.shippingCode)
          .map((order) => order.shippingCode as string)
      );
      setSelectedOrders(allShippingCodes);
    } else {
      setSelectedOrders(new Set());
    }
  };

  // Handle individual selection
  const handleSelectOrder = (shippingCode: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(shippingCode);
    } else {
      newSelected.delete(shippingCode);
    }
    setSelectedOrders(newSelected);
    setSelectAll(
      newSelected.size ===
        orders.filter((o) => o.shippingCode).length &&
        orders.filter((o) => o.shippingCode).length > 0
    );
  };

  // Fetch QR labels for selected orders
  const fetchLabels = async (): Promise<LabelData[]> => {
    const labels: LabelData[] = [];
    const selectedArray = Array.from(selectedOrders);

    for (let i = 0; i < selectedArray.length; i++) {
      const shippingCode = selectedArray[i];
      setPrintProgress(Math.round(((i + 1) / selectedArray.length) * 100));

      // Find the order to get the origin
      const order = orders.find(o => o.shippingCode === shippingCode);
      const orderOrigin = order?.orderOrigin || "";

      try {
        const response = await apiFetch(
          `https://incredible-charm-production.up.railway.app/orders/${shippingCode}/label`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.ok) {
          const labelData = await response.json();
          labels.push({
            ...labelData,
            orderOrigin: labelData.orderOrigin || orderOrigin,
          });
        } else {
          console.error(`Failed to fetch label for ${shippingCode}`);
        }
      } catch (error) {
        console.error(`Error fetching label for ${shippingCode}:`, error);
      }
    }

    return labels;
  };

  // Handle download PDF
  const handleDownloadPDF = async () => {
    if (selectedOrders.size === 0) {
      toast({
        title: "Advertencia",
        description: "Por favor selecciona al menos un pedido para descargar",
        variant: "destructive",
      });
      return;
    }

    setIsPrinting(true);
    setPrintProgress(0);

    try {
      const labels = await fetchLabels();

      if (labels.length === 0) {
        toast({
          title: "Error",
          description: "No se pudieron obtener las etiquetas QR",
          variant: "destructive",
        });
        return;
      }

      // Generate PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const labelsPerRow = 3;
      const labelWidth = (pageWidth - margin * 2 - (labelsPerRow - 1) * 5) / labelsPerRow;
      const labelHeight = 80; // Increased height for title and origin
      const qrSize = 35;

      // Helper function to normalize origin (remove _sin_envio suffix)
      const normalizeOrigin = (origin: string): string => {
        if (!origin) return '';
        return origin.toUpperCase().replace(/_SIN_ENVIO$/, '').trim();
      };

      // Helper function to get origin display name
      const getOriginDisplayName = (origin: string): string => {
        const normalized = normalizeOrigin(origin);
        const originMap: Record<string, string> = {
          'DUX': 'DUX',
          'TN': 'Tienda Nube',
          'TIENDA_NUBE': 'Tienda Nube',
          'ML': 'MercadoLibre',
          'MERCADO_LIBRE': 'MercadoLibre',
          'MANUAL': 'Manual',
        };
        return originMap[normalized] || origin || 'N/A';
      };

      // Helper function to get origin color
      const getOriginColor = (origin: string): { r: number; g: number; b: number } => {
        const normalized = normalizeOrigin(origin);
        const colorMap: Record<string, { r: number; g: number; b: number }> = {
          'DUX': { r: 59, g: 130, b: 246 }, // Blue
          'TN': { r: 16, g: 185, b: 129 }, // Green
          'TIENDA_NUBE': { r: 16, g: 185, b: 129 }, // Green
          'ML': { r: 255, g: 214, b: 0 }, // Yellow
          'MERCADO_LIBRE': { r: 255, g: 214, b: 0 }, // Yellow
          'MANUAL': { r: 156, g: 163, b: 175 }, // Gray
        };
        return colorMap[normalized] || { r: 156, g: 163, b: 175 };
      };

      let currentX = margin;
      let currentY = margin;
      let labelsInCurrentPage = 0;
      const maxLabelsPerPage = Math.floor((pageHeight - margin * 2) / (labelHeight + 5)) * labelsPerRow;

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];

        // Add new page if needed
        if (labelsInCurrentPage >= maxLabelsPerPage) {
          pdf.addPage();
          currentX = margin;
          currentY = margin;
          labelsInCurrentPage = 0;
        }

        // Draw label border with rounded effect
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.3);
        pdf.rect(currentX, currentY, labelWidth, labelHeight);

        // Header background
        pdf.setFillColor(30, 41, 59); // Dark blue-gray
        pdf.rect(currentX, currentY, labelWidth, 8, 'F');

        // DeporAR title
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        pdf.text("DeporAR", currentX + labelWidth / 2, currentY + 5.5, { align: "center" });

        // Origin badge
        const originColor = getOriginColor(label.orderOrigin);
        const originText = getOriginDisplayName(label.orderOrigin);
        const badgeWidth = pdf.getTextWidth(originText) + 4;
        const badgeX = currentX + labelWidth - badgeWidth - 2;
        const badgeY = currentY + 10;

        pdf.setFillColor(originColor.r, originColor.g, originColor.b);
        pdf.roundedRect(badgeX, badgeY, badgeWidth, 5, 1, 1, 'F');
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "bold");
        // Use dark text for yellow (MercadoLibre)
        const normalized = normalizeOrigin(label.orderOrigin);
        if (normalized === 'ML' || normalized === 'MERCADO_LIBRE') {
          pdf.setTextColor(0, 0, 0);
        } else {
          pdf.setTextColor(255, 255, 255);
        }
        pdf.text(originText, badgeX + badgeWidth / 2, badgeY + 3.5, { align: "center" });

        // Add QR code image
        if (label.qrCodeImage) {
          try {
            const imgX = currentX + (labelWidth - qrSize) / 2;
            const imgY = currentY + 17;
            pdf.addImage(label.qrCodeImage, "PNG", imgX, imgY, qrSize, qrSize);
          } catch (imgError) {
            console.error("Error adding QR image:", imgError);
          }
        }

        // Add text
        pdf.setTextColor(0, 0, 0);

        // Recipient name (truncate if too long)
        const recipientName = label.recipientName || "Sin nombre";
        const truncatedName = recipientName.length > 22
          ? recipientName.substring(0, 19) + "..."
          : recipientName;
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(truncatedName, currentX + labelWidth / 2, currentY + qrSize + 22, { align: "center" });

        // Order code
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text(`Pedido: ${label.orderCode}`, currentX + labelWidth / 2, currentY + qrSize + 27, { align: "center" });

        // Address (truncate if too long)
        const address = label.address || "";
        const truncatedAddress = address.length > 28
          ? address.substring(0, 25) + "..."
          : address;
        pdf.setFontSize(6);
        pdf.setTextColor(100, 100, 100);
        pdf.text(truncatedAddress, currentX + labelWidth / 2, currentY + qrSize + 32, { align: "center" });

        // Move to next position
        currentX += labelWidth + 5;
        if ((i + 1) % labelsPerRow === 0) {
          currentX = margin;
          currentY += labelHeight + 5;
        }
        labelsInCurrentPage++;
      }

      // Download PDF
      const fileName = `etiquetas_qr_${startDate || "all"}_${endDate || "all"}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Descarga exitosa",
        description: `Se descargaron ${labels.length} etiquetas en PDF.`,
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el PDF",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
      setPrintProgress(0);
    }
  };


  // Helper function to get badge styling for origin in table
  const getOriginBadgeClass = (origin: string): string => {
    const normalized = origin?.toUpperCase().replace(/_SIN_ENVIO$/, '').trim() || '';
    const badgeMap: Record<string, string> = {
      'DUX': 'bg-blue-100 text-blue-800',
      'TN': 'bg-green-100 text-green-800',
      'TIENDA_NUBE': 'bg-green-100 text-green-800',
      'ML': 'bg-yellow-100 text-yellow-800',
      'MERCADO_LIBRE': 'bg-yellow-100 text-yellow-800',
      'MANUAL': 'bg-gray-100 text-gray-800',
    };
    return badgeMap[normalized] || 'bg-gray-100 text-gray-800';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Main Content */}
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-akira">GESTIÓN DE QR</h1>
            <Button
              onClick={handleDownloadPDF}
              disabled={selectedOrders.size === 0 || isPrinting}
              className="bg-primary hover:bg-primary/90"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparando... {printProgress}%
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar QRs ({selectedOrders.size})
                </>
              )}
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origen
                </label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los orígenes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {ORIGINS.map((o) => {
                      const displayName = o === 'DUX' ? 'DUX' : o === 'TIENDA_NUBE' ? 'Tienda Nube' : 'Manual';
                      return (
                        <SelectItem key={o} value={o}>
                          {displayName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Resultados
                {totalElements > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({totalElements} pedidos)
                  </span>
                )}
              </h2>
              {selectedOrders.size > 0 && (
                <span className="text-sm text-primary font-medium">
                  {selectedOrders.size} seleccionados
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={(checked) =>
                            handleSelectAll(checked as boolean)
                          }
                          aria-label="Seleccionar todos"
                        />
                      </TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Destinatario</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          {order.shippingCode ? (
                            <Checkbox
                              checked={selectedOrders.has(order.shippingCode)}
                              onCheckedChange={(checked) =>
                                handleSelectOrder(
                                  order.shippingCode as string,
                                  checked as boolean
                                )
                              }
                              aria-label={`Seleccionar ${order.orderCode}`}
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.orderCode}
                        </TableCell>
                        <TableCell>{order.recipientName || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOriginBadgeClass(order.orderOrigin)}`}>
                            {order.orderOrigin}
                          </span>
                        </TableCell>
                        <TableCell>{order.city || "-"}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Página {currentPage + 1} de {totalPages}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentPage((prev) => Math.max(0, prev - 1));
                          fetchOrders();
                        }}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentPage((prev) =>
                            Math.min(totalPages - 1, prev + 1)
                          );
                          fetchOrders();
                        }}
                        disabled={currentPage >= totalPages - 1}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No hay pedidos. Usa los filtros para buscar.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
