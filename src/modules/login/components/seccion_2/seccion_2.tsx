import style from "./seccion_2.module.css";

const Seccion_2 = () => {
  return (
    <div className={style.seccion}>

      {/* Marca / logo */}
      <section className={style.marca}>
        <div className={style.logoBox}>
          <img src="/logo.png" alt="Logo" />
        </div>
        <div className={style.marcaTexto}>
          <span className={style.marcaNombre}>System AW</span>
          <span className={style.marcaSub}>by Aera Systems</span>
        </div>
      </section>

      {/* Contenido principal */}
      <section className={style.contenido}>
        <p className={style.eyebrow}>Sistema de Administración Web</p>
        <h1 className={style.titulo}>System AW</h1>

        <div className={style.separador}>
          <span className={style.linea} />
          <span className={style.diamante} />
          <span className={style.linea} />
        </div>

        <p className={style.descripcion}>
          Soluciones inteligentes para la gestión<br />
          eficiente de tu empresa
        </p>

        <div className={style.badges}>
          <span className={style.badge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Tiempo real
          </span>
          <span className={style.badge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Seguro
          </span>
          <span className={style.badge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Analytics
          </span>
        </div>
      </section>

    </div>
  );
};

export default Seccion_2;