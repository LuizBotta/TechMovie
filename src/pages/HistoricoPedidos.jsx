
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/historico.css";

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(data) {
  const convertida = new Date(data.replace(" ", "T"));

  if (Number.isNaN(convertida.getTime())) {
    return data;
  }

  return convertida.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function HistoricoPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  const location = useLocation();
  const mensagem = location.state?.mensagem;

  useEffect(() => {
    const controlador = new AbortController();

    async function buscarHistorico() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch(
          "http://localhost:8000/api/pedidos.php",
          { signal: controlador.signal }
        );

        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {
          throw new Error(
            dados.mensagem ||
            "Não foi possível carregar o histórico."
          );
        }

        setPedidos(
          Array.isArray(dados.pedidos) ? dados.pedidos : []
        );
      } catch (erro) {
        if (erro.name !== "AbortError") {
          setErro(
            erro.message || "Erro ao carregar os pedidos."
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    buscarHistorico();

    return () => controlador.abort();
  }, [tentativa]);

  return (
    <main className="pagina-historico">
      <header className="historico-topo">
        <h1>Meus pedidos</h1>
        <p>Histórico de ingressos e produtos comprados.</p>
      </header>

      {mensagem && (
        <p className="mensagem-sucesso" role="status">
          {mensagem}
        </p>
      )}

      {carregando && (
        <p role="status">Carregando histórico...</p>
      )}

      {erro && (
        <section role="alert">
          <p>{erro}</p>

          <button
            type="button"
            onClick={() => setTentativa((valor) => valor + 1)}
          >
            Tentar novamente
          </button>
        </section>
      )}

      {!carregando && !erro && pedidos.length === 0 && (
        <section className="historico-vazio">
          <span>📋</span>
          <h2>Você ainda não tem pedidos</h2>
          <p>Suas compras aparecerão aqui.</p>

          <Link to="/" className="botao-voltar">
            Ver filmes
          </Link>
        </section>
      )}

      {!carregando && !erro && pedidos.length > 0 && (
        <section className="lista-pedidos">
          {pedidos.map((pedido) => (
            <article className="pedido-card" key={pedido.id}>
              <header className="pedido-cabecalho">
                <section>
                  <h2>Pedido {pedido.id}</h2>
                  <p>Realizado em {formatarData(pedido.data)}</p>
                </section>

                <span className="pedido-status">
                  {pedido.status}
                </span>
              </header>

              {pedido.ingressos?.length > 0 && (
                <section className="pedido-produtos">
                  <h3>🎟️ Ingressos</h3>

                  {pedido.ingressos.map((ingresso, indice) => (
                    <section
                      className="pedido-produto"
                      key={`${pedido.id}-ingresso-${indice}`}
                    >
                      <span className="pedido-emoji">🎟️</span>

                      <section className="pedido-produto-info">
                        <strong>{ingresso.filme}</strong>

                        <p>
                          {ingresso.data.split("-").reverse().join("/")}
                          {" às "}
                          {ingresso.horario}
                        </p>

                        <p>
                          Poltrona {ingresso.poltrona} —{" "}
                          {ingresso.tipo === "meia"
                            ? "Meia"
                            : "Inteira"}
                        </p>
                      </section>

                      <strong>
                        {formatarMoeda(ingresso.preco)}
                      </strong>
                    </section>
                  ))}
                </section>
              )}

              {pedido.produtos?.length > 0 && (
                <section className="pedido-produtos">
                  <h3>🍿 Produtos da bomboniere</h3>

                  {pedido.produtos.map((produto, indice) => (
                    <section
                      className="pedido-produto"
                      key={`${pedido.id}-produto-${indice}`}
                    >
                      <span className="pedido-emoji">
                        {produto.emoji}
                      </span>

                      <section className="pedido-produto-info">
                        <strong>{produto.nome}</strong>
                        <p>
                          {produto.quantidade} x{" "}
                          {formatarMoeda(produto.preco)}
                        </p>
                      </section>

                      <strong>
                        {formatarMoeda(produto.subtotal)}
                      </strong>
                    </section>
                  ))}
                </section>
              )}

              <footer className="pedido-total">
                <span>Total do pedido</span>
                <strong>{formatarMoeda(pedido.total)}</strong>
              </footer>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default HistoricoPedidos;
