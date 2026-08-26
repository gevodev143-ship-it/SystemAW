import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./seccion_1.module.css";
import { supabase } from "../../../../lib/supabase";

const Seccion_1 = () => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulario de login
  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Formulario de registro
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [correoError, setCorreoError] = useState(false);

  // Modal de éxito (registro)
  const [showModal, setShowModal] = useState(false);

  // Modal de elección de modo (cuando ambos flags son null/false)
  const [showChoice, setShowChoice] = useState(false);
  const [pendingCustId, setPendingCustId] = useState<number | null>(null);
  const [choiceLoading, setChoiceLoading] = useState<"personal" | "business" | null>(null);

  const handleLogin = async () => {
    setLoginError("");

    if (!loginCorreo.trim() || !loginPassword) {
      setLoginError("Ingresa tu correo y contraseña.");
      return;
    }

    setLoginLoading(true);
    try {
      // 1. Verificar credenciales contra Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginCorreo.trim().toLowerCase(),
        password: loginPassword,
      });

      if (authError || !authData.user) {
        setLoginError("Correo o contraseña incorrectos.");
        return;
      }

      // 2. Buscar al cliente asociado a ese usuario de auth
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("cust_id, cust_personal_development, cust_business_management")
        .eq("cust_auth_id", authData.user.id)
        .maybeSingle();

      if (customerError || !customer) {
        setLoginError("No se encontró una cuenta de cliente asociada a este usuario.");
        return;
      }

      const { cust_id, cust_personal_development, cust_business_management } = customer;

      // 3. Reglas de redirección
      if (cust_business_management === true) {
        navigate("/staffs");
        return;
      }

      if (cust_personal_development === true) {
        navigate("/habits");
        return;
      }

      // Ambos son null/false: dejar que el usuario elija su modo
      setPendingCustId(cust_id);
      setShowChoice(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const persistJwtSession = async () => {
    // Asegura que el JWT de la sesión activa quede disponible para las
    // siguientes pantallas (/habits, /staffs).
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      localStorage.setItem("aw_erp_jwt", sessionData.session.access_token);
    }
  };

  const handleChoosePersonalDevelopment = async () => {
    if (!pendingCustId) return;
    setChoiceLoading("personal");
    try {
      const { error } = await supabase
        .from("customers")
        .update({ cust_personal_development: true })
        .eq("cust_id", pendingCustId);

      if (error) {
        setLoginError("No se pudo guardar tu preferencia. Intenta de nuevo.");
        return;
      }

      await persistJwtSession();
      setShowChoice(false);
      navigate("/habits");
    } finally {
      setChoiceLoading(null);
    }
  };

  const handleChooseBusinessManagement = async () => {
    if (!pendingCustId) return;
    setChoiceLoading("business");
    try {
      const { error } = await supabase
        .from("customers")
        .update({ cust_business_management: true })
        .eq("cust_id", pendingCustId);

      if (error) {
        setLoginError("No se pudo guardar tu preferencia. Intenta de nuevo.");
        return;
      }

      await persistJwtSession();
      setShowChoice(false);
      navigate("/staffs");
    } finally {
      setChoiceLoading(null);
    }
  };

  const handleCrearCuenta = async () => {
    const correoNormalizado = correo.trim().toLowerCase();
    setLoading(true);

    // 1. Verifica si el correo ya existe en auth.users
    const { data: existe, error: rpcError } = await supabase.rpc(
      "verificar_correo_existente",
      { correo_input: correoNormalizado }
    );

    if (rpcError) {
      console.error(rpcError);
      setLoading(false);
      return;
    }

    if (existe) {
      setCorreoError(true);
      setLoading(false);
      return;
    }

    // 2. Guarda la solicitud de registro
    const { error: insertError } = await supabase.from("registration_request").insert({
      rgrequest_name: nombre,
      rgrequest_lastname: apellido,
      rgrequest_email_momentaneo: correoNormalizado,
    });

    setLoading(false);

    if (insertError) {
      // por si alguien mandó el mismo correo justo entre el chequeo y el insert
      if (insertError.code === "23505") {
        setCorreoError(true);
      } else {
        console.error(insertError);
      }
      return;
    }

    setCorreoError(false);
    setShowModal(true);

    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  return (
    <div className={style.seccion}>
      <div className={style.escenario}>
        <div className={`${style.tarjeta} ${isFlipped ? style.volteada : ""}`}>

          {/* Cara frontal: Login */}
          <div className={`${style.cara} ${style.frente}`}>
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
            <input
              type="password"
              className={style.input}
              value={loginPassword}
              onChange={(e) => {
                setLoginPassword(e.target.value);
                if (loginError) setLoginError("");
              }}
            />

            {loginError && <span className={style.textoError}>{loginError}</span>}

            <span className={style.enlace} onClick={() => setIsFlipped(true)}>
              ¿crear cuenta?
            </span>

            <button className={style.boton} onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? "Ingresando..." : "Entrar"}
            </button>
          </div>

          {/* Cara trasera: Crear cuenta */}
          <div className={`${style.cara} ${style.reverso}`}>
            <div className={style.encabezadoReverso}>
              <h2 className={style.titulo}>Formulario</h2>
              <span className={style.cerrar} onClick={() => setIsFlipped(false)}>
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
            {correoError && (
              <span className={style.textoError}>
                Ese correo ya ha sido registrado
              </span>
            )}

            <span className={style.enlace} onClick={() => setIsFlipped(false)}>
              ya tengo cuenta
            </span>

            <button className={style.boton} onClick={handleCrearCuenta} disabled={loading}>
              {loading ? "Enviando..." : "Crear cuenta"}
            </button>
          </div>

        </div>
      </div>

      {/* Modal de éxito (registro) */}
      {showModal && (
        <div className={style.modalOverlay}>
          <div className={style.modalContenido}>
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

      {/* Modal de elección de modo */}
      {showChoice && (
        <div className={style.modalOverlay}>
          <div className={style.modalContenido}>
            <p className={style.modalTexto}>¿Qué modo quieres usar?</p>
            <div className={style.opcionesModo}>
              <div
                className={style.opcionModo}
                onClick={() => {
                  if (!choiceLoading) handleChoosePersonalDevelopment();
                }}
              >
                {choiceLoading === "personal" ? "Cargando..." : "Desarrollo Personal"}
              </div>
              <div
                className={style.opcionModo}
                onClick={() => {
                  if (!choiceLoading) handleChooseBusinessManagement();
                }}
              >
                {choiceLoading === "business" ? "Cargando..." : "Gestión Empresarial"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seccion_1;