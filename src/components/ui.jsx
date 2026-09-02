import { AlertTriangle, Inbox, LoaderCircle, X } from "lucide-react";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function StatePanel({ tone = "empty", title, description, action }) {
  const Icon = tone === "error" ? AlertTriangle : Inbox;
  return (
    <div className={`state-panel state-panel--${tone}`}>
      <div className="state-icon">
        <Icon aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export function LoadingPanel({ label = "Carregando dados..." }) {
  return (
    <div className="loading-panel" role="status">
      <LoaderCircle className="spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="skeleton-list" aria-label="Carregando">
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-row" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

export function Modal({ open, title, description, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`modal ${wide ? "modal--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </section>
    </div>
  );
}

export function StatusBadge({ status, children }) {
  return <span className={`status-badge status-badge--${status}`}>{children}</span>;
}

export function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="stat-card">
      <div className="stat-card__icon">
        <Icon aria-hidden="true" />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {helper ? <small>{helper}</small> : null}
      </div>
    </article>
  );
}
