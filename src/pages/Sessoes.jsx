import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { filmes } from "../data/filmes";
import { sessoes } from "../data/sessoes";

function Sessoes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarioSelecionado, setHorarioSelecionado] = useState("");

  const filme = filmes.find(
    (item) => item.id === Number(id)
  );

  const sessoesFilme = sessoes.filter(
    (sessao) => sessao.filmeId === Number(id)
  );

  const sessaoAtual = sessoesFilme.find(
    (sessao) => sessao.data === dataSelecionada
  );

  function selecionarData(data) {
    setDataSelecionada(data);
    setHorarioSelecionado("");
  }

  function continuar() {
    if (!dataSelecionada || !horarioSelecionado) {
      return;
    }

    const parametros = new URLSearchParams({
      data: dataSelecionada,
      horario: horarioSelecionado
    });

    navigate(`/assentos/${id}?${parametros.toString()}`);
  }

  if (!filme) {
    return <h2 className="mensagem">Filme não encontrado.</h2>;
  }

  return (
    <main className="pagina-sessoes">
      <h1>Escolha sua sessão</h1>

      <article className="sessao-filme">
        <img src={filme.imagem} alt={filme.titulo} />

        <section>
          <h2>{filme.titulo}</h2>
          <p>{filme.genero}</p>
          <p>{filme.duracao}</p>
        </section>
      </article>

      <section aria-label="Datas disponíveis">
        <h2>Selecione a data</h2>

        <section className="opcoes">
          {sessoesFilme.map((sessao) => (
            <button
              key={sessao.id}
              type="button"
              className={
                dataSelecionada === sessao.data
                  ? "opcao selecionada"
                  : "opcao"
              }
              onClick={() => selecionarData(sessao.data)}
            >
              {sessao.data.split("-").reverse().join("/")}
            </button>
          ))}
        </section>
      </section>

      {sessaoAtual && (
        <section aria-label="Horários disponíveis">
          <h2>Selecione o horário</h2>

          <section className="opcoes">
            {sessaoAtual.horarios.map((horario) => (
              <button
                key={horario}
                type="button"
                className={
                  horarioSelecionado === horario
                    ? "opcao selecionada"
                    : "opcao"
                }
                onClick={() => setHorarioSelecionado(horario)}
              >
                {horario}
              </button>
            ))}
          </section>
        </section>
      )}

      <button
        type="button"
        className="botao"
        disabled={!dataSelecionada || !horarioSelecionado}
        onClick={continuar}
      >
        Escolher poltronas
      </button>
    </main>
  );
}

export default Sessoes;