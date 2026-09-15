import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./modal.module.css";
import { supabase } from "../../../../lib/supabase";

interface JobPositionOption {
  jb_pstn_cust_id: number;
  jb_pstn_cust_name: string;
}

interface RoleOption {
  role_cust_id: number;
  role_cust_name: string;
}

interface ModalProps {
  onClose: () => void;
  onCreado: () => void;
}

const DNI_REGEX = /^\d{8}$/;
const PHONE_REGEX = /^\d{9}$/;

const Modal = ({ onClose, onCreado }: ModalProps) => {
  const navigate = useNavigate();

  const [custId, setCustId] = useState<number | null>(null);
  const [cargos, setCargos] = useState<JobPositionOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [linkImagen, setLinkImagen] = useState("");
  const [cargoId, setCargoId] = useState<number | "">("");
  const [roleId, setRoleId] = useState<number | "">("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================================================
  // RESOLVER cust_id Y CARGAR CATÁLOGOS (cargos + roles del cliente)
  // =========================================================
  useEffect(() => {
    const cargarDatos = async () => {
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

      const { cust_id } = customer;
      setCustId(cust_id);

      const [cargosRes, rolesRes] = await Promise.all([
        supabase
          .from("job_position_customers")
          .select("jb_pstn_cust_id, jb_pstn_cust_name")
          .eq("cust_id", cust_id)
          .order("jb_pstn_cust_name", { ascending: true }),
        supabase
          .from("role_customers")
          .select("role_cust_id, role_cust_name")
          .eq("cust_id", cust_id)
          .order("role_cust_name", { ascending: true }),
      ]);

      if (!cargosRes.error && cargosRes.data) {
        setCargos(cargosRes.data);
      }

      if (!rolesRes.error && rolesRes.data) {
        setRoles(rolesRes.data);
      }

      setLoadingCatalogos(false);
    };

    cargarDatos();
  }, [navigate]);

  // =========================================================
  // VALIDACIÓN
  // =========================================================
  const validar = (): boolean => {
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return false;
    }

    if (!apellido.trim()) {
      setError("El apellido es obligatorio.");
      return false;
    }

    if (!DNI_REGEX.test(dni.trim())) {
      setError("El DNI debe tener 8 dígitos.");
      return false;
    }

    if (telefono.trim() && !PHONE_REGEX.test(telefono.trim())) {
      setError("El teléfono debe tener 9 dígitos.");
      return false;
    }

    if (cargoId === "") {
      setError("Selecciona un cargo.");
      return false;
    }

    return true;
  };

  // =========================================================
  // CREAR (INSERT)
  // =========================================================
  const handleCrear = async () => {
    if (!custId) return;
    setError("");

    if (!validar()) return;

    setSaving(true);

    const { error } = await supabase.from("staffs").insert({
      stff_name: nombre.trim(),
      stff_lastname: apellido.trim(),
      stff_dni: dni.trim(),
      stff_phone: telefono.trim() || null,
      stff_link_img: linkImagen.trim() || null,
      cust_id: custId,
      jb_pstn_cust_id: cargoId,
      role_cust_id: roleId === "" ? null : roleId,
    });

    if (error) {
      console.error("ERROR AL CREAR PERSONAL:", error);
      if (error.code === "23505") {
        setError("Ya existe un personal registrado con ese DNI.");
      } else {
        setError("No se pudo crear el personal. Intenta de nuevo.");
      }
      setSaving(false);
      return;
    }

    setSaving(false);
    onCreado();
  };

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContenido} onClick={(e) => e.stopPropagation()}>
        <h3>Crear Personal</h3>

        {loadingCatalogos ? (
          <p>Cargando datos...</p>
        ) : (
          <>
            <label className={style.label}>Nombre</label>
            <input
              className={style.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <label className={style.label}>Apellido</label>
            <input
              className={style.input}
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />

            <label className={style.label}>DNI</label>
            <input
              className={style.input}
              value={dni}
              maxLength={8}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
            />

            <label className={style.label}>Teléfono</label>
            <input
              className={style.input}
              value={telefono}
              maxLength={9}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
            />

            <label className={style.label}>Link de Imagen</label>
            <input
              className={style.input}
              value={linkImagen}
              onChange={(e) => setLinkImagen(e.target.value)}
              placeholder="https://..."
            />

            <label className={style.label}>Cargo</label>
            <select
              className={style.input}
              value={cargoId}
              onChange={(e) =>
                setCargoId(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">— Selecciona un cargo —</option>
              {cargos.map((c) => (
                <option key={c.jb_pstn_cust_id} value={c.jb_pstn_cust_id}>
                  {c.jb_pstn_cust_name}
                </option>
              ))}
            </select>

            <label className={style.label}>Rol (opcional)</label>
            <select
              className={style.input}
              value={roleId}
              onChange={(e) =>
                setRoleId(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">— Sin rol —</option>
              {roles.map((r) => (
                <option key={r.role_cust_id} value={r.role_cust_id}>
                  {r.role_cust_name}
                </option>
              ))}
            </select>

            {error && <span className={style.textoError}>{error}</span>}

            <div className={style.modalAcciones}>
              <button onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button
                className={style.botonCrear}
                onClick={handleCrear}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;