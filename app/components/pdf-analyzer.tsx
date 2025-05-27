"use client";

import { useState, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Progress } from "@/app/components/ui/progress";
import {
  FileUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Producto {
  nombre: string;
  sku: string;
  cantidad: number;
  color: string | null;
  talle: string | null;
  colorytalle: string | null;
}

interface FileWithProducts extends File {
  productos?: Producto[];
}

export function PdfAnalyzer() {
  const [files, setFiles] = useState<FileWithProducts[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: FileWithProducts[] = [];
    let hasError = false;

    selectedFiles.forEach((file) => {
      if (file.type !== "application/pdf") {
        setError(`El archivo ${file.name} no es un PDF válido`);
        hasError = true;
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(
          `El archivo ${file.name} es demasiado grande. El tamaño máximo es 10MB`,
        );
        hasError = true;
        return;
      }

      validFiles.push(file);
    });

    if (!hasError) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const url =
        "https://incredible-charm-production.up.railway.app/analyze-pdf";
      console.log("Llamando a la API:", url);

      // Procesar cada archivo secuencialmente
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("files", file);
        formData.append("notes", notes);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error de la API:", errorData);
          throw new Error(
            `Error al analizar ${file.name}: ${
              errorData.error || "Error desconocido"
            }`,
          );
        }

        const data = await response.json();
        console.log(`Datos recibidos para ${file.name}:`, data);

        if (!Array.isArray(data)) {
          throw new Error(`Formato de respuesta inválido para ${file.name}`);
        }

        // Actualizar el archivo con sus productos
        setFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          newFiles[i] = { ...file, productos: data };
          return newFiles;
        });

        // Actualizar el progreso
        setUploadProgress(((i + 1) / files.length) * 100);
      }
    } catch (error) {
      console.error("Error al analizar los PDFs:", error);
      setError(
        error instanceof Error ? error.message : "Error al analizar los PDFs",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setError(null);
    setNotes("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadResults = (file: FileWithProducts) => {
    if (!file.productos?.length) return;

    const dataStr = JSON.stringify(file.productos, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr,
    )}`;
    const exportName = `analisis-${file.name}-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();
  };

  const downloadPDF = (file: FileWithProducts) => {
    if (!file.productos?.length) return;

    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Análisis de Productos", 14, 15);

    // Fecha y archivo
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 25);
    doc.text(`Archivo: ${file.name}`, 14, 30);

    // Tabla de productos
    autoTable(doc, {
      startY: 35,
      head: [["SKU", "Nombre", "Cantidad", "Color", "Talle"]],
      body: file.productos.map((p) => [
        p.sku,
        p.nombre,
        p.cantidad.toString(),
        p.color || "-",
        p.talle || "-",
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 35 },
    });

    // Guardar el PDF
    doc.save(
      `analisis-${file.name}-${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  // Función para obtener todos los productos de todos los archivos
  const getAllProducts = () => {
    return files.reduce<Producto[]>((allProducts, file) => {
      if (file.productos) {
        return [...allProducts, ...file.productos];
      }
      return allProducts;
    }, []);
  };

  // Función para descargar todos los resultados en JSON
  const downloadAllResults = () => {
    const allProducts = getAllProducts();
    if (!allProducts.length) return;

    const dataStr = JSON.stringify(allProducts, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr,
    )}`;
    const exportName = `analisis-completo-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();
  };

  // Función para descargar todos los resultados en PDF
  const downloadAllPDF = () => {
    const allProducts = getAllProducts();
    if (!allProducts.length) return;

    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Análisis de Productos", 14, 15);

    // Fecha y archivos
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 25);
    doc.text(
      `Archivos analizados: ${files.map((f) => f.name).join(", ")}`,
      14,
      30,
    );

    // Tabla de productos
    autoTable(doc, {
      startY: 35,
      head: [["SKU", "Nombre", "Cantidad", "Color", "Talle"]],
      body: allProducts.map((p) => [
        p.sku,
        p.nombre,
        p.cantidad.toString(),
        p.color || "-",
        p.talle || "-",
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 35 },
    });

    // Guardar el PDF
    doc.save(`analisis-completo-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const allProducts = getAllProducts();

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="border-b border-primary/10">
          <CardTitle className="font-akira text-primary">
            Analizar Documentos PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-files">Seleccionar Archivos PDF</Label>
              <Input
                id="pdf-files"
                type="file"
                accept=".pdf"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="border-primary/20 focus-visible:ring-primary"
                disabled={isUploading}
              />
              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm">
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Añade notas o instrucciones para el análisis"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-primary/20 focus-visible:ring-primary"
                disabled={isUploading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subiendo y analizando...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isUploading || files.length === 0}
                className="border-primary/20 hover:bg-primary/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUploading || files.length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Analizar PDFs
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {allProducts.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="border-b border-primary/10">
            <div className="flex justify-between items-center">
              <CardTitle className="font-akira text-primary">
                Resultados del Análisis ({allProducts.length} productos)
              </CardTitle>
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Análisis Completado</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Talle
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allProducts.map((producto, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.color || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.talle || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetForm}
              className="border-primary/20 hover:bg-primary/10"
            >
              <FileText className="mr-2 h-4 w-4" />
              Analizar Otros Documentos
            </Button>
            <div className="space-x-2">
              <Button
                onClick={downloadAllResults}
                className="bg-primary hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar JSON
              </Button>
              <Button
                onClick={downloadAllPDF}
                className="bg-primary hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
