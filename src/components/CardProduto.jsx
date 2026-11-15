function CardProduto({ produto, onAdicionar }) {
  return (
    <article className="produto-card">
      <section className="produto-imagem">
        <span>{produto.emoji}</span>
      </section>

      <section className="produto-info">
        <span className="produto-categoria">
          {produto.categoria}
        </span>

        <h2>{produto.nome}</h2>

        <p>{produto.descricao}</p>

        <strong>
          {Number(produto.preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })}
        </strong>

        <button
          type="button"
          onClick={() => onAdicionar(produto)}
          className="botao-adicionar"
        >
          + Adicionar ao carrinho
        </button>
      </section>
    </article>
  );
}

export default CardProduto;
