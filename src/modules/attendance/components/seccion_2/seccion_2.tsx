import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import style from "./seccion_2.module.css";

export interface Asistencia {
  asis_id: number;
  asis_marca_temporal: string;
  asis_dni: string;
  asis_dato: string;
  asis_hora: string;
  asis_fecha: string;
}

const formatearHora = (hora: string) => {
  // "13:07:00" -> "01:07:00 p. m."
  const [h, m, s] = hora.split(":").map(Number);
  const periodo = h >= 12 ? "p. m." : "a. m.";
  const hora12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hora12).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${periodo}`;
};

const formatearFecha = (fecha: string) => {
  // "2026-01-07" -> "7/01/2026"
  const [anio, mes, dia] = fecha.split("-");
  return `${Number(dia)}/${mes}/${anio}`;
};

const Seccion_2 = () => {
  const [registros, setRegistros] = useState<Asistencia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarRegistros = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from("asistencia")
        .select("*")
        .order("asis_marca_temporal", { ascending: false });

      if (error) {
        console.error("Error al cargar asistencia:", error);
      } else {
        setRegistros(data as Asistencia[]);
      }
      setCargando(false);
    };

    cargarRegistros();
  }, []);

  return (
    <div className={style.seccion}>
      <section className={style.tabla}>

        <div className={style.header}>
          <span>Trabajador</span>
          <span>DNI</span>
          <span>Hora</span>
          <span>Fecha</span>
          <span>Marca temporal</span>
        </div>

        {cargando && <p className={style.sinResultados}>Cargando...</p>}

        {!cargando && registros.length === 0 && (
          <p className={style.sinResultados}>No se encontraron resultados</p>
        )}

        {!cargando && registros.map((r) => (
          <div key={r.asis_id} className={style.fila}>
            <div className={style.nombreCol}>
              <div className={style.avatar}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div>
                <p className={style.nombre}>{r.asis_dato}</p>
              </div>
            </div>

            <span className={style.celda}>{r.asis_dni}</span>

            <span className={style.celda}>{formatearHora(r.asis_hora)}</span>

            <span className={style.celda}>{formatearFecha(r.asis_fecha)}</span>

            <div className={style.celda}>
              <span className={style.marcaBadge}>
                {new Date(r.asis_marca_temporal).toLocaleString("es-PE")}
              </span>
            </div>
          </div>
        ))}

      </section>
    </div>
  );
};

export default Seccion_2;