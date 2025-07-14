'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export function PdfAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const analyzePdf = useCallback(async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo PDF');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Aquí iría la lógica para analizar el PDF
      // Por ahora, simulamos un análisis exitoso después de 1.5 segundos
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulamos un resultado de análisis
      setResult('Análisis completado. Se encontraron 5 páginas y 3 tablas en el documento.');
    } catch (err) {
      setError('Error al analizar el PDF. Por favor, inténtalo de nuevo.');
      console.error('Error analyzing PDF:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [file]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analizador de PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pdf-file">Seleccionar archivo PDF</Label>
            <Input
              id="pdf-file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isAnalyzing}
            />
          </div>

          <Button
            onClick={analyzePdf}
            disabled={!file || isAnalyzing}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? 'Analizando...' : 'Analizar PDF'}
          </Button>

          {error && (
            <div className="p-4 text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 mt-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Resultados del análisis:</h3>
              <p>{result}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección para mostrar información adicional o resultados detallados */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>Este es un componente básico de análisis de PDF.</p>
              <p className="mt-2">Puedes expandir esta sección para mostrar más detalles sobre el análisis del PDF.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
