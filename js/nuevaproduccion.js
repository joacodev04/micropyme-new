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

//Helpers para que funcionen los pasos de nueva produccion

function showStep(index){
  steps.forEach((s,i)=>{
    s.classList.toggle("active", i === index);
  });

  panels.forEach((p,i)=>{
    p.classList.toggle("active", i === index);
  });

  currentStep = index;
};
