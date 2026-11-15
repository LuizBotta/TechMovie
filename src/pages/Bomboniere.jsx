import { useEffect, useState } from "react";
import CardProduto from "../components/CardProduto";
import "../styles/bomboniere.css";

function Bomboniere() {
  const [produtos, setProdutos] = useState([]);
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    async function buscarProdutos() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch(
          "http://localhost:8000/api/produtos.php"
        );

        if (!resposta.ok) {
          throw new Error("Não foi possível consultar os produtos.");
        }

        const dados = await resposta.json();

        if (!dados.sucesso || !Array.isArray(dados.produtos)) {
          throw new Error(
            dados.mensagem || "A API retornou dados inválidos."
          );
        }

        setProdutos(dados.produtos);
      } catch (erro) {
        console.error("Erro ao buscar produtos:", erro);
        setErro(
          "Não foi possível carregar os produtos. Verifique se o servidor PHP está funcionando."
        );
      } finally {
        setCarregando(false);
      }
    }

    buscarProdutos();
  }, [tentativa]);

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
          ? {
              ...item,
              quantidade: Number(item.quantidade || 1) + 1
            }
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

      {carregando && (
        <p role="status">Carregando produtos...</p>
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

      {!carregando && !erro && produtos.length === 0 && (
        <p>Nenhum produto disponível no momento.</p>
      )}

      {!carregando && !erro && produtos.length > 0 && (
        <section className="produtos-grid">
          {produtos.map((produto) => (
            <CardProduto
              key={produto.id}
              produto={produto}
              onAdicionar={adicionarAoCarrinho}
            />
          ))}
        </section>
      )}
    </main>
  );
}

export default Bomboniere;
