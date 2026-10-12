import { useState } from "react";
import EncabezadoPagina from "../components/EncabezadoPagina";
import TablaDatos from "../components/TablaDatos";
import { formatDate, getCollection, saveCollection, statuses } from "../lib/store";

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState(() => getCollection("producciones"));
  const [filtro, setFiltro] = useState("Todas");

  const ordenesVisibles = filtro === "Todas"
    ? ordenes
    : ordenes.filter((orden) => (orden.estado || "Diseño") === filtro);

  const cambiarEstado = (id, estado) => {
    const nuevasOrdenes = ordenes.map((orden) => {
      if (orden.id === id) return { ...orden, estado };
      return orden;
    });

    saveCollection("producciones", nuevasOrdenes);
    setOrdenes(nuevasOrdenes);
  };

  const columnas = [
    { key: "codigo", label: "Código" },
    { key: "producto", label: "Producto" },
    { key: "cliente", label: "Cliente" },
    { key: "fechaEntrega", label: "Entrega", render: (orden) => formatDate(orden.fechaEntrega) },
    { key: "unidades", label: "Unidades" },
    { key: "estado", label: "Estado", render: (orden) => (
      <select className="form-select form-select-sm" value={orden.estado || "Diseño"} onChange={(event) => cambiarEstado(orden.id, event.target.value)}>
        {statuses.map((estado) => <option key={estado}>{estado}</option>)}
      </select>
    ) },
    { key: "avance", label: "Avance", render: (orden) => {
      const posicion = statuses.indexOf(orden.estado || "Diseño");
      const avance = (posicion + 1) * 25;
      return <><div className="progress" style={{ minWidth: 100 }}><div className="progress-bar" style={{ width: `${avance}%` }} /></div><small className="text-secondary">{avance}%</small></>;
    } }
  ];

  return (
    <div className="container-fluid py-4">
      <EncabezadoPagina title="Órdenes de producción" description="Seguimiento de cada orden y su avance." action="/nueva-produccion" actionLabel="Nueva producción" />
      <div className="ordenes-filtros mb-3">
        {["Todas", ...statuses].map((estado) => <button className={`btn btn-sm ${filtro === estado ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setFiltro(estado)} key={estado}>{estado}</button>)}
      </div>
      <section className="card shadow-sm"><div className="card-body"><TablaDatos rows={ordenesVisibles} columns={columnas} /></div></section>
    </div>
  );
};

export default Ordenes;
