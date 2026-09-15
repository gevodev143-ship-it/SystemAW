import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";
import style from "./seccion_3.module.css";
import Modal from "./modal";

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

const Seccion_3 = () => {
  const navigate = useNavigate();

  const [custId, setCustId] = useState<number | null>(null);
  const [attendances, setAttendances] = useState<StaffAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StaffAttendance | null>(null);

  // 1. Resolver custId a partir de la sesión, igual que el Sidebar
  useEffect(() => {
    const resolveCustId = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const { data: customer, error } = await supabase
        .from("customers")
        .select("cust_id")
        .eq("cust_auth_id", session.user.id)
        .single();

      if (error || !customer) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      setCustId(customer.cust_id);
    };

    resolveCustId();
  }, [navigate]);

  // 2. Cargar asistencias del día solo cuando ya tenemos custId
  useEffect(() => {
    if (custId === null) return;

    const fetchAttendances = async () => {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];

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
        setAttendances([]);
      } else {
        setAttendances((data as unknown as StaffAttendance[]) ?? []);
      }

      setLoading(false);
    };

    fetchAttendances();
  }, [custId]);

  const totalRegistrados = useMemo(() => attendances.length, [attendances]);

  // El loading cubre tanto la resolución de custId como la carga de asistencia
  if (loading) {
    return (
      <div className={style.seccion}>
        <p>Cargando asistencia...</p>
      </div>
    );
  }

  return (
    <div className={style.seccion}>
      <h2>Asistencia de hoy ({totalRegistrados})</h2>

      {attendances.length === 0 ? (
        <p>No hay registros de asistencia para el día de hoy.</p>
      ) : (
        <table className={style.tabla}>
          <thead>
            <tr>
              <th>Personal</th>
              <th>DNI</th>
              <th>Inicio jornada</th>
              <th>Inicio receso</th>
              <th>Fin receso</th>
              <th>Fin jornada</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((a) => (
              <tr key={a.att_id} onClick={() => setSelected(a)}>
                <td>
                  {a.staffs.stff_name} {a.staffs.stff_lastname}
                </td>
                <td>{a.staffs.stff_dni}</td>
                <td>{a.att_inicio_jornada ?? "-"}</td>
                <td>{a.att_inicio_receso ?? "-"}</td>
                <td>{a.att_fin_receso ?? "-"}</td>
                <td>{a.att_fin_jornada ?? "-"}</td>
              </tr>
            ))}
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