import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import Fotocheck from "../../../attendance/components/seccion_1/fotocheck";
import style from "./seccion_1.module.css";

interface Colaborador {
  id: string;
  nombre: string;
  cargo: string;
  dni: string;
  fecha: string;
}

const Seccion_1 = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", cargo: "", dni: "", sede: "Mazamari" });
  const [foto, setFoto] = useState<string | null>(null);
  const [, setColaboradores] = useState<Colaborador[]>([]);
  const [qrListo, setQrListo] = useState(false);
  const fotocheckRef = useRef<HTMLDivElement>(null);

  const abrirModal = () => {
    setForm({ nombre: "", cargo: "", dni: "", sede: "Mazamari" });
    setFoto(null);
    setQrListo(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setQrListo(false);
  };

  const handleChange = (campo: keyof typeof form, valor: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: campo === "nombre" ? valor.toUpperCase() : valor,
    }));
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerar = () => {
    if (!form.nombre || !form.cargo || !form.dni) {
      alert("Por favor completa todos los campos: Nombre, Cargo e ID.");
      return;
    }
    setQrListo(true);
  };

  const handleDescargarFotocheck = async () => {
    if (!fotocheckRef.current) return;
    try {
      const dataUrl = await toPng(fotocheckRef.current, {
        cacheBust: true,
        pixelRatio: 3, // mayor resolución para impresión
      });
      const a = document.createElement("a");
      a.download = `Fotocheck_${form.dni || "trabajador"}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("Error generando fotocheck:", err);
      alert("Ocurrió un error al generar la imagen.");
    }
  };

  const handleGuardar = () => {
    const nuevo: Colaborador = {
      id: crypto.randomUUID(),
      nombre: form.nombre,
      cargo: form.cargo,
      dni: form.dni,
      fecha: new Date().toLocaleDateString("es-PE"),
    };
    setColaboradores((prev) => [nuevo, ...prev]);
    cerrarModal();
  };

  const qrData = `Nombre: ${form.nombre}\nCargo: ${form.cargo}\nID: ${form.dni}`;

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
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Ej: VELIZ INOCENTE JUDITH KELY"
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                  />
                </div>

                <div className={style.field}>
                  <label>Cargo</label>
                  <input
                    type="text"
                    placeholder="Ej: Comercial Cajera"
                    value={form.cargo}
                    onChange={(e) => handleChange("cargo", e.target.value)}
                  />
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
                  <label>Foto (opcional)</label>
                  <input type="file" accept="image/*" onChange={handleFoto} />
                </div>

                <div className={style.modalActions}>
                  <button className={style.btnSecundario} onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button className={style.btnPrimario} onClick={handleGenerar}>
                    Generar Fotocheck
                  </button>
                </div>
              </div>
            ) : (
              <div className={style.modalBody}>
                <Fotocheck
                  ref={fotocheckRef}
                  nombre={form.nombre}
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
                  <button className={style.btnSecundario} onClick={handleDescargarFotocheck}>
                    Descargar Fotocheck
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