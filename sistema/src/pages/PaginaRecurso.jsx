import { useState } from "react";
import EncabezadoPagina from "../components/EncabezadoPagina";
import InsigniaEstado from "../components/InsigniaEstado";
import TablaDatos from "../components/TablaDatos";
import { formatNumber, getAviosWithStock, getCollection, getTelasWithStock, removeItem, saveItem } from "../lib/store";

const configuraciones = {
  telas: {
    titulo: "Telas",
    singular: "tela",
    descripcion: "Administra telas, proveedores y stock.",
    campos: [["nombre", "Nombre"], ["proveedor", "Proveedor"], ["stock", "Stock (kg)", "number"], ["minimo", "Mínimo (kg)", "number"]],
    columnas: [
      { key: "nombre", label: "Nombre" },
      { key: "proveedor", label: "Proveedor" },
      { key: "stock", label: "Stock", render: (item) => `${formatNumber(item.stock)} kg` },
      { key: "minimo", label: "Mínimo", render: (item) => `${formatNumber(item.minimo)} kg` },
    ],
  },
  avios: {
    titulo: "Avíos",
    singular: "avío",
    descripcion: "Gestiona insumos y existencias disponibles.",
    campos: [["nombre", "Nombre"], ["unidad", "Unidad"], ["stock", "Stock", "number"], ["minimo", "Mínimo", "number"]],
    columnas: [{ key: "nombre", label: "Nombre" }, { key: "unidad", label: "Unidad" }, { key: "stock", label: "Stock" }, { key: "minimo", label: "Mínimo" }],
  },
  productos: {
    titulo: "Productos",
    singular: "producto",
    descripcion: "Catálogo de productos y modelos.",
    campos: [["nombre", "Nombre"], ["codigo", "Código"], ["categoria", "Categoría"]],
    columnas: [{ key: "nombre", label: "Nombre" }, { key: "codigo", label: "Código" }, { key: "categoria", label: "Categoría" }],
  },
  procesos: {
    titulo: "Procesos",
    singular: "proceso",
    descripcion: "Define las etapas de fabricación.",
    campos: [["nombre", "Nombre"], ["descripcion", "Descripción"]],
    columnas: [{ key: "nombre", label: "Nombre" }, { key: "descripcion", label: "Descripción" }],
  },
};

const PaginaRecurso = ({ type }) => {
  const configuracion = configuraciones[type];
  const [items, setItems] = useState(() => getCollection(type));
  const [formulario, setFormulario] = useState({});

  const cambiarCampo = (campo, valor) => {
    setFormulario({ ...formulario, [campo]: valor });
  };

  const guardar = (event) => {
    event.preventDefault();
    if (!formulario.nombre) return;

    saveItem(type, formulario);
    setItems(getCollection(type));
    setFormulario({});
  };

  const eliminar = (id) => {
    removeItem(type, id);
    setItems(getCollection(type));
  };

  const obtenerItems = () => {
    if (type === "telas") return getTelasWithStock();
    if (type === "avios") return getAviosWithStock();
    return items;
  };

  const obtenerColumnas = () => {
    const columnas = [...configuracion.columnas];
    const usaStock = type === "telas" || type === "avios";

    if (usaStock) {
      columnas.push({ key: "level", label: "Estado", render: (item) => <InsigniaEstado value={item.level} /> });
    }

    columnas.push({ key: "acciones", label: "", render: (item) => <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(item.id)}>Eliminar</button> });
    return columnas;
  };

  return (
    <div className="container-fluid py-4">
      <EncabezadoPagina title={configuracion.titulo} description={configuracion.descripcion} />
      <section className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h5">Nuevo {configuracion.singular}</h2>
          <form className="row g-3" onSubmit={guardar}>
            {configuracion.campos.map(([campo, etiqueta, tipo = "text"]) => (
              <div className="col-12 col-md-6 col-xl-3" key={campo}>
                <label className="form-label">{etiqueta}</label>
                <input className="form-control" type={tipo} value={formulario[campo] || ""} onChange={(event) => cambiarCampo(campo, event.target.value)} />
              </div>
            ))}
            <div className="col-12 col-md-auto d-flex align-items-end"><button className="btn btn-primary">Guardar</button></div>
          </form>
        </div>
      </section>
      <section className="card shadow-sm"><div className="card-body"><TablaDatos rows={obtenerItems()} columns={obtenerColumnas()} empty={`No hay ${configuracion.titulo.toLowerCase()} cargados.`} /></div></section>
    </div>
  );
};

export default PaginaRecurso;
