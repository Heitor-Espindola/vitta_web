import { Database, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { PageHeader, StatusBadge } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Config() {
  const { profile, firebaseUser, logout, isAdmin } = useAuth();
  const name = profile?.fullName || profile?.name || "Profissional Vitta";
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Conta e segurança" title="Configurações" description="Informações reais da sessão e do ambiente conectado." />
      <section className="settings-grid">
        <article className="content-card profile-card">
          <span className="profile-card__avatar"><UserRound /></span>
          <div><h2>{name}</h2><p>{profile?.email || firebaseUser.email}</p><StatusBadge status="active">Conta ativa</StatusBadge></div>
        </article>
        <article className="content-card settings-list">
          <header className="card-header"><div><span className="eyebrow">Perfil</span><h2>Acesso profissional</h2></div><ShieldCheck /></header>
          <dl>
            <div><dt><Mail /> E-mail</dt><dd>{profile?.email || firebaseUser.email}</dd></div>
            <div><dt><ShieldCheck /> Permissão</dt><dd>{isAdmin ? "Administrador" : "Profissional de saúde"}</dd></div>
            <div><dt><Database /> Firebase</dt><dd>vitta-5ec1e</dd></div>
          </dl>
        </article>
        <article className="content-card session-card">
          <div><span className="feature-icon"><LogOut /></span><h2>Encerrar sessão</h2><p>Remove a sessão persistida deste navegador e encerra o acesso aos dados.</p></div>
          <button className="button button--danger" type="button" onClick={logout}><LogOut size={18} /> Sair do Vitta</button>
        </article>
      </section>
    </div>
  );
}
