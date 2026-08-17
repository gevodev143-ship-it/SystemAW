import ExcelJS from "exceljs";
import { supabase } from "../../../../lib/supabase";
import logoUrl from "../../../../assets/img/image.png";

interface AsistenciaRow {
  asis_id: number;
  asis_marca_temporal: string;
  asis_dni: string;
  asis_dato: string;
  asis_hora: string;
  asis_fecha: string; // "YYYY-MM-DD"
}

const DIAS_SEMANA = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIÉRCOLES",
  "JUEVES",
  "VIERNES",
  "SÁBADO",
];

// "07:10:00" -> "7:10 a. m."  (sin segundos, sin cero a la izquierda, como en la planilla)
const formatearHoraCorta = (hora: string): string => {
  if (!hora) return "";
  const [hStr, mStr] = hora.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const periodo = h >= 12 ? "p. m." : "a. m.";
  const hora12 = h % 12 === 0 ? 12 : h % 12;
  return `${hora12}:${String(m).padStart(2, "0")} ${periodo}`;
};

// "YYYY-MM-DD" -> Date (evita desfases de zona horaria)
const parsearFecha = (fecha: string): Date => {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
};

const formatearFechaDDMMYYYY = (fecha: Date): string => {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

const toISODate = (fecha: Date): string => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const extraerNombre = (dato: string): string => {
  if (!dato) return "";
  return dato.replace(/^nombre:\s*/i, "").trim();
};

export const generarReporteAsistencia = async (dniIngresado: string): Promise<void> => {
  const dni = dniIngresado.trim();
  if (!dni) {
    throw new Error("Ingresa un DNI válido");
  }

  const { data, error } = await supabase
    .from("asistencia")
    .select("*")
    .eq("asis_dni", dni)
    .order("asis_marca_temporal", { ascending: true });

  if (error) {
    throw new Error("Error al consultar la base de datos: " + error.message);
  }

  const registros = (data as AsistenciaRow[]) ?? [];

  if (registros.length === 0) {
    throw new Error("No se encontraron registros de asistencia para ese DNI");
  }

  const nombre = extraerNombre(registros[0].asis_dato);

  // Agrupamos por fecha, respetando el orden de marca temporal dentro de cada día
  const porFecha = new Map<string, AsistenciaRow[]>();
  for (const r of registros) {
    const lista = porFecha.get(r.asis_fecha) ?? [];
    lista.push(r);
    porFecha.set(r.asis_fecha, lista);
  }

  // Rango: desde el primer día con registro hasta hoy
  const fechasOrdenadas = [...porFecha.keys()].sort();
  const primeraFecha = parsearFecha(fechasOrdenadas[0]);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const dias: Date[] = [];
  const cursor = new Date(primeraFecha);
  while (cursor <= hoy) {
    dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // =========================================================
  // Construcción del Excel
  // =========================================================
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ASISTENCIA");

  worksheet.columns = [
    { key: "n", width: 6 },
    { key: "dia", width: 12 },
    { key: "fecha", width: 12 },
    { key: "llegada", width: 14 },
    { key: "salidaAlmuerzo", width: 14 },
    { key: "llegadaAlmuerzo", width: 14 },
    { key: "horaSalida", width: 14 },
    { key: "tardanzas", width: 16 },
    { key: "adelanto", width: 16 },
    { key: "descuento", width: 20 },
    { key: "detalle1", width: 22 },
    { key: "monto1", width: 10 },
    { key: "detalle2", width: 22 },
    { key: "monto2", width: 10 },
    { key: "observacion", width: 18 },
  ];

  // Fila 1-2: título
  worksheet.mergeCells("A1:O2");
  worksheet.getCell("A1").value = "ASISTENCIA DEL PERSONAL";
  worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  // Fila 3: nombre + DNI
  worksheet.mergeCells("A3:O3");
  worksheet.getCell("A3").value = `${nombre} - DNI Nª ${dni}`;
  worksheet.getCell("A3").alignment = { horizontal: "center" };
  worksheet.getCell("A3").font = { bold: true };

  // Fila 4: inicio laboral + encabezados de descuentos (sin datos, solo el rótulo)
  worksheet.mergeCells("A4:J4");
  worksheet.getCell("A4").value = `INICIO LABORAL ${formatearFechaDDMMYYYY(primeraFecha)}`;
  worksheet.mergeCells("K4:L4");
  worksheet.getCell("K4").value = "DESCUENTO POR COMPRA AL CREDITO";
  worksheet.mergeCells("M4:N4");
  worksheet.getCell("M4").value = "DESCUENTO POR REPOSICION DE MATERIAL DAÑADO";

  // Fila 5: encabezados de columna
  const filaEncabezado = worksheet.getRow(5);
  filaEncabezado.values = [
    "N°",
    "DIA",
    "FECHA",
    "HORA LLEGADA",
    "SALIDA ALMUERZO",
    "LLEGADA ALMUERZO",
    " HORA SALIDA  ",
    "TARDANZAS (MINUTOS)",
    "ADELANTO EN EFECTIVO",
    "DESCUENTO X FALTA (50.00) X TARDANZA (5.00)",
    "DETALLE",
    "MONTO",
    "DETALLE",
    "MONTO",
    "OBSERVACION",
  ];
  filaEncabezado.font = { bold: true };
  filaEncabezado.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

  // Filas de datos: solo se llenan N°, DIA, FECHA y las 4 columnas de hora
  dias.forEach((diaFecha, index) => {
    const iso = toISODate(diaFecha);
    const registrosDelDia = (porFecha.get(iso) ?? []).slice().sort(
      (a, b) => new Date(a.asis_marca_temporal).getTime() - new Date(b.asis_marca_temporal).getTime()
    );

    const [rLlegada, rSalidaAlmuerzo, rLlegadaAlmuerzo, rHoraSalida] = registrosDelDia;

    worksheet.addRow({
      n: index + 1,
      dia: DIAS_SEMANA[diaFecha.getDay()],
      fecha: formatearFechaDDMMYYYY(diaFecha),
      llegada: rLlegada ? formatearHoraCorta(rLlegada.asis_hora) : "",
      salidaAlmuerzo: rSalidaAlmuerzo ? formatearHoraCorta(rSalidaAlmuerzo.asis_hora) : "",
      llegadaAlmuerzo: rLlegadaAlmuerzo ? formatearHoraCorta(rLlegadaAlmuerzo.asis_hora) : "",
      horaSalida: rHoraSalida ? formatearHoraCorta(rHoraSalida.asis_hora) : "",
    });
  });

  worksheet.eachRow((row) => {
    row.alignment = { ...row.alignment, horizontal: "center", vertical: "middle" };
  });

  // Logo en A1:B4
  const respuestaLogo = await fetch(logoUrl);
  const bufferLogo = await respuestaLogo.arrayBuffer();
  const imageId = workbook.addImage({
    buffer: bufferLogo,
    extension: "png",
  });
  worksheet.addImage(imageId, "A1:B4");

  // Descarga
  const bufferArchivo = await workbook.xlsx.writeBuffer();
  const blob = new Blob([bufferArchivo], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ASISTENCIA_${dni}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};