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

//Activar producción

const KEY_ACTUAL = "produccionActual";
const KEY_LISTA = "producciones";

let producciones = JSON.parse(localStorage.getItem(KEY_ACTUAL)) || {};


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
  const select = document.querySelector("#select-tela");

  producciones.telaNombre = select.options[select.selectedIndex]?.text || "";
  producciones.consumoTela = document.getElementById("consumo-tela").value;
  producciones.piezaCerrada = document.getElementById("kg-por-pieza").value;
  producciones.precio = document.getElementById("precio/kg").value;

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
  
 localStorage.setItem(KEY_ACTUAL, JSON.stringify(producciones));
}


//Evitar borrar lo escrito en los inputs
const form = document.getElementById("form-produccion");
form.addEventListener("submit", (e) => {
  e.preventDefault();
});

document.querySelectorAll("input, select, textarea").forEach((el) => {
  el.addEventListener("input", () => {
    const data = JSON.parse(localStorage.getItem("form-produccion")) || {};
    data[el.id] = el.value;
    localStorage.setItem("form-produccion", JSON.stringify(data));
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("form-produccion")) || {};
  Object.keys(data).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = data[id];
  });
});

//Resumen
function renderResumen() {
  const actual = JSON.parse(localStorage.getItem(KEY_ACTUAL)) || {};
  const tbody = document.getElementById("tabla-resumen");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr><td>Codigo</td><td>${producciones.codigo || "-"}</td></tr>
    <tr><td>Producto</td><td>${producciones.producto || "-"}</td></tr>
    <tr><td>Tela</td><td>${producciones.telaNombre || "-"}</td></tr>
    <tr><td>Procesos</td><td>${(producciones.procesos || []).join(", ") || "-"}</td></tr>
    <tr><td>Avios</td><td>${(actual.avios || []).map(a => `${a.avio} x${a.cantidad}`).join(", ") || "-"}</td></tr>
  `;
}

const btnActivar = document.getElementById("activar-produccion");

if (btnActivar) {
  btnActivar.addEventListener("click", (e) => {
    e.preventDefault();

    if (window.Swal) {
      Swal.fire({
        title: "Produccion activada!",
        icon: "success",
      });
    }
  });
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

  if (index === 5) renderResumen();
}

document.querySelectorAll(".btnSiguiente").forEach(btn => {

  btn.addEventListener("click", () => {

    guardarPaso(currentStep);

    if(currentStep < steps.length - 1){
      showStep(currentStep + 1);
    }

  });

});

document.getElementById("activar-produccion").addEventListener("click", (e) => {
  e.preventDefault();

  const lista = JSON.parse(localStorage.getItem(KEY_LISTA)) || [];
  const actual = JSON.parse(localStorage.getItem(KEY_ACTUAL)) || {};

  lista.push({ ...actual, id: Date.now() });
  localStorage.setItem(KEY_LISTA, JSON.stringify(lista));

  localStorage.removeItem(KEY_ACTUAL);
  producciones = {};
});
