let avios = JSON.parse(localStorage.getItem("avios")) || [];

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
        <td>${a.unidad || '—'}</td>
        <td>$${a.costo}</td>
        <td>${a.proveedor || '—'}</td>
        <td>${a.notas || ''}</td>
      </tr>`;
  });
}

if(formAvio){
  formAvio.addEventListener("submit",e=>{
    e.preventDefault();
    const i=formAvio.querySelectorAll(".input");
    avios.push({nombre:i[0].value,unidad:i[1].value,costo:i[2].value,proveedor:i[3].value,notas:i[4].value});
    localStorage.setItem("avios",JSON.stringify(avios));
    renderAvios();
    formAvio.reset();
  });
  renderAvios();
}