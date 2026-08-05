import React from "react";
import { useNavigate } from "react-router-dom";

import isotipo from "../assets/isotipo.png";
import isologo from "../assets/isologo.png";

import {
    Users,
    Syringe,
    FileText,
    ShieldCheck,
} from "lucide-react";

const funcionalidades = [
    {
        img: <Users />,
        titulo: "Gestão de Pacientes",
        descricao: "Cadastro completo de pacientes, histórico e acompanhamento da vacinação."
    },
    {
        img: <Syringe />,
        titulo: "Controle de Vacinas",
        descricao: "Gerencie lotes, estoque, validade e disponibilidade das vacinas."
    },
    {
        img: <FileText />,
        titulo: "Aplicações e Relatórios",
        descricao: "Registre aplicações e acompanhe indicadores da unidade de saúde."
    },
    {
        img: <ShieldCheck />,
        titulo: "Segurança",
        descricao: "Autenticação via Firebase e armazenamento seguro das informações."
    }
];

export default function Welcome() {
    const navigate = useNavigate();

    function acessarSistema() {
        navigate("/login");
    }

    return (
        <div
            className="
            min-h-screen
            bg-gradient-to-br
            from-slate-50
            via-white
            to-blue-50
            flex
            flex-col
            "
        >

            <header className="flex items-center justify-between px-8 py-5">
                <div className="flex items-center gap-3">
                    <img
                        src={isologo}
                        alt="Vitta"
                        className="w-12 h-12"
                    />

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Vitta
                        </h1>

                        <p className="text-xs text-slate-500=">
                            Plataforma Administrativa
                        </p>
                    </div>
                </div>

                <button onClick={acessarSistema} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition">
                    Entrar
                </button>
            </header>

            <main className="flex-1 flex items-center justify-center px-8">
                <div className="max-w-6xl w-full">
                    <div className="text-center max-w-3xl mx-auto">
                        <img
                            src={isotipo}
                            alt="Vitta"
                            className="w-24 h-24 ml-auto mr-auto mb-6"
                        />
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
                            Sistema de Gestão de Vacinação
                        </span>

                        <h2 className="text-5xl font-bold text-slate-800 leading-tight">
                            Gestão inteligente para clínicas, UBSs e unidades de vacinação
                        </h2>

                        <p className="text-slate-600 text-lg mt-6 leading-relaxed">
                            Organize pacientes, controle estoques, registre aplicações, acompanhe indicadores e mantenha todo o processo de vacinação em uma única plataforma.
                        </p>

                        <button onClick={acessarSistema} className="mt-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
                            Acessar Plataforma
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-20">
                        {funcionalidades.map((item) => (
                            <div key={item.titulo} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                                    {item.img}
                                </div>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                                    {item.titulo}
                                </h3>

                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {item.descricao}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </main>

            <footer className="border-t border-slate-200 text-center py-6 text-sm text-slate-500">
                Vitta © {new Date().getFullYear()} — Plataforma administrativa de vacinação
            </footer>
        </div>
    );
}