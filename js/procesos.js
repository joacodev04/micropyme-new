let productos = JSON.parse(localStorage.getItem("productos")) || [];

const tablaProcesos = document.getElementById("tablaProcesos");

function renderProductos() {
  if (!tablaProcesos) return;

  tablaProcesos.innerHTML = "";

  productos.forEach((producto) => {
    tablaProcesos.innerHTML += `
      <tr>
        <td>${producto.producto}</td>
        <td>
          <select class="select select--small">
            <option value="">Seleccionar proceso</option>
            <option value="Corte">Corte</option>
            <option value="Costura">Costura</option>
            <option value="Bordado">Bordado</option>
            <option value="Estampado">Estampado</option>
            <option value="Finishing">Finishing</option>
          </select>
        </td>
        <td><input class="input" type="text" placeholder="Modalidad"></td>
        <td><input class="input" type="number" placeholder="Costo"></td>
      </tr>
    `;
  });
}

document.addEventListener(
  "blur",
  (event) => {
    if (!event.target.classList.contains("input")) return;

    const input = event.target;
    const value = input.value;

    if (!value) return;

    input.parentElement.innerHTML = `<span class="editable">${value}</span>`;
  },
  true
);

document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("editable")) return;

  const span = event.target;
  const value = span.textContent;

  span.parentElement.innerHTML = `<input class="input" value="${value}">`;
});

renderProductos();
