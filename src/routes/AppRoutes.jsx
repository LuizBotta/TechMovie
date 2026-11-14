import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Home from "../pages/Home";
import DetalhesFilme from "../pages/DetalhesFilme";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/filme/:id" element={<DetalhesFilme />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;