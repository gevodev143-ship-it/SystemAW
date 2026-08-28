import { useEffect, useState } from "react";
import React from "react";
import style from "./seccion_1.module.css";
import { supabase } from "../../../../lib/supabase";

interface ExtensionRow {
  extns_id: number;
  extns_name: string;
  extns_codigo_tsx: string;
  extns_codigo_css: string;
  extns_activa: boolean;
  cust_id: number;
}

// TODO: reemplazar por el cust_id real (contexto de sesión / auth del cliente logueado)
const CUST_ID = 1;

const Seccion_1 = () => {
  const [Componente, setComponente] = useState<React.ComponentType | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const cargarExtension = async () => {
      setCargando(true);
      setError(null);

      const { data, error: errSupabase } = await supabase
        .from("extensions")
        .select("*")
        .eq("cust_id", CUST_ID)
        .eq("extns_activa", true)
        .maybeSingle<ExtensionRow>();

      if (errSupabase || !data) {
        if (activo) {
          setError("No se encontró una extensión activa para este cliente.");
          setCargando(false);
        }
        return;
      }

      try {
        // 1. Inyectar el CSS de la extensión
        const styleId = `extns-style-${data.extns_id}`;
        let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleTag) {
          styleTag = document.createElement("style");
          styleTag.id = styleId;
          document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = data.extns_codigo_css;

        // 2. Cargar Babel standalone solo cuando hace falta (lazy)
        const Babel = await import("@babel/standalone");

        // 3. Transpilar el TSX guardado a JS ejecutable
        // IMPORTANTE: runtime "classic" para que el JSX compile a React.createElement(...)
        // en vez de inyectar un `import` automático de "react/jsx-runtime",
        // que rompería la ejecución con new Function().
        const codigoJS = Babel.transform(data.extns_codigo_tsx, {
          presets: [
            ["react", { runtime: "classic" }],
            "typescript",
          ],
          plugins: ["transform-modules-commonjs"],
          filename: "extension.tsx",
        }).code;

        // 4. Ejecutar: la extensión debe hacer `export default` de su componente
        const moduleShim = { exports: {} as any };
        const factory = new Function("module", "exports", "React", codigoJS!);
        factory(moduleShim, moduleShim.exports, React);

        const ComponenteExtension =
          moduleShim.exports.default ?? moduleShim.exports;

        if (activo) setComponente(() => ComponenteExtension);
      } catch (e) {
        console.error("Error interpretando extensión:", e);

        if (activo) {
          setError(
            e instanceof Error
              ? e.message
              : "Error desconocido al interpretar la extensión."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarExtension();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className={style.seccion}>
      {cargando && <p>Cargando extensión...</p>}
      {error && <p className={style.sinResultados}>{error}</p>}
      {Componente && <Componente />}
    </div>
  );
};

export default Seccion_1;