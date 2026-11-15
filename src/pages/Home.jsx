
import { useEffect, useState } from "react";
import FilmeCard from "../components/FilmeCard";

function Home() {
  const [filmes, setFilmes] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [genero, setGenero] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarFilmes() {
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

        setFilmes(dados.filmes);
      } catch (erro) {
        if (erro.name !== "AbortError") {
          setErro("Não foi possível carregar os filmes.");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarFilmes();

    return () => controlador.abort();
  }, []);

  function normalizarTexto(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  const generos = [
    ...new Set(filmes.map((filme) => filme.genero))
  ];

  const filmesFiltrados = filmes.filter((filme) => {
    const correspondeNome = normalizarTexto(filme.titulo)
      .includes(normalizarTexto(pesquisa));

    const correspondeGenero =
      genero === "todos" || filme.genero === genero;

    return correspondeNome && correspondeGenero;
  });

  return (
    <main>
      <section className="banner">
      </section>

      <section className="catalogo">
        <h2>Filmes em cartaz</h2>

        <section className="filtros-filmes">
          <input
            type="text"
            placeholder="Pesquisar filme..."
            aria-label="Pesquisar filme pelo nome"
            value={pesquisa}
            onChange={(evento) => setPesquisa(evento.target.value)}
          />

          <select
            value={genero}
            onChange={(evento) => setGenero(evento.target.value)}
            aria-label="Filtrar filmes por gênero"
          >
            <option value="todos">Todos os gêneros</option>

            {generos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        {carregando ? (
          <p>Carregando filmes...</p>
        ) : erro ? (
          <p role="alert">{erro}</p>
        ) : filmesFiltrados.length > 0 ? (
          <section className="filmes-grid">
            {filmesFiltrados.map((filme) => (
              <FilmeCard key={filme.id} filme={filme} />
            ))}
          </section>
        ) : (
          <p className="nenhum-filme">
            Nenhum filme encontrado.
          </p>
        )}
      </section>
    </main>
  );
}

export default Home;
