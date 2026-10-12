export default function TarjetaEstadistica({ label, value, detail }) {
  return <div className="card shadow-sm h-100"><div className="card-body"><small className="text-secondary">{label}</small><div className="fs-3 fw-bold mt-2">{value}</div>{detail && <small className="text-secondary">{detail}</small>}</div></div>;
}
