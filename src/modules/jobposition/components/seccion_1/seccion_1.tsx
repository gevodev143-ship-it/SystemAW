import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./seccion_1.module.css";
import { supabase } from "../../../../lib/supabase";

interface JobPositionCustomer {
  jb_pstn_cust_id: number;
  jb_pstn_cust_name: string;
  jb_pstn_cust_description: string | null;
  jb_pstn_cust_parent_id: number | null;
  cust_id: number;
}

const Seccion_1 = () => {
  const navigate = useNavigate();

  const [custId, setCustId] = useState<number | null>(null);
  const [cargos, setCargos] = useState<JobPositionCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<JobPositionCustomer | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  // =========================================================
  // RESOLVER cust_id A PARTIR DE LA SESIÓN (mismo patrón del Sidebar)
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
  // LEER (SELECT) — solo cargos de este cliente
  // =========================================================
  const fetchCargos = async (id: number) => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("job_position_customers")
      .select("*")
      .eq("cust_id", id)
      .order("jb_pstn_cust_id", { ascending: true });

    if (error) {
      console.error("ERROR AL OBTENER CARGOS:", error);
      setError("No se pudieron cargar los cargos.");
    } else {
      setCargos(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (custId !== null) fetchCargos(custId);
  }, [custId]);

  const nombrePadre = (id: number | null) => {
    if (!id) return "— (cargo raíz)";
    const padre = cargos.find((c) => c.jb_pstn_cust_id === id);
    return padre ? padre.jb_pstn_cust_name : "—";
  };

  const abrirCrear = () => {
    setEditando(null);
    setNombre("");
    setDescripcion("");
    setParentId("");
    setError("");
    setShowModal(true);
  };

  const abrirEditar = (cargo: JobPositionCustomer) => {
    setEditando(cargo);
    setNombre(cargo.jb_pstn_cust_name);
    setDescripcion(cargo.jb_pstn_cust_description ?? "");
    setParentId(cargo.jb_pstn_cust_parent_id ?? "");
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
      setError("El nombre del cargo es obligatorio.");
      return;
    }

    if (editando && parentId === editando.jb_pstn_cust_id) {
      setError("Un cargo no puede ser su propio cargo superior.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      jb_pstn_cust_name: nombre.trim(),
      jb_pstn_cust_description: descripcion.trim() || null,
      jb_pstn_cust_parent_id: parentId === "" ? null : parentId,
    };

    if (editando) {
      const { error } = await supabase
        .from("job_position_customers")
        .update(payload)
        .eq("jb_pstn_cust_id", editando.jb_pstn_cust_id)
        .eq("cust_id", custId);

      if (error) {
        console.error("ERROR AL ACTUALIZAR CARGO:", error);
        setError("No se pudo actualizar. ¿Nombre duplicado para este cliente?");
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("job_position_customers").insert({
        ...payload,
        cust_id: custId,
      });

      if (error) {
        console.error("ERROR AL CREAR CARGO:", error);
        setError("No se pudo crear. ¿Nombre duplicado para este cliente?");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    cerrarModal();
    fetchCargos(custId);
  };

  // =========================================================
  // ELIMINAR (DELETE)
  // =========================================================
  const handleEliminar = async (cargo: JobPositionCustomer) => {
    if (!custId) return;

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el cargo "${cargo.jb_pstn_cust_name}"? ` +
      `Los cargos que dependan de él quedarán sin cargo superior.`
    );
    if (!confirmar) return;

    const { error } = await supabase
      .from("job_position_customers")
      .delete()
      .eq("jb_pstn_cust_id", cargo.jb_pstn_cust_id)
      .eq("cust_id", custId);

    if (error) {
      console.error("ERROR AL ELIMINAR CARGO:", error);
      alert("No se pudo eliminar el cargo. Puede estar en uso.");
      return;
    }

    fetchCargos(custId);
  };

  if (loading && custId === null) {
    return null;
  }

  return (
    <div className={style.seccion}>
      <div className={style.encabezado}>
        <div>
          <h2>
            <b>Cargos Personalizados</b>
          </h2>
          <p>Administra los cargos propios de tu empresa (Administrador, Asistente Contable, Almacenero, etc.)</p>
        </div>
        <button className={style.botonCrear} onClick={abrirCrear}>
          + Crear Cargo
        </button>
      </div>

      {error && !showModal && <span className={style.textoError}>{error}</span>}

      {loading ? (
        <p>Cargando cargos...</p>
      ) : (
        <table className={style.tabla}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Cargo Superior</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargos.length === 0 ? (
              <tr>
                <td colSpan={5}>No hay cargos registrados.</td>
              </tr>
            ) : (
              cargos.map((cargo) => (
                <tr key={cargo.jb_pstn_cust_id}>
                  <td>{cargo.jb_pstn_cust_id}</td>
                  <td>{cargo.jb_pstn_cust_name}</td>
                  <td>{cargo.jb_pstn_cust_description || "—"}</td>
                  <td>{nombrePadre(cargo.jb_pstn_cust_parent_id)}</td>
                  <td className={style.acciones}>
                    <button onClick={() => abrirEditar(cargo)}>Editar</button>
                    <button
                      className={style.botonEliminar}
                      onClick={() => handleEliminar(cargo)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={style.modalOverlay}>
          <div className={style.modalContenido}>
            <h3>{editando ? "Editar Cargo" : "Crear Cargo"}</h3>

            <label className={style.label}>Nombre</label>
            <input
              className={style.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <label className={style.label}>Descripción</label>
            <textarea
              className={style.textarea}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />

            <label className={style.label}>Cargo Superior</label>
            <select
              className={style.input}
              value={parentId}
              onChange={(e) =>
                setParentId(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">— Sin cargo superior (raíz) —</option>
              {cargos
                .filter((c) => !editando || c.jb_pstn_cust_id !== editando.jb_pstn_cust_id)
                .map((c) => (
                  <option key={c.jb_pstn_cust_id} value={c.jb_pstn_cust_id}>
                    {c.jb_pstn_cust_name}
                  </option>
                ))}
            </select>

            {error && <span className={style.textoError}>{error}</span>}

            <div className={style.modalAcciones}>
              <button onClick={cerrarModal} disabled={saving}>
                Cancelar
              </button>
              <button
                className={style.botonCrear}
                onClick={handleGuardar}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seccion_1;