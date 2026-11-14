import { Link, useParams } from "react-router-dom";
import { filmes } from "../data/filmes";

function DetalhesFilme() {
  const { id } = useParams();

  const filme = filmes.find(
    (item) => item.id === Number(id)
  );

  if (!filme) {
    return <h2>Filme não encontrado.</h2>;
  }

  return (
    <main className="detalhes">
      <img src={filme.imagem} alt={filme.titulo} />

      <div>
        <h1>{filme.titulo}</h1>
        <p>Gênero: {filme.genero}</p>
        <p>Duração: {filme.duracao}</p>
        <p>Classificação: {filme.classificacao}</p>

        <h2>Sinopse</h2>
        <p>{filme.sinopse}</p>

        <Link to="/" className="botao">
          Voltar
        </Link>
      </div>
    </main>
  );
}

export default DetalhesFilme;