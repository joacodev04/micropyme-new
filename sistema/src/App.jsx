import { BrowserRouter, Routes, Route } from "react-router-dom";
import Diseno from "./components/Diseno";
import Panel from "./pages/Panel";
import PaginaRecurso from "./pages/PaginaRecurso";
import Ordenes from "./pages/Ordenes";
import NuevaProduccion from "./pages/NuevaProduccion";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Diseno />}>
          <Route path="/" element={<Panel />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/nueva-produccion" element={<NuevaProduccion />} />
          <Route path="/telas" element={<PaginaRecurso type="telas" />} />
          <Route path="/avios" element={<PaginaRecurso type="avios" />} />
          <Route path="/productos" element={<PaginaRecurso type="productos" />} />
          <Route path="/procesos" element={<PaginaRecurso type="procesos" />} />
          <Route path="*" element={<Panel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
