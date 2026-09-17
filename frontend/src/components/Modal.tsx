import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  large?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, footer, large }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${large ? 'modal-lg' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
