// ===== TELAS =====
let telas = JSON.parse(localStorage.getItem("telas")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let avios = JSON.parse(localStorage.getItem("avios")) || [];
let procesos = JSON.parse(localStorage.getItem("procesos")) || [];

//TELAS 
const formTela = document.getElementById("formTela");
const tablaTelas = document.getElementById("tablaTelas");

function renderTelas(){
  if(!tablaTelas) return;
  tablaTelas.innerHTML="";
  telas.forEach(t=>{
    tablaTelas.innerHTML+=`
      <tr>
        <td><b>${t.nombre}</b></td>
        <td>$${t.precio}</td>
        <td>${t.kg}</td>
        <td>${t.notas}</td>
      </tr>`;
  });
}

if(formTela){
  formTela.addEventListener("submit",e=>{
    e.preventDefault();
    const i=formTela.querySelectorAll(".input");
    telas.push({nombre:i[0].value,precio:i[1].value,kg:i[2].value,notas:i[3].value});
    localStorage.setItem("telas",JSON.stringify(telas));
    renderTelas();
    formTela.reset();
  });
  renderTelas();
}

//PRODUCTOS 
const formProducto=document.getElementById("formProducto");
const tablaProductos=document.getElementById("tablaProductos");

function renderProductos(){
  if(!tablaProductos) return;
  tablaProductos.innerHTML="";
  productos.forEach(p=>{
    tablaProductos.innerHTML+=`
      <tr>
        <td><b>${p.nombre}</b></td>
        <td>${p.tela}</td>
        <td>${p.consumo}</td>
        <td>$${p.precio}</td>
      </tr>`;
  });
}

if(formProducto){
  formProducto.addEventListener("submit",e=>{
    e.preventDefault();
    const i=formProducto.querySelectorAll(".input");
    productos.push({nombre:i[0].value,tela:i[1].value,consumo:i[2].value,precio:i[3].value});
    localStorage.setItem("productos",JSON.stringify(productos));
    renderProductos();
    formProducto.reset();
  });
  renderProductos();
}

//AVIOS
const formAvio=document.getElementById("formAvio");
const tablaAvios=document.getElementById("tablaAvios");

function renderAvios(){
  if(!tablaAvios) return;
  tablaAvios.innerHTML="";
  avios.forEach(a=>{
    tablaAvios.innerHTML+=`
      <tr>
        <td><b>${a.nombre}</b></td>
        <td>${a.unidad}</td>
        <td>$${a.costo}</td>
      </tr>`;
  });
}

if(formAvio){
  formAvio.addEventListener("submit",e=>{
    e.preventDefault();
    const i=formAvio.querySelectorAll(".input");
    avios.push({nombre:i[0].value,unidad:i[1].value,costo:i[2].value});
    localStorage.setItem("avios",JSON.stringify(avios));
    renderAvios();
    formAvio.reset();
  });
  renderAvios();
}

//PROCESOS
const formProceso=document.getElementById("formProceso");
const tablaProcesos=document.getElementById("tablaProcesos");

function renderProcesos(){
  if(!tablaProcesos) return;
  tablaProcesos.innerHTML="";
  procesos.forEach(p=>{
    tablaProcesos.innerHTML+=`
      <tr>
        <td><b>${p.nombre}</b></td>
        <td>${p.modalidad}</td>
        <td>$${p.costo}</td>
      </tr>`;
  });
}

if(formProceso){
  formProceso.addEventListener("submit",e=>{
    e.preventDefault();
    const i=formProceso.querySelectorAll(".input");
    procesos.push({nombre:i[0].value,modalidad:i[1].value,costo:i[2].value});
    localStorage.setItem("procesos",JSON.stringify(procesos));
    renderProcesos();
    formProceso.reset();
  });
  renderProcesos();
}


const steps = document.querySelectorAll(".step");
const panels = document.querySelectorAll(".step-panel");
const btnNext = document.querySelector(".btn.primary");
const btnBack = document.querySelector(".btn");

let currentStep = 0;

//Helpers

function showStep(index){
  steps.forEach((s,i)=>{
    s.classList.toggle("active", i === index);
  });

  panels.forEach((p,i)=>{
    p.classList.toggle("active", i === index);
  });

  currentStep = index;
}

//Click en pasos (Nueva Produccion)

steps.forEach((step, index)=>{
  step.addEventListener("click", ()=>{
    showStep(index);
  });
});


showStep(0);



