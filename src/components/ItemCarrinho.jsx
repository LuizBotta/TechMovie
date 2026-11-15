function ItemCarrinho({ produto, onAumentar, onDiminuir, onRemover }) {
  const subtotal = produto.preco * produto.quantidade;

  return (
    <article className="item-carrinho">
      <section className="item-carrinho-imagem">
        <span>{produto.emoji}</span>
      </section>

      <section className="item-carrinho-info">
        <h2>{produto.nome}</h2>
        <p>{produto.descricao}</p>

        <strong>
          {subtotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })}
        </strong>

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

        <button
          type="button"
          className="botao-remover"
          onClick={() => onRemover(produto.id)}
        >
          Remover produto
        </button>
      </section>
    </article>
  );
}

export default ItemCarrinho;
