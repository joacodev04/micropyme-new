const aviosStore = window.TelaProStore;
const aviosFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

function aviosLevelClass(level) {
  if (level === "critico") return "bad";
  if (level === "alerta") return "warn";
  return "ok";
}

function renderAviosSummary(items) {
  const totalStock = items.reduce((acc, item) => acc + item.stock, 0);
  const totalComprometido = items.reduce((acc, item) => acc + item.comprometido, 0);
  const alertas = items.filter((item) => item.nivel !== "ok").length;

  const stockNode = document.getElementById("avios-total-stock");
  const comprometidoNode = document.getElementById("avios-total-comprometido");
  const alertasNode = document.getElementById("avios-total-alertas");

  if (stockNode) stockNode.textContent = aviosFormatter.format(totalStock);
  if (comprometidoNode) comprometidoNode.textContent = aviosFormatter.format(totalComprometido);
  if (alertasNode) alertasNode.textContent = alertas;
}

function renderAviosTable() {
  const tabla = document.getElementById("tablaAvios");
  const alertas = document.getElementById("lista-alertas-avios");
  if (!tabla || !alertas) return;

  const items = aviosStore.getAviosWithStock().sort((a, b) => a.disponible - b.disponible);
  renderAviosSummary(items);

  if (!items.length) {
    tabla.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <strong>No hay insumos cargados.</strong>
            <span>Registra stock disponible y minimo para monitorear reposiciones.</span>
          </div>
        </td>
      </tr>
    `;

    alertas.innerHTML = `
      <div class="empty-state empty-state--soft">
        <strong>Sin alertas.</strong>
        <span>Las alertas aparecen cuando el stock proyectado cae.</span>
      </div>
    `;
    return;
  }

  tabla.innerHTML = items
    .map(
      (avio) => `
        <tr>
          <td><strong>${avio.nombre}</strong></td>
          <td>${avio.unidad}</td>
          <td>$${aviosFormatter.format(avio.costo)}</td>
          <td>${aviosFormatter.format(avio.stock)}</td>
          <td>${aviosFormatter.format(avio.minimo)}</td>
          <td>${aviosFormatter.format(avio.comprometido)}</td>
          <td>${aviosFormatter.format(avio.disponible)}</td>
          <td><span class="pill ${aviosLevelClass(avio.nivel)}">${avio.nivel}</span></td>
          <td>${avio.proveedor || "-"}</td>
        </tr>
      `
    )
    .join("");

  const materialesCriticos = items.filter((item) => item.nivel !== "ok");
  alertas.innerHTML = materialesCriticos.length
    ? materialesCriticos
        .map(
          (item) => `
            <article class="alert-item">
              <div>
                <div class="alert-title">${item.nombre}</div>
                <div class="alert-copy">Disponible ${aviosFormatter.format(item.disponible)} ${item.unidad} sobre minimo ${aviosFormatter.format(item.minimo)} ${item.unidad}</div>
              </div>
              <span class="pill ${aviosLevelClass(item.nivel)}">${item.nivel}</span>
            </article>
          `
        )
        .join("")
    : `
      <div class="empty-state empty-state--soft">
        <strong>Sin alertas de insumos.</strong>
        <span>El stock proyectado esta por encima del minimo en todos los avios.</span>
      </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
  const formAvio = document.getElementById("formAvio");

  if (formAvio) {
    formAvio.addEventListener("submit", (event) => {
      event.preventDefault();

      const payload = {
        nombre: document.getElementById("avio-nombre").value.trim(),
        unidad: document.getElementById("avio-unidad").value.trim(),
        costo: document.getElementById("avio-costo").value,
        stock: document.getElementById("avio-stock").value,
        minimo: document.getElementById("avio-minimo").value,
        proveedor: document.getElementById("avio-proveedor").value.trim(),
        notas: document.getElementById("avio-notas").value.trim()
      };

      if (!payload.nombre) return;

      const items = aviosStore.getAvios();
      items.unshift(payload);
      aviosStore.saveAvios(items);
      formAvio.reset();
      renderAviosTable();
    });
  }

  renderAviosTable();
});
