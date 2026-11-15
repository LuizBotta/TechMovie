import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ItemCarrinho from "../components/ItemCarrinho";
import "../styles/carrinho.css";

const CHAVE_CARRINHO = "techmovie_carrinho";
const CHAVE_HISTORICO = "techmovie_historico";

function lerLocalStorage(chave) {
  try {
    const dados = JSON.parse(localStorage.getItem(chave) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function Carrinho() {
  const [carrinho, setCarrinho] = useState(() =>
    lerLocalStorage(CHAVE_CARRINHO)
  );
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

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

  function finalizarCompra() {
    setErro("");

    if (carrinho.length === 0) {
      setErro("Adicione pelo menos um produto antes de finalizar.");
      return;
    }

    const total = carrinho.reduce(
      (soma, produto) =>
        soma + Number(produto.preco) * Number(produto.quantidade),
      0
    );

    const pedido = {
      id: `PED-${Date.now()}`,
      data: new Date().toISOString(),
      produtos: carrinho.map((produto) => ({ ...produto })),
      total: Number(total.toFixed(2)),
      status: "Concluído"
    };

    const historico = lerLocalStorage(CHAVE_HISTORICO);

    try {
      localStorage.setItem(
        CHAVE_HISTORICO,
        JSON.stringify([pedido, ...historico])
      );

      localStorage.setItem(CHAVE_CARRINHO, "[]");

      window.dispatchEvent(new Event("carrinhoAtualizado"));

      setCarrinho([]);
      navigate("/historico");
    } catch {
      setErro("Não foi possível salvar o pedido. Tente novamente.");
    }
  }

  const total = carrinho.reduce(
    (soma, produto) =>
      soma + Number(produto.preco) * Number(produto.quantidade),
    0
  );

  const quantidadeTotal = carrinho.reduce(
    (soma, produto) => soma + Number(produto.quantidade),
    0
  );

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  return (
    <main className="pagina-carrinho">
      <h1>Meu carrinho</h1>

      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      {carrinho.length === 0 ? (
        <section className="carrinho-vazio">
          <span>🛒</span>
          <h2>Seu carrinho está vazio</h2>
          <p>
            Que tal escolher alguns produtos para sua sessão?
          </p>
          <Link to="/bomboniere" className="botao-voltar">
            Ir para a bomboniere
          </Link>
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
              <strong>{formatarMoeda(total)}</strong>
            </section>

            <section className="resumo-total">
              <span>Total:</span>
              <strong>{formatarMoeda(total)}</strong>
            </section>

            <button
              type="button"
              className="botao-finalizar"
              onClick={finalizarCompra}
            >
              Finalizar compra
            </button>

            <button
              type="button"
              className="botao-limpar"
              onClick={limparCarrinho}
            >
              Limpar carrinho
            </button>

            <p className="mensagem-checkout">
              Checkout demonstrativo: nenhuma cobrança será realizada.
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}

export default Carrinho;
