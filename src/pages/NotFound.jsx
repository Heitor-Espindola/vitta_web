import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { StatePanel } from "../components/ui";

export default function NotFound() {
  return (
    <StatePanel
      tone="error"
      title="Página não encontrada"
      description="O endereço acessado não existe no painel Vitta."
      action={
        <Link className="button button--primary" to="/">
          <ArrowLeft size={17} /> Voltar ao dashboard
        </Link>
      }
    />
  );
}
