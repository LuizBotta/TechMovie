
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Sessoes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [filme, setFilme] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarDados() {
      setCarregando(true);
      setErro("");
      setFilme(null);
      setSessoes([]);
      setDataSelecionada("");
      setHorarioSelecionado("");

      try {
        const [respostaFilmes, respostaSessoes] = await Promise.all([
          fetch("http://localhost:8000/api/filmes.php", {
            signal: controlador.signal
          }),
          fetch(
            `http://localhost:8000/api/sessoes.php?filmeId=${encodeURIComponent(id)}`,
            { signal: controlador.signal }
          )
        ]);

        if (!respostaFilmes.ok || !respostaSessoes.ok) {
          throw new Error("Erro ao consultar o servidor.");
        }

        const dadosFilmes = await respostaFilmes.json();
        const dadosSessoes = await respostaSessoes.json();

        if (
          !dadosFilmes.sucesso ||
          !Array.isArray(dadosFilmes.filmes) ||
          !dadosSessoes.sucesso ||
          !Array.isArray(dadosSessoes.sessoes)
        ) {
          throw new Error("Resposta inválida do servidor.");
        }

        const filmeEncontrado = dadosFilmes.filmes.find(
          (item) => Number(item.id) === Number(id)
        );

        setFilme(filmeEncontrado || null);
        setSessoes(dadosSessoes.sessoes);
      } catch (erro) {
        if (erro.name !== "AbortError") {
          setErro("Não foi possível carregar as sessões.");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => controlador.abort();
  }, [id]);

  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  const dataHoje = `${ano}-${mes}-${dia}`;

  const horarioAtual =
    `${String(agora.getHours()).padStart(2, "0")}:` +
    `${String(agora.getMinutes()).padStart(2, "0")}`;

  const sessoesDisponiveis = sessoes.filter((sessao) => {
    return (
      sessao.data > dataHoje ||
      (sessao.data === dataHoje && sessao.horario > horarioAtual)
    );
  });

  const datasDisponiveis = [
    ...new Set(sessoesDisponiveis.map((sessao) => sessao.data))
  ];

  const horariosDisponiveis = sessoesDisponiveis
    .filter((sessao) => sessao.data === dataSelecionada)
    .map((sessao) => sessao.horario);

  function selecionarData(data) {
    setDataSelecionada(data);
    setHorarioSelecionado("");
  }

  function continuar() {
    if (
      !dataSelecionada ||
      !horariosDisponiveis.includes(horarioSelecionado)
    ) {
      return;
    }

    const parametros = new URLSearchParams({
      data: dataSelecionada,
      horario: horarioSelecionado
    });

    navigate(`/assentos/${id}?${parametros.toString()}`);
  }

  if (carregando) {
    return (
      <main className="pagina-sessoes">
        <p>Carregando sessões...</p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="pagina-sessoes">
        <p role="alert">{erro}</p>
      </main>
    );
  }

  if (!filme) {
    return (
      <main className="pagina-sessoes">
        <h2>Filme não encontrado.</h2>
      </main>
    );
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

      {datasDisponiveis.length === 0 ? (
        <p className="mensagem">
          Não há sessões disponíveis para este filme.
        </p>
      ) : (
        <>
          <section aria-label="Datas disponíveis">
            <h2>Selecione a data</h2>

            <section className="opcoes">
              {datasDisponiveis.map((data) => (
                <button
                  key={data}
                  type="button"
                  className={
                    dataSelecionada === data
                      ? "opcao selecionada"
                      : "opcao"
                  }
                  onClick={() => selecionarData(data)}
                >
                  {data.split("-").reverse().join("/")}
                </button>
              ))}
            </section>
          </section>

          {dataSelecionada && (
            <section aria-label="Horários disponíveis">
              <h2>Selecione o horário</h2>

              <section className="opcoes">
                {horariosDisponiveis.map((horario) => (
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
            disabled={
              !dataSelecionada ||
              !horariosDisponiveis.includes(horarioSelecionado)
            }
            onClick={continuar}
          >
            Escolher poltronas
          </button>
        </>
      )}
    </main>
  );
}

export default Sessoes;
