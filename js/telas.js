const telasStore = window.TelaProStore;
const telasFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

function telasLevelClass(level) {
  if (level === "critico") return "bad";
  if (level === "alerta") return "warn";
  return "ok";
}

function renderTelasSummary(items) {
  const totalStock = items.reduce((acc, item) => acc + item.stockKg, 0);
  const totalComprometido = items.reduce((acc, item) => acc + item.comprometido, 0);
  const alertas = items.filter((item) => item.nivel !== "ok").length;

  const stockNode = document.getElementById("telas-total-stock");
  const comprometidoNode = document.getElementById("telas-total-comprometido");
  const alertasNode = document.getElementById("telas-total-alertas");

  if (stockNode) stockNode.textContent = `${telasFormatter.format(totalStock)} kg`;
  if (comprometidoNode) comprometidoNode.textContent = `${telasFormatter.format(totalComprometido)} kg`;
  if (alertasNode) alertasNode.textContent = alertas;
}

function renderTelasTable() {
  const tabla = document.getElementById("tablaTelas");
  const alertas = document.getElementById("lista-alertas-telas");
  if (!tabla || !alertas) return;

  const items = telasStore.getTelasWithStock().sort((a, b) => a.disponible - b.disponible);
  renderTelasSummary(items);

  if (!items.length) {
    tabla.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <strong>No hay telas cargadas.</strong>
            <span>Registra stock real y stock minimo para activar las alertas.</span>
          </div>
        </td>
      </tr>
    `;

    alertas.innerHTML = `
      <div class="empty-state empty-state--soft">
        <strong>Sin alertas.</strong>
        <span>Las alertas se calculan en base al stock proyectado.</span>
      </div>
    `;
    return;
  }

  tabla.innerHTML = items
    .map(
      (tela) => `
        <tr>
          <td><strong>${tela.nombre}</strong></td>
          <td>$${telasFormatter.format(tela.precio)}</td>
          <td>${telasFormatter.format(tela.piezaKg)} kg</td>
          <td>${telasFormatter.format(tela.stockKg)} kg</td>
          <td>${telasFormatter.format(tela.minimoKg)} kg</td>
          <td>${telasFormatter.format(tela.comprometido)} kg</td>
          <td>${telasFormatter.format(tela.disponible)} kg</td>
          <td><span class="pill ${telasLevelClass(tela.nivel)}">${tela.nivel}</span></td>
          <td>${tela.proveedor || "-"}</td>
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
                <div class="alert-copy">Disponible ${telasFormatter.format(item.disponible)} kg sobre minimo ${telasFormatter.format(item.minimoKg)} kg</div>
              </div>
              <span class="pill ${telasLevelClass(item.nivel)}">${item.nivel}</span>
            </article>
          `
        )
        .join("")
    : `
      <div class="empty-state empty-state--soft">
        <strong>Sin alertas de telas.</strong>
        <span>El stock proyectado esta por encima del minimo en todas las telas.</span>
      </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
  const formTela = document.getElementById("formTela");

  if (formTela) {
    formTela.addEventListener("submit", (event) => {
      event.preventDefault();

      const payload = {
        nombre: document.getElementById("tela-nombre").value.trim(),
        precio: document.getElementById("tela-precio").value,
        piezaKg: document.getElementById("tela-pieza").value,
        stockKg: document.getElementById("tela-stock").value,
        minimoKg: document.getElementById("tela-minimo").value,
        proveedor: document.getElementById("tela-proveedor").value.trim(),
        notas: document.getElementById("tela-notas").value.trim()
      };

      if (!payload.nombre) return;

      const items = telasStore.getTelas();
      items.unshift(payload);
      telasStore.saveTelas(items);
      formTela.reset();
      renderTelasTable();
    });
  }

  renderTelasTable();
});
