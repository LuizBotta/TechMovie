import { useState } from "react";
import ItemCarrinho from "../components/ItemCarrinho";
import "../styles/carrinho.css";

const CHAVE_CARRINHO = "techmovie_carrinho";

function carregarCarrinho() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_CARRINHO) || "[]"
    );

    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function Carrinho() {
  const [carrinho, setCarrinho] = useState(carregarCarrinho);

  function atualizarCarrinho(novoCarrinho) {
    setCarrinho(novoCarrinho);

    localStorage.setItem(
      CHAVE_CARRINHO,
      JSON.stringify(novoCarrinho)
    );

    window.dispatchEvent(new Event("carrinhoAtualizado"));
  }

  function aumentarQuantidade(id) {
    const novoCarrinho = carrinho.map((produto) =>
      produto.id === id
        ? { ...produto, quantidade: produto.quantidade + 1 }
        : produto
    );

    atualizarCarrinho(novoCarrinho);
  }

  function diminuirQuantidade(id) {
    const novoCarrinho = carrinho
      .map((produto) =>
        produto.id === id
          ? { ...produto, quantidade: produto.quantidade - 1 }
          : produto
      )
      .filter((produto) => produto.quantidade > 0);

    atualizarCarrinho(novoCarrinho);
  }

  function removerProduto(id) {
    const novoCarrinho = carrinho.filter(
      (produto) => produto.id !== id
    );

    atualizarCarrinho(novoCarrinho);
  }

  function limparCarrinho() {
    atualizarCarrinho([]);
  }

  const total = carrinho.reduce(
    (acumulado, produto) =>
      acumulado + produto.preco * produto.quantidade,
    0
  );

  const quantidadeTotal = carrinho.reduce(
    (acumulado, produto) =>
      acumulado + produto.quantidade,
    0
  );

  return (
    <main className="pagina-carrinho">
      <h1>Meu carrinho</h1>

      {carrinho.length === 0 ? (
        <section className="carrinho-vazio">
          <span>🛒</span>
          <h2>Seu carrinho está vazio</h2>
          <p>
            Que tal escolher alguns produtos para sua sessão?
          </p>
          <a href="/bomboniere" className="botao-voltar">
            Ir para a bomboniere
          </a>
        </section>
      ) : (
        <section className="carrinho-conteudo">
          <section className="lista-carrinho">
            {carrinho.map((produto) => (
              <ItemCarrinho
                key={produto.id}
                produto={produto}
                onAumentar={aumentarQuantidade}
                onDiminuir={diminuirQuantidade}
                onRemover={removerProduto}
              />
            ))}
          </section>

          <aside className="resumo-carrinho">
            <h2>Resumo do pedido</h2>

            <section className="resumo-linha">
              <span>Quantidade de itens:</span>
              <strong>{quantidadeTotal}</strong>
            </section>

            <section className="resumo-linha">
              <span>Subtotal:</span>
              <strong>
                {total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </strong>
            </section>

            <section className="resumo-total">
              <span>Total:</span>
              <strong>
                {total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </strong>
            </section>

            <button
              type="button"
              className="botao-limpar"
              onClick={limparCarrinho}
            >
              Limpar carrinho
            </button>

            <p className="mensagem-checkout">
              O checkout será implementado na próxima etapa.
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}

export default Carrinho;

