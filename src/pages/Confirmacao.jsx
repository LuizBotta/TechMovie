
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api";
const CHAVE_RESERVA = "techmovie_reserva";
const CHAVE_CARRINHO = "techmovie_carrinho";

const poltronasValidas = ["A", "B", "C", "D", "E"].flatMap(
  (fileira) =>
    [1, 2, 3, 4, 5, 6, 7, 8].map(
      (numero) => `${fileira}${numero}`
    )
);

function buscarReservaSalva() {
  try {
    const reserva = JSON.parse(
      localStorage.getItem(CHAVE_RESERVA)
    );

    if (
      !reserva ||
      !Number.isInteger(Number(reserva.sessaoId)) ||
      !Array.isArray(reserva.ingressos) ||
      reserva.ingressos.length === 0
    ) {
      return null;
    }

    const poltronas = reserva.ingressos.map(
      (ingresso) => ingresso.poltrona
    );

    const validos = reserva.ingressos.every(
      (ingresso) =>
        poltronasValidas.includes(ingresso.poltrona) &&
        ["inteira", "meia"].includes(ingresso.tipo)
    );

    if (
      !validos ||
      new Set(poltronas).size !== poltronas.length
    ) {
      return null;
    }

    return reserva;
  } catch {
    return null;
  }
}

function buscarCarrinhoSalvo() {
  try {
    const carrinho = JSON.parse(
      localStorage.getItem(CHAVE_CARRINHO) || "[]"
    );

    return Array.isArray(carrinho) ? carrinho : [];
  } catch {
    return [];
  }
}

function sessaoFutura(data, horario) {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  const hoje = `${ano}-${mes}-${dia}`;

  const horaAtual =
    `${String(agora.getHours()).padStart(2, "0")}:` +
    `${String(agora.getMinutes()).padStart(2, "0")}`;

  return (
    data > hoje ||
    (data === hoje && horario > horaAtual)
  );
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function Confirmacao() {
  const navigate = useNavigate();

  const [reserva, setReserva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function verificarReserva() {
      const salva = buscarReservaSalva();

      if (!salva) {
        setErro("Nenhuma seleção válida encontrada.");
        setCarregando(false);
        return;
      }

      try {
        const [respostaFilmes, respostaSessoes, respostaAssentos] =
          await Promise.all([
            fetch(`${API}/filmes.php`, {
              signal: controlador.signal
            }),

            fetch(
              `${API}/sessoes.php?filmeId=${encodeURIComponent(
                salva.filmeId
              )}`,
              { signal: controlador.signal }
            ),

            fetch(
              `${API}/assentos.php?sessaoId=${encodeURIComponent(
                salva.sessaoId
              )}`,
              { signal: controlador.signal }
            )
          ]);

        if (
          !respostaFilmes.ok ||
          !respostaSessoes.ok ||
          !respostaAssentos.ok
        ) {
          throw new Error(
            "Não foi possível verificar a reserva."
          );
        }

        const dadosFilmes = await respostaFilmes.json();
        const dadosSessoes = await respostaSessoes.json();
        const dadosAssentos = await respostaAssentos.json();

        if (
          !dadosFilmes.sucesso ||
          !Array.isArray(dadosFilmes.filmes) ||
          !dadosSessoes.sucesso ||
          !Array.isArray(dadosSessoes.sessoes) ||
          !dadosAssentos.sucesso ||
          !Array.isArray(dadosAssentos.ocupados)
        ) {
          throw new Error(
            "Resposta inválida do servidor."
          );
        }

        const filme = dadosFilmes.filmes.find(
          (item) =>
            Number(item.id) === Number(salva.filmeId)
        );

        const sessao = dadosSessoes.sessoes.find(
          (item) =>
            Number(item.id) === Number(salva.sessaoId) &&
            item.data === salva.data &&
            item.horario === salva.horario
        );

        if (
          !filme ||
          !sessao ||
          !sessaoFutura(salva.data, salva.horario)
        ) {
          throw new Error(
            "Esta sessão não está disponível."
          );
        }

        const ocupadas = salva.ingressos.filter(
          (ingresso) =>
            dadosAssentos.ocupados.includes(
              ingresso.poltrona
            )
        );

        if (ocupadas.length > 0) {
          throw new Error(
            "Uma ou mais poltronas foram ocupadas. Escolha novamente."
          );
        }

        const ingressos = salva.ingressos.map(
          (ingresso) => {
            const preco =
              ingresso.tipo === "meia" ? 15 : 30;

            return {
              ...ingresso,
              preco,
              precoUnitario: preco,
              subtotal: preco,
              quantidade: 1
            };
          }
        );

        const total = ingressos.reduce(
          (soma, ingresso) =>
            soma + ingresso.preco,
          0
        );

        setReserva({
          ...salva,
          filme: filme.titulo,
          ingressos,
          total
        });
      } catch (erro) {
        if (erro.name !== "AbortError") {
          setErro(erro.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    verificarReserva();

    return () => controlador.abort();
  }, []);

  async function adicionarAoCarrinho() {
    if (!reserva || adicionando) {
      return;
    }

    setAdicionando(true);
    setErro("");

    try {
      if (!sessaoFutura(reserva.data, reserva.horario)) {
        throw new Error(
          "Esta sessão não está mais disponível."
        );
      }

      const resposta = await fetch(
        `${API}/assentos.php?sessaoId=${reserva.sessaoId}`
      );

      if (!resposta.ok) {
        throw new Error(
          "Não foi possível verificar as poltronas."
        );
      }

      const dados = await resposta.json();

      if (
        !dados.sucesso ||
        !Array.isArray(dados.ocupados)
      ) {
        throw new Error(
          "Resposta inválida do servidor."
        );
      }

      const indisponiveis = reserva.ingressos.filter(
        (ingresso) =>
          dados.ocupados.includes(ingresso.poltrona)
      );

      if (indisponiveis.length > 0) {
        throw new Error(
          "Uma das poltronas foi comprada. Escolha novamente."
        );
      }

      const carrinho = buscarCarrinhoSalvo();

      const outrosItens = carrinho.filter(
        (item) =>
          item.categoria !== "ingresso" ||
          Number(item.sessaoId) !==
            Number(reserva.sessaoId)
      );

      const ingressos = reserva.ingressos.map(
        (ingresso) => ({
          ...ingresso,
          id: `ingresso-${reserva.sessaoId}-${ingresso.poltrona}`,
          categoria: "ingresso",
          nome: `Ingresso - ${reserva.filme}`,
          sessaoId: Number(reserva.sessaoId),
          filme: reserva.filme,
          data: reserva.data,
          horario: reserva.horario,
          quantidade: 1,
          emoji: "🎟️",
          descricao:
            `${reserva.data
              .split("-")
              .reverse()
              .join("/")} às ${reserva.horario}` +
            ` — Poltrona ${ingresso.poltrona}`
        })
      );

      const novoCarrinho = [
        ...outrosItens,
        ...ingressos
      ];

      localStorage.setItem(
        CHAVE_CARRINHO,
        JSON.stringify(novoCarrinho)
      );

      localStorage.removeItem(CHAVE_RESERVA);

      window.dispatchEvent(
        new Event("carrinhoAtualizado")
      );

      navigate("/carrinho");
    } catch (erro) {
      setErro(
        erro.message ||
        "Erro ao adicionar ingressos ao carrinho."
      );
    } finally {
      setAdicionando(false);
    }
  }

  const salva = buscarReservaSalva();

  const parametros = new URLSearchParams({
    data: salva?.data || "",
    horario: salva?.horario || ""
  });

  const linkAssentos = salva
    ? `/assentos/${salva.filmeId}?${parametros.toString()}`
    : "/";

  if (carregando) {
    return (
      <main className="pagina-confirmacao">
        <p>Verificando ingressos...</p>
      </main>
    );
  }

  if (!reserva) {
    return (
      <main className="pagina-confirmacao">
        <h1>Não foi possível confirmar a seleção</h1>

        <p role="alert">
          {erro ||
            "Nenhuma seleção válida encontrada."}
        </p>

        <Link
          to={linkAssentos}
          className="botao"
        >
          {salva
            ? "Voltar às poltronas"
            : "Ver filmes"}
        </Link>
      </main>
    );
  }

  return (
    <main className="pagina-confirmacao">
      <h1>Resumo dos ingressos</h1>

      <p>
        Confira os dados antes de adicionar
        ao carrinho.
      </p>

      {erro && (
        <p role="alert" className="mensagem-erro">
          {erro}
        </p>
      )}

      <article className="confirmacao-card">
        <h2>{reserva.filme}</h2>

        <p>
          Data:{" "}
          {reserva.data
            .split("-")
            .reverse()
            .join("/")}
        </p>

        <p>Horário: {reserva.horario}</p>

        <h3>Ingressos selecionados</h3>

        <section className="confirmacao-ingressos">
          {reserva.ingressos.map(
            (ingresso) => (
              <article
                className="confirmacao-ingresso"
                key={ingresso.poltrona}
              >
                <p>
                  Poltrona {ingresso.poltrona}
                </p>

                <p>
                  {ingresso.tipo === "meia"
                    ? "Meia"
                    : "Inteira"}
                </p>

                <p>
                  {formatarMoeda(ingresso.preco)}
                </p>
              </article>
            )
          )}
        </section>

        <h2>
          Total: {formatarMoeda(reserva.total)}
        </h2>
      </article>

      <p className="aviso-confirmacao">
        A seleção ainda não representa uma
        compra concluída. As poltronas só
        serão reservadas após finalizar o
        pedido no carrinho.
      </p>

      <nav className="acoes-confirmacao">
        <button
          type="button"
          className="botao"
          onClick={adicionarAoCarrinho}
          disabled={adicionando}
        >
          {adicionando
            ? "Verificando..."
            : "Adicionar ingressos ao carrinho"}
        </button>

        <Link
          to={linkAssentos}
          className="botao"
        >
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
