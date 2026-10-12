// Todo lo que se carga desde la app queda guardado en el navegador.
const KEYS = { telas: "telas", avios: "avios", productos: "productos", procesos: "procesos", producciones: "producciones" };

const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const date = (value) => value ? new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(new Date(value)) : "-";

export const statuses = ["Diseño", "Corte", "Costura", "Terminado"];
export function getCollection(key) { return read(KEYS[key] || key); }
export function saveCollection(key, items) { write(KEYS[key] || key, items); }
export function formatDate(value) { return date(value); }
export function formatNumber(value) { return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(number(value)); }

export function getTelasWithStock() {
  const production = getCollection("producciones");
  return getCollection("telas").map((tela) => {
    const committed = production.filter((p) => p.estado !== "Terminado" && (p.telaId === tela.id || p.tela === tela.nombre))
      .reduce((sum, p) => sum + number(p.consumo) * number(p.unidades), 0);
    const available = number(tela.stock) - committed;
    return { ...tela, committed, available, level: available <= 0 || available <= number(tela.minimo) ? "critico" : available <= number(tela.minimo) * 1.5 ? "alerta" : "ok" };
  });
}

export function getAviosWithStock() {
  const production = getCollection("producciones");
  return getCollection("avios").map((avio) => {
    const committed = production.filter((p) => p.estado !== "Terminado").flatMap((p) => p.avios || [])
      .filter((item) => item.avioId === avio.id || item.nombre === avio.nombre).reduce((sum, item) => sum + number(item.cantidad), 0);
    const available = number(avio.stock) - committed;
    return { ...avio, committed, available, level: available <= 0 || available <= number(avio.minimo) ? "critico" : available <= number(avio.minimo) * 1.5 ? "alerta" : "ok" };
  });
}

export function getStats() {
  const productions = getCollection("producciones");
  return {
    active: productions.filter((p) => p.estado !== "Terminado").length,
    units: productions.filter((p) => p.estado !== "Terminado").reduce((sum, p) => sum + number(p.unidades), 0),
    completed: productions.filter((p) => p.estado === "Terminado").length,
    alerts: [...getTelasWithStock(), ...getAviosWithStock()].filter((item) => item.level !== "ok").length
  };
}

export function saveItem(collection, item, itemId) {
  const items = getCollection(collection);
  const next = itemId ? items.map((current) => current.id === itemId ? { ...current, ...item } : current) : [{ ...item, id: id(collection.slice(0, -1)) }, ...items];
  saveCollection(collection, next);
}
export function removeItem(collection, itemId) { saveCollection(collection, getCollection(collection).filter((item) => item.id !== itemId)); }
export { number };
