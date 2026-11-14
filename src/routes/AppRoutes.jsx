import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Home from "../pages/Home";
import DetalhesFilme from "../pages/DetalhesFilme";
import Sessoes from "../pages/Sessoes";
import Assentos from "../pages/Assentos";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/filme/:id" element={<DetalhesFilme />} />
        <Route path="/sessoes/:id" element={<Sessoes />} />
        <Route path="/assentos/:id" element={<Assentos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;