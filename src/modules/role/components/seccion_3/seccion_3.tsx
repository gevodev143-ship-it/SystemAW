import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./seccion_3.module.css";
import { supabase } from "../../../../lib/supabase";

interface RoleCustomer {
  role_cust_id: number;
  role_cust_name: string;
  role_cust_description: string | null;
  cust_id: number;
}

const Seccion_3 = () => {
  const navigate = useNavigate();

  const [custId, setCustId] = useState<number | null>(null);
  const [roles, setRoles] = useState<RoleCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<RoleCustomer | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================================================
  // RESOLVER cust_id A PARTIR DE LA SESIÓN (mismo patrón de Job Position)
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
  // LEER (SELECT) — solo roles de este cliente
  // =========================================================
  const fetchRoles = async (id: number) => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("role_customers")
      .select("*")
      .eq("cust_id", id)
      .order("role_cust_id", { ascending: true });

    if (error) {
      console.error("ERROR AL OBTENER ROLES:", error);
      setError("No se pudieron cargar los roles.");
    } else {
      setRoles(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (custId !== null) fetchRoles(custId);
  }, [custId]);

  const abrirCrear = () => {
    setEditando(null);
    setNombre("");
    setDescripcion("");
    setError("");
    setShowModal(true);
  };

  const abrirEditar = (rol: RoleCustomer) => {
    setEditando(rol);
    setNombre(rol.role_cust_name);
    setDescripcion(rol.role_cust_description ?? "");
    setError("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditando(null);
  };

  // =========================================================
  // CREAR / ACTUALIZAR (INSERT / UPDATE)
  // =========================================================
  const handleGuardar = async () => {
    if (!custId) return;

    if (!nombre.trim()) {
      setError("El nombre del rol es obligatorio.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      role_cust_name: nombre.trim(),
      role_cust_description: descripcion.trim() || null,
    };

    if (editando) {
      const { error } = await supabase
        .from("role_customers")
        .update(payload)
        .eq("role_cust_id", editando.role_cust_id)
        .eq("cust_id", custId);

      if (error) {
        console.error("ERROR AL ACTUALIZAR ROL:", error);
        setError("No se pudo actualizar. ¿Nombre duplicado para este cliente?");
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("role_customers").insert({
        ...payload,
        cust_id: custId,
      });

      if (error) {
        console.error("ERROR AL CREAR ROL:", error);
        setError("No se pudo crear. ¿Nombre duplicado para este cliente?");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    cerrarModal();
    fetchRoles(custId);
  };

  // =========================================================
  // ELIMINAR (DELETE)
  // =========================================================
  const handleEliminar = async (rol: RoleCustomer) => {
    if (!custId) return;

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el rol "${rol.role_cust_name}"? ` +
      `Los usuarios que tengan este rol asignado quedarán sin rol.`
    );
    if (!confirmar) return;

    const { error } = await supabase
      .from("role_customers")
      .delete()
      .eq("role_cust_id", rol.role_cust_id)
      .eq("cust_id", custId);

    if (error) {
      console.error("ERROR AL ELIMINAR ROL:", error);
      alert("No se pudo eliminar el rol. Puede estar en uso.");
      return;
    }

    fetchRoles(custId);
  };

  if (loading && custId === null) {
    return null;
  }

  return (
    <div className={style.seccion}>
      <div className={style.header}>
        <h2>Roles</h2>
        <button type="button" className={style.botonCrear} onClick={abrirCrear}>
          + Nuevo rol
        </button>
      </div>

      {error && !showModal && <p className={style.error}>{error}</p>}

      {loading ? (
        <p>Cargando roles...</p>
      ) : roles.length === 0 ? (
        <p>Aún no hay roles creados.</p>
      ) : (
        <table className={style.tabla}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => (
              <tr key={rol.role_cust_id}>
                <td>{rol.role_cust_name}</td>
                <td>{rol.role_cust_description ?? "—"}</td>
                <td className={style.acciones}>
                  <button type="button" onClick={() => abrirEditar(rol)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => handleEliminar(rol)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={style.overlay}>
          <div className={style.modal}>
            <h3>{editando ? "Editar rol" : "Nuevo rol"}</h3>

            {error && <p className={style.error}>{error}</p>}

            <label>
              Nombre
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Descripción
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={saving}
              />
            </label>

            <div className={style.modalAcciones}>
              <button type="button" onClick={cerrarModal} disabled={saving}>
                Cancelar
              </button>
              <button type="button" onClick={handleGuardar} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seccion_3;