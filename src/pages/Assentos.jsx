
import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link
} from "react-router-dom";

const API = "http://localhost:8000/api";

const fileiras = ["A", "B", "C", "D", "E"];
const numeros = [1, 2, 3, 4, 5, 6, 7, 8];

const poltronasValidas = fileiras.flatMap((fileira) =>
  numeros.map((numero) => `${fileira}${numero}`)
);

function sessaoFutura(data, horario) {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  const hoje = `${ano}-${mes}-${dia}`;
  const horaAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(
    agora.getMinutes()
  ).padStart(2, "0")}`;

  return data > hoje || (data === hoje && horario > horaAtual);
}

function buscarReservaSalva(sessaoId) {
  try {
    const dados = JSON.parse(
      localStorage.getItem("techmovie_reserva")
    );

    if (
      Number(dados?.sessaoId) === Number(sessaoId) &&
      Array.isArray(dados.ingressos)
    ) {
      return dados.ingressos;
    }
  } catch {
    return [];
  }

  return [];
}

function Assentos() {
  const { id } = useParams();
  const [parametros] = useSearchParams();
  const navigate = useNavigate();

  const data = parametros.get("data");
  const horario = parametros.get("horario");

  const [filme, setFilme] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [ocupados, setOcupados] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [tipos, setTipos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarDados() {
      setCarregando(true);
      setErro("");
      setFilme(null);
      setSessao(null);
      setOcupados([]);
      setSelecionados([]);
      setTipos({});

      try {
        const [respostaFilmes, respostaSessoes] = await Promise.all([
          fetch(`${API}/filmes.php`, {
            signal: controlador.signal
          }),
          fetch(
            `${API}/sessoes.php?filmeId=${encodeURIComponent(id)}`,
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

        const sessaoEncontrada = dadosSessoes.sessoes.find(
          (item) =>
            item.data === data &&
            item.horario === horario
        );

        setFilme(filmeEncontrado || null);

        if (
          !filmeEncontrado ||
          !sessaoEncontrada ||
          !sessaoFutura(data, horario)
        ) {
          return;
        }

        const respostaAssentos = await fetch(
          `${API}/assentos.php?sessaoId=${sessaoEncontrada.id}`,
          { signal: controlador.signal }
        );

        if (!respostaAssentos.ok) {
          throw new Error("Erro ao consultar as poltronas.");
        }

        const dadosAssentos = await respostaAssentos.json();

        if (
          !dadosAssentos.sucesso ||
          !Array.isArray(dadosAssentos.ocupados)
        ) {
          throw new Error("Resposta inválida das poltronas.");
        }

        const ocupadas = dadosAssentos.ocupados;
        setSessao(sessaoEncontrada);
        setOcupados(ocupadas);

        const salvos = buscarReservaSalva(sessaoEncontrada.id)
          .filter(
            (ingresso) =>
              poltronasValidas.includes(ingresso.poltrona) &&
              !ocupadas.includes(ingresso.poltrona)
          );

        const poltronasSalvas = [
          ...new Set(salvos.map((ingresso) => ingresso.poltrona))
        ];

        const tiposSalvos = {};

        salvos.forEach((ingresso) => {
          tiposSalvos[ingresso.poltrona] =
            ingresso.tipo === "meia" ? "meia" : "inteira";
        });

        setSelecionados(poltronasSalvas);
        setTipos(tiposSalvos);
      } catch (erro) {
        if (erro.name !== "AbortError") {
          setErro("Não foi possível carregar as poltronas.");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => controlador.abort();
  }, [id, data, horario]);

  function selecionarAssento(assento) {
    if (
      !sessao ||
      !poltronasValidas.includes(assento) ||
      ocupados.includes(assento)
    ) {
      return;
    }

    if (selecionados.includes(assento)) {
      setSelecionados(
        selecionados.filter((item) => item !== assento)
      );

      setTipos((anteriores) => {
        const novos = { ...anteriores };
        delete novos[assento];
        return novos;
      });
    } else {
      setSelecionados([...selecionados, assento]);
      setTipos({ ...tipos, [assento]: "inteira" });
    }
  }

  function alterarTipo(assento, tipo) {
    if (
      !selecionados.includes(assento) ||
      !["inteira", "meia"].includes(tipo)
    ) {
      return;
    }

    setTipos({ ...tipos, [assento]: tipo });
  }

  const total = selecionados.reduce(
    (soma, assento) =>
      soma + (tipos[assento] === "meia" ? 15 : 30),
    0
  );

  async function confirmarAssentos() {
    if (
      confirmando ||
      !filme ||
      !sessao ||
      !sessaoFutura(data, horario) ||
      selecionados.length === 0
    ) {
      return;
    }

    setConfirmando(true);
    setErro("");

    try {
      const resposta = await fetch(
        `${API}/assentos.php?sessaoId=${sessao.id}`
      );

      if (!resposta.ok) {
        throw new Error("Erro ao verificar as poltronas.");
      }

      const dados = await resposta.json();

      if (!dados.sucesso || !Array.isArray(dados.ocupados)) {
        throw new Error("Resposta inválida do servidor.");
      }

      const indisponiveis = selecionados.filter(
        (assento) => dados.ocupados.includes(assento)
      );

      if (indisponiveis.length > 0) {
        setOcupados(dados.ocupados);

        setSelecionados((anteriores) =>
          anteriores.filter(
            (assento) => !indisponiveis.includes(assento)
          )
        );

        throw new Error(
          `As poltronas ${indisponiveis.join(", ")} foram ocupadas.`
        );
      }

      const ingressos = selecionados.map((assento) => {
        const tipo = tipos[assento] === "meia"
          ? "meia"
          : "inteira";

        const preco = tipo === "meia" ? 15 : 30;

        return {
          id: `ingresso-${sessao.id}-${assento}`,
          categoria: "ingresso",
          nome: `Ingresso - ${filme.titulo}`,
          sessaoId: sessao.id,
          poltrona: assento,
          tipo,
          quantidade: 1,
          preco,
          precoUnitario: preco,
          subtotal: preco
        };
      });

      const reserva = {
        filmeId: filme.id,
        filme: filme.titulo,
        sessaoId: sessao.id,
        data,
        horario,
        ingressos,
        total
      };

      localStorage.setItem(
        "techmovie_reserva",
        JSON.stringify(reserva)
      );

      navigate("/confirmacao");
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setConfirmando(false);
    }
  }

  if (carregando) {
    return (
      <main className="pagina-assentos">
        <p>Carregando poltronas...</p>
      </main>
    );
  }

  if (!filme) {
    return (
      <main className="pagina-assentos">
        <h2>Filme não encontrado.</h2>
        <Link to="/" className="botao">
          Voltar aos filmes
        </Link>
      </main>
    );
  }

  if (!sessao) {
    return (
      <main className="pagina-assentos">
        <h2>Sessão não disponível.</h2>
        {erro && <p role="alert">{erro}</p>}
        <Link to={`/sessoes/${id}`} className="botao">
          Escolher outra sessão
        </Link>
      </main>
    );
  }

  return (
    <main className="pagina-assentos">
      <h1>Escolha suas poltronas</h1>

      <p>
        {filme.titulo} — {data.split("-").reverse().join("/")} às {horario}
      </p>

      {erro && <p role="alert">{erro}</p>}

      <section className="sala-cinema">
        <p className="tela-cinema">TELA DO CINEMA</p>

        <section className="mapa-assentos">
          {fileiras.map((fileira) => (
            <section className="fileira" key={fileira}>
              <span className="letra-fileira">{fileira}</span>

              {numeros.map((numero) => {
                const assento = `${fileira}${numero}`;
                const ocupado = ocupados.includes(assento);
                const selecionado = selecionados.includes(assento);

                return (
                  <button
                    key={assento}
                    type="button"
                    disabled={ocupado}
                    className={
                      ocupado
                        ? "assento ocupado"
                        : selecionado
                        ? "assento selecionado"
                        : "assento disponivel"
                    }
                    onClick={() => selecionarAssento(assento)}
                    aria-label={`Poltrona ${assento}`}
                    aria-pressed={selecionado}
                  >
                    {numero}
                  </button>
                );
              })}
            </section>
          ))}
        </section>

        <section className="legenda-assentos">
          <p>🟢 Disponível</p>
          <p>🔴 Selecionada</p>
          <p>⚫ Ocupada</p>
        </section>
      </section>

      {selecionados.length > 0 && (
        <section className="resumo-assentos">
          <h2>Seus ingressos</h2>

          {selecionados.map((assento) => (
            <article className="ingresso-item" key={assento}>
              <p>Poltrona {assento}</p>

              <select
                value={tipos[assento] || "inteira"}
                onChange={(evento) =>
                  alterarTipo(assento, evento.target.value)
                }
                aria-label={`Tipo de ingresso da poltrona ${assento}`}
              >
                <option value="inteira">
                  Inteira — R$ 30,00
                </option>
                <option value="meia">
                  Meia — R$ 15,00
                </option>
              </select>
            </article>
          ))}

          <h2>
            Total: R$ {total.toFixed(2).replace(".", ",")}
          </h2>

          <button
            type="button"
            className="botao"
            disabled={confirmando}
            onClick={confirmarAssentos}
          >
            {confirmando
              ? "Verificando..."
              : "Confirmar assentos"}
          </button>
        </section>
      )}

      <Link to={`/sessoes/${id}`} className="botao">
        Voltar às sessões
      </Link>
    </main>
  );
}

export default Assentos;
