import { useEffect, useState } from "react";
import { useAuth } from "../../../../core/contexts/auth.context";
import {
  obtenerLogosPorCustId,
  subirImagenLogo,
  crearLogo,
  actualizarLogo,
  eliminarLogo,
  eliminarImagenLogo,
  type Logo,
} from "../../services/logo.service";
import style from "./seccion_1.module.css";

const Seccion_1 = () => {
  const { custId, custNameBucket, loadingAuth } = useAuth();

  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario (crear / editar)
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargarLogos = async () => {
    if (!custId) return;
    setLoading(true);
    setError(null);

    const { data, error } = await obtenerLogosPorCustId(custId);

    if (error) {
      console.error("Error al obtener logos:", error);
      setError(error.message);
      setLogos([]);
    } else {
      setLogos(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!loadingAuth && custId) {
      cargarLogos();
    } else if (!loadingAuth && !custId) {
      setLoading(false);
    }
  }, [custId, loadingAuth]);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre("");
    setDescripcion("");
    setArchivo(null);
  };

  const handleGuardar = async () => {
    if (!custId || !custNameBucket) {
      setError("No se encontró cust_id o cust_name_bucket del usuario.");
      return;
    }
    if (!nombre.trim()) {
      setError("El nombre del logo es obligatorio.");
      return;
    }
    if (!editandoId && !archivo) {
      setError("Debes seleccionar una imagen para el nuevo logo.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      // CREAR
      if (!editandoId) {
        const { publicUrl, error: uploadError } = await subirImagenLogo(
          archivo as File,
          custNameBucket
        );

        if (uploadError || !publicUrl) {
          throw uploadError ?? new Error("No se pudo subir la imagen.");
        }

        const { error: insertError } = await crearLogo({
          logo_name: nombre.trim(),
          logo_description: descripcion.trim() || null,
          logo_link_img: publicUrl,
          cust_id: custId,
        });

        if (insertError) throw insertError;
      } else {
        // EDITAR
        let nuevaUrl: string | undefined;

        if (archivo) {
          const { publicUrl, error: uploadError } = await subirImagenLogo(
            archivo,
            custNameBucket
          );
          if (uploadError || !publicUrl) {
            throw uploadError ?? new Error("No se pudo subir la nueva imagen.");
          }
          nuevaUrl = publicUrl;
        }

        const { error: updateError } = await actualizarLogo(editandoId, {
          logo_name: nombre.trim(),
          logo_description: descripcion.trim() || null,
          ...(nuevaUrl ? { logo_link_img: nuevaUrl } : {}),
        });

        if (updateError) throw updateError;
      }

      limpiarFormulario();
      await cargarLogos();
    } catch (err: any) {
      console.error("Error al guardar logo:", err);
      setError(err.message ?? "Error desconocido al guardar el logo.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (logo: Logo) => {
    setEditandoId(logo.logo_id);
    setNombre(logo.logo_name);
    setDescripcion(logo.logo_description ?? "");
    setArchivo(null);
  };

  const handleEliminar = async (logo: Logo) => {
    if (!custNameBucket) return;
    if (!confirm(`¿Eliminar el logo "${logo.logo_name}"?`)) return;

    try {
      // Extrae el path relativo dentro del bucket a partir de la URL pública
      const marcador = `/${custNameBucket}/`;
      const idx = logo.logo_link_img.indexOf(marcador);
      if (idx !== -1) {
        const path = logo.logo_link_img.substring(idx + marcador.length);
        await eliminarImagenLogo(custNameBucket, path);
      }

      const { error } = await eliminarLogo(logo.logo_id);
      if (error) throw error;

      await cargarLogos();
    } catch (err: any) {
      console.error("Error al eliminar logo:", err);
      setError(err.message ?? "Error al eliminar el logo.");
    }
  };

  if (loadingAuth || loading) {
    return (
      <div className={style.seccion}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!custId) {
    return (
      <div className={style.seccion}>
        <p>No se encontró el cust_id del usuario.</p>
      </div>
    );
  }

  return (
    <div className={style.seccion}>
      {error && <p className={style.error}>{error}</p>}

      {/* Formulario crear / editar */}
      <div className={style.formulario}>
        <h3>{editandoId ? "Editar logo" : "Nuevo logo"}</h3>

        <input
          type="text"
          placeholder="Nombre del logo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <textarea
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
        />

        <div className={style.accionesFormulario}>
          <button onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Crear"}
          </button>
          {editandoId && (
            <button onClick={limpiarFormulario} disabled={guardando}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Listado */}
      <div className={style.listado}>
        {logos.length === 0 ? (
          <p>No hay logos registrados.</p>
        ) : (
          logos.map((logo) => (
            <div key={logo.logo_id} className={style.tarjetaLogo}>
              <img
                src={logo.logo_link_img}
                alt={logo.logo_name}
                className={style.logoImagen}
              />
              <p className={style.logoNombre}>{logo.logo_name}</p>
              {logo.logo_description && (
                <p className={style.logoDescripcion}>
                  {logo.logo_description}
                </p>
              )}
              <div className={style.accionesTarjeta}>
                <button onClick={() => handleEditar(logo)}>Editar</button>
                <button onClick={() => handleEliminar(logo)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Seccion_1;