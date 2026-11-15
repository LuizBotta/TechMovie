
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function DetalhesFilme() {
  const { id } = useParams();

  const [filme, setFilme] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarFilme() {
      setCarregando(true);
      setErro("");
      setFilme(null);

      try {
        const resposta = await fetch(
          "http://localhost:8000/api/filmes.php",
          { signal: controlador.signal }
        );

        if (!resposta.ok) {
          throw new Error("Erro ao consultar os filmes.");
        }

        const dados = await resposta.json();

        if (!dados.sucesso || !Array.isArray(dados.filmes)) {
          throw new Error("Resposta inválida do servidor.");
        }

        const encontrado = dados.filmes.find(
          (item) => Number(item.id) === Number(id)
        );

        setFilme(encontrado || null);
      } catch (erro) {
        if (erro.name !== "AbortError") {
          setErro("Não foi possível carregar o filme.");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarFilme();

    return () => controlador.abort();
  }, [id]);

  if (carregando) {
    return (
      <main className="detalhes">
        <p>Carregando filme...</p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="detalhes">
        <p role="alert">{erro}</p>
        <Link to="/" className="botao">Voltar</Link>
      </main>
    );
  }

  if (!filme) {
    return (
      <main className="detalhes">
        <h2>Filme não encontrado.</h2>
        <Link to="/" className="botao">Voltar</Link>
      </main>
    );
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
