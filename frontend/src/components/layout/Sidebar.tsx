"use client";

/**
 * Sidebar de Navegação
 * Exibe apenas os itens de menu correspondentes ao perfil do usuário logado.
 * Admin vê tudo | Professor vê seus menus | Aluno vê os menus de aluno.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  User,
  LogOut,
  ChevronRight,
  Settings,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Perfil } from "@/types";

// Define um item do menu com seus metadados
interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  perfisPermitidos: Perfil[]; // Quais perfis podem ver este item
}

// Todos os itens de menu do sistema
// Cada rota é visível apenas para os perfis listados em perfisPermitidos
const MENU_ITEMS: MenuItem[] = [
  {
    label: "Painel",
    href: "/dashboard",
    icon: BarChart3,
    perfisPermitidos: ["ADMIN", "PROFESSOR", "ALUNO"],
  },
  {
    label: "Alunos",
    href: "/dashboard/alunos",
    icon: Users,
    perfisPermitidos: ["ADMIN", "PROFESSOR"],
  },
  {
    label: "Professores",
    href: "/dashboard/professores",
    icon: User,
    perfisPermitidos: ["ADMIN", "ALUNO"],
  },
  {
    label: "Disciplinas",
    href: "/dashboard/disciplinas",
    icon: BookOpen,
    perfisPermitidos: ["ADMIN", "PROFESSOR", "ALUNO"],
  },
  {
    label: "Lançar Notas",
    href: "/dashboard/notas",
    icon: ClipboardList,
    perfisPermitidos: ["ADMIN", "PROFESSOR"],
  },
  {
    label: "Meu Boletim",
    href: "/dashboard/boletim",
    icon: FileText,
    perfisPermitidos: ["ALUNO"],
  },
  {
    label: "Administração",
    href: "/dashboard/admin",
    icon: Settings,
    perfisPermitidos: ["ADMIN"],
  },
  {
    label: "Meu Perfil",
    href: "/dashboard/perfil",
    icon: User,
    perfisPermitidos: ["ADMIN", "PROFESSOR", "ALUNO"],
  },
];

export function Sidebar() {
  const { usuario, logout } = useAuth();
  const pathname = usePathname();

  if (!usuario) return null;

  // Filtra apenas os itens que o perfil do usuário pode ver
  const itensFiltrados = MENU_ITEMS.filter((item) =>
    item.perfisPermitidos.includes(usuario.perfil)
  );

  // Exibe um badge com o nome do perfil de forma amigável
  const labelPerfil = {
    ADMIN: "Administrador",
    PROFESSOR: "Professor",
    ALUNO: "Aluno",
  }[usuario.perfil];

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-800 text-white">
      {/* Cabeçalho da sidebar com logo e nome do sistema */}
      <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">App Scholar</p>
          <p className="mt-0.5 text-xs text-slate-400">FATEC Jacareí</p>
        </div>
      </div>

      {/* Área de navegação — crescente para empurrar o rodapé para baixo */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {itensFiltrados.map((item) => {
            const Icon = item.icon;
            // Destaca o item ativo com base na URL atual
            const estaAtivo =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    estaAtivo
                      ? "bg-slate-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {estaAtivo && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé com dados do usuário e botão de logout */}
      <div className="border-t border-slate-700 p-4">
        <div className="mb-3 flex items-center gap-3">
          {/* Avatar inicial do nome */}
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-600 text-xs font-medium">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {usuario.nome}
            </p>
            <p className="text-xs text-slate-400">{labelPerfil}</p>
          </div>
        </div>

        {/* Botão de logout */}
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
