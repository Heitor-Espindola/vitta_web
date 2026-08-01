import React, { useState } from "react";
import { auth, db } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {

    e.preventDefault();

    if (!email.trim() || !senha.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    setCarregando(true);

    try {
      const credencial =
        await signInWithEmailAndPassword(
          auth,
          email,
          senha
        );

      const uid = credencial.user.uid;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Usuário não encontrado.");
        return;
      }

      const usuario = {
        uid,
        ...docSnap.data()
      };

      if (usuario.role !== "health_professional") {
        alert("Esta conta não possui acesso ao sistema web.");
        return;
      }

      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuario)
      );

      navigate("/home", { replace: true });
    } catch (erro) {
      console.error(erro);

      if (erro.code === "auth/invalid-credential") {
        alert("E-mail ou senha incorretos.");
      } else if (erro.code === "auth/user-not-found") {
        alert("Usuário não encontrado.");
      } else if (erro.code === "auth/wrong-password") {
        alert("Senha incorreta.");
      } else {
        alert("Não foi possível conectar ao Firebase.");
      }

    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      className="
        min-h-screen
        bg-linear-to-br
        from-slate-50
        via-white
        to-blue-50
        flex
        items-center
        justify-center
        px-6
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          shadow-lg
          w-full
          max-w-md
          p-8
        "
      >
        <div className="text-center mb-8">
          <div
            className="
              w-14
              h-14
              bg-blue-600
              rounded-2xl
              flex
              items-center
              justify-center
              mx-auto
              mb-4
            "
          >
            <span className="text-white text-2xl">
              ♥
            </span>
          </div>

          <h1
            className="
              text-3xl
              font-bold
              text-slate-800
            "
          >
            Vitta
          </h1>

          <p className="text-slate-500 mt-2">
            Plataforma de gestão de vacinação
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
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
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="seu@email.com"
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-4
                py-2.5
                outline-none
                focus:ring-2
                focus:ring-blue-500
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
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
              placeholder="Digite sua senha"
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-4
                py-2.5
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-blue-400
              text-white
              font-medium
              py-2.5
              rounded-lg
              transition
            "
          >
            {carregando
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>

        <p
          className="
            text-center
            text-xs
            text-slate-400
            mt-6
          "
        >
          Vitta © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}