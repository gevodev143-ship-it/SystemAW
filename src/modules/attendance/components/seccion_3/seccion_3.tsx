import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../core/contexts/auth.context";
import { getStaffImageUrl } from "../../../../core/services/staff.service";
import style from "./seccion_3.module.css";
import Modal from "./shared/modal";

interface StaffAttendance {
  att_id: number;
  att_fecha: string;
  att_inicio_jornada: string | null;
  att_inicio_receso: string | null;
  att_fin_receso: string | null;
  att_fin_jornada: string | null;
  stff_id: number;
  staffs: {
    stff_name: string;
    stff_lastname: string;
    stff_dni: string;
    stff_link_img: string | null;
  };
}

// Calcula la fecha de HOY en hora local (Perú), no en UTC.
// toISOString() se desfasa un día apenas cae la tarde/noche en UTC-5.
const getFechaLocalHoy = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Seccion_3 = () => {
  const navigate = useNavigate();
  const { custId, custNameBucket, session, loadingAuth } = useAuth();

  const [attendance, setAttendance] = useState<StaffAttendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [selected, setSelected] = useState<StaffAttendance | null>(null);

  // 1. Redirige a /login si terminó de cargar la sesión y no hay ninguna.
  // Reemplaza la resolución manual de custId que hacía este componente antes.
  useEffect(() => {
    if (!loadingAuth && !session) {
      localStorage.clear();
      navigate("/login");
    }
  }, [loadingAuth, session, navigate]);

  // 2. fetchAttendance extraída para poder llamarla desde el useEffect
  // inicial y también desde el canal de Realtime
  const fetchAttendance = useCallback(async () => {
    if (custId === null) return;

    setLoadingAttendance(true);
    const today = getFechaLocalHoy();

    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
        att_id,
        att_fecha,
        att_inicio_jornada,
        att_inicio_receso,
        att_fin_receso,
        att_fin_jornada,
        stff_id,
        staffs!inner (
          stff_name,
          stff_lastname,
          stff_dni,
          stff_link_img,
          cust_id
        )
      `
      )
      .eq("att_fecha", today)
      .eq("staffs.cust_id", custId);

    if (error) {
      console.error("Error al cargar asistencias:", error);
      setAttendance([]);
    } else {
      setAttendance((data as unknown as StaffAttendance[]) ?? []);
    }

    setLoadingAttendance(false);
  }, [custId]);

  // 3. Cargar asistencias del día + suscripción Realtime, solo con custId listo
  useEffect(() => {
    if (custId === null) return;

    fetchAttendance();

    const canal = supabase
      .channel("attendance-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // antes decía "INSERT" — ahora escucha INSERT, UPDATE y DELETE
          schema: "public",
          table: "attendance",
        },
        () => {
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [custId, fetchAttendance]);

  const totalRegistrados = useMemo(() => attendance.length, [attendance]);

  // El loading cubre tanto la carga de sesión/customer (loadingAuth)
  // como la carga de asistencia (loadingAttendance)
  if (loadingAuth || loadingAttendance) {
    return (
      <div className={style.seccion}>
        <p>Cargando asistencia...</p>
      </div>
    );
  }

  return (
    <div className={style.seccion}>
      

      {attendance.length === 0 ? (
        <p>No hay registros de asistencia para el día de hoy.</p>
      ) : (
        <table className={style.tabla}>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Personal</th>
              <th>DNI</th>
              <th>Inicio jornada</th>
              <th>Inicio receso</th>
              <th>Fin receso</th>
              <th>Fin jornada</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => {
              const urlImagen = custNameBucket
                ? getStaffImageUrl(custNameBucket, a.staffs.stff_link_img)
                : null;

              return (
                <tr key={a.att_id} onClick={() => setSelected(a)}>
                  <td>
                    {urlImagen ? (
                      <img
                        src={urlImagen}
                        alt={`${a.staffs.stff_name} ${a.staffs.stff_lastname}`}
                        className={style.foto}
                      />
                    ) : (
                      <div className={style.fotoVacia} />
                    )}
                  </td>
                  <td>
                    {a.staffs.stff_name} {a.staffs.stff_lastname}
                  </td>
                  <td>{a.staffs.stff_dni}</td>
                  <td>{a.att_inicio_jornada ?? "-"}</td>
                  <td>{a.att_inicio_receso ?? "-"}</td>
                  <td>{a.att_fin_receso ?? "-"}</td>
                  <td>{a.att_fin_jornada ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selected && (
        <Modal
          title={`${selected.staffs.stff_name} ${selected.staffs.stff_lastname}`}
          onClose={() => setSelected(null)}
        >
          <p><strong>DNI:</strong> {selected.staffs.stff_dni}</p>
          <p><strong>Inicio jornada:</strong> {selected.att_inicio_jornada ?? "-"}</p>
          <p><strong>Inicio receso:</strong> {selected.att_inicio_receso ?? "-"}</p>
          <p><strong>Fin receso:</strong> {selected.att_fin_receso ?? "-"}</p>
          <p><strong>Fin jornada:</strong> {selected.att_fin_jornada ?? "-"}</p>
        </Modal>
      )}
    </div>
  );
};

export default Seccion_3;