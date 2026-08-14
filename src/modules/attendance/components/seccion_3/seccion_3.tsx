import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import style from "./seccion_3.module.css";
import Modal from "./modal";

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

const Seccion_3 = () => {
  const [registros, setRegistros] = useState<Asistencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idEditar, setIdEditar] = useState<number | null>(null);
  const [idEliminando, setIdEliminando] = useState<number | null>(null);

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

  useEffect(() => {
    cargarRegistros();
  }, []);

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    setIdEliminando(id);
    const { error } = await supabase.from("asistencia").delete().eq("asis_id", id);
    setIdEliminando(null);

    if (error) {
      console.error("Error al eliminar registro:", error);
      window.alert("No se pudo eliminar el registro");
      return;
    }

    setRegistros((prev) => prev.filter((r) => r.asis_id !== id));
  };

  return (
    <div className={style.seccion}>
      <section className={style.tabla}>

        <div className={style.header}>
          <span>Trabajador</span>
          <span>DNI</span>
          <span>Hora</span>
          <span>Fecha</span>
          <span>Marca temporal</span>
          <span>Acciones</span>
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

            <div className={style.accionesCol}>
              <button
                className={style.btnAccion}
                title="Editar"
                type="button"
                onClick={() => setIdEditar(r.asis_id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#2b5aa0" strokeWidth="1.8">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>

              <button
                className={style.btnAccion}
                title="Eliminar"
                type="button"
                disabled={idEliminando === r.asis_id}
                onClick={() => handleEliminar(r.asis_id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="1.8">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </div>
          </div>
        ))}

      </section>

      {idEditar !== null && (
        <Modal
          asisId={idEditar}
          onClose={() => setIdEditar(null)}
          onGuardado={cargarRegistros}
        />
      )}
    </div>
  );
};

export default Seccion_3;