
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "../components/Header";
import Home from "../pages/Home";
import DetalhesFilme from "../pages/DetalhesFilme";
import Bomboniere from "../pages/Bomboniere";
import Carrinho from "../pages/Carrinho";
import HistoricoPedidos from "../pages/HistoricoPedidos";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/filme/:id" element={<DetalhesFilme />} />
        <Route path="/bomboniere" element={<Bomboniere />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/historico" element={<HistoricoPedidos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
