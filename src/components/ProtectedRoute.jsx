import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const usuario =
        localStorage.getItem("usuarioLogado");

    if (!usuario) {

        return (
            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-slate-50
                    px-6
                "
            >

                <div
                    className="
                        bg-white
                        rounded-2xl
                        shadow-lg
                        p-8
                        text-center
                        max-w-md
                    "
                >

                    <h1
                        className="
                            text-2xl
                            font-bold
                            text-slate-800
                            mb-3
                        "
                    >
                        Você não está logado
                    </h1>

                    <p className="text-slate-500 mb-6"> Faça login para acessar o sistema Vitta.</p>

                    <button
                        onClick={() =>
                            window.location.href = "/"
                        }
                        className="
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            px-6
                            py-2
                            rounded-lg
                            transition
                        "
                    >
                        Login →
                    </button>
                </div>
            </div>
        );
    }


    return children;
}