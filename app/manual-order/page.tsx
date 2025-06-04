"use client";

import { useState, useEffect } from "react";
import {
  ManualOrderForm,
  ManualOrderList,
} from "@/app/components/orders/manual-order-entry";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";

export default function ManualOrderPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshList, setRefreshList] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleManualOrderSubmit = async (shippingInfo: any) => {
    try {
      const response = await fetch("/api/orders/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingData: {
            address: shippingInfo.address,
            recipientName: shippingInfo.name,
            floor: shippingInfo.floor,
            door: shippingInfo.door,
            postalCode: shippingInfo.postalCode,
            city: shippingInfo.city,
            phone: shippingInfo.phone,
            housingType: shippingInfo.housingType,
            observations: shippingInfo.observations,
            email: shippingInfo.email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear la orden manual");
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error creating manual order:", error);
    }
  };

  const handleSuccess = (orderCode: string) => {
    setRefreshList((prev) => prev + 1);
    setSuccessMsg(`Pedido generado correctamente. ID: ${orderCode}`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos Manuales</h1>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Nuevo Pedido
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-center">
          {successMsg}
        </div>
      )}

      {showForm && (
        <div className="mb-8">
          <ManualOrderForm
            onSubmit={handleManualOrderSubmit}
            isProcessing={false}
            onCancel={() => setShowForm(false)}
            onSuccess={handleSuccess}
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por ID, código, cliente o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ManualOrderList searchQuery={searchQuery} key={refreshList} />
      </div>
    </div>
  );
}
