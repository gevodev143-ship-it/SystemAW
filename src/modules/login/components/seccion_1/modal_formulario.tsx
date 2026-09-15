"use client";

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./modal_formulario.module.css";
import { supabase } from "../../../../lib/supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ModalFormularioProps {
  onYaTengoCuenta: () => void;
}

const ModalFormulario = ({ onYaTengoCuenta }: ModalFormularioProps) => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [correoError, setCorreoError] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal de éxito (registro)
  const [showModal, setShowModal] = useState(false);

  // Guardamos el id del setTimeout que redirige a /login, para poder
  // cancelarlo si el usuario cierra el modal manualmente con la X.
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validarFormulario = (): boolean => {
    setFormError("");
    setCorreoError(false);

    const nombreTrim = nombre.trim();
    const apellidoTrim = apellido.trim();
    const correoTrim = correo.trim();

    // 1. Ningún campo vacío
    if (!nombreTrim || !apellidoTrim || !correoTrim) {
      setFormError("Todos los campos son obligatorios.");
      return false;
    }

    // 2. Formato de correo válido
    if (!EMAIL_REGEX.test(correoTrim)) {
      setCorreoError(true);
      setFormError("Ingresa un correo electrónico válido.");
      return false;
    }

    return true;
  };

  const handleCrearCuenta = async () => {
    if (!validarFormulario()) return;

    setLoading(true);

    const { data, error } = await supabase.functions.invoke("antes-crear-cliente", {
      body: {
        rgrequest_name: nombre.trim(),
        rgrequest_lastname: apellido.trim(),
        rgrequest_email: correo.trim().toLowerCase(),
      },
    });

    setLoading(false);

    if (error) {
      setFormError("No se pudo enviar la solicitud. Intenta de nuevo.");
      return;
    }

    if (data?.error) {
      if (data.error.toLowerCase().includes("correo")) {
        setCorreoError(true);
      }
      setFormError(data.error);
      return;
    }

    setFormError("");
    setCorreoError(false);
    setShowModal(true);

    redirectTimeoutRef.current = setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  const handleCerrarModalExito = () => {
    // Evita que, tras navegar manualmente, el timeout dispare
    // una segunda redirección (a /login) más tarde.
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setShowModal(false);
    navigate("/login");
  };

  return (
    <>
      <div className={style.card}>
        <div className={style.encabezado}>
          <h2 className={style.titulo}>Formulario</h2>
          <span className={style.cerrar} onClick={onYaTengoCuenta}>
            X
          </span>
        </div>

        <label className={style.label}>Nombre</label>
        <input
          type="text"
          className={style.input}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <label className={style.label}>Apellido</label>
        <input
          type="text"
          className={style.input}
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />

        <label className={style.label}>Correo Electrónico</label>
        <input
          type="email"
          className={`${style.input} ${correoError ? style.inputError : ""}`}
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            if (correoError) setCorreoError(false);
          }}
        />

        {formError && <span className={style.textoError}>{formError}</span>}

        <span className={style.enlace} onClick={onYaTengoCuenta}>
          ya tengo cuenta
        </span>

        <button className={style.boton} onClick={handleCrearCuenta} disabled={loading}>
          {loading ? "Enviando..." : "Crear cuenta"}
        </button>
      </div>

      {/* Modal de éxito (registro) */}
      {showModal && (
        <div className={style.modalOverlay}>
          <div className={style.modalContenido}>
            <span className={style.cerrar} onClick={handleCerrarModalExito}>
              X
            </span>

            <svg className={style.check} viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
              <circle className={style.checkCirculo} cx="26" cy="26" r="24" fill="none" />
              <path className={style.checkPalomita} fill="none" d="M14 27l7 7 16-16" />
            </svg>
            <p className={style.modalTexto}>
              Se le enviaron las credenciales al correo <strong>{correo}</strong> para
              que pueda ingresar al System AW ERP. Puede cambiar las credenciales
              dentro del sistema.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalFormulario;