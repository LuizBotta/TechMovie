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
      </nav>
    </header>
  );
}

export default Header;