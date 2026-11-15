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
  const dataConvertida = new Date(data.replace(" ", "T"));

  if (Number.isNaN(dataConvertida.getTime())) {
    return data;
  }

  return dataConvertida.toLocaleString("pt-BR", {
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
    async function buscarHistorico() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch(
          "http://localhost:8000/api/pedidos.php"
        );

        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {
          throw new Error(
            dados.mensagem || "Não foi possível carregar o histórico."
          );
        }

        setPedidos(
          Array.isArray(dados.pedidos) ? dados.pedidos : []
        );
      } catch (erro) {
        console.error("Erro ao buscar histórico:", erro);

        setErro(
          erro.message || "Não foi possível carregar os pedidos."
        );
      } finally {
        setCarregando(false);
      }
    }

    buscarHistorico();
  }, [tentativa]);

  return (
    <main className="pagina-historico">
      <header className="historico-topo">
        <h1>Meus pedidos</h1>
        <p>Acompanhe suas compras realizadas na bomboniere.</p>
      </header>

      {mensagem && (
        <p className="mensagem-sucesso" role="status">
          {mensagem}
        </p>
      )}

      {carregando && (
        <p role="status">Carregando histórico de pedidos...</p>
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
          <p>Quando finalizar uma compra, ela aparecerá aqui.</p>

          <Link to="/bomboniere" className="botao-voltar">
            Conhecer a bomboniere
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

              <section className="pedido-produtos">
                <h3>Produtos</h3>

                {pedido.produtos.map((produto, indice) => (
                  <section
                    className="pedido-produto"
                    key={`${pedido.id}-${produto.id}-${indice}`}
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
