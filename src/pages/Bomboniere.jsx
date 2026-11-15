
import { useState } from "react";
import produtos from "../data/produtos";
import CardProduto from "../components/CardProduto";
import "../styles/bomboniere.css";

function Bomboniere() {
  const [aviso, setAviso] = useState("");

  function adicionarAoCarrinho(produto) {
    let carrinho = [];

    try {
      carrinho = JSON.parse(
        localStorage.getItem("techmovie_carrinho") || "[]"
      );

      if (!Array.isArray(carrinho)) {
        carrinho = [];
      }
    } catch {
      carrinho = [];
    }

    const produtoExistente = carrinho.find(
      (item) => item.id === produto.id
    );

    if (produtoExistente) {
      carrinho = carrinho.map((item) =>
        item.id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      );
    } else {
      carrinho.push({
        ...produto,
        quantidade: 1
      });
    }

    localStorage.setItem(
      "techmovie_carrinho",
      JSON.stringify(carrinho)
    );

    window.dispatchEvent(new Event("carrinhoAtualizado"));

    setAviso(`${produto.nome} foi adicionado ao carrinho!`);
  }

  return (
    <main className="bomboniere">
      <section className="bomboniere-topo">
        <h1>Bomboniere TechMovie</h1>
        <p>
          Deixe sua sessão ainda melhor com nossos produtos!
        </p>
      </section>

      {aviso && (
        <p className="aviso-carrinho" role="status">
          {aviso}
        </p>
      )}

      <section className="produtos-grid">
        {produtos.map((produto) => (
          <CardProduto
            key={produto.id}
            produto={produto}
            onAdicionar={adicionarAoCarrinho}
          />
        ))}
      </section>
    </main>
  );
}

export default Bomboniere;
