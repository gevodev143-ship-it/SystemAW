import style from "./modal.module.css";

export interface OpcionModal {
  label: string;
  onClick: () => void;
  destructivo?: boolean;
}

interface ModalProps {
  opciones: OpcionModal[];
}

const Modal = ({ opciones }: ModalProps) => {
  return (
    <div className={style.menuDesplegable}>
      {opciones.map((opcion, i) => (
        <button
          key={i}
          className={opcion.destructivo ? style.itemEliminar : undefined}
          onClick={opcion.onClick}
        >
          {opcion.label}
        </button>
      ))}
    </div>
  );
};

export default Modal;