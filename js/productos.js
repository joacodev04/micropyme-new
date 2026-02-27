let productos = JSON.parse(localStorage.getItem("productos")) || [];

const formulario = document.getElementById("formProductos");   
const tabla = document.getElementById("tablaProductos");
const boton = document.getElementById("btnProducto");

boton.addEventListener("click", e=>{
    e.preventDefault();
  const producto = document.getElementById("producto").value;
  const tela = document.getElementById("tela").value;
  const consumo = document.getElementById("consumo").value;
  const margen = document.getElementById("margen").value;
  const comisiones = document.getElementById("comisiones").value;
  const precioVenta = document.getElementById("precioVenta").value;
  const costoFinal = document.getElementById("costoFinal").value;

  //Creo los objetos
  const nuevoProducto = {
    producto,
    tela,
    consumo,
    margen,
    comisiones,
    precioVenta,
    costoFinal,
    fecha: new Date().toLocaleDateString("es-AR")
  };
  productos.push(nuevoProducto); //Lo guarda en memoria
  localStorage.setItem("productos", JSON.stringify(productos)); //Lo guarda permanente
  renderProductos(); //Lo muestra en pantalla
});

function renderProductos() {
  tabla.innerHTML = "";

  productos.forEach(p => {
    tabla.innerHTML += `
      <tr>
        <td><b>${p.producto}</b></td>
        <td>$${p.tela}</td>
        <td>${p.consumo}</td>
        <td>${p.margen}</td>
        <td>${p.comisiones}</td>
        <td>${p.precioVenta}</td>
        <td>${p.costoFinal}</td>
        <td>${p.fecha}</td>
      </tr>
    `;
  });
}

renderProductos();