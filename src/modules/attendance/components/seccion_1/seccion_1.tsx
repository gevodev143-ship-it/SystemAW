import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
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
  const [form, setForm] = useState({ nombre: "", cargo: "", dni: "" });
  const [, setColaboradores] = useState<Colaborador[]>([]);
  const [qrListo, setQrListo] = useState(false);
  const qrWrapperRef = useRef<HTMLDivElement>(null);

  const abrirModal = () => {
    setForm({ nombre: "", cargo: "", dni: "" });
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

  const handleGenerar = () => {
    if (!form.nombre || !form.cargo || !form.dni) {
      alert("Por favor completa todos los campos: Nombre, Cargo e ID.");
      return;
    }
    setQrListo(true);
  };

  const handleDescargar = () => {
    const canvas = qrWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `QR_${form.dni || "codigo"}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
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
          Agregar cliente
        </button>
      </div>

      

      {modalOpen && (
        <div className={style.overlay} onClick={cerrarModal}>
          <div className={style.modal} onClick={(e) => e.stopPropagation()}>
            <div className={style.modalHeader}>
              <h2>Agregar cliente</h2>
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
                <div className={style.infoBlock}>
                  <div className={style.rowData}>
                    <span className={style.k}>Nombre</span>
                    <span className={style.v}>{form.nombre}</span>
                  </div>
                  <div className={style.rowData}>
                    <span className={style.k}>Cargo</span>
                    <span className={style.v}>{form.cargo}</span>
                  </div>
                  <div className={style.rowData}>
                    <span className={style.k}>ID</span>
                    <span className={style.v}>{form.dni}</span>
                  </div>
                </div>

                <div className={style.qrWrapper} ref={qrWrapperRef}>
                  <QRCodeCanvas value={qrData} size={200} level="M" />
                </div>

                <div className={style.modalActions}>
                  <button className={style.btnSecundario} onClick={() => setQrListo(false)}>
                    Editar datos
                  </button>
                  <button className={style.btnSecundario} onClick={handleDescargar}>
                    Descargar PNG
                  </button>
                  <button className={style.btnPrimario} onClick={handleGuardar}>
                    Guardar cliente
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