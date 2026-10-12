export default function InsigniaEstado({ value }) {
  const tone = ["ok", "Terminado", "Activo"].includes(value)
    ? "success"
    : ["critico", "Crítico"].includes(value) ? "danger" : "warning";
  return <span className={`badge text-bg-${tone}`}>{value}</span>;
}
