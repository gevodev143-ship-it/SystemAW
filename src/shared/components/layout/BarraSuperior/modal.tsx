import type { ReactNode } from "react";
import style from "./modal.module.css";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div className={style.overlay} onClick={onClose}>
      <div
        className={style.contenido}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={style.botonCerrar}
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}