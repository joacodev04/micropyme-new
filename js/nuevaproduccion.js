//Nueva produccion
let telas = JSON.parse(localStorage.getItem("telas")) || [];
let avios = JSON.parse(localStorage.getItem("avios")) || [];

let colores = [];
let color = document.getElementById("input-color");
let colorTexto = document.getElementById("color-texto");
let btnAgregarColor = document.getElementById("btn-agregar-color");


//Colores
btnAgregarColor.addEventListener("click", () => {

  if(color.value.trim() === "") return;

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${color.value}</td>
    <td><input type="number" class="input" value="0"></td>
    <td><input type="number" class="input" value="0"></td>
  `;

  colorTexto.appendChild(tr);

  color.value = "";
});

//Telas
const selectTela = document.getElementById("select-tela");

function cargarTelas() {
  selectTela.innerHTML = '<option value="">Seleccionar tela</option>';
    telas.forEach((tela, index) => {
    selectTela.innerHTML += `
      <option value="${index}">
        ${tela.nombre}
      </option>
    `;
  });

}
cargarTelas();

//Avios

const tablaAvios = document.getElementById("tabla-avios");

if(tablaAvios){

  avios.forEach(a => {

    tablaAvios.innerHTML += `
      <tr>
        <td>${a.nombre}</td>
        <td>${a.unidad}</td>
        <td>${a.costo}</td>
        <td><input type="number" class="input" value="0"></td>
      </tr>
    `;

  });

}

// //Activar producción
// const botonguardar = document.getElementById("activar-produccion");

// botonguardar.addEventListener("click", () => {
//   const nombreProducto = document.querySelector(".input[placeholder='Nombre del Producto']").value;
//   const 
// });

// function guardarProductos() {
//   let producciones = JSON.parse(localStorage.getItem("guardarProducto")) || [];

//   const producto = document.getElementById
  
// }

let producciones = {};

function guardarPaso1(){
  producciones.producto = document.querySelector("#nombre-producto").value;
  producciones.merma = document.querySelector("#merma").value;
  producciones.codigo = document.querySelector("#codigo").value;
}

function guardarPaso2(){

  producciones.colores = [];

  let filas = document.querySelectorAll("#color-texto tr");

  filas.forEach(fila => {

    let color = fila.children[0].innerText;
    let unidades = fila.children[1].querySelector("input").value;
    let modelos = fila.children[2].querySelector("input").value;

    producciones.colores.push({
      color,
      unidades,
      modelos
    });

  });

}

function guardarPaso3(){
  producciones.tela = document.querySelector("#select-tela").value;
}

function guardarPaso4(){
  producciones.procesos = [];

  if(document.querySelector("#corte").checked){
    producciones.procesos.push("Corte");
  }

  if(document.querySelector("#estampado").checked){
    producciones.procesos.push("Estampado");
  }

  if(document.querySelector("#confeccion").checked){
    producciones.procesos.push("Confeccion");
  }

  if(document.querySelector("#finishing").checked){
    producciones.procesos.push("Finishing");
  }
}

function guardarPaso5(){

  producciones.avios = [];

  let filas = document.querySelectorAll("#tabla-avios tr");

  filas.forEach(fila => {

    let avio = fila.children[0].innerText;
    let unidad = fila.children[1].innerText;
    let costo = fila.children[2].innerText;
    let cantidad = fila.children[3].querySelector("input").value;

    producciones.avios.push({
      avio,
      unidad,
      costo,
      cantidad
    });

  });

}

function guardarPaso(step){

  if(step === 0) guardarPaso1();
  if(step === 1) guardarPaso2();
  if(step === 2) guardarPaso3();
  if(step === 3) guardarPaso4();
  if(step === 4) guardarPaso5();
  console.log(producciones);
}

//Click en pasos (Nueva Produccion)

let steps = document.querySelectorAll(".step");
let panels = document.querySelectorAll(".step-panel");
let currentStep = 0;

steps.forEach((step, index)=>{
  step.addEventListener("click", ()=>{
    showStep(index);
  });
});

showStep(0);

function showStep(index){

  steps.forEach((s,i)=>{
    s.classList.toggle("active", i === index);
  });

  panels.forEach((p,i)=>{
    p.classList.toggle("active", i === index);
  });

  currentStep = index;
}

document.querySelectorAll(".btnSiguiente").forEach(btn => {

  btn.addEventListener("click", () => {

    guardarPaso(currentStep);

    if(currentStep < steps.length - 1){
      showStep(currentStep + 1);
    }

  });

});
