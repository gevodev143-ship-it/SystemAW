import { useEffect, useLayoutEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import style from "./seccion_3.module.css";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../core/contexts/auth.context";
import { getStaffImageUrl } from "../../../../core/services/staff.service";

// Escala mínima para que el texto siga siendo legible.
// Si el organigrama no cabe ni así, el lienzo hace scroll horizontal.
const MIN_ESCALA = 0.6;

// Logo: coloca tu archivo en la carpeta /public con este nombre
// (o cambia la ruta / URL aquí).
const LOGO_SRC = "/logogorrioncito.png";

interface JobPositionCustomer {
  jb_pstn_cust_id: number;
  jb_pstn_cust_name: string;
  jb_pstn_cust_description: string | null;
  cust_id: number;
}

interface StaffMember {
  stff_id: number;
  stff_name: string;
  stff_lastname: string;
  stff_link_img: string | null;
  jb_pstn_cust_id: number;
  stff_supervisor_id: number | null;
  stff_active: boolean;
  job_position_customers: JobPositionCustomer | null;
}

interface OrgNode extends StaffMember {
  hijos: OrgNode[];
}

function construirArbol(personal: StaffMember[]): OrgNode[] {
  const mapa = new Map<number, OrgNode>();

  personal.forEach((p) => {
    mapa.set(p.stff_id, { ...p, hijos: [] });
  });

  const raices: OrgNode[] = [];

  mapa.forEach((nodo) => {
    if (
      nodo.stff_supervisor_id !== null &&
      mapa.has(nodo.stff_supervisor_id)
    ) {
      mapa.get(nodo.stff_supervisor_id)!.hijos.push(nodo);
    } else {
      raices.push(nodo);
    }
  });

  return raices;
}

// =========================================================
// TARJETA DE UNA PERSONA
// =========================================================

interface TarjetaProps {
  nodo: OrgNode;
  custNameBucket: string | null;
  esRaiz: boolean;
}

const TarjetaPersona = ({ nodo, custNameBucket, esRaiz }: TarjetaProps) => {
  const tieneHijos = nodo.hijos.length > 0;

  const urlImagen = custNameBucket
    ? getStaffImageUrl(custNameBucket, nodo.stff_link_img)
    : null;

  const clases = [
    style.tarjeta,
    tieneHijos ? style.conHijos : "",
    esRaiz ? style.raiz : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={clases}>
      {urlImagen ? (
        <img
          src={urlImagen}
          alt={`${nodo.stff_name} ${nodo.stff_lastname}`}
          className={style.avatar}
        />
      ) : (
        <span className={style.avatarPlaceholder}>
          {nodo.stff_name.charAt(0).toUpperCase()}
        </span>
      )}

      <div className={style.textos}>
        <p className={style.nombre}>
          {nodo.stff_name} {nodo.stff_lastname}
        </p>
        <p className={style.cargo}>
          {nodo.job_position_customers?.jb_pstn_cust_name ?? "Sin cargo"}
        </p>
      </div>
    </div>
  );
};

// =========================================================
// NODO DEL ORGANIGRAMA
// Si todos los hijos son "hojas" (sin equipo a cargo) y hay más de uno,
// se apilan en vertical para ahorrar ancho.
// =========================================================

interface NodoOrganigramaProps {
  nodo: OrgNode;
  custNameBucket: string | null;
  esRaiz?: boolean;
}

const NodoOrganigrama = ({
  nodo,
  custNameBucket,
  esRaiz = false,
}: NodoOrganigramaProps) => {
  const tieneHijos = nodo.hijos.length > 0;
  const apilar =
    nodo.hijos.length > 1 && nodo.hijos.every((h) => h.hijos.length === 0);

  return (
    <div className={`${style.rama} ${apilar ? style.ramaApilada : ""}`}>
      <TarjetaPersona
        nodo={nodo}
        custNameBucket={custNameBucket}
        esRaiz={esRaiz}
      />

      {tieneHijos &&
        (apilar ? (
          <div className={style.hijosApilados}>
            {nodo.hijos.map((hijo) => (
              <div key={hijo.stff_id} className={style.itemApilado}>
                <TarjetaPersona
                  nodo={hijo}
                  custNameBucket={custNameBucket}
                  esRaiz={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={style.hijos}>
            {nodo.hijos.map((hijo) => (
              <NodoOrganigrama
                key={hijo.stff_id}
                nodo={hijo}
                custNameBucket={custNameBucket}
              />
            ))}
          </div>
        ))}
    </div>
  );
};

// =========================================================
// SECCIÓN 3
// =========================================================

const Seccion_3 = () => {
  const { custId, custNameBucket } = useAuth();

  const [arbol, setArbol] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const vistaRef = useRef<HTMLDivElement>(null);
  const contenidoRef = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  const [tamano, setTamano] = useState({ ancho: 0, alto: 0 });

  // =========================================================
  // CARGAR PERSONAL (sin cambios)
  // =========================================================

  useEffect(() => {
    if (custId === null) return;

    const fetchOrganigrama = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("staffs")
        .select(
          `
          stff_id,
          stff_name,
          stff_lastname,
          stff_link_img,
          jb_pstn_cust_id,
          stff_supervisor_id,
          stff_active,
          job_position_customers (
            jb_pstn_cust_id,
            jb_pstn_cust_name,
            jb_pstn_cust_description,
            cust_id
          )
        `
        )
        .eq("cust_id", custId)
        .eq("stff_active", true)
        .returns<StaffMember[]>();

      if (error) {
        console.error("ERROR AL OBTENER ORGANIGRAMA:", error);
        setError("No se pudo cargar el organigrama.");
        setLoading(false);
        return;
      }

      const staffNormalizado: StaffMember[] = (data ?? []).map((d) => ({
        ...d,
        job_position_customers: Array.isArray(d.job_position_customers)
          ? (d.job_position_customers as unknown as JobPositionCustomer[])[0] ?? null
          : d.job_position_customers,
      }));

      setArbol(construirArbol(staffNormalizado));
      setLoading(false);
    };
    fetchOrganigrama();
  }, [custId]);

  // =========================================================
  // AJUSTE AL ANCHO DISPONIBLE
  // =========================================================

  useLayoutEffect(() => {
    const vista = vistaRef.current;
    const contenido = contenidoRef.current;
    if (!vista || !contenido) return;

    const ajustar = () => {
      const anchoNat = contenido.offsetWidth;
      const altoNat = contenido.offsetHeight;
      if (!anchoNat || !altoNat) return;

      const anchoDisp = vista.clientWidth;

      setTamano({ ancho: anchoNat, alto: altoNat });
      setEscala(Math.max(MIN_ESCALA, Math.min(1, anchoDisp / anchoNat)));
    };

    ajustar();

    const observer = new ResizeObserver(ajustar);
    observer.observe(vista);
    observer.observe(contenido);
    window.addEventListener("resize", ajustar);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", ajustar);
    };
  }, [arbol, loading, error]);

  // =========================================================
  // DESCARGAR PDF
  // Solo la lámina (logo + organigrama), sin texto adicional.
  // La orientación se elige según la forma del organigrama.
  // =========================================================

const descargarPdf = async () => {
  const contenido = contenidoRef.current;
  if (!contenido) return;

  setGenerandoPdf(true);

  try {
    // Proporción exacta de A4 horizontal
    const RATIO_A4 = 297 / 210;

    const anchoNat = contenido.offsetWidth;
    const altoNat = contenido.offsetHeight;

    // Se agranda la lámina (nunca se recorta) hasta tener proporción A4
    let anchoObj = anchoNat;
    let altoObj = altoNat;
    if (anchoNat / altoNat < RATIO_A4) {
      anchoObj = altoNat * RATIO_A4;
    } else {
      altoObj = anchoNat / RATIO_A4;
    }

    const escalaCaptura = Math.min(2, 8000 / Math.max(anchoObj, altoObj));

    const canvas = await html2canvas(contenido, {
      scale: escalaCaptura,
      backgroundColor: "#ffffff",
      useCORS: true,
      width: anchoObj,
      height: altoObj,
      onclone: (_doc, el) => {
        const escalaEl = el.parentElement;
        const cajaEl = escalaEl?.parentElement;
        if (escalaEl) escalaEl.style.transform = "none";
        if (cajaEl) {
          cajaEl.style.width = "auto";
          cajaEl.style.height = "auto";
        }
        // La copia que se captura tiene proporción A4 y esquinas rectas
        el.style.width = `${anchoObj}px`;
        el.style.height = `${altoObj}px`;
        el.style.borderRadius = "0";
      },
    });

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // La imagen ocupa toda la hoja, sin márgenes
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageW, pageH);
    pdf.save("organigrama.pdf");
  } catch (err) {
    console.error("ERROR AL GENERAR PDF DEL ORGANIGRAMA:", err);
    setError("No se pudo generar el PDF.");
  } finally {
    setGenerandoPdf(false);
  }
};

  if (loading) {
    return (
      <div className={style.seccion}>
        <p className={style.estado}>Cargando organigrama...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.seccion}>
        <p className={`${style.estado} ${style.error}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className={style.seccion}>
      <div className={style.encabezado}>
        <h2 className={style.titulo}>Organigrama</h2>

        {arbol.length > 0 && (
          <button
            type="button"
            className={style.botonPdf}
            onClick={descargarPdf}
            disabled={generandoPdf}
          >
            {generandoPdf ? "Generando PDF..." : "Descargar PDF"}
          </button>
        )}
      </div>

      {arbol.length === 0 ? (
        <p className={style.estado}>
          Aún no hay personal registrado para este cliente.
        </p>
      ) : (
        <div ref={vistaRef} className={style.lienzo}>
          <div
            className={style.caja}
            style={{ width: tamano.ancho * escala, height: tamano.alto * escala }}
          >
            <div
              className={style.escala}
              style={{ transform: `scale(${escala})` }}
            >
              <div ref={contenidoRef} className={style.contenido}>
                {/* Logo arriba a la izquierda */}
                <div className={style.cabeceraLogo}>
                  <img
                    src={LOGO_SRC}
                    alt="Logo"
                    className={style.logo}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                {/* Organigrama */}
                <div className={style.arbol}>
                  {arbol.map((raiz) => (
                    <NodoOrganigrama
                      key={raiz.stff_id}
                      nodo={raiz}
                      custNameBucket={custNameBucket}
                      esRaiz
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seccion_3;