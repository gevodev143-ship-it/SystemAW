import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./seccion_3.module.css";
import { supabase } from "../../../../lib/supabase";
import Modal from "./modal";

interface Staff {
  stff_id: number;
  stff_name: string;
  stff_lastname: string;
  stff_dni: string;
  stff_phone: string | null;
  stff_link_img: string | null;
  stff_active: boolean;
  job_position_customers: { jb_pstn_cust_name: string } | null;
  role_customers: { role_cust_name: string } | null;
}

const Seccion_3 = () => {
  const navigate = useNavigate();

  const [custId, setCustId] = useState<number | null>(null);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffSeleccionado, setStaffSeleccionado] = useState<Staff | null>(null);

  // =========================================================
  // RESOLVER cust_id (mismo patrón del Sidebar / Modal)
  // =========================================================
  useEffect(() => {
    const resolverCustId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("cust_id")
        .eq("cust_auth_id", user.id)
        .maybeSingle();

      if (customerError || !customer) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      setCustId(customer.cust_id);
    };

    resolverCustId();
  }, [navigate]);

  // =========================================================
  // LEER (SELECT) — staffs del cliente, con cargo y rol via join
  // =========================================================
  const fetchStaffs = async (id: number) => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("staffs")
      .select(
        `
        stff_id,
        stff_name,
        stff_lastname,
        stff_dni,
        stff_phone,
        stff_link_img,
        stff_active,
        job_position_customers ( jb_pstn_cust_name ),
        role_customers ( role_cust_name )
      `
      )
      .eq("cust_id", id)
      .order("stff_name", { ascending: true });

    if (error) {
      console.error("ERROR AL OBTENER PERSONALES:", error);
      setError("No se pudieron cargar los personales.");
    } else {
      setStaffs((data as any) ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (custId !== null) fetchStaffs(custId);
  }, [custId]);

  // =========================================================
  // ACTIVAR / DESACTIVAR (UPDATE stff_active)
  // =========================================================
  const toggleActivo = async (staff: Staff) => {
    if (!custId) return;

    const { error } = await supabase
      .from("staffs")
      .update({ stff_active: !staff.stff_active })
      .eq("stff_id", staff.stff_id)
      .eq("cust_id", custId);

    if (error) {
      console.error("ERROR AL CAMBIAR ESTADO:", error);
      alert("No se pudo cambiar el estado del personal.");
      return;
    }

    fetchStaffs(custId);
  };

  // =========================================================
  // ELIMINAR (DELETE)
  // =========================================================
  const handleEliminar = async (staff: Staff) => {
    if (!custId) return;

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar a "${staff.stff_name} ${staff.stff_lastname}"?`
    );
    if (!confirmar) return;

    const { error } = await supabase
      .from("staffs")
      .delete()
      .eq("stff_id", staff.stff_id)
      .eq("cust_id", custId);

    if (error) {
      console.error("ERROR AL ELIMINAR PERSONAL:", error);
      alert("No se pudo eliminar el personal.");
      return;
    }

    fetchStaffs(custId);
  };

  return (
    <div className={style.seccion}>
      {error && <span className={style.textoError}>{error}</span>}

      {loading ? (
        <p>Cargando personales...</p>
      ) : staffs.length === 0 ? (
        <p>No hay personales registrados.</p>
      ) : (
        <table className={style.tabla}>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Cargo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {staffs.map((staff) => (
              <tr key={staff.stff_id}>
                <td onClick={() => setStaffSeleccionado(staff)} style={{ cursor: "pointer" }}>
                  {staff.stff_link_img ? (
                    <img
                      src={staff.stff_link_img}
                      alt={staff.stff_name}
                      className={style.foto}
                    />
                  ) : (
                    <div className={style.fotoVacia} />
                  )}
                </td>
                <td>{staff.stff_name} {staff.stff_lastname}</td>
                <td>{staff.stff_dni}</td>
                <td>{staff.stff_phone || "—"}</td>
                <td>{staff.job_position_customers?.jb_pstn_cust_name || "—"}</td>
                <td>{staff.role_customers?.role_cust_name || "—"}</td>
                <td>
                  <span
                    className={
                      staff.stff_active ? style.badgeActivo : style.badgeInactivo
                    }
                  >
                    {staff.stff_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className={style.acciones}>
                  <button onClick={() => toggleActivo(staff)}>
                    {staff.stff_active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    className={style.botonEliminar}
                    onClick={() => handleEliminar(staff)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      )}
      {staffSeleccionado && (
        <Modal
          staff={{
            stff_name: staffSeleccionado.stff_name,
            stff_lastname: staffSeleccionado.stff_lastname,
            stff_dni: staffSeleccionado.stff_dni,
            stff_link_img: staffSeleccionado.stff_link_img,
            cargo: staffSeleccionado.job_position_customers?.jb_pstn_cust_name || "—",
          }}
          onClose={() => setStaffSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default Seccion_3;