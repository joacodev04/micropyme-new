const wizardStore = window.TelaProStore;
const wizardKeys = wizardStore.KEYS;
const wizardNumber = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const processIds = ["corte", "estampado", "costura", "terminacion"];
const fieldIds = [
  "nombre-producto",
  "codigo",
  "cliente",
  "fecha-entrega",
  "prioridad",
  "merma",
  "notas",
  "consumo-tela",
  "kg-por-pieza",
  "precio-kg"
];

function blankState() {
  return {
    producto: "",
    codigo: "",
    cliente: "",
    fechaEntrega: "",
    prioridad: "Media",
    merma: "5",
    notas: "",
    telaId: "",
    telaNombre: "",
    consumoTela: 0,
    piezaCerrada: 0,
    precioKg: 0,
    procesos: [],
    prendas: [],
    avios: []
  };
}

function mapLegacyPrendas(saved) {
  if (Array.isArray(saved.prendas) && saved.prendas.length) {
    return saved.prendas.map((prenda) => ({
      id: prenda.id || `draft-prenda-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      nombre: prenda.nombre || prenda.modelo || saved.producto || "Prenda",
      color: prenda.color || "",
      unidades: wizardStore.toNumber(prenda.unidades ?? prenda.cantidad),
      modelo: prenda.modelo || prenda.modelos || "",
      estado: prenda.estado || "Diseno"
    }));
  }

  if (Array.isArray(saved.colores) && saved.colores.length) {
    return saved.colores.map((item, index) => ({
      id: `draft-prenda-${Date.now()}-${index}`,
      nombre: `${saved.producto || "Prenda"} ${index + 1}`,
      color: item.color || "",
      unidades: wizardStore.toNumber(item.unidades),
      modelo: item.modelos || "",
      estado: item.estado || "Diseno"
    }));
  }

  return [];
}

function loadState() {
  const saved = wizardStore.readJSON(wizardKeys.produccionActual, null);
  if (!saved) return blankState();

  return {
    ...blankState(),
    ...saved,
    prendas: mapLegacyPrendas(saved),
    avios: Array.isArray(saved.avios) ? saved.avios : []
  };
}

let state = loadState();
let currentStep = 0;

function notify(icon, text) {
  if (window.Swal) {
    Swal.fire({
      icon,
      text,
      confirmButtonColor: "#6a4cff"
    });
    return;
  }

  window.alert(text);
}

function persistState() {
  localStorage.setItem(wizardKeys.produccionActual, JSON.stringify(state));
}

function syncFieldState() {
  state.producto = document.getElementById("nombre-producto").value.trim();
  state.codigo = document.getElementById("codigo").value.trim();
  state.cliente = document.getElementById("cliente").value.trim();
  state.fechaEntrega = document.getElementById("fecha-entrega").value;
  state.prioridad = document.getElementById("prioridad").value;
  state.merma = document.getElementById("merma").value.trim();
  state.notas = document.getElementById("notas").value.trim();
  state.consumoTela = wizardStore.toNumber(document.getElementById("consumo-tela").value);
  state.piezaCerrada = wizardStore.toNumber(document.getElementById("kg-por-pieza").value);
  state.precioKg = wizardStore.toNumber(document.getElementById("precio-kg").value);

  const telaSelect = document.getElementById("select-tela");
  const tela = wizardStore.getTelas().find((item) => item.id === telaSelect.value);
  state.telaId = tela ? tela.id : "";
  state.telaNombre = tela ? tela.nombre : "";

  state.procesos = processIds
    .filter((id) => document.getElementById(id).checked)
    .map((id) => document.getElementById(id).dataset.label);

  persistState();
}

function fillForm() {
  document.getElementById("nombre-producto").value = state.producto || "";
  document.getElementById("codigo").value = state.codigo || "";
  document.getElementById("cliente").value = state.cliente || "";
  document.getElementById("fecha-entrega").value = state.fechaEntrega || "";
  document.getElementById("prioridad").value = state.prioridad || "Media";
  document.getElementById("merma").value = state.merma || "5";
  document.getElementById("notas").value = state.notas || "";
  document.getElementById("consumo-tela").value = state.consumoTela || "";
  document.getElementById("kg-por-pieza").value = state.piezaCerrada || "";
  document.getElementById("precio-kg").value = state.precioKg || "";

  processIds.forEach((id) => {
    document.getElementById(id).checked = state.procesos.includes(document.getElementById(id).dataset.label);
  });
}

function renderTelas() {
  const select = document.getElementById("select-tela");
  if (!select) return;

  const telas = wizardStore.getTelas();
  select.innerHTML = '<option value="">Seleccionar tela</option>';

  telas.forEach((tela) => {
    const option = document.createElement("option");
    option.value = tela.id;
    option.textContent = `${tela.nombre} · stock ${wizardNumber.format(tela.stockKg)} kg`;
    option.selected = tela.id === state.telaId;
    select.appendChild(option);
  });
}

function renderPrendas() {
  const tbody = document.getElementById("tabla-prendas");
  if (!tbody) return;

  if (!state.prendas.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state empty-state--soft">
            <strong>Sin prendas cargadas.</strong>
            <span>Agrega cada variante o lote con sus unidades para seguir el estado individual.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = state.prendas
    .map(
      (prenda) => `
        <tr>
          <td><strong>${prenda.nombre}</strong></td>
          <td>${prenda.color || "-"}</td>
          <td>${prenda.modelo || "-"}</td>
          <td>${wizardNumber.format(prenda.unidades)}</td>
          <td><span class="pill warn">${prenda.estado}</span></td>
          <td><button type="button" class="btn btn-ghost" data-remove-prenda="${prenda.id}">Quitar</button></td>
        </tr>
      `
    )
    .join("");
}

function renderAvios() {
  const tbody = document.getElementById("tabla-avios");
  if (!tbody) return;

  const avios = wizardStore.getAviosWithStock();
  const draftMap = new Map(state.avios.map((item) => [item.avioId || item.avio, item]));

  if (!avios.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state empty-state--soft">
            <strong>No hay insumos cargados.</strong>
            <span>Agrega avios desde la seccion de stock para usarlos en una orden.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = avios
    .map((avio) => {
      const draft = draftMap.get(avio.id) || draftMap.get(avio.nombre);
      return `
        <tr>
          <td><strong>${avio.nombre}</strong></td>
          <td>${avio.unidad}</td>
          <td>$${wizardNumber.format(avio.costo)}</td>
          <td>${wizardNumber.format(avio.disponible)} ${avio.unidad}</td>
          <td>${wizardNumber.format(avio.minimo)} ${avio.unidad}</td>
          <td>
            <input
              type="number"
              min="0"
              class="input input--compact"
              value="${draft ? draft.cantidad : 0}"
              data-avio-id="${avio.id}"
              data-avio-nombre="${avio.nombre}"
              data-avio-unidad="${avio.unidad}"
              data-avio-costo="${avio.costo}"
            >
          </td>
        </tr>
      `;
    })
    .join("");
}

function saveAviosDraft() {
  const inputs = document.querySelectorAll("[data-avio-id]");

  state.avios = [...inputs]
    .map((input) => ({
      avioId: input.dataset.avioId,
      avio: input.dataset.avioNombre,
      unidad: input.dataset.avioUnidad,
      costo: wizardStore.toNumber(input.dataset.avioCosto),
      cantidad: wizardStore.toNumber(input.value)
    }))
    .filter((item) => item.cantidad > 0);

  persistState();
}

function renderResumen() {
  syncFieldState();
  saveAviosDraft();

  const tbody = document.getElementById("tabla-resumen");
  const prendasList = document.getElementById("resumen-prendas");
  const aviosList = document.getElementById("resumen-avios");

  if (!tbody || !prendasList || !aviosList) return;

  tbody.innerHTML = `
    <tr><td>Codigo</td><td>${state.codigo || "-"}</td></tr>
    <tr><td>Producto</td><td>${state.producto || "-"}</td></tr>
    <tr><td>Cliente</td><td>${state.cliente || "-"}</td></tr>
    <tr><td>Entrega</td><td>${wizardStore.formatDate(state.fechaEntrega)}</td></tr>
    <tr><td>Prioridad</td><td>${state.prioridad || "-"}</td></tr>
    <tr><td>Tela</td><td>${state.telaNombre || "-"}</td></tr>
    <tr><td>Consumo por prenda</td><td>${wizardNumber.format(state.consumoTela)} kg</td></tr>
    <tr><td>Procesos</td><td>${state.procesos.join(", ") || "-"}</td></tr>
  `;

  prendasList.innerHTML = state.prendas.length
    ? state.prendas
        .map(
          (prenda) => `
            <div class="summary-box">
              <span class="summary-label">${prenda.nombre}</span>
              <strong>${wizardNumber.format(prenda.unidades)} unidades</strong>
              <p>${prenda.color || "Sin color"}${prenda.modelo ? ` · ${prenda.modelo}` : ""} · ${prenda.estado}</p>
            </div>
          `
        )
        .join("")
    : `
      <div class="empty-state empty-state--soft">
        <strong>Sin prendas.</strong>
        <span>Agrega al menos una prenda para activar la orden.</span>
      </div>
    `;

  aviosList.innerHTML = state.avios.length
    ? state.avios
        .map(
          (avio) => `
            <div class="summary-box">
              <span class="summary-label">${avio.avio}</span>
              <strong>${wizardNumber.format(avio.cantidad)} ${avio.unidad}</strong>
              <p>Costo unitario $${wizardNumber.format(avio.costo)}</p>
            </div>
          `
        )
        .join("")
    : `
      <div class="empty-state empty-state--soft">
        <strong>Sin avios seleccionados.</strong>
        <span>La orden se puede activar igual si todavia no definiste insumos.</span>
      </div>
    `;
}

function showStep(index) {
  const steps = document.querySelectorAll(".step");
  const panels = document.querySelectorAll(".step-panel");

  steps.forEach((step, position) => {
    step.classList.toggle("active", position === index);
  });

  panels.forEach((panel, position) => {
    panel.classList.toggle("active", position === index);
  });

  currentStep = index;

  if (index === 5) {
    renderResumen();
  }
}

function addPrenda() {
  const nombre = document.getElementById("input-prenda").value.trim();
  const color = document.getElementById("input-color").value.trim();
  const modelo = document.getElementById("input-modelo").value.trim();
  const unidades = wizardStore.toNumber(document.getElementById("input-unidades").value);

  if (!nombre || unidades <= 0) {
    notify("warning", "Completa nombre de prenda y unidades para agregar el lote.");
    return;
  }

  state.prendas.push({
    id: `draft-prenda-${Date.now()}`,
    nombre,
    color,
    modelo,
    unidades,
    estado: "Diseno"
  });

  persistState();
  renderPrendas();

  document.getElementById("input-prenda").value = "";
  document.getElementById("input-color").value = "";
  document.getElementById("input-modelo").value = "";
  document.getElementById("input-unidades").value = "";
}

function validateStep(index) {
  syncFieldState();

  if (index === 0 && (!state.producto || !state.codigo)) {
    notify("warning", "Completa producto y codigo antes de avanzar.");
    return false;
  }

  if (index === 1 && !state.prendas.length) {
    notify("warning", "Agrega al menos una prenda o lote para seguir el estado individual.");
    return false;
  }

  if (index === 2 && !state.telaNombre) {
    notify("warning", "Selecciona una tela para calcular stock comprometido.");
    return false;
  }

  return true;
}

function activateProduccion(event) {
  event.preventDefault();
  syncFieldState();
  saveAviosDraft();

  if (!state.producto || !state.codigo || !state.prendas.length || !state.telaNombre) {
    notify("warning", "Completa los datos principales, prendas y tela antes de activar la orden.");
    return;
  }

  wizardStore.addProduccion({
    ...state,
    avios: state.avios
  });

  localStorage.removeItem(wizardKeys.produccionActual);
  localStorage.removeItem(wizardKeys.draftProduccion);
  state = blankState();

  if (window.Swal) {
    Swal.fire({
      icon: "success",
      title: "Orden creada",
      text: "La produccion ya figura en seguimiento y stock comprometido.",
      confirmButtonColor: "#6a4cff"
    }).then(() => {
      window.location.href = "ordenes.html";
    });
    return;
  }

  window.location.href = "ordenes.html";
}

document.addEventListener("DOMContentLoaded", () => {
  renderTelas();
  fillForm();
  renderPrendas();
  renderAvios();
  showStep(0);

  fieldIds.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("input", syncFieldState);
    element.addEventListener("change", syncFieldState);
  });

  processIds.forEach((id) => {
    const checkbox = document.getElementById(id);
    checkbox.addEventListener("change", syncFieldState);
  });

  document.getElementById("btn-agregar-prenda").addEventListener("click", addPrenda);
  document.getElementById("tabla-prendas").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-prenda]");
    if (!button) return;

    state.prendas = state.prendas.filter((item) => item.id !== button.dataset.removePrenda);
    persistState();
    renderPrendas();
  });

  document.getElementById("select-tela").addEventListener("change", (event) => {
    const tela = wizardStore.getTelas().find((item) => item.id === event.target.value);
    if (tela) {
      document.getElementById("kg-por-pieza").value = tela.piezaKg || "";
      document.getElementById("precio-kg").value = tela.precio || "";
    }

    syncFieldState();
  });

  document.getElementById("tabla-avios").addEventListener("input", (event) => {
    if (!event.target.matches("[data-avio-id]")) return;
    saveAviosDraft();
  });

  document.querySelectorAll(".step").forEach((step, index) => {
    step.addEventListener("click", () => {
      syncFieldState();
      showStep(index);
    });
  });

  document.querySelectorAll(".btnSiguiente").forEach((button) => {
    button.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
      if (currentStep < document.querySelectorAll(".step").length - 1) {
        showStep(currentStep + 1);
      }
    });
  });

  document.getElementById("activar-produccion").addEventListener("click", activateProduccion);
});
