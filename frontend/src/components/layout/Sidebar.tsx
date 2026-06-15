"use client";

/**
 * Sidebar de Navegação
 * Exibe apenas os itens de menu correspondentes ao perfil do usuário logado.
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

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  perfisPermitidos: Perfil[];
}

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
    label: "Cursos",
    href: "/dashboard/cursos",
    icon: GraduationCap,
    perfisPermitidos: ["ADMIN"],
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

  const itensFiltrados = MENU_ITEMS.filter((item) =>
    item.perfisPermitidos.includes(usuario.perfil)
  );

  const labelPerfil = {
    ADMIN: "Administrador",
    PROFESSOR: "Professor",
    ALUNO: "Aluno",
  }[usuario.perfil];

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700">
          <GraduationCap size={20} />
        </div>
        <div>
          <p className="font-bold leading-tight">App Scholar</p>
          <p className="text-xs text-slate-400">FATEC Jacareí</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {itensFiltrados.map((item) => {
          const Icon = item.icon;
          const estaAtivo =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                estaAtivo
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {item.label}
              </span>
              {estaAtivo && <ChevronRight size={16} />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-bold">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{usuario.nome}</p>
            <p className="text-xs text-slate-400">{labelPerfil}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={16} />
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
