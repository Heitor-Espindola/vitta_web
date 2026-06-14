import Pacientes from "./pages/Pacientes";
export default function PacienteModal({
  aberto,
  fechar
}) {

  if (!aberto) return null;

  return (

    <div
      className="
        fixed inset-0
        bg-black/50
        flex
        items-center
        justify-center
      "
    >

      <div
        className="
          bg-white
          rounded-xl
          p-6
          w-[500px]
        "
      >

        <h2 className="text-2xl font-bold mb-4">
          Novo Paciente
        </h2>

        <div className="space-y-3">

          <input
            placeholder="Nome"
            className="
              w-full
              border
              rounded-lg
              px-3 py-2
            "
          />

          <input
            placeholder="CPF"
            className="
              w-full
              border
              rounded-lg
              px-3 py-2
            "
          />

          <input
            type="date"
            className="
              w-full
              border
              rounded-lg
              px-3 py-2
            "
          />

        </div>

        <div
          className="
            flex
            justify-end
            gap-3
            mt-6
          "
        >

          <button
            onClick={fechar}
            className="
              px-4 py-2
              border
              rounded-lg
            "
          >
            Cancelar
          </button>

          <button
            className="
              bg-blue-600
              text-white
              px-4 py-2
              rounded-lg
            "
          >
            Salvar
          </button>

        </div>

      </div>

    </div>
  );
}