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

      <section>
        <h1>{filme.titulo}</h1>
        <p>Gênero: {filme.genero}</p>
        <p>Duração: {filme.duracao}</p>
        <p>Classificação: {filme.classificacao}</p>

        <h2>Sinopse</h2>
        <p>{filme.sinopse}</p>

        <Link to={`/sessoes/${filme.id}`} className="botao">
            Comprar ingresso
        </Link>

        <Link to="/" className="botao">
          Voltar
        </Link>
      </section>
    </main>
  );
}

export default DetalhesFilme;