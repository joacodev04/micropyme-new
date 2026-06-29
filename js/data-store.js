(function () {
  const KEYS = {
    productos: "productos",
    telas: "telas",
    avios: "avios",
    producciones: "producciones",
    produccionActual: "produccionActual",
    draftProduccion: "form-produccion",
    procesos: "procesos"
  };

  const ESTADOS = ["Diseno", "Corte", "Costura", "Terminado"];
  const ACTIVE_STATUS = new Set(["Diseno", "Corte", "Costura"]);

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function isoNow() {
    return new Date().toISOString();
  }

  function formatDateTime(value) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(value));
  }

  function formatDate(value) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short"
    }).format(new Date(value));
  }

  function toNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string") return 0;

    const normalized = value.replace(",", ".").replace(/[^0-9.-]/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function buildHistorialEntry(accion, detalle, fecha) {
    return {
      id: uid("hist"),
      fecha: fecha || isoNow(),
      accion,
      detalle
    };
  }

  function normalizeHistorial(historial, fallback) {
    const items = ensureArray(historial).map((item) => ({
      id: item.id || uid("hist"),
      fecha: item.fecha || fallback || isoNow(),
      accion: item.accion || "Actualizacion",
      detalle: item.detalle || ""
    }));

    if (items.length) return items;
    return [buildHistorialEntry("Orden creada", "Alta inicial de produccion", fallback)];
  }

  function normalizeTela(item) {
    const createdAt = item.createdAt || item.fechaAlta || isoNow();

    return {
      id: item.id || uid("tela"),
      nombre: item.nombre || "",
      precio: toNumber(item.precio),
      piezaKg: toNumber(item.piezaKg ?? item.kg),
      stockKg: toNumber(item.stockKg ?? item.stock),
      minimoKg: toNumber(item.minimoKg ?? item.minimo),
      proveedor: item.proveedor || "",
      notas: item.notas || "",
      createdAt,
      updatedAt: item.updatedAt || createdAt
    };
  }

  function normalizeAvio(item) {
    const createdAt = item.createdAt || item.fechaAlta || isoNow();

    return {
      id: item.id || uid("avio"),
      nombre: item.nombre || "",
      unidad: item.unidad || "unidad",
      costo: toNumber(item.costo),
      stock: toNumber(item.stock),
      minimo: toNumber(item.minimo),
      proveedor: item.proveedor || "",
      notas: item.notas || "",
      createdAt,
      updatedAt: item.updatedAt || createdAt
    };
  }

  function normalizePrenda(item, index, producto) {
    const fallbackName = producto || `Prenda ${index + 1}`;
    const estado = ESTADOS.includes(item.estado) ? item.estado : "Diseno";

    return {
      id: item.id || uid("prenda"),
      nombre: item.nombre || item.modelo || fallbackName,
      color: item.color || "",
      unidades: Math.max(0, toNumber(item.unidades ?? item.cantidad)),
      modelo: item.modelo || item.modelos || "",
      estado
    };
  }

  function derivePrendas(item) {
    if (Array.isArray(item.prendas) && item.prendas.length) {
      return item.prendas.map((prenda, index) => normalizePrenda(prenda, index, item.producto));
    }

    if (Array.isArray(item.colores) && item.colores.length) {
      return item.colores.map((color, index) =>
        normalizePrenda(
          {
            nombre: `${item.producto || "Prenda"} ${index + 1}`,
            color: color.color,
            unidades: color.unidades,
            modelo: color.modelos,
            estado: color.estado || item.estadoGeneral
          },
          index,
          item.producto
        )
      );
    }

    return [
      normalizePrenda(
        {
          nombre: item.producto || "Prenda",
          unidades: item.unidades,
          estado: item.estadoGeneral || "Diseno"
        },
        0,
        item.producto
      )
    ];
  }

  function normalizeAvioUso(item) {
    return {
      id: item.id || uid("uso"),
      avioId: item.avioId || "",
      avio: item.avio || item.nombre || "",
      unidad: item.unidad || "unidad",
      costo: toNumber(item.costo),
      cantidad: Math.max(0, toNumber(item.cantidad)),
      proveedor: item.proveedor || ""
    };
  }

  function deriveEstadoGeneral(prendas, fallback) {
    const estados = prendas.map((prenda) => prenda.estado);
    const unique = [...new Set(estados)];

    if (!unique.length) return ESTADOS.includes(fallback) ? fallback : "Diseno";
    if (unique.length === 1) return unique[0];
    return "Mixto";
  }

  function calcProgress(prendas) {
    if (!prendas.length) return 0;

    const total = prendas.reduce((acc, prenda) => acc + statusProgress(prenda.estado), 0);
    return Math.round(total / prendas.length);
  }

  function statusProgress(estado) {
    switch (estado) {
      case "Diseno":
        return 25;
      case "Corte":
        return 50;
      case "Costura":
        return 75;
      case "Terminado":
        return 100;
      default:
        return 0;
    }
  }

  function normalizeProduccion(item) {
    const createdAt = item.createdAt || item.fechaCreacion || item.fecha || isoNow();
    const prendas = derivePrendas(item);
    const estadoGeneral = deriveEstadoGeneral(prendas, item.estadoGeneral);
    const totalUnidades = prendas.reduce((acc, prenda) => acc + prenda.unidades, 0);
    const historial = normalizeHistorial(item.historial, createdAt);

    return {
      id: item.id || uid("op"),
      codigo: item.codigo || "",
      producto: item.producto || "",
      cliente: item.cliente || "",
      prioridad: item.prioridad || "Media",
      fechaEntrega: item.fechaEntrega || "",
      merma: item.merma || "",
      notas: item.notas || "",
      telaId: item.telaId || "",
      telaNombre: item.telaNombre || "",
      consumoTela: toNumber(item.consumoTela),
      piezaCerrada: toNumber(item.piezaCerrada ?? item.kgPorPieza),
      precioKg: toNumber(item.precioKg ?? item.precio),
      procesos: ensureArray(item.procesos),
      avios: ensureArray(item.avios).map(normalizeAvioUso),
      prendas,
      totalUnidades,
      estadoGeneral,
      progreso: calcProgress(prendas),
      createdAt,
      updatedAt: item.updatedAt || createdAt,
      historial
    };
  }

  function migrateCollection(key, normalizer) {
    const current = ensureArray(readJSON(key, []));
    const normalized = current.map(normalizer);

    if (JSON.stringify(current) !== JSON.stringify(normalized)) {
      writeJSON(key, normalized);
    }

    return normalized;
  }

  function init() {
    migrateCollection(KEYS.telas, normalizeTela);
    migrateCollection(KEYS.avios, normalizeAvio);
    migrateCollection(KEYS.producciones, normalizeProduccion);
  }

  function getTelas() {
    return ensureArray(readJSON(KEYS.telas, [])).map(normalizeTela);
  }

  function saveTelas(items) {
    writeJSON(KEYS.telas, items.map(normalizeTela));
  }

  function getAvios() {
    return ensureArray(readJSON(KEYS.avios, [])).map(normalizeAvio);
  }

  function saveAvios(items) {
    writeJSON(KEYS.avios, items.map(normalizeAvio));
  }

  function getProducciones() {
    return ensureArray(readJSON(KEYS.producciones, [])).map(normalizeProduccion);
  }

  function saveProducciones(items) {
    writeJSON(KEYS.producciones, items.map(normalizeProduccion));
  }

  function getActiveProducciones() {
    return getProducciones().filter((item) => item.estadoGeneral !== "Terminado");
  }

  function getCompletedProducciones() {
    return getProducciones().filter((item) => item.estadoGeneral === "Terminado");
  }

  function calculateMaterialUsage() {
    const producciones = getActiveProducciones();
    const telaUsage = {};
    const avioUsage = {};

    producciones.forEach((produccion) => {
      const telaKey = produccion.telaId || produccion.telaNombre;
      const consumoTela = produccion.consumoTela * produccion.totalUnidades;

      if (telaKey && consumoTela > 0) {
        telaUsage[telaKey] = (telaUsage[telaKey] || 0) + consumoTela;
      }

      produccion.avios.forEach((avio) => {
        const avioKey = avio.avioId || avio.avio;
        if (!avioKey) return;
        avioUsage[avioKey] = (avioUsage[avioKey] || 0) + avio.cantidad;
      });
    });

    return { telaUsage, avioUsage };
  }

  function resolveStockLevel(disponible, minimo) {
    if (disponible <= 0) return "critico";
    if (disponible <= minimo) return "critico";
    if (minimo > 0 && disponible <= minimo * 1.5) return "alerta";
    return "ok";
  }

  function getTelasWithStock() {
    const telas = getTelas();
    const { telaUsage } = calculateMaterialUsage();

    return telas.map((tela) => {
      const comprometido = telaUsage[tela.id] ?? telaUsage[tela.nombre] ?? 0;
      const disponible = tela.stockKg - comprometido;
      const nivel = resolveStockLevel(disponible, tela.minimoKg);

      return {
        ...tela,
        comprometido,
        disponible,
        nivel
      };
    });
  }

  function getAviosWithStock() {
    const avios = getAvios();
    const { avioUsage } = calculateMaterialUsage();

    return avios.map((avio) => {
      const comprometido = avioUsage[avio.id] ?? avioUsage[avio.nombre] ?? 0;
      const disponible = avio.stock - comprometido;
      const nivel = resolveStockLevel(disponible, avio.minimo);

      return {
        ...avio,
        comprometido,
        disponible,
        nivel
      };
    });
  }

  function getMaterialAlerts() {
    const telas = getTelasWithStock()
      .filter((item) => item.nivel !== "ok")
      .map((item) => ({
        id: item.id,
        tipo: "Tela",
        nombre: item.nombre,
        disponible: item.disponible,
        minimo: item.minimoKg,
        unidad: "kg",
        nivel: item.nivel
      }));

    const avios = getAviosWithStock()
      .filter((item) => item.nivel !== "ok")
      .map((item) => ({
        id: item.id,
        tipo: "Insumo",
        nombre: item.nombre,
        disponible: item.disponible,
        minimo: item.minimo,
        unidad: item.unidad || "u",
        nivel: item.nivel
      }));

    return [...telas, ...avios].sort((a, b) => a.disponible - b.disponible);
  }

  function getRecentHistory(limit) {
    return getProducciones()
      .flatMap((produccion) =>
        produccion.historial.map((item) => ({
          ...item,
          codigo: produccion.codigo,
          producto: produccion.producto
        }))
      )
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, limit || 10);
  }

  function buildProduccion(payload) {
    const createdAt = isoNow();
    const prendas = ensureArray(payload.prendas)
      .filter((prenda) => prenda.nombre && prenda.unidades > 0)
      .map((prenda, index) => normalizePrenda(prenda, index, payload.producto));

    const base = normalizeProduccion({
      ...payload,
      id: uid("op"),
      createdAt,
      updatedAt: createdAt,
      prendas,
      historial: [
        buildHistorialEntry(
          "Orden creada",
          `${payload.codigo || "Sin codigo"} - ${payload.producto || "Produccion"} activada`,
          createdAt
        )
      ]
    });

    return base;
  }

  function addProduccion(payload) {
    const producciones = getProducciones();
    const nueva = buildProduccion(payload);
    producciones.unshift(nueva);
    saveProducciones(producciones);
    return nueva;
  }

  function updatePrendaEstado(produccionId, prendaId, nuevoEstado) {
    if (!ESTADOS.includes(nuevoEstado)) return null;

    const producciones = getProducciones();
    const index = producciones.findIndex((item) => item.id === produccionId);
    if (index === -1) return null;

    const produccion = producciones[index];
    const prendas = produccion.prendas.map((prenda) => {
      if (prenda.id !== prendaId) return prenda;

      return {
        ...prenda,
        estado: nuevoEstado
      };
    });

    const changed = prendas.find((prenda) => prenda.id === prendaId);
    const original = produccion.prendas.find((prenda) => prenda.id === prendaId);

    if (!changed || !original || changed.estado === original.estado) {
      return produccion;
    }

    const updatedAt = isoNow();
    const estadoGeneral = deriveEstadoGeneral(prendas, produccion.estadoGeneral);
    const historial = [
      buildHistorialEntry(
        "Cambio de estado",
        `${changed.nombre}: ${original.estado} -> ${changed.estado}`,
        updatedAt
      ),
      ...produccion.historial
    ];

    const updated = normalizeProduccion({
      ...produccion,
      prendas,
      estadoGeneral,
      historial,
      updatedAt
    });

    if (updated.estadoGeneral === "Terminado" && produccion.estadoGeneral !== "Terminado") {
      updated.historial.unshift(
        buildHistorialEntry("Orden terminada", `${updated.codigo} finalizo toda la produccion`, updatedAt)
      );
    }

    producciones[index] = updated;
    saveProducciones(producciones);
    return updated;
  }

  function getDashboardStats() {
    const producciones = getProducciones();
    const activas = producciones.filter((item) => item.estadoGeneral !== "Terminado");
    const terminadas = producciones.filter((item) => item.estadoGeneral === "Terminado");
    const prendasEnCurso = activas.reduce(
      (acc, item) => acc + item.prendas.filter((prenda) => prenda.estado !== "Terminado").length,
      0
    );
    const totalComprometidoTela = getTelasWithStock().reduce((acc, item) => acc + item.comprometido, 0);
    const totalComprometidoAvios = getAviosWithStock().reduce((acc, item) => acc + item.comprometido, 0);

    return {
      activas: activas.length,
      terminadas: terminadas.length,
      prendasEnCurso,
      alertas: getMaterialAlerts().length,
      telaComprometida: totalComprometidoTela,
      aviosComprometidos: totalComprometidoAvios
    };
  }

  init();

  window.TelaProStore = {
    KEYS,
    ESTADOS,
    readJSON,
    writeJSON,
    toNumber,
    formatDate,
    formatDateTime,
    statusProgress,
    getTelas,
    saveTelas,
    getAvios,
    saveAvios,
    getProducciones,
    saveProducciones,
    getActiveProducciones,
    getCompletedProducciones,
    getTelasWithStock,
    getAviosWithStock,
    getMaterialAlerts,
    getRecentHistory,
    addProduccion,
    updatePrendaEstado,
    getDashboardStats,
    buildHistorialEntry
  };
})();
