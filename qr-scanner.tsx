"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const qrScannerId = "html5-qr-code-scanner";
    const qrContainer = document.createElement("div");
    qrContainer.id = qrScannerId;
    containerRef.current.appendChild(qrContainer);

    scannerRef.current = new Html5Qrcode(qrScannerId);

    const startScanner = async () => {
      try {
        await scannerRef.current?.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            console.log(errorMessage);
          },
        );
      } catch (err) {
        console.error("Error starting QR scanner:", err);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  const stopScanner = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current
        .stop()
        .catch((err) => console.error("Error stopping scanner:", err));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="w-full h-64 bg-muted rounded-md overflow-hidden"
      ></div>
      <p className="text-sm text-center text-muted-foreground">
        Position the Mercado Libre order QR code within the frame
      </p>
      <Button variant="outline" onClick={onClose} className="gap-2">
        <X className="w-4 h-4" /> Close Scanner
      </Button>
    </div>
  );
}
