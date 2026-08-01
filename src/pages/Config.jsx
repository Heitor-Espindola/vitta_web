import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Config() {
  const navigate = useNavigate();

  const [usuario, setUsuario] =
    useState(null);
  const [nomeUnidade, setNomeUnidade] =
    useState("Clínica Vitta");
  const [endereco, setEndereco] =
    useState("");
  const [telefone, setTelefone] =
    useState("");
  const [salvo, setSalvo] =
    useState(false);
  useEffect(() => {
    const usuarioSalvo =
      localStorage.getItem(
        "usuarioLogado"
      );
    if (usuarioSalvo) {
      setUsuario(
        JSON.parse(usuarioSalvo)
      );
    }
  }, []);
  function salvarConfiguracoes() {
    const configuracoes = {
      nomeUnidade,
      endereco,
      telefone
    };
    localStorage.setItem(
      "configuracoesVitta",
      JSON.stringify(configuracoes)
    );
    setSalvo(true);
    setTimeout(() => {
      setSalvo(false);
    }, 2000);
  }
  async function sairDaConta() {
    await signOut(auth);

    localStorage.removeItem("usuarioLogado");

    navigate("/", {
      replace: true
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="
            text-3xl
            font-bold
            text-slate-800
          "
        >
          Configurações
        </h1>
        <p className="text-slate-500">
          Gerencie as configurações
          da plataforma
        </p>
      </div>

      {/* PERFIL */}
      <div
        className="
          bg-white
          rounded-xl
          shadow
          p-6
          max-w-2xl
        "
      >
        <h2
          className="
            text-xl
            font-semibold
            text-slate-800
            mb-1
          "
        >
          Perfil do Usuário
        </h2>
        <p
          className="
            text-sm
            text-slate-500
            mb-6
          "
        >
          Informações da sua conta
        </p>
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              w-14
              h-14
              rounded-full
              bg-blue-100
              flex
              items-center
              justify-center
            "
          >
            <span
              className="
                text-blue-600
                text-xl
                font-bold
              "
            >
              {usuario?.email
                ?.charAt(0)
                .toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p
              className="
                font-semibold
                text-slate-800
              "
            >
              {usuario?.email || "—"}
            </p>
            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Usuário do sistema
            </p>
          </div>
          <button
            onClick={sairDaConta}
            className="
              ml-auto
              border
              border-red-300
              text-red-600
              hover:bg-red-50
              px-4
              py-2
              rounded-lg
            "
          >
            Sair da conta
          </button>
        </div>
      </div>

      {/* DADOS DA UNIDADE */}
      <div
        className="
          bg-white
          rounded-xl
          shadow
          p-6
          max-w-2xl
        "
      >
        <h2
          className="
            text-xl
            font-semibold
            text-slate-800
            mb-1
          "
        >
          Dados da Clínica / UBS
        </h2>
        <p
          className="
            text-sm
            text-slate-500
            mb-6
          "
        >
          Informações da unidade de saúde
        </p>
        <div className="space-y-4">
          <div>
            <label
              className="
                block
                text-sm
                font-medium
                text-slate-700
                mb-1
              "
            >
              Nome da Unidade
            </label>
            <input
              value={nomeUnidade}
              onChange={(e) =>
                setNomeUnidade(
                  e.target.value
                )
              }
              placeholder="
                Nome da clínica ou UBS
              "
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2
              "
            />
          </div>
          <div>
            <label
              className="
                block
                text-sm
                font-medium
                text-slate-700
                mb-1
              "
            >
              Endereço
            </label>
            <input
              value={endereco}
              onChange={(e) =>
                setEndereco(
                  e.target.value
                )
              }
              placeholder="
                Rua, número, bairro, cidade
              "
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2
              "
            />
          </div>
          <div>
            <label
              className="
                block
                text-sm
                font-medium
                text-slate-700
                mb-1
              "
            >
              Telefone
            </label>
            <input
              value={telefone}
              onChange={(e) =>
                setTelefone(
                  e.target.value
                )
              }
              placeholder="(00) 00000-0000"
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2
              "
            />
          </div>
          <button
            onClick={
              salvarConfiguracoes
            }
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            {salvo
              ? "Salvo!"
              : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {/* NOTIFICAÇÕES */}
      <div
        className="
          bg-white
          rounded-xl
          shadow
          p-6
          max-w-2xl
        "
      >
        <h2
          className="
            text-xl
            font-semibold
            text-slate-800
            mb-1
          "
        >
          Notificações
        </h2>
        <p
          className="
            text-sm
            text-slate-500
            mb-6
          "
        >
          Preferências de alertas
          e lembretes
        </p>
        <div className="space-y-4">
          <div
            className="
              flex
              justify-between
              items-center
              border-b
              pb-4
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-medium
                "
              >
                Alertas de vacinas vencidas
              </p>
              <p
                className="
                  text-xs
                  text-slate-500
                  mt-1
                "
              >
                Notificar quando uma vacina
                estiver próxima do vencimento
              </p>
            </div>
            <span
              className="
                text-xs
                text-slate-500
              "
            >
              Em breve
            </span>
          </div>

          <div
            className="
              flex
              justify-between
              items-center
              border-b
              pb-4
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-medium
                "
              >
                Doses atrasadas
              </p>
              <p
                className="
                  text-xs
                  text-slate-500
                  mt-1
                "
              >
                Alertar sobre pacientes
                com doses em atraso
              </p>
            </div>
            <span
              className="
                text-xs
                text-slate-500
              "
            >
              Em breve
            </span>
          </div>

          <div
            className="
              flex
              justify-between
              items-center
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-medium
                "
              >
                Resumo diário
              </p>
              <p
                className="
                  text-xs
                  text-slate-500
                  mt-1
                "
              >
                Receber resumo das
                aplicações do dia
              </p>
            </div>
            <span
              className="
                text-xs
                text-slate-500
              "
            >
              Em breve
            </span>
          </div>
        </div>
      </div>

      {/* SEGURANÇA */}
      <div
        className="
          bg-white
          rounded-xl
          shadow
          p-6
          max-w-2xl
        "
      >
        <h2
          className="
            text-xl
            font-semibold
            text-slate-800
            mb-1
          "
        >
          Segurança e Acesso
        </h2>
        <p
          className="
            text-sm
            text-slate-500
            mb-4
          "
        >
          Informações sobre autenticação
          e permissões
        </p>
        <div
          className="
            space-y-3
            text-sm
            text-slate-500
          "
        >
          <p>
            A autenticação é realizada
            através do sistema de usuários
            do Vitta.
          </p>
          <p>
            O controle de permissões por
            perfil poderá ser implementado
            futuramente.
          </p>
        </div>
      </div>
    </div>
  );
}