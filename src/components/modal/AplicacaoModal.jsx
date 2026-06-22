import React, { useEffect, useState } from "react";

export default function AplicacaoModal({
  aberto,
  fechar,
  onSalvar,
  aplicacaoInicial,
  pacientes,
  vacinas
}) {

    const [pacienteId, setPacienteId] = useState("");
    
    const [vacinaId, setVacinaId] = useState("");

    const [dose, setDose] = useState("");

    const [data, setData] = useState("");

    const [profissional, setProfissional] = useState("");

    const [status, setStatus] = useState("");


    useEffect(() => {
      if (!aberto) {
        setPacienteId("");
        setVacinaId("");
        setDose("");
        setData("");
        setProfissional("");
        setStatus("");
        return;
      }

      if (aplicacaoInicial) {
        setPacienteId(aplicacaoInicial.pacienteId || "");
        setVacinaId(aplicacaoInicial.vacinaId || "");
        setDose(aplicacaoInicial.dose || "");
        setData(aplicacaoInicial.data || "");
        setProfissional(aplicacaoInicial.profissional || "");
        setStatus(aplicacaoInicial.status || "");
      }
    }, [aberto, aplicacaoInicial]);

    function handleSalvar() {
      if (
        !pacienteId ||
        !vacinaId ||
        !dose ||
        !data ||
        !profissional ||
        !status
      ) {
        alert("Preencha todos os campos.");
        return;
      }

      onSalvar({
        pacienteId,
        vacinaId,
        dose,
        data,
        profissional,
        status
      });
    }

    if (!aberto) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 w-[500px]">
          <h2 className="text-2xl font-bold mb-4">
            {aplicacaoInicial
              ? "Editar Aplicação"
              : "Nova Aplicação"}
          </h2>

          <div className="space-y-3">
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Selecione o paciente</option>

              {(pacientes || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>

            <select
              value={vacinaId}
              onChange={(e) => setVacinaId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Selecione a vacina</option>
                    
              {(vacinas || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>

            <select
              value={dose}
              onChange={(e) =>
                setDose(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">
                Selecione a dose
              </option>

              <option>
                1ª Dose
              </option>

              <option>
                2ª Dose
              </option>

              <option>
                3ª Dose
              </option>

              <option>
                Reforço
              </option>

              <option>
                Dose Única
              </option>
            </select>

            <input
              type="date"
              value={data}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setData(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2"
            />

            <select
              value={profissional}
              onChange={(e) => setProfissional(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Selecione o profissional</option>
              <option value="Admin">Admin</option>
            </select>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">
                Selecione o status
              </option>

              <option>
                Agendada
              </option>

              <option>
                Aplicada
              </option>

              <option>
                Cancelada
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={fechar}
              className="px-4 py-2 border rounded-lg"
            >
              Cancelar
            </button>

            <button
              onClick={handleSalvar}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    );
}