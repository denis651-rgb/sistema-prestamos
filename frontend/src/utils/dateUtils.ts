// Utilidad para obtener la fecha civil local real (YYYY-MM-DD) sin el error de huso horario UTC
export const getFechaHoyLocal = (): string => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
