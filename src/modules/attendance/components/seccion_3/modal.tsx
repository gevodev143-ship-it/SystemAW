import { ReactNode, useEffect } from "react";
import style from "./modal.module.css";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal = ({ onClose, children, title }: ModalProps) => {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.header}>
          {title && <h3>{title}</h3>}
          <button className={style.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={style.body}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;