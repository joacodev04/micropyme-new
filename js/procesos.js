let productos = JSON.parse(localStorage.getItem("productos")) || []; //Traigo los productos guardados en memoria

const tablaProcesos = document.getElementById("tablaProcesos");

function renderProductos(){

  tablaProcesos.innerHTML = "";

  productos.forEach(p => {

    tablaProcesos.innerHTML += `
      <tr>

        <td>${p.producto}</td>

        <td>
          <select class="select select--small">
            <option value="">Seleccionar proceso</option>
            <option value="Corte">Corte</option>
            <option value="Confección">Confección</option>
            <option value="Bordado">Bordado</option>
            <option value="Estampado">Estampado</option>
            <option value="Finishing">Finishing</option>
          </select>
        </td>

        <td></td>
        <td>${p.costoFinal}</td>

      </tr>
    `;

  });

}

renderProductos();