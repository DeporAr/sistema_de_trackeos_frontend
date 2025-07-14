"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { X } from "lucide-react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const qrScannerId = "html5-qr-code-scanner";

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    const scanner = new Html5Qrcode(qrScannerId, { verbose: false });

    const handleSuccess = (decodedText: string) => {
      onScanRef.current(decodedText);
    };

    const handleError = (errorMessage: string) => {
      // Silently ignore errors. This prevents spamming the console.
    };

    const config = {
      fps: 10,
      qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdge * 0.8);
        return {
          width: qrboxSize,
          height: qrboxSize,
        };
      },
    };

    scanner.start(
      { facingMode: "environment" },
      config,
      handleSuccess,
      handleError
    ).catch((err) => {
      console.error("Unable to start scanning.", err);
    });

    return () => {
      const stopScanner = async () => {
        try {
          if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
            await scanner.stop();
          }
          // Forzar la limpieza del DOM para evitar renderizados duplicados en desarrollo
          const scannerElement = document.getElementById(qrScannerId);
          if (scannerElement) {
            scannerElement.innerHTML = "";
          }
        } catch (err) {
          console.error("Failed to stop the scanner on unmount.", err);
        }
      };
      stopScanner();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div id={qrScannerId} className="w-full"></div>
      <p className="text-sm text-center text-muted-foreground">
        Position the Mercado Libre order QR code within the frame
      </p>
      <Button
        variant="outline"
        onClick={onClose}
        className="gap-2 border-primary/20 hover:bg-primary/10"
      >
        <X className="w-4 h-4" /> Close Scanner
      </Button>
    </div>
  );
}
