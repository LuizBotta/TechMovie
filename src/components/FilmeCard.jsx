import { Link } from "react-router-dom";

function FilmeCard({ filme }) {
  return (
    <article className="filme-card">
      <img src={filme.imagem} alt={filme.titulo} />

      <div className="filme-info">
        <h3>{filme.titulo}</h3>
        <p>{filme.genero}</p>
        <p>{filme.duracao}</p>

        <Link to={`/filme/${filme.id}`} className="botao">
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}

export default FilmeCard;