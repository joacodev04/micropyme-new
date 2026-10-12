import { Link } from "react-router-dom";
import EncabezadoPagina from "../components/EncabezadoPagina";
import TarjetaEstadistica from "../components/TarjetaEstadistica";
import TablaDatos from "../components/TablaDatos";
import InsigniaEstado from "../components/InsigniaEstado";
import { formatDate, getAviosWithStock, getCollection, getStats, getTelasWithStock } from "../lib/store";

const tarjetas = [
  ["active", "Producciones activas", "Órdenes en curso"],
  ["units", "Prendas en curso", "Unidades comprometidas"],
  ["completed", "Producciones terminadas", "Histórico completado"],
  ["alerts", "Materiales críticos", "Requieren atención"]
];

export default function Panel() {
  const estadisticas = getStats();
  const ordenes = getCollection("producciones").filter((orden) => orden.estado !== "Terminado").slice(0, 5);
  const alertas = [...getTelasWithStock(), ...getAviosWithStock()].filter((material) => material.level !== "ok").slice(0, 5);
  const columnasOrdenes = [
    { key: "codigo", label: "Código" },
    { key: "producto", label: "Producto" },
    { key: "cliente", label: "Cliente" },
    { key: "fechaEntrega", label: "Entrega", render: (orden) => formatDate(orden.fechaEntrega) },
    { key: "estado", label: "Estado", render: (orden) => <InsigniaEstado value={orden.estado || "Diseño"} /> }
  ];

  return (
    <div className="container-fluid py-4">
      <EncabezadoPagina title="Dashboard" description="Una vista general de tus operaciones textiles." action="/nueva-produccion" actionLabel="Nueva producción" />
      <div className="row g-3 mb-4">
        {tarjetas.map(([key, label, detail]) => <div className="col-12 col-sm-6 col-xl-3" key={key}><TarjetaEstadistica label={label} value={estadisticas[key]} detail={detail} /></div>)}
      </div>
      <div className="row g-4">
        <div className="col-12 col-xl-8"><section className="card shadow-sm"><div className="card-body"><div className="d-flex justify-content-between mb-3"><h2 className="h5 mb-0">Órdenes activas</h2><Link to="/ordenes" className="small">Ver todas</Link></div><TablaDatos rows={ordenes} columns={columnasOrdenes} /></div></section></div>
        <div className="col-12 col-xl-4"><section className="card shadow-sm h-100"><div className="card-body"><h2 className="h5">Alertas de stock</h2>{alertas.length ? <div className="list-group list-group-flush">{alertas.map((material) => <div className="list-group-item px-0 d-flex justify-content-between align-items-center" key={material.id}><div><strong>{material.nombre}</strong><small className="d-block text-secondary">Disponible: {material.available}</small></div><InsigniaEstado value={material.level === "critico" ? "Crítico" : "Alerta"} /></div>)}</div> : <p className="text-secondary mt-4">Stock bajo control.</p>}</div></section></div>
      </div>
    </div>
  );
}
