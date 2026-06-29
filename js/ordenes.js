const ordenesStore = window.TelaProStore;
const ordenesFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

let currentFilter = "activas";

function orderLevelClass(value) {
  if (value === "Terminado") return "ok";
  if (value === "Mixto") return "warn";
  return "primary";
}

function getFilteredOrders() {
  const all = ordenesStore.getProducciones().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if (currentFilter === "activas") {
    return all.filter((item) => item.estadoGeneral !== "Terminado");
  }

  if (currentFilter === "terminadas") {
    return all.filter((item) => item.estadoGeneral === "Terminado");
  }

  return all;
}

function renderSummary() {
  const all = ordenesStore.getProducciones();
  const activas = all.filter((item) => item.estadoGeneral !== "Terminado");
  const terminadas = all.filter((item) => item.estadoGeneral === "Terminado");
  const prendas = activas.reduce(
    (acc, item) => acc + item.prendas.filter((prenda) => prenda.estado !== "Terminado").length,
    0
  );
  const historial = ordenesStore.getRecentHistory(100).length;

  const activosNode = document.getElementById("ordenes-activas");
  const terminadasNode = document.getElementById("ordenes-terminadas");
  const prendasNode = document.getElementById("ordenes-prendas");
  const historialNode = document.getElementById("ordenes-historial");

  if (activosNode) activosNode.textContent = activas.length;
  if (terminadasNode) terminadasNode.textContent = terminadas.length;
  if (prendasNode) prendasNode.textContent = prendas;
  if (historialNode) historialNode.textContent = historial;
}

function buildStatusOptions(current) {
  return ordenesStore.ESTADOS.map(
    (estado) => `<option value="${estado}" ${estado === current ? "selected" : ""}>${estado}</option>`
  ).join("");
}

function renderOrders() {
  const container = document.getElementById("ordenes-grid");
  if (!container) return;

  const orders = getFilteredOrders();

  if (!orders.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No hay ordenes para este filtro.</strong>
        <span>Activa una produccion o cambia el filtro para ver historial.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = orders
    .map((order) => {
      const lastEvent = order.historial[0];
      const procesos = order.procesos.length ? order.procesos.join(", ") : "Sin procesos definidos";

      return `
        <section class="order-card">
          <div class="order-head">
            <div>
              <div class="order-kicker">${order.codigo || "Sin codigo"}</div>
              <h3>${order.producto || "Produccion sin nombre"}</h3>
              <p>${order.cliente || "Sin cliente"} · Entrega ${ordenesStore.formatDate(order.fechaEntrega)}</p>
            </div>
            <span class="pill ${orderLevelClass(order.estadoGeneral)}">${order.estadoGeneral}</span>
          </div>

          <div class="order-meta">
            <span class="info-chip">Prendas ${order.prendas.length}</span>
            <span class="info-chip">Unidades ${ordenesFormatter.format(order.totalUnidades)}</span>
            <span class="info-chip">Tela ${order.telaNombre || "-"}</span>
            <span class="info-chip">Procesos ${procesos}</span>
          </div>

          <div class="progress progress--inline progress--large">
            <div style="width:${order.progreso}%"></div>
          </div>
          <div class="table-note">${order.progreso}% de avance promedio</div>

          <div class="table-wrapper">
            <table class="table table-compact">
              <thead>
                <tr>
                  <th>Prenda</th>
                  <th>Color</th>
                  <th>Modelo</th>
                  <th>Unidades</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${order.prendas
                  .map(
                    (prenda) => `
                      <tr>
                        <td><strong>${prenda.nombre}</strong></td>
                        <td>${prenda.color || "-"}</td>
                        <td>${prenda.modelo || "-"}</td>
                        <td>${ordenesFormatter.format(prenda.unidades)}</td>
                        <td>
                          <select class="select status-select" data-order-id="${order.id}" data-prenda-id="${prenda.id}">
                            ${buildStatusOptions(prenda.estado)}
                          </select>
                        </td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="summary-grid">
            <div class="summary-box">
              <span class="summary-label">Avios comprometidos</span>
              <strong>${order.avios.filter((item) => item.cantidad > 0).length}</strong>
              <p>${order.avios.filter((item) => item.cantidad > 0).map((item) => `${item.avio} x${ordenesFormatter.format(item.cantidad)}`).join(", ") || "Sin insumos asignados"}</p>
            </div>
            <div class="summary-box">
              <span class="summary-label">Ultimo movimiento</span>
              <strong>${lastEvent ? lastEvent.accion : "Sin eventos"}</strong>
              <p>${lastEvent ? `${lastEvent.detalle} · ${ordenesStore.formatDateTime(lastEvent.fecha)}` : "Todavia no hay historial"}</p>
            </div>
          </div>
        </section>
      `;
    })
    .join("");
}

function renderHistoryTable() {
  const tbody = document.getElementById("tabla-historial");
  if (!tbody) return;

  const history = ordenesStore.getRecentHistory(30);

  if (!history.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state empty-state--soft">
            <strong>Sin movimientos registrados.</strong>
            <span>Los cambios de estado aparecen automaticamente en esta tabla.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = history
    .map(
      (item) => `
        <tr>
          <td><strong>${item.codigo || "-"}</strong></td>
          <td>${item.producto || "-"}</td>
          <td>${item.accion}</td>
          <td>${item.detalle || "-"}</td>
          <td>${ordenesStore.formatDateTime(item.fecha)}</td>
        </tr>
      `
    )
    .join("");
}

function renderAll() {
  renderSummary();
  renderOrders();
  renderHistoryTable();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;

      document.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      renderOrders();
    });
  });

  const orderGrid = document.getElementById("ordenes-grid");
  if (orderGrid) {
    orderGrid.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement) || !target.dataset.orderId || !target.dataset.prendaId) return;

      ordenesStore.updatePrendaEstado(target.dataset.orderId, target.dataset.prendaId, target.value);
      renderAll();
    });
  }

  renderAll();
});
