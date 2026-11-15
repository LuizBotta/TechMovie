
function ItemCarrinho({
  produto,
  onAumentar,
  onDiminuir,
  onRemover
}) {
  const ingresso = produto.categoria === "ingresso";

  const subtotal =
    Number(produto.preco) * Number(produto.quantidade);

  const moeda = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  return (
    <article className="item-carrinho">
      <section className="item-carrinho-imagem">
        <span>{ingresso ? "🎟️" : produto.emoji}</span>
      </section>

      <section className="item-carrinho-info">
        <h2>{produto.nome}</h2>

        {ingresso ? (
          <>
            <p>{produto.descricao}</p>
            <p>
              Tipo: {produto.tipo === "meia" ? "Meia" : "Inteira"}
            </p>
            <p>Quantidade: 1 ingresso</p>
          </>
        ) : (
          <p>{produto.descricao}</p>
        )}

        <strong>{moeda(subtotal)}</strong>

        {!ingresso && (
          <section className="controle-quantidade">
            <button
              type="button"
              onClick={() => onDiminuir(produto.id)}
              aria-label={`Diminuir quantidade de ${produto.nome}`}
            >
              -
            </button>

            <span>{produto.quantidade}</span>

            <button
              type="button"
              onClick={() => onAumentar(produto.id)}
              aria-label={`Aumentar quantidade de ${produto.nome}`}
            >
              +
            </button>
          </section>
        )}

        <button
          type="button"
          className="botao-remover"
          onClick={() => onRemover(produto.id)}
        >
          {ingresso ? "Remover ingresso" : "Remover produto"}
        </button>
      </section>
    </article>
  );
}

export default ItemCarrinho;
