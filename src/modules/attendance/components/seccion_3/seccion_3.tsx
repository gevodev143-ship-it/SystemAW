import { useState, useEffect, useMemo } from "react";
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

const REGISTROS_POR_PAGINA = 50;

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
  const [paginaActual, setPaginaActual] = useState(1);

  const cargarRegistros = async () => {
    setCargando(true);

    // Traemos todos los registros paginando internamente en bloques de 1000
    // (límite por defecto de Supabase/PostgREST) hasta cubrir el total.
    const TAMANO_LOTE = 1000;
    let desde = 0;
    let todos: Asistencia[] = [];

    while (true) {
      const { data, error } = await supabase
        .from("asistencia")
        .select("*")
        .order("asis_marca_temporal", { ascending: false })
        .range(desde, desde + TAMANO_LOTE - 1);

      if (error) {
        console.error("Error al cargar asistencia:", error);
        break;
      }

      const lote = (data as Asistencia[]) ?? [];
      todos = todos.concat(lote);

      if (lote.length < TAMANO_LOTE) break;
      desde += TAMANO_LOTE;
    }

    setRegistros(todos);
    setPaginaActual(1);
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

    setRegistros((prev) => {
      const nuevos = prev.filter((r) => r.asis_id !== id);
      const totalPaginas = Math.max(1, Math.ceil(nuevos.length / REGISTROS_POR_PAGINA));
      setPaginaActual((pagina) => Math.min(pagina, totalPaginas));
      return nuevos;
    });
  };

  const totalPaginas = Math.max(1, Math.ceil(registros.length / REGISTROS_POR_PAGINA));

  const registrosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    return registros.slice(inicio, inicio + REGISTROS_POR_PAGINA);
  }, [registros, paginaActual]);

  const irAPagina = (pagina: number) => {
    const destino = Math.min(Math.max(pagina, 1), totalPaginas);
    setPaginaActual(destino);
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

        {!cargando && registrosPagina.map((r) => (
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

      {!cargando && registros.length > 0 && (
        <div className={style.paginacion}>
          <button
            type="button"
            className={style.btnPagina}
            onClick={() => irAPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>

          <span className={style.infoPagina}>
            Página {paginaActual} de {totalPaginas} ({registros.length} registros)
          </span>

          <button
            type="button"
            className={style.btnPagina}
            onClick={() => irAPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      )}

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