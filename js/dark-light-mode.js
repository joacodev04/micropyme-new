document.addEventListener("DOMContentLoaded", () => {

  const botonTema = document.querySelector(".dark-light");

  if (!botonTema) return;

  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
  }

  botonTema.addEventListener("click", () => {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
      localStorage.setItem("theme", "light");
    } else {
      localStorage.setItem("theme", "dark");
    }
  });

});