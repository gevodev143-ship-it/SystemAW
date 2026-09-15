"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./modal_logueo.module.css";
import { supabase } from "../../../../lib/supabase";

interface ModuleOption {
  mod_id: number;
  mod_name: string;
  mod_description: string | null;
  mod_direction_url: string | null;
}

interface ModalLogueoProps {
  onCrearCuenta: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ModalLogueo = ({ onCrearCuenta }: ModalLogueoProps) => {
  const navigate = useNavigate();

  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Modal de elección de módulo
  const [showChoice, setShowChoice] = useState(false);
  const [availableModules, setAvailableModules] = useState<ModuleOption[]>([]);
  const [selectedModIds, setSelectedModIds] = useState<number[]>([]);
  const [pendingAccessToken, setPendingAccessToken] = useState<string | null>(null);
  const [choiceLoading, setChoiceLoading] = useState(false);

  const persistSessionAndGo = async (
    accessToken: string,
    refreshToken: string,
    redirectUrl: string
  ) => {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    localStorage.setItem("aw_erp_jwt", accessToken);

    navigate(redirectUrl.startsWith("/") ? redirectUrl : `/${redirectUrl}`);
  };

  // =========================================================
  // VALIDACIÓN LOCAL (frontend) — primera capa
  // =========================================================
  const validateLocalFields = (): boolean => {
    if (!loginCorreo.trim()) {
      setLoginError("Ingresa tu correo.");
      return false;
    }

    if (!EMAIL_REGEX.test(loginCorreo.trim())) {
      setLoginError("Ingresa un correo válido.");
      return false;
    }

    if (!loginPassword) {
      setLoginError("Ingresa tu contraseña.");
      return false;
    }

    return true;
  };

  // =========================================================
  // LOGIN → llama a la Edge Function "login"
  // Se usa tanto para el intento inicial como para el reintento
  // después de asignar módulos.
  // =========================================================
  const handleLogin = async () => {
    setLoginError("");

    if (!validateLocalFields()) {
      return;
    }

    setLoginLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("login", {
        body: {
          step: "login",
          email: loginCorreo.trim().toLowerCase(),
          password: loginPassword,
        },
      });

      if (error) {
        console.error("ERROR EDGE FUNCTION LOGIN:", error);
        setLoginError("Ocurrió un error al iniciar sesión. Intenta de nuevo.");
        return;
      }

      if (data?.error) {
        setLoginError(data.error);
        return;
      }

      if (data?.status === "redirect") {
        setShowChoice(false);
        await persistSessionAndGo(
          data.accessToken,
          data.refreshToken,
          data.redirectUrl
        );
        return;
      }

      if (data?.status === "select_modules") {
        setAvailableModules(data.modules ?? []);
        setPendingAccessToken(data.accessToken);
        setSelectedModIds([]);
        setShowChoice(true);
        return;
      }

      setLoginError("Respuesta inesperada del servidor.");
    } catch (err) {
      console.error("ERROR INESPERADO LOGIN:", err);
      setLoginError("Ocurrió un error inesperado. Intenta nuevamente.");
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================================================
  // ELEGIR MÓDULOS (checkboxes múltiples)
  // =========================================================
  const toggleModule = (modId: number) => {
    setSelectedModIds((prev) =>
      prev.includes(modId)
        ? prev.filter((id) => id !== modId)
        : [...prev, modId]
    );
  };

  // El botón "enviar" solo inserta la selección; luego se vuelve a
  // ejecutar handleLogin() con el mismo correo/contraseña, y esta vez
  // la función "login" ya encontrará el registro en customer_modules
  // y devolverá el redirectUrl correspondiente.
  const handleConfirmModules = async () => {
    if (selectedModIds.length === 0 || !pendingAccessToken) {
      return;
    }

    setChoiceLoading(true);
    setLoginError("");

    try {
      const { data, error } = await supabase.functions.invoke("login", {
        body: {
          step: "assign_modules",
          accessToken: pendingAccessToken,
          moduleIds: selectedModIds,
        },
      });

      if (error) {
        console.error("ERROR EDGE FUNCTION ASSIGN MODULES:", error);
        setLoginError("No se pudo guardar tu selección. Intenta de nuevo.");
        return;
      }

      if (data?.error) {
        setLoginError(data.error);
        return;
      }

      if (data?.status === "modules_assigned") {
        await handleLogin();
        return;
      }

      setLoginError("Respuesta inesperada del servidor.");
    } catch (err) {
      console.error("ERROR INESPERADO AL ELEGIR MÓDULOS:", err);
      setLoginError("Ocurrió un error al guardar tu selección.");
    } finally {
      setChoiceLoading(false);
    }
  };

  return (
    <>
      <div className={style.card}>
        <h2 className={style.titulo}>Login</h2>

        <label className={style.label}>Correo Electrónico</label>

        <input
          type="email"
          className={style.input}
          value={loginCorreo}
          onChange={(e) => {
            setLoginCorreo(e.target.value);
            if (loginError) setLoginError("");
          }}
        />

        <label className={style.label}>Contraseña</label>

        <div className={style.inputPasswordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            className={style.input}
            value={loginPassword}
            onChange={(e) => {
              setLoginPassword(e.target.value);
              if (loginError) setLoginError("");
            }}
          />

          <button
            type="button"
            className={style.togglePassword}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              // ojo tachado
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 4.22-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.6 18.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // ojo abierto
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <span className={style.enlace} onClick={onCrearCuenta}>
          ¿crear cuenta?
        </span>

        <button
          className={style.boton}
          onClick={handleLogin}
          disabled={loginLoading}
        >
          {loginLoading ? "Ingresando..." : "Entrar"}
        </button>

        {loginError && (
          <span className={style.textoError}>{loginError}</span>
        )}
      </div>

      {/* =====================================================
          MODAL DE ELECCIÓN DE MÓDULO(S)
      ====================================================== */}

      {showChoice && (
        <div className={style.modalOverlay}>
          <div className={style.modalContenido}>
            <p className={style.modalTexto}>
              ¿Qué módulo(s) quieres usar?
            </p>

            <div className={style.opcionesModo}>
              {availableModules.map((mod) => {
                const isSelected = selectedModIds.includes(mod.mod_id);

                return (
                  <label
                    key={mod.mod_id}
                    className={style.opcionModo}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleModule(mod.mod_id)}
                    />
                    <span>{mod.mod_name}</span>
                  </label>
                );
              })}
            </div>

            {loginError && (
              <span className={style.textoError}>{loginError}</span>
            )}

            <button
              className={style.boton}
              onClick={handleConfirmModules}
              disabled={selectedModIds.length === 0 || choiceLoading}
            >
              {choiceLoading ? "Guardando..." : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalLogueo;