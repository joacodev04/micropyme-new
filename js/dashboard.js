window.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tabla-dash");
  if (!tbody) return;

  const lista = JSON.parse(localStorage.getItem("producciones") || "[]");

  tbody.innerHTML = lista.map(p => `
    <tr>
      <td>${p.codigo || "-"}</td>
      <td>${p.producto || "-"}</td>
      <td>${p.telaNombre || "-"}</td>
      <td>${(p.procesos || []).join(", ") || "-"}</td>
      <td>${(p.avios || []).map(a => `${a.avio} x${a.cantidad}`).join(", ") || "-"}</td>
    </tr>
  `).join("");
});

//Producciones activas

window.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("producciones-activas");
  if (!el) return;

  const lista = JSON.parse(localStorage.getItem("producciones") || "[]");
  el.textContent = lista.length;
});
