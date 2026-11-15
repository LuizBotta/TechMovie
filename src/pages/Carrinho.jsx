
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ItemCarrinho from "../components/ItemCarrinho";
import "../styles/carrinho.css";

const CHAVE_CARRINHO = "techmovie_carrinho";

function lerCarrinho() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_CARRINHO) || "[]"
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

function Carrinho() {
  const [carrinho, setCarrinho] = useState(lerCarrinho);
  const [erro, setErro] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  const navigate = useNavigate();

  function atualizarCarrinho(itens) {
    setCarrinho(itens);
    localStorage.setItem(
      CHAVE_CARRINHO,
      JSON.stringify(itens)
    );
    window.dispatchEvent(new Event("carrinhoAtualizado"));
  }

  function aumentarQuantidade(id) {
    atualizarCarrinho(
      carrinho.map((item) =>
        item.id === id && item.categoria !== "ingresso"
          ? {
              ...item,
              quantidade: Math.min(
                99,
                Number(item.quantidade) + 1
              )
            }
          : item
      )
    );
  }

  function diminuirQuantidade(id) {
    atualizarCarrinho(
      carrinho
        .map((item) =>
          item.id === id && item.categoria !== "ingresso"
            ? {
                ...item,
                quantidade: Number(item.quantidade) - 1
              }
            : item
        )
        .filter((item) => Number(item.quantidade) > 0)
    );
  }

  function removerProduto(id) {
    atualizarCarrinho(
      carrinho.filter((item) => item.id !== id)
    );
  }

  function limparCarrinho() {
    atualizarCarrinho([]);
  }

  async function finalizarCompra() {
    if (finalizando) {
      return;
    }

    setErro("");

    if (carrinho.length === 0) {
      setErro("Adicione pelo menos um item.");
      return;
    }

    const produtos = carrinho
      .filter((item) => item.categoria !== "ingresso")
      .map((item) => ({
        id: Number(item.id),
        quantidade: Number(item.quantidade)
      }));

    const ingressos = carrinho
      .filter((item) => item.categoria === "ingresso")
      .map((item) => ({
        sessaoId: Number(item.sessaoId),
        poltrona: item.poltrona,
        tipo: item.tipo
      }));

    try {
      setFinalizando(true);

      const resposta = await fetch(
        "http://localhost:8000/api/pedidos.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            produtos,
            ingressos
          })
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok || !dados.sucesso) {
        throw new Error(
          dados.mensagem ||
          "Não foi possível finalizar a compra."
        );
      }

      atualizarCarrinho([]);

      navigate("/historico", {
        state: {
          mensagem: "Compra realizada com sucesso!"
        }
      });
    } catch (erro) {
      setErro(
        erro.message ||
        "Não foi possível finalizar a compra."
      );
    } finally {
      setFinalizando(false);
    }
  }

  const total = carrinho.reduce(
    (soma, item) =>
      soma +
      Number(item.preco) * Number(item.quantidade),
    0
  );

  const quantidadeTotal = carrinho.reduce(
    (soma, item) => soma + Number(item.quantidade),
    0
  );

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
            Escolha ingressos ou produtos para começar.
          </p>

          <Link to="/" className="botao-voltar">
            Ver filmes
          </Link>

          <Link to="/bomboniere" className="botao-voltar">
            Ir para a bomboniere
          </Link>
        </section>
      ) : (
        <section className="carrinho-conteudo">
          <section className="lista-carrinho">
            {carrinho.map((item) => (
              <ItemCarrinho
                key={item.id}
                produto={item}
                onAumentar={aumentarQuantidade}
                onDiminuir={diminuirQuantidade}
                onRemover={removerProduto}
              />
            ))}

            <Link to="/bomboniere" className="botao-voltar">
              Adicionar produtos da bomboniere
            </Link>
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
              disabled={finalizando}
            >
              {finalizando
                ? "Finalizando..."
                : "Finalizar compra"}
            </button>

            <button
              type="button"
              className="botao-limpar"
              onClick={limparCarrinho}
              disabled={finalizando}
            >
              Limpar carrinho
            </button>

            <p className="mensagem-checkout">
              Checkout demonstrativo: nenhuma cobrança
              será realizada.
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}

export default Carrinho;
