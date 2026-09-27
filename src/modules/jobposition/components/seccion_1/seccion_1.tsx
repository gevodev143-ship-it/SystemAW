import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./seccion_1.module.css";
import { supabase } from "../../../../lib/supabase";

interface JobPositionCustomer {
  jb_pstn_cust_id: number;
  jb_pstn_cust_name: string;
  jb_pstn_cust_description: string | null;
  cust_id: number;
}

const Seccion_1 = () => {
  const navigate = useNavigate();

  const [custId, setCustId] = useState<number | null>(null);
  const [cargos, setCargos] = useState<JobPositionCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // MODAL CREAR / EDITAR
  // =========================================================

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] =
    useState<JobPositionCustomer | null>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================================================
  // RESOLVER cust_id A PARTIR DE LA SESIÓN
  // =========================================================

  useEffect(() => {
    const resolverCustId = async () => {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user = sessionData.session?.user;

      if (!user) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      const { data: customer, error: customerError } =
        await supabase
          .from("customers")
          .select("cust_id")
          .eq("cust_auth_id", user.id)
          .maybeSingle();

      if (customerError || !customer) {
        console.error(
          "ERROR AL OBTENER CUSTOMER:",
          customerError
        );

        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      setCustId(customer.cust_id);
    };

    resolverCustId();
  }, [navigate]);

  // =========================================================
  // LEER CARGOS DEL CLIENTE
  // =========================================================

  const fetchCargos = async (id: number) => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("job_position_customers")
      .select(`
        jb_pstn_cust_id,
        jb_pstn_cust_name,
        jb_pstn_cust_description,
        cust_id
      `)
      .eq("cust_id", id)
      .order("jb_pstn_cust_id", {
        ascending: true,
      });

    if (error) {
      console.error(
        "ERROR AL OBTENER CARGOS:",
        error
      );

      setError("No se pudieron cargar los cargos.");
    } else {
      setCargos(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (custId !== null) {
      fetchCargos(custId);
    }
  }, [custId]);

  // =========================================================
  // ABRIR MODAL PARA CREAR
  // =========================================================

  const abrirCrear = () => {
    setEditando(null);
    setNombre("");
    setDescripcion("");
    setError("");
    setShowModal(true);
  };

  // =========================================================
  // ABRIR MODAL PARA EDITAR
  // =========================================================

  const abrirEditar = (cargo: JobPositionCustomer) => {
    setEditando(cargo);
    setNombre(cargo.jb_pstn_cust_name);
    setDescripcion(
      cargo.jb_pstn_cust_description ?? ""
    );
    setError("");
    setShowModal(true);
  };

  // =========================================================
  // CERRAR MODAL
  // =========================================================

  const cerrarModal = () => {
    setShowModal(false);
    setEditando(null);
    setNombre("");
    setDescripcion("");
    setError("");
  };

  // =========================================================
  // CREAR / ACTUALIZAR CARGO
  // =========================================================

  const handleGuardar = async () => {
    if (!custId) return;

    // Validar nombre
    if (!nombre.trim()) {
      setError("El nombre del cargo es obligatorio.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      jb_pstn_cust_name: nombre.trim(),
      jb_pstn_cust_description:
        descripcion.trim() || null,
    };

    // =======================================================
    // ACTUALIZAR
    // =======================================================

    if (editando) {
      const { error } = await supabase
        .from("job_position_customers")
        .update(payload)
        .eq(
          "jb_pstn_cust_id",
          editando.jb_pstn_cust_id
        )
        .eq("cust_id", custId);

      if (error) {
        console.error(
          "ERROR AL ACTUALIZAR CARGO:",
          error
        );

        setError(
          "No se pudo actualizar. ¿Nombre duplicado para este cliente?"
        );

        setSaving(false);
        return;
      }
    }

    // =======================================================
    // CREAR
    // =======================================================

    else {
      const { error } = await supabase
        .from("job_position_customers")
        .insert({
          ...payload,
          cust_id: custId,
        });

      if (error) {
        console.error(
          "ERROR AL CREAR CARGO:",
          error
        );

        setError(
          "No se pudo crear. ¿Nombre duplicado para este cliente?"
        );

        setSaving(false);
        return;
      }
    }

    setSaving(false);

    cerrarModal();

    await fetchCargos(custId);
  };

  // =========================================================
  // ELIMINAR CARGO
  // =========================================================

  const handleEliminar = async (
    cargo: JobPositionCustomer
  ) => {
    if (!custId) return;

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el cargo "${cargo.jb_pstn_cust_name}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("job_position_customers")
      .delete()
      .eq(
        "jb_pstn_cust_id",
        cargo.jb_pstn_cust_id
      )
      .eq("cust_id", custId);

    if (error) {
      console.error(
        "ERROR AL ELIMINAR CARGO:",
        error
      );

      alert(
        "No se pudo eliminar el cargo. Puede estar en uso por algún trabajador."
      );

      return;
    }

    await fetchCargos(custId);
  };

  // =========================================================
  // CARGANDO CUSTOMER
  // =========================================================

  if (loading && custId === null) {
    return null;
  }

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div className={style.seccion}>

      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className={style.encabezado}>

        <div>
          <h2>
            <b>Cargos Personalizados</b>
          </h2>

          <p>
            Administra los cargos propios de tu empresa
            (Administrador, Asistente Contable,
            Almacenero, etc.).
          </p>
        </div>

        <button
          className={style.botonCrear}
          onClick={abrirCrear}
        >
          + Crear Cargo
        </button>

      </div>

      {/* =====================================================
          ERROR GENERAL
      ====================================================== */}

      {error && !showModal && (
        <span className={style.textoError}>
          {error}
        </span>
      )}

      {/* =====================================================
          TABLA
      ====================================================== */}

      {loading ? (
        <p>Cargando cargos...</p>
      ) : (
        <table className={style.tabla}>

          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {cargos.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  No hay cargos registrados.
                </td>
              </tr>
            ) : (
              cargos.map((cargo) => (
                <tr
                  key={cargo.jb_pstn_cust_id}
                >

                  <td>
                    {cargo.jb_pstn_cust_id}
                  </td>

                  <td>
                    {cargo.jb_pstn_cust_name}
                  </td>

                  <td>
                    {cargo.jb_pstn_cust_description ||
                      "—"}
                  </td>

                  <td className={style.acciones}>

                    <button
                      onClick={() =>
                        abrirEditar(cargo)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className={
                        style.botonEliminar
                      }
                      onClick={() =>
                        handleEliminar(cargo)
                      }
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

      {/* =====================================================
          MODAL CREAR / EDITAR
      ====================================================== */}

      {showModal && (
        <div className={style.modalOverlay}>

          <div className={style.modalContenido}>

            <h3>
              {editando
                ? "Editar Cargo"
                : "Crear Cargo"}
            </h3>

            {/* NOMBRE */}

            <label className={style.label}>
              Nombre
            </label>

            <input
              className={style.input}
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Ej. Administrador"
            />

            {/* DESCRIPCIÓN */}

            <label className={style.label}>
              Descripción
            </label>

            <textarea
              className={style.textarea}
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
              placeholder="Describe las funciones del cargo..."
            />

            {/* ERROR */}

            {error && (
              <span
                className={style.textoError}
              >
                {error}
              </span>
            )}

            {/* ACCIONES */}

            <div
              className={style.modalAcciones}
            >

              <button
                onClick={cerrarModal}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                className={style.botonCrear}
                onClick={handleGuardar}
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : "Guardar"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Seccion_1;