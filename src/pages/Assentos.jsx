import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { filmes } from "../data/filmes";

function Assentos() {
  const { id } = useParams();
  const [parametros] = useSearchParams();

  const filme = filmes.find(
    (item) => item.id === Number(id)
  );

  const data = parametros.get("data");
  const horario = parametros.get("horario");

  const fileiras = ["A", "B", "C", "D", "E"];
  const numeros = [1, 2, 3, 4, 5, 6, 7, 8];

  const ocupados = ["A3", "B5", "C2", "D7", "E4"];

  const [selecionados, setSelecionados] = useState([]);
  const [tipos, setTipos] = useState({});

  function selecionarAssento(assento) {
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
    setTipos({
      ...tipos,
      [assento]: tipo
    });
  }

  const total = selecionados.reduce((soma, assento) => {
    return soma + (tipos[assento] === "meia" ? 15 : 30);
  }, 0);

  if (!filme || !data || !horario) {
    return (
      <main className="pagina-assentos">
        <h2>Sessão não encontrada.</h2>
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
                value={tipos[assento]}
                onChange={(evento) =>
                  alterarTipo(assento, evento.target.value)
                }
              >
                <option value="inteira">Inteira — R$ 30,00</option>
                <option value="meia">Meia — R$ 15,00</option>
              </select>
            </article>
          ))}

          <h2>Total: R$ {total.toFixed(2).replace(".", ",")}</h2>

          <button
            type="button"
            className="botao"
            onClick={() => alert("Assentos selecionados com sucesso!")}
          >
            Confirmar assentos
          </button>
        </section>
      )}
    </main>
  );
}

export default Assentos;