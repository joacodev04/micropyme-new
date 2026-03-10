let telas = JSON.parse(localStorage.getItem("telas")) || [];

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
        <td>$${t.precio || 0}</td>
        <td>${t.kg || 0}</td>
        <td>${t.proveedor || '—'}</td>
        <td>${t.notas}</td>
      </tr>`;
  });
}

if(formTela){
  formTela.addEventListener("submit",e=>{
    e.preventDefault();
    const i=formTela.querySelectorAll(".input");
    telas.push({nombre:i[0].value,precio:Number(i[1].value),kg:Number(i[2].value),proveedor:i[3].value,notas:i[4].value});
    localStorage.setItem("telas",JSON.stringify(telas));
    renderTelas();
    sumarTabla();
    formTela.reset();
  });
  renderTelas();
  sumarTabla();  
}

//Calcular total (precio por kg * kg por pieza)
function sumarTabla(){

  let total = 0;

  telas.forEach(t => {
    total += (Number(t.precio) || 0);
  });

  document.getElementById("totalTela").textContent = "Calcular total: $" + total.toFixed(2);

}

sumarTabla();
