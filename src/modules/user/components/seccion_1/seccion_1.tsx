import { useState } from "react";
import style from "./seccion_1.module.css";

interface Seccion1Props {
  filtroNombre: string;
  setFiltroNombre: (valor: string) => void;
  filtroCargo: string;
  setFiltroCargo: (valor: string) => void;
  filtroEstado: string;
  setFiltroEstado: (valor: string) => void;
  totalUsuarios: number;
  onAgregar: (nuevoTrabajador: NuevoTrabajador) => void;
}

export interface NuevoTrabajador {
  nombre: string;
  cargo: string;
  estado: string;
  telefonos: string[];
  permisos: {
    editarColores: boolean;
    editarCatalogos: boolean;
    editarIconos: boolean;
    editarInformacion: boolean;
    editarImagenes: boolean;
  };
}

const CARGOS = ["todos", "Diseñador", "Administrador", "Almacenero"];
const CARGOS_FORM = ["Diseñador", "Administrador", "Almacenero"];
const ESTADOS = ["Activo", "Inactivo"];

const PERMISOS_VACIOS = {
  editarColores: false,
  editarCatalogos: false,
  editarIconos: false,
  editarInformacion: false,
  editarImagenes: false,
};

const Seccion_1 = ({
  filtroNombre,
  setFiltroNombre,
  filtroCargo,
  setFiltroCargo,
  filtroEstado,
  setFiltroEstado,
  totalUsuarios,
  onAgregar,
}: Seccion1Props) => {
  const [modalAbierto, setModalAbierto] = useState(false);

  const [nombre, setNombre] = useState("");
  const [cargoForm, setCargoForm] = useState(CARGOS_FORM[0]);
  const [estadoForm, setEstadoForm] = useState(ESTADOS[0]);
  const [telefonos, setTelefonos] = useState<string[]>([""]);
  const [permisos, setPermisos] = useState(PERMISOS_VACIOS);

  const abrirModal = () => setModalAbierto(true);

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre("");
    setCargoForm(CARGOS_FORM[0]);
    setEstadoForm(ESTADOS[0]);
    setTelefonos([""]);
    setPermisos(PERMISOS_VACIOS);
  };

  const actualizarTelefono = (index: number, valor: string) => {
    setTelefonos((prev) => prev.map((t, i) => (i === index ? valor : t)));
  };

  const agregarCampoTelefono = () => {
    setTelefonos((prev) => [...prev, ""]);
  };

  const togglePermiso = (clave: keyof typeof PERMISOS_VACIOS) => {
    setPermisos((prev) => ({ ...prev, [clave]: !prev[clave] }));
  };

  const handleGuardar = () => {
    const nuevoTrabajador: NuevoTrabajador = {
      nombre,
      cargo: cargoForm,
      estado: estadoForm,
      telefonos: telefonos.filter((t) => t.trim() !== ""),
      permisos,
    };
    onAgregar(nuevoTrabajador);
    cerrarModal();
  };

  return (
    <div className={style.seccion}>
      <section className={style.barra}>

        <input
          type="text"
          placeholder="Filtrar por nombre"
          className={style.inputNombre}
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />

        <div className={style.filtroGrupo}>
          <span>Cargo</span>
          <select
            className={style.select}
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value)}
          >
            {CARGOS.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargo}
              </option>
            ))}
          </select>
        </div>

        <div className={style.filtroGrupo}>
          <span>Estado</span>
          <select
            className={style.select}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        <div className={style.espaciador} />

        <span className={style.contador}>{totalUsuarios} usuarios</span>

        <button
          className={style.btnAgregar}
          onClick={abrirModal}
          title="Agregar trabajador"
        >
          +
        </button>

      </section>

      {modalAbierto && (
        <div className={style.overlay} onClick={cerrarModal}>
          <div className={style.modal} onClick={(e) => e.stopPropagation()}>

            <div className={style.modalHeader}>
              <div className={style.avatarGrande}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>

              <div className={style.camposHeader}>
                <label className={style.label}>Nombre Completo :</label>
                <input
                  type="text"
                  className={style.inputTexto}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />

                <label className={style.label}>Cargo:</label>
                <select
                  className={style.selectForm}
                  value={cargoForm}
                  onChange={(e) => setCargoForm(e.target.value)}
                >
                  {CARGOS_FORM.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <label className={style.label}>Número teléfono</label>
                {telefonos.map((tel, i) => (
                  <div key={i} className={style.filaTelefono}>
                    <input
                      type="text"
                      className={style.inputTexto}
                      value={tel}
                      onChange={(e) => actualizarTelefono(i, e.target.value)}
                    />
                    {i === telefonos.length - 1 && (
                      <button
                        type="button"
                        className={style.btnMasTelefono}
                        onClick={agregarCampoTelefono}
                        title="Agregar otro teléfono"
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={style.estadoHeader}>
                <label className={style.label}>Estado:</label>
                <select
                  className={style.selectForm}
                  value={estadoForm}
                  onChange={(e) => setEstadoForm(e.target.value)}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={style.configSeccion}>
              <p className={style.configTitulo}>
                Configuración Normal de {cargoForm.toLowerCase()}:
              </p>

              <div className={style.togglesGrid}>
                <label className={style.toggleItem}>
                  <span>Editar colores<br />de la página</span>
                  <span
                    className={`${style.switch} ${permisos.editarColores ? style.switchOn : ""}`}
                    onClick={() => togglePermiso("editarColores")}
                  >
                    <span className={style.switchBola} />
                  </span>
                </label>

                <label className={style.toggleItem}>
                  <span>Editar Catalogos</span>
                  <span
                    className={`${style.switch} ${permisos.editarCatalogos ? style.switchOn : ""}`}
                    onClick={() => togglePermiso("editarCatalogos")}
                  >
                    <span className={style.switchBola} />
                  </span>
                </label>

                <label className={style.toggleItem}>
                  <span>Editar Iconos<br />de la página</span>
                  <span
                    className={`${style.switch} ${permisos.editarIconos ? style.switchOn : ""}`}
                    onClick={() => togglePermiso("editarIconos")}
                  >
                    <span className={style.switchBola} />
                  </span>
                </label>

                <label className={style.toggleItem}>
                  <span>Editar Información<br />de la página</span>
                  <span
                    className={`${style.switch} ${permisos.editarInformacion ? style.switchOn : ""}`}
                    onClick={() => togglePermiso("editarInformacion")}
                  >
                    <span className={style.switchBola} />
                  </span>
                </label>

                <label className={style.toggleItem}>
                  <span>Editar imagenes<br />de la página</span>
                  <span
                    className={`${style.switch} ${permisos.editarImagenes ? style.switchOn : ""}`}
                    onClick={() => togglePermiso("editarImagenes")}
                  >
                    <span className={style.switchBola} />
                  </span>
                </label>
              </div>
            </div>

            <div className={style.modalAcciones}>
              <button className={style.btnCancelar} onClick={cerrarModal}>
                Cancelar
              </button>
              <button className={style.btnGuardar} onClick={handleGuardar}>
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Seccion_1;