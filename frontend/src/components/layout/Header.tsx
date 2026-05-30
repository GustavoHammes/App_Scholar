"use client";

/**
 * Header principal do dashboard
 * Exibe mensagem de boas-vindas personalizada com o nome do usuário logado
 * e um breadcrumb dinâmico baseado na rota atual.
 */

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Mapeamento de rotas para nomes legíveis no breadcrumb
const ROTA_LABELS: Record<string, string> = {
  "/dashboard": "Painel",
  "/dashboard/alunos": "Alunos",
  "/dashboard/professores": "Professores",
  "/dashboard/disciplinas": "Disciplinas",
  "/dashboard/notas": "Lançar Notas",
  "/dashboard/boletim": "Meu Boletim",
  "/dashboard/perfil": "Meu Perfil",
  "/dashboard/admin": "Administração",
};

// Saudação baseada no horário atual do servidor
function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function Header() {
  const { usuario } = useAuth();
  const pathname = usePathname();

  if (!usuario) return null;

  const tituloAtual = ROTA_LABELS[pathname] ?? "App Scholar";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Título da página atual */}
      <div>
        <h2 className="text-base font-semibold text-slate-800">{tituloAtual}</h2>
        <p className="text-xs text-slate-500">
          {getSaudacao()}, <span className="font-medium text-slate-700">{usuario.nome}</span>!
        </p>
      </div>

      {/* Área direita: badge de perfil e ícone de notificação (visual) */}
      <div className="flex items-center gap-3">
        {/* Badge do perfil do usuário */}
        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:inline">
          {
            { ADMIN: "Administrador", PROFESSOR: "Professor", ALUNO: "Aluno" }[
              usuario.perfil
            ]
          }
        </span>

        {/* Ícone de notificações (estrutural — sem funcionalidade de push nesta versão) */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
