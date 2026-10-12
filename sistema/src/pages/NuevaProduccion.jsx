import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EncabezadoPagina from "../components/EncabezadoPagina";
import { getCollection, saveItem } from "../lib/store";

const campos = [
  ["codigo", "Código"],
  ["producto", "Producto"],
  ["cliente", "Cliente"],
  ["fechaEntrega", "Fecha de entrega", "date"],
  ["consumo", "Consumo por unidad", "number"],
  ["unidades", "Unidades", "number"],
];

const NuevaProduccion = () => {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({ estado: "Diseño", unidades: 1 });
  const telas = getCollection("telas");

  const cambiarCampo = (campo, valor) => {
    setFormulario({ ...formulario, [campo]: valor });
  };

  const guardarProduccion = (event) => {
    event.preventDefault();

    saveItem("producciones", {
      ...formulario,
      unidades: Number(formulario.unidades),
      createdAt: new Date().toISOString(),
    });

    navigate("/ordenes");
  };

  return (
    <div className="container-fluid py-4">
      <EncabezadoPagina title="Nueva producción" description="Registra una nueva orden y comienza a seguirla." />

      <form className="card shadow-sm" onSubmit={guardarProduccion}>
        <div className="card-body">
          <div className="row g-3">
            {campos.map(([campo, etiqueta, tipo = "text"]) => (
              <div className="col-12 col-md-6" key={campo}>
                <label className="form-label">{etiqueta}</label>
                <input
                  required={campo !== "consumo"}
                  className="form-control"
                  type={tipo}
                  value={formulario[campo] || ""}
                  onChange={(event) => cambiarCampo(campo, event.target.value)}
                />
              </div>
            ))}

            <div className="col-12 col-md-6">
              <label className="form-label">Tela</label>
              <select className="form-select" value={formulario.tela || ""} onChange={(event) => cambiarCampo("tela", event.target.value)}>
                <option value="">Seleccionar tela</option>
                {telas.map((tela) => <option key={tela.id}>{tela.nombre}</option>)}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Notas</label>
              <textarea className="form-control" rows="3" value={formulario.notas || ""} onChange={(event) => cambiarCampo("notas", event.target.value)} />
            </div>
          </div>
        </div>

        <div className="card-footer d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/ordenes")}>Cancelar</button>
          <button className="btn btn-primary">Crear producción</button>
        </div>
      </form>
    </div>
  );
};

export default NuevaProduccion;
