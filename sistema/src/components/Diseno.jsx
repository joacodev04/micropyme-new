import { useState } from "react";
import { Outlet } from "react-router-dom";
import BarraLateral from "./BarraLateral";

export default function Diseno() {
  const [open, setOpen] = useState(false);

  function cerrarMenu() {
    setOpen(false);
  }

  return (
    <div className="app-shell">
      <BarraLateral open={open} onClose={cerrarMenu} />
      <main className="main bg-body-tertiary min-vh-100">
        <button
          className="menu-toggle btn btn-dark"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <Outlet />
      </main>
    </div>
  );
}
