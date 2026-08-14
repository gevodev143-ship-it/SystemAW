import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./seccion_3.module.css";
import { supabase } from "../../../../lib/supabase";

const Seccion_3 = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!usuario || !password) {
      setError("Completa ambos campos");
      return;
    }

    setCargando(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("login-customer", {
        body: { usuario, password },
      });

      if (fnError) {
        setError("Usuario o contraseña incorrectos");
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (!data?.customer) {
        setError("Respuesta inválida del servidor");
        return;
      }

      // Guarda la sesión del cliente
      localStorage.setItem("customer", JSON.stringify(data.customer));

      // Redirige al home del cliente
      navigate("/home");

    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={style.seccion}>
      <div className={style.modal}>

        <div className={style.header}>
          <p className={style.titulo}>Iniciar Sesión</p>
          <div className={style.separador}>
            <span className={style.lineaIzq} />
            <span className={style.diamante} />
            <span className={style.lineaDer} />
          </div>
          <p className={style.bienvenido}>Bienvenido de nuevo</p>
        </div>

        <div className={style.form}>
          <div className={style.campo}>
            <label className={style.label}>Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              className={style.input}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>

          <div className={style.campo}>
            <label className={style.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className={style.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && <p className={style.error}>{error}</p>}

          <button
            className={style.btn}
            onClick={handleLogin}
            disabled={cargando}
          >
            {cargando ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Seccion_3;