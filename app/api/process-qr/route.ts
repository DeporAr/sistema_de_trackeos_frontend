import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { qrData, userId, userName, userRole } = await request.json();

    // Here you would typically send the data to your actual API
    // This is a placeholder response

    // Parse the QR data if possible
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      // If not JSON, just use the raw data
      parsedData = { rawData: qrData };
    }

    return NextResponse.json({
      success: true,
      message: "Información del pedido procesada correctamente",
      orderData: parsedData,
      scannedBy: {
        id: userId || "unknown",
        name: userName || "Usuario desconocido",
        role: userRole || "unknown",
      },
      scanTime: new Date().toISOString(),
      nextSteps:
        "Utilice la sección 'Actualizar Estado' para cambiar el estado del pedido",
    });
  } catch (error) {
    console.error("Error processing QR code:", error);
    return NextResponse.json(
      { success: false, message: "Error al procesar el código QR" },
      { status: 500 },
    );
  }
}
