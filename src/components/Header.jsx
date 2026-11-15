
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        Tech<span>Movie</span>
      </Link>

      <nav className="menu">
        <Link to="/">Início</Link>
        <Link to="/">Filmes</Link>
        <Link to="/bomboniere">Bomboniere</Link>
        <Link to="/carrinho">Carrinho</Link>
        <Link to="/historico">Meus pedidos</Link>
      </nav>
    </header>
  );
}

export default Header;
