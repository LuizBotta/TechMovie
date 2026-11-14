import FilmeCard from "../components/FilmeCard";
import { filmes } from "../data/filmes";

function Home() {
  return (
    <main>
      <section className="banner">
        <h1>Bem-vindo ao TechMovie</h1>
        <p>Os melhores filmes estão aqui!</p>
      </section>

      <section className="catalogo">
        <h2>Filmes em cartaz</h2>

        <div className="filmes-grid">
          {filmes.map((filme) => (
            <FilmeCard key={filme.id} filme={filme} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;