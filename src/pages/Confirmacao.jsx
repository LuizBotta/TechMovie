
import { Link } from "react-router-dom";
import { filmes } from "../data/filmes";
import { sessoes } from "../data/sessoes";

function buscarReserva() {
  try {
    const dados = localStorage.getItem("techmovie_reserva");

    if (!dados) {
      return null;
    }

    const reserva = JSON.parse(dados);

    if (
      !reserva ||
      !Array.isArray(reserva.ingressos) ||
      reserva.ingressos.length === 0
    ) {
      return null;
    }

    const filme = filmes.find(
      (item) => item.id === Number(reserva.filmeId)
    );

    const sessao = sessoes.find(
      (item) =>
        item.filmeId === Number(reserva.filmeId) &&
        item.data === reserva.data &&
        item.horarios.includes(reserva.horario)
    );

    if (!filme || !sessao) {
      return null;
    }

    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    const dataHoje = `${ano}-${mes}-${dia}`;

    const horarioAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(
      agora.getMinutes()
    ).padStart(2, "0")}`;

    const disponivel =
      reserva.data > dataHoje ||
      (reserva.data === dataHoje &&
        reserva.horario > horarioAtual);

    if (!disponivel) {
      return null;
    }

    const poltronasValidas = ["A", "B", "C", "D", "E"].flatMap(
      (fileira) =>
        [1, 2, 3, 4, 5, 6, 7, 8].map(
          (numero) => `${fileira}${numero}`
        )
    );

    const ocupados = ["A3", "B5", "C2", "D7", "E4"];

    const ingressosValidos = reserva.ingressos.every(
      (ingresso) =>
        poltronasValidas.includes(ingresso.poltrona) &&
        !ocupados.includes(ingresso.poltrona) &&
        ["inteira", "meia"].includes(ingresso.tipo)
    );

    const poltronas = reserva.ingressos.map(
      (ingresso) => ingresso.poltrona
    );

    if (
      !ingressosValidos ||
      new Set(poltronas).size !== poltronas.length
    ) {
      return null;
    }

    const ingressos = reserva.ingressos.map((ingresso) => {
      const preco = ingresso.tipo === "meia" ? 15 : 30;

      return {
        ...ingresso,
        preco: preco
      };
    });

    const total = ingressos.reduce(
      (soma, ingresso) => soma + ingresso.preco,
      0
    );

    return {
      ...reserva,
      filme: filme.titulo,
      ingressos: ingressos,
      total: total
    };
  } catch {
    return null;
  }
}

function Confirmacao() {
  const reserva = buscarReserva();

  if (!reserva) {
    return (
      <main className="pagina-confirmacao">
        <h1>Nenhuma seleção válida encontrada</h1>

        <p>
          Escolha um filme e selecione uma sessão disponível.
        </p>

        <Link to="/" className="botao">
          Ver filmes
        </Link>
      </main>
    );
  }

  const parametros = new URLSearchParams({
    data: reserva.data,
    horario: reserva.horario
  });

  const linkAssentos = `/assentos/${reserva.filmeId}?${parametros.toString()}`;

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

      <nav className="acoes-confirmacao">
        <Link to={linkAssentos} className="botao">
          Alterar poltronas
        </Link>

        <Link to="/" className="botao">
          Voltar ao início
        </Link>
      </nav>
    </main>
  );
}

export default Confirmacao;
