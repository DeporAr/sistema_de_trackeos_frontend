import { NextResponse } from "next/server";

// In a real app, this would be stored in a database
const orderHistory: Record<string, any[]> = {};

export async function POST(request: Request) {
  try {
    const { qrData, status, userId, userName, userRole } = await request.json();

    if (!qrData || !status || !userId || !userName) {
      return NextResponse.json(
        { success: false, message: "Faltan datos requeridos" },
        { status: 400 },
      );
    }

    // Parse the QR data to get the order ID
    let orderId: string;
    try {
      // Try to parse as JSON first
      const parsedData = JSON.parse(qrData);
      orderId = parsedData.orderId || "unknown";
    } catch (e) {
      // If not JSON, use the raw data as the ID
      orderId = qrData.substring(0, 20); // Limit length for display
    }

    // Create a history entry
    const historyEntry = {
      timestamp: new Date().toISOString(),
      status,
      userId,
      userName,
      userRole,
    };

    // Add to history (in a real app, this would be saved to a database)
    if (!orderHistory[orderId]) {
      orderHistory[orderId] = [];
    }
    orderHistory[orderId].push(historyEntry);

    // In a real app, you would update the order status in your database
    // and potentially trigger notifications or other workflows

    return NextResponse.json({
      success: true,
      message: `Estado del pedido actualizado a: ${status}`,
      orderId,
      newStatus: status,
      updatedBy: {
        id: userId,
        name: userName,
        role: userRole,
      },
      timestamp: historyEntry.timestamp,
      history: orderHistory[orderId],
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, message: "Error al actualizar el estado del pedido" },
      { status: 500 },
    );
  }
}
