import { NextResponse } from "next/server";

const BACKEND_URL = "https://incredible-charm-production.up.railway.app";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No se proporcionó token de autenticación" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/tiendanube-efd/sync/test`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error en sincronización forzada EFD:", error);
    return NextResponse.json(
      { error: "Error al sincronizar órdenes EFD (forzado últimas 24hs)" },
      { status: 500 }
    );
  }
}
