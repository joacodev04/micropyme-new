import { NavLink } from "react-router-dom";

const grupos = [
  { titulo: "Operaciones", enlaces: [["/", "▦", "Dashboard"], ["/ordenes", "▤", "Órdenes"], ["/nueva-produccion", "+", "Nueva producción"]] },
  { titulo: "Catálogo", enlaces: [["/telas", "▥", "Telas"], ["/avios", "◈", "Avíos"], ["/productos", "◫", "Productos"], ["/procesos", "↻", "Procesos"]] }
];

export default function BarraLateral({ open, onClose }) {
  const claseSidebar = `sidebar bg-dark text-white ${open ? "active" : ""}`;

  return (
    <>
    <aside className={claseSidebar}>
      <div className="brand border-bottom border-secondary-subtle">
        <span className="brand-logo">T</span>
        <div><strong>TelaPro</strong><small className="d-block text-white-50">Gestión textil</small></div>
      </div>
      <nav className="nav flex-column p-3">
        {grupos.map((grupo) => (
          <div className="sidebar-group" key={grupo.titulo}>
            <span className="sidebar-group-title">{grupo.titulo}</span>
            <div className="d-flex flex-column gap-1">
              {grupo.enlaces.map(([to, icon, label]) => (
                <NavLink key={to} to={to} end={to === "/"} onClick={onClose} className={({ isActive }) => `nav-link text-white rounded ${isActive ? "active" : ""}`}>
                  <span className="me-2">{icon}</span>{label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
    {open && <button className="sidebar-overlay" aria-label="Cerrar menú" onClick={onClose} />}
    </>
  );
}
