import { Link } from "react-router-dom";
import "../styles/historico.css";

const CHAVE_HISTORICO = "techmovie_historico";

function carregarHistorico() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_HISTORICO) || "[]"
    );

    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function HistoricoPedidos() {
  const pedidos = carregarHistorico();

  return (
    <main className="pagina-historico">
      <header className="historico-topo">
        <h1>Meus pedidos</h1>
        <p>Acompanhe suas compras realizadas na bomboniere.</p>
      </header>

      {pedidos.length === 0 ? (
        <section className="historico-vazio">
          <span>📋</span>
          <h2>Você ainda não tem pedidos</h2>
          <p>Quando finalizar uma compra, ela aparecerá aqui.</p>

          <Link to="/bomboniere" className="botao-voltar">
            Conhecer a bomboniere
          </Link>
        </section>
      ) : (
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
                        {produto.quantidade} x {formatarMoeda(produto.preco)}
                      </p>
                    </section>

                    <strong>
                      {formatarMoeda(
                        produto.preco * produto.quantidade
                      )}
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
