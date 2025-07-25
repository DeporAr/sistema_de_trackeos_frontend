import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { OrderStatusHistory } from "@/app/types/order";
import { format, parseISO } from "date-fns";
import { getStatusLabel, getStatusColor } from "@/app/types/order";

interface StatusHistoryTableProps {
  history: OrderStatusHistory[];
}

export function StatusHistoryTable({ history }: StatusHistoryTableProps) {
  const calculateTimeInStatus = (startedAt: string, endedAt: string | null) => {
    const start = parseISO(startedAt);
    const end = endedAt ? parseISO(endedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const safeDiffMs = Math.max(0, diffMs);
    const diffInHours = Math.floor(safeDiffMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(
      (safeDiffMs % (1000 * 60 * 60)) / (1000 * 60),
    );
    return `${diffInHours}h ${diffInMinutes}m`;
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="w-full p-4 bg-gray-50">
      <h4 className="font-semibold mb-4 text-center text-gray-800">Historial de Estados</h4>
      <Table className="w-full bg-white rounded-md shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Inicio</TableHead>
            <TableHead className="text-center">Fin</TableHead>
            <TableHead className="text-center">Duración</TableHead>
            <TableHead className="text-center">Cambiado por</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/50">
              <TableCell className="text-center">
                <Badge className={getStatusColor(record.status)}>
                  {getStatusLabel(record.status)}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-center">
                {formatDateTime(record.startedAt)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-center">
                {record.endedAt ? (
                  formatDateTime(record.endedAt)
                ) : (
                  <span className="text-muted-foreground">En curso</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-center">
                {calculateTimeInStatus(record.startedAt, record.endedAt)}
              </TableCell>
              <TableCell className="text-center">
                {typeof record.changedBy === 'string'
                  ? record.changedBy
                  : (record.changedBy as any)?.name || 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
