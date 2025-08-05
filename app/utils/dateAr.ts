// Utilidad para obtener el inicio y fin del día en horario Argentina (GMT-3)
export function getArgentinaDayRange(dateArg?: Date) {
  // Si no se pasa fecha, usar hoy
  const now = dateArg ? new Date(dateArg) : new Date();
  // Ajustar a horario Argentina (GMT-3)
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // Inicio del día (00:00:00)
  const start = new Date(Date.UTC(year, month, day, 3, 0, 0)); // 00:00:00 GMT-3 es 03:00:00 UTC
  // Fin del día (23:59:59)
  const end = new Date(Date.UTC(year, month, day, 26, 59, 59)); // 23:59:59 GMT-3 es 26:59:59 UTC

  // Formato YYYY-MM-DD para filtros
  const pad = (n: number) => n.toString().padStart(2, '0');
  const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  return {
    startDate: format(start),
    endDate: format(end),
    start,
    end,
  };
}
