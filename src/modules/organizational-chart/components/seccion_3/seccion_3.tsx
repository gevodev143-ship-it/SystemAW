import { useEffect, useState } from "react";
import style from "./seccion_3.module.css";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../core/contexts/auth.context";
import { getStaffImageUrl } from "../../../staff/services/staff.service";

// =========================================================
// CARGO PERSONALIZADO DEL CLIENTE
// =========================================================

interface JobPositionCustomer {
  jb_pstn_cust_id: number;
  jb_pstn_cust_name: string;
  jb_pstn_cust_description: string | null;
  cust_id: number;
}

// =========================================================
// PERSONAL DEL CLIENTE
// =========================================================

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

// =========================================================
// NODO DEL ORGANIGRAMA
// Cada nodo representa a una PERSONA
// =========================================================

interface OrgNode extends StaffMember {
  hijos: OrgNode[];
}

// =========================================================
// CONSTRUIR ÁRBOL DEL ORGANIGRAMA
//
// stff_id = persona
// stff_supervisor_id = jefe directo
// =========================================================

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
// COMPONENTE DE CADA NODO DEL ORGANIGRAMA
// =========================================================

interface NodoOrganigramaProps {
  nodo: OrgNode;
  custNameBucket: string | null;
}

const NodoOrganigrama = ({ nodo, custNameBucket }: NodoOrganigramaProps) => {
  const tieneHijos = nodo.hijos.length > 0;

  const urlImagen = custNameBucket
    ? getStaffImageUrl(custNameBucket, nodo.stff_link_img)
    : null;

  return (
    <div className={style.rama}>
      <div className={`${style.tarjeta} ${tieneHijos ? style.conHijos : ""}`}>
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

        <p className={style.nombre}>
          {nodo.stff_name} {nodo.stff_lastname}
        </p>

        <p className={style.cargo}>
          {nodo.job_position_customers?.jb_pstn_cust_name ?? "Sin cargo"}
        </p>
      </div>

      {tieneHijos && (
        <div className={style.hijos}>
          {nodo.hijos.map((hijo) => (
            <NodoOrganigrama
              key={hijo.stff_id}
              nodo={hijo}
              custNameBucket={custNameBucket}
            />
          ))}
        </div>
      )}
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

  // =========================================================
  // CARGAR PERSONAL Y ARMAR EL ORGANIGRAMA
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
  // ESTADO: CARGANDO
  // =========================================================

  if (loading) {
    return (
      <div className={style.seccion}>
        <p className={style.estado}>Cargando organigrama...</p>
      </div>
    );
  }

  // =========================================================
  // ESTADO: ERROR
  // =========================================================

  if (error) {
    return (
      <div className={style.seccion}>
        <p className={`${style.estado} ${style.error}`}>{error}</p>
      </div>
    );
  }

  // =========================================================
  // VISTA PRINCIPAL
  // =========================================================

  return (
    <div className={style.seccion}>
      <h2 className={style.titulo}>Organigrama</h2>

      {arbol.length === 0 ? (
        <p className={style.estado}>
          Aún no hay personal registrado para este cliente.
        </p>
      ) : (
        <div className={style.lienzo}>
          {arbol.map((raiz) => (
            <NodoOrganigrama
              key={raiz.stff_id}
              nodo={raiz}
              custNameBucket={custNameBucket}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Seccion_3;