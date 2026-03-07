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

        <td><input class="input" type="text" placeholder="Modalidad"></td>
        <td><input class="input" type="number" placeholder="Costo"></td>
      </tr>
    `;

  });

}

document.addEventListener("blur", function(e){

  if(e.target.classList.contains("input")){

    const input = e.target;
    const valor = input.value;

    if(valor !== ""){

      const td = input.parentElement;

      td.innerHTML = `<span class="editable">${valor}</span>`;

    }

  }

}, true);


document.addEventListener("click", function(e){

  if(e.target.classList.contains("editable")){

    const span = e.target;
    const valor = span.textContent;

    const td = span.parentElement;

    td.innerHTML = `<input class="input" value="${valor}">`;

  }

});

renderProductos();