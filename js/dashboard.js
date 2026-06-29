const dashboardStore = window.TelaProStore;
const numberFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

function levelClass(level) {
  if (level === "critico") return "bad";
  if (level === "alerta") return "warn";
  return "ok";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderStats() {
  const stats = dashboardStore.getDashboardStats();

  setText("producciones-activas", stats.activas);
  setText("prendas-en-curso", stats.prendasEnCurso);
  setText("producciones-terminadas", stats.terminadas);
  setText("materiales-criticos", stats.alertas);
  setText("tela-comprometida", `${numberFormatter.format(stats.telaComprometida)} kg`);
  setText("avios-comprometidos", numberFormatter.format(stats.aviosComprometidos));
}

function renderActiveOrders() {
  const tbody = document.getElementById("tabla-dash");
  if (!tbody) return;

  const lista = dashboardStore.getActiveProducciones();

  if (!lista.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <strong>No hay ordenes activas.</strong>
            <span>Crea una produccion para empezar a seguir prendas, materiales e historial.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista
    .map(
      (produccion) => `
        <tr>
          <td><strong>${produccion.codigo || "-"}</strong></td>
          <td>${produccion.producto || "-"}</td>
          <td>${produccion.cliente || "-"}</td>
          <td>${dashboardStore.formatDate(produccion.fechaEntrega)}</td>
          <td>${produccion.prendas.length} prendas / ${numberFormatter.format(produccion.totalUnidades)} u</td>
          <td><span class="pill ${levelClass(produccion.estadoGeneral === "Mixto" ? "alerta" : produccion.estadoGeneral === "Terminado" ? "ok" : "warn")}">${produccion.estadoGeneral}</span></td>
          <td>
            <div class="progress progress--inline">
              <div style="width:${produccion.progreso}%"></div>
            </div>
            <div class="table-note">${produccion.progreso}% completado</div>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderAlerts() {
  const container = document.getElementById("lista-alertas");
  if (!container) return;

  const alerts = dashboardStore.getMaterialAlerts();

  if (!alerts.length) {
    container.innerHTML = `
      <div class="empty-state empty-state--soft">
        <strong>Stock bajo control.</strong>
        <span>No hay materiales en riesgo segun las ordenes activas.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = alerts
    .slice(0, 6)
    .map(
      (alerta) => `
        <article class="alert-item">
          <div>
            <div class="alert-title">${alerta.tipo}: ${alerta.nombre}</div>
            <div class="alert-copy">Disponible proyectado ${numberFormatter.format(alerta.disponible)} ${alerta.unidad} / minimo ${numberFormatter.format(alerta.minimo)} ${alerta.unidad}</div>
          </div>
          <span class="pill ${levelClass(alerta.nivel)}">${alerta.nivel}</span>
        </article>
      `
    )
    .join("");
}

function renderStockSnapshot() {
  const telasBody = document.getElementById("tabla-stock-telas");
  const aviosBody = document.getElementById("tabla-stock-avios");
  if (!telasBody || !aviosBody) return;

  const telas = dashboardStore
    .getTelasWithStock()
    .sort((a, b) => a.disponible - b.disponible)
    .slice(0, 4);
  const avios = dashboardStore
    .getAviosWithStock()
    .sort((a, b) => a.disponible - b.disponible)
    .slice(0, 4);

  telasBody.innerHTML = telas.length
    ? telas
        .map(
          (tela) => `
            <tr>
              <td><strong>${tela.nombre}</strong></td>
              <td>${numberFormatter.format(tela.stockKg)} kg</td>
              <td>${numberFormatter.format(tela.comprometido)} kg</td>
              <td>${numberFormatter.format(tela.disponible)} kg</td>
              <td><span class="pill ${levelClass(tela.nivel)}">${tela.nivel}</span></td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="5">
          <div class="empty-state empty-state--soft">
            <strong>Sin telas cargadas.</strong>
            <span>Agrega tela y stock para activar el monitoreo.</span>
          </div>
        </td>
      </tr>
    `;

  aviosBody.innerHTML = avios.length
    ? avios
        .map(
          (avio) => `
            <tr>
              <td><strong>${avio.nombre}</strong></td>
              <td>${numberFormatter.format(avio.stock)} ${avio.unidad}</td>
              <td>${numberFormatter.format(avio.comprometido)} ${avio.unidad}</td>
              <td>${numberFormatter.format(avio.disponible)} ${avio.unidad}</td>
              <td><span class="pill ${levelClass(avio.nivel)}">${avio.nivel}</span></td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="5">
          <div class="empty-state empty-state--soft">
            <strong>Sin insumos cargados.</strong>
            <span>Agrega avios para ver disponibilidad proyectada.</span>
          </div>
        </td>
      </tr>
    `;
}

function renderHistory() {
  const timeline = document.getElementById("timeline-historial");
  if (!timeline) return;

  const history = dashboardStore.getRecentHistory(8);

  if (!history.length) {
    timeline.innerHTML = `
      <div class="empty-state empty-state--soft">
        <strong>Sin historial todavia.</strong>
        <span>Los cambios de estado y las altas de ordenes se veran aca.</span>
      </div>
    `;
    return;
  }

  timeline.innerHTML = history
    .map(
      (item) => `
        <article class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-body">
            <div class="timeline-top">
              <strong>${item.codigo || "Sin codigo"} · ${item.producto || "Produccion"}</strong>
              <span>${dashboardStore.formatDateTime(item.fecha)}</span>
            </div>
            <div class="timeline-title">${item.accion}</div>
            <p>${item.detalle || "-"}</p>
          </div>
        </article>
      `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderActiveOrders();
  renderAlerts();
  renderStockSnapshot();
  renderHistory();
});
