"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Hash } from "lucide-react";

export default function QrDataDisplay({ qrData }: { qrData: string | null }) {
  if (!qrData) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="font-akira text-primary">
          Información del Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-primary" />
          <span className="font-medium">ID Escaneado:</span>
          <span className="font-mono bg-muted p-1 rounded-md text-sm">{qrData}</span>
        </div>
      </CardContent>
    </Card>
  );
}
