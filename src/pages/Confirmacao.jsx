import { Link } from "react-router-dom";

function Confirmacao() {
  const dadosSalvos = localStorage.getItem("techmovie_reserva");
  const reserva = dadosSalvos ? JSON.parse(dadosSalvos) : null;

  if (!reserva) {
    return (
      <main className="pagina-confirmacao">
        <h1>Nenhuma seleção encontrada</h1>
        <p>Escolha um filme e selecione suas poltronas.</p>

        <Link to="/" className="botao">
          Ver filmes
        </Link>
      </main>
    );
  }

  return (
    <main className="pagina-confirmacao">
      <h1>Resumo dos ingressos</h1>

      <p>Confira os dados da sua seleção.</p>

      <article className="confirmacao-card">
        <h2>{reserva.filme}</h2>

        <p>
          Data: {reserva.data.split("-").reverse().join("/")}
        </p>

        <p>Horário: {reserva.horario}</p>

        <h3>Ingressos selecionados</h3>

        <section className="confirmacao-ingressos">
          {reserva.ingressos.map((ingresso) => (
            <article
              className="confirmacao-ingresso"
              key={ingresso.poltrona}
            >
              <p>Poltrona {ingresso.poltrona}</p>

              <p>
                {ingresso.tipo === "meia" ? "Meia" : "Inteira"}
              </p>

              <p>
                R$ {ingresso.preco.toFixed(2).replace(".", ",")}
              </p>
            </article>
          ))}
        </section>

        <h2>
          Total: R$ {reserva.total.toFixed(2).replace(".", ",")}
        </h2>
      </article>

      <p className="aviso-confirmacao">
        Esta seleção ainda não representa uma compra concluída.
      </p>

      <Link to="/" className="botao">
        Voltar ao início
      </Link>
    </main>
  );
}

export default Confirmacao;