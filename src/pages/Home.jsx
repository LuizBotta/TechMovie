
import { useState } from "react";
import FilmeCard from "../components/FilmeCard";
import { filmes } from "../data/filmes";

function Home() {
  const [pesquisa, setPesquisa] = useState("");
  const [genero, setGenero] = useState("todos");

  function normalizarTexto(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  const generos = [...new Set(filmes.map((filme) => filme.genero))];

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
        <h1>Bem-vindo ao TechMovie</h1>
        <p>Os melhores filmes estão aqui!</p>
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

        {filmesFiltrados.length > 0 ? (
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
