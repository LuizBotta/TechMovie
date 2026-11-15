
import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link
} from "react-router-dom";
import { filmes } from "../data/filmes";
import { sessoes } from "../data/sessoes";

const fileiras = ["A", "B", "C", "D", "E"];
const numeros = [1, 2, 3, 4, 5, 6, 7, 8];
const ocupados = ["A3", "B5", "C2", "D7", "E4"];

const poltronasValidas = fileiras.flatMap((fileira) =>
  numeros.map((numero) => `${fileira}${numero}`)
);

function sessaoDisponivel(id, data, horario) {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  const dataHoje = `${ano}-${mes}-${dia}`;

  const horarioAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(
    agora.getMinutes()
  ).padStart(2, "0")}`;

  const existeSessao = sessoes.some(
    (sessao) =>
      sessao.filmeId === Number(id) &&
      sessao.data === data &&
      sessao.horarios.includes(horario)
  );

  const horarioValido =
    data > dataHoje ||
    (data === dataHoje && horario > horarioAtual);

  return existeSessao && horarioValido;
}

function buscarReserva(id, data, horario) {
  try {
    const dados = localStorage.getItem("techmovie_reserva");

    if (!dados) {
      return null;
    }

    const reserva = JSON.parse(dados);

    if (
      Number(reserva.filmeId) === Number(id) &&
      reserva.data === data &&
      reserva.horario === horario &&
      Array.isArray(reserva.ingressos)
    ) {
      return reserva;
    }

    return null;
  } catch {
    return null;
  }
}

function Assentos() {
  const { id } = useParams();
  const [parametros] = useSearchParams();
  const navigate = useNavigate();

  const filme = filmes.find((item) => item.id === Number(id));

  const data = parametros.get("data");
  const horario = parametros.get("horario");

  const valida = sessaoDisponivel(id, data, horario);

  const [selecionados, setSelecionados] = useState([]);
  const [tipos, setTipos] = useState({});

  useEffect(() => {
    if (!valida) {
      setSelecionados([]);
      setTipos({});
      return;
    }

    const reserva = buscarReserva(id, data, horario);

    if (!reserva) {
      setSelecionados([]);
      setTipos({});
      return;
    }

    const ingressos = reserva.ingressos.filter(
      (ingresso) =>
        poltronasValidas.includes(ingresso.poltrona) &&
        !ocupados.includes(ingresso.poltrona)
    );

    const poltronasSalvas = [
      ...new Set(ingressos.map((ingresso) => ingresso.poltrona))
    ];

    setSelecionados(poltronasSalvas);

    const tiposSalvos = {};

    ingressos.forEach((ingresso) => {
      tiposSalvos[ingresso.poltrona] =
        ingresso.tipo === "meia" ? "meia" : "inteira";
    });

    setTipos(tiposSalvos);
  }, [id, data, horario, valida]);

  function selecionarAssento(assento) {
    if (!valida || !poltronasValidas.includes(assento)) {
      return;
    }

    if (ocupados.includes(assento)) {
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

      setTipos({
        ...tipos,
        [assento]: "inteira"
      });
    }
  }

  function alterarTipo(assento, tipo) {
    if (
      !selecionados.includes(assento) ||
      !["inteira", "meia"].includes(tipo)
    ) {
      return;
    }

    setTipos({
      ...tipos,
      [assento]: tipo
    });
  }

  const total = selecionados.reduce((soma, assento) => {
    return soma + (tipos[assento] === "meia" ? 15 : 30);
  }, 0);

  function confirmarAssentos() {
    if (
      !filme ||
      !sessaoDisponivel(id, data, horario) ||
      selecionados.length === 0
    ) {
      return;
    }

    const ingressos = selecionados.map((assento) => {
      const preco = tipos[assento] === "meia" ? 15 : 30;

      return {
        id: `ingresso-${filme.id}-${data}-${horario}-${assento}`,
        categoria: "ingresso",
        nome: `Ingresso - ${filme.titulo}`,
        poltrona: assento,
        tipo: tipos[assento] || "inteira",
        quantidade: 1,
        preco: preco,
        precoUnitario: preco,
        subtotal: preco
      };
    });

    const reserva = {
      filmeId: filme.id,
      filme: filme.titulo,
      data: data,
      horario: horario,
      ingressos: ingressos,
      total: total
    };

    localStorage.setItem(
      "techmovie_reserva",
      JSON.stringify(reserva)
    );

    navigate("/confirmacao");
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

  if (!valida) {
    return (
      <main className="pagina-assentos">
        <h2>Sessão não disponível.</h2>

        <p>
          A data ou o horário selecionado não está disponível.
        </p>

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
            onClick={confirmarAssentos}
          >
            Confirmar assentos
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
