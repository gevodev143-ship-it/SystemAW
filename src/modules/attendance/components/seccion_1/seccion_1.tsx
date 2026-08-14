import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import Fotocheck from "./fotocheck";
import style from "./seccion_1.module.css";

interface Colaborador {
  id: string;
  nombre: string;
  apellido: string;
  cargo: string;
  dni: string;
  sede: string;
  fecha: string;
}

const SEDES = ["Mazamari", "Satipo", "Pangoa"];
const CARGOS = ["Cajera Comercial", "Chofer", "Repartidor"];

const Seccion_1 = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cargo: "",
    dni: "",
    sede: "",
  });
  const [foto, setFoto] = useState<string | null>(null);
  const [, setColaboradores] = useState<Colaborador[]>([]);
  const [qrListo, setQrListo] = useState(false);
  const fotocheckRef = useRef<HTMLDivElement>(null);

  const abrirModal = () => {
    setForm({ nombre: "", apellido: "", cargo: "", dni: "", sede: "" });
    setFoto(null);
    setQrListo(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setQrListo(false);
    setFoto(null);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      setFoto(lector.result as string);
    };
    lector.readAsDataURL(archivo);
  };

  const handleChange = (campo: keyof typeof form, valor: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]:
        campo === "nombre" || campo === "apellido" ? valor.toUpperCase() : valor,
    }));
  };

  const handleGenerar = () => {
    if (!form.nombre || !form.apellido || !form.cargo || !form.dni || !form.sede) {
      alert("Por favor completa todos los campos: Sede, Nombre, Apellido, Cargo e ID.");
      return;
    }
    setQrListo(true);
  };

  const handleDescargar = async () => {
    if (!fotocheckRef.current) return;
    try {
      const dataUrl = await toPng(fotocheckRef.current, {
        pixelRatio: 3, // mayor resolución, sin perder calidad
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.download = `Fotocheck_${form.dni || "trabajador"}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("Error al generar la imagen del fotocheck:", err);
      alert("No se pudo generar la imagen. Intenta nuevamente.");
    }
  };

  const handleGuardar = async () => {
    if (!fotocheckRef.current) return;

    try {
      const dataUrl = await toPng(fotocheckRef.current, {
        pixelRatio: 3, // mayor resolución, sin perder calidad
        cacheBust: true,
      });

      const nuevo: Colaborador = {
        id: crypto.randomUUID(),
        nombre: form.nombre,
        apellido: form.apellido,
        cargo: form.cargo,
        dni: form.dni,
        sede: form.sede,
        fecha: new Date().toLocaleDateString("es-PE"),
      };
      setColaboradores((prev) => [nuevo, ...prev]);

      // descarga automática de la imagen completa del fotocheck al guardar
      const a = document.createElement("a");
      a.download = `Fotocheck_${form.dni || "trabajador"}.png`;
      a.href = dataUrl;
      a.click();

      cerrarModal();
    } catch (err) {
      console.error("Error al generar la imagen del fotocheck:", err);
      alert("No se pudo generar la imagen. Se guardó el registro igualmente.");
      cerrarModal();
    }
  };

  // misma condición que antes: no cambia el contenido del QR
  const qrData = `Nombre: ${form.nombre} ${form.apellido}\nCargo: ${form.cargo}\nID: ${form.dni}`;

  return (
    <div className={style.seccion}>
      <div className={style.toolbar}>
        <button className={style.btnAgregar} onClick={abrirModal}>
          Agregar trabajador
        </button>
      </div>

      {modalOpen && (
        <div className={style.overlay} onClick={cerrarModal}>
          <div className={style.modal} onClick={(e) => e.stopPropagation()}>
            <div className={style.modalHeader}>
              <h2>Agregar trabajador</h2>
              <button className={style.btnCerrar} onClick={cerrarModal}>
                Cerrar
              </button>
            </div>

            {!qrListo ? (
              <div className={style.modalBody}>
                <div className={style.field}>
                  <label>Sede</label>
                  <select
                    value={form.sede}
                    onChange={(e) => handleChange("sede", e.target.value)}
                  >
                    <option value="">Selecciona una sede</option>
                    {SEDES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={style.field}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: JUDITH KELY"
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                  />
                </div>

                <div className={style.field}>
                  <label>Apellido</label>
                  <input
                    type="text"
                    placeholder="Ej: VELIZ INOCENTE"
                    value={form.apellido}
                    onChange={(e) => handleChange("apellido", e.target.value)}
                  />
                </div>

                <div className={style.field}>
                  <label>Cargo</label>
                  <select
                    value={form.cargo}
                    onChange={(e) => handleChange("cargo", e.target.value)}
                  >
                    <option value="">Selecciona un cargo</option>
                    {CARGOS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={style.field}>
                  <label>ID / DNI</label>
                  <input
                    type="text"
                    placeholder="Ej: 76978140"
                    maxLength={20}
                    value={form.dni}
                    onChange={(e) => handleChange("dni", e.target.value)}
                  />
                </div>

                <div className={style.field}>
                  <label>Foto del trabajador</label>
                  <input type="file" accept="image/*" onChange={handleFotoChange} />
                  {foto && (
                    <img
                      src={foto}
                      alt="Vista previa"
                      className={style.previewFoto}
                    />
                  )}
                </div>

                <div className={style.modalActions}>
                  <button className={style.btnSecundario} onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button className={style.btnPrimario} onClick={handleGenerar}>
                    Generar QR
                  </button>
                </div>
              </div>
            ) : (
              <div className={style.modalBody}>
                <Fotocheck
                  ref={fotocheckRef}
                  nombre={form.nombre}
                  apellido={form.apellido}
                  cargo={form.cargo}
                  codigo={form.dni}
                  sede={form.sede}
                  foto={foto}
                  qrData={qrData}
                />

                <div className={style.modalActions}>
                  <button className={style.btnSecundario} onClick={() => setQrListo(false)}>
                    Editar datos
                  </button>
                  <button className={style.btnSecundario} onClick={handleDescargar}>
                    Descargar PNG
                  </button>
                  <button className={style.btnPrimario} onClick={handleGuardar}>
                    Guardar trabajador
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Seccion_1;