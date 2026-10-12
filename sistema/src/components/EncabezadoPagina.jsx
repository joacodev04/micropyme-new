import { Link } from "react-router-dom";

export default function EncabezadoPagina({ title, description, action, actionLabel }) {
  return (
    <header className="topbar d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        <p className="text-secondary mb-0">{description}</p>
      </div>
      {action && <Link className="btn btn-primary" to={action}>{actionLabel}</Link>}
    </header>
  );
}
