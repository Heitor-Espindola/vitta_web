export default function Pacientes() {
  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Pacientes
        </h1>
        <p className="text-slate-500">
          Gerencie os pacientes cadastrados
        </p>
      </div>
      {/* Barra superior */}
      <div className="flex justify-between items-center">
        <input type="text" placeholder="Pesquisar paciente..." className="border border-slate-300 rounded-lg px-4 py-2 w-80"/>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          + Novo Paciente
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">
                Nome
              </th>
              <th className="text-left p-4">
                CPF
              </th>
              <th className="text-left p-4">
                Nascimento
              </th>
              <th className="text-left p-4">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-4">
                João Silva
              </td>
              <td className="p-4">
                123.456.789-00
              </td>
              <td className="p-4">
                12/05/2010
              </td>
              <td className="p-4">
                <button className="text-blue-600 mr-3">
                  Editar
                </button>
                <button className="text-red-600">
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}