"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Search, Loader2 } from "lucide-react";

interface ManualOrderEntryProps {
  onSubmit: (orderId: string) => void;
  isProcessing: boolean;
}

export function ManualOrderEntry({
  onSubmit,
  isProcessing,
}: ManualOrderEntryProps) {
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim() && !isProcessing) {
      onSubmit(orderId.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderId">ID del Pedido</Label>
          <Input
            id="orderId"
            placeholder="Ingresa el ID del pedido (ej: ML-12345)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="border-primary/20 focus-visible:ring-primary"
            disabled={isProcessing}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!orderId.trim() || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar Pedido
            </>
          )}
        </Button>
      </form>

      <p className="text-sm text-center text-muted-foreground">
        Ingresa el ID del pedido para cargarlo manualmente
      </p>
    </div>
  );
}
