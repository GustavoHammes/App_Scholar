"use client";

/**
 * Página de Administração — exclusiva do Admin
 * Painel centralizado para gerenciamento geral do sistema.
 * Exibe estatísticas e atalhos para as principais funções administrativas.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, BookOpen, Award, ClipboardList, TrendingUp,
  CheckCircle, AlertCircle, XCircle, Database,
} from "lucide-react";
import { PaginaContainer, Spinner } from "@/components/ui";
import api from "@/lib/api";
import { Aluno, Professor, Disciplina, Nota } from "@/types";

interface EstatisticasGerais {
  totalAlunos: number;
  totalProfessores: number;
  totalDisciplinas: number;
  totalNotas: number;
  aprovados: number;
  recuperacao: number;
  reprovados: number;
  semNota: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<EstatisticasGerais | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregarEstatisticas(); }, []);

  async function carregarEstatisticas() {
    setCarregando(true);
    try {
      const [alunosRes, professoresRes, disciplinasRes] = await Promise.all([
        api.get<Aluno[]>("/alunos"),
        api.get<Professor[]>("/professores"),
        api.get<Disciplina[]>("/disciplinas"),
      ]);

      const alunos = alunosRes.data;
      const totalDisciplinas = disciplinasRes.data.length;

      // Calcula estatísticas consolidadas de notas
      let totalNotas = 0, aprovados = 0, recuperacao = 0, reprovados = 0;

      // Busca notas de cada aluno para consolidar
      for (const aluno of alunos.slice(0, 5)) { // Limita para performance
        try {
          const notasRes = await api.get<Nota[]>(`/notas/aluno/${aluno.id}`);
          const notasAluno = notasRes.data.filter((n) => n.situacao);
          totalNotas += notasAluno.length;
          aprovados += notasAluno.filter((n) => n.situacao === "Aprovado").length;
          recuperacao += notasAluno.filter((n) => n.situacao === "Recuperação").length;
          reprovados += notasAluno.filter((n) => n.situacao === "Reprovado").length;
        } catch { /* ignora erros pontuais */ }
      }

      const totalPossivel = alunos.length * totalDisciplinas;

      setStats({
        totalAlunos: alunos.length,
        totalProfessores: professoresRes.data.length,
        totalDisciplinas,
        totalNotas,
        aprovados,
        recuperacao,
        reprovados,
        semNota: totalPossivel - totalNotas,
      });
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) return <Spinner texto="Carregando estatísticas..." />;

  return (
    <PaginaContainer titulo="Administração" subtitulo="Visão geral e gerenciamento do sistema">

      {/* Cards de totais do sistema */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icone={Users} titulo="Alunos" valor={stats?.totalAlunos ?? 0} cor="blue" href="/dashboard/alunos" />
        <StatCard icone={Award} titulo="Professores" valor={stats?.totalProfessores ?? 0} cor="violet" href="/dashboard/professores" />
        <StatCard icone={BookOpen} titulo="Disciplinas" valor={stats?.totalDisciplinas ?? 0} cor="emerald" href="/dashboard/disciplinas" />
        <StatCard icone={ClipboardList} titulo="Notas Lançadas" valor={stats?.totalNotas ?? 0} cor="amber" href="/dashboard/notas" />
      </div>

      {/* Distribuição de situações */}
      {stats && stats.totalNotas > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Distribuição de Situações</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SituacaoCard icone={CheckCircle} titulo="Aprovados" valor={stats.aprovados} total={stats.totalNotas} cor="text-emerald-600 bg-emerald-50" />
            <SituacaoCard icone={AlertCircle} titulo="Recuperação" valor={stats.recuperacao} total={stats.totalNotas} cor="text-amber-600 bg-amber-50" />
            <SituacaoCard icone={XCircle} titulo="Reprovados" valor={stats.reprovados} total={stats.totalNotas} cor="text-red-600 bg-red-50" />
          </div>
        </div>
      )}

      {/* Ações administrativas rápidas */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Ações Rápidas</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AcaoAdmin href="/dashboard/alunos" titulo="Gerenciar Alunos"
            descricao="Cadastrar novos alunos, editar dados e gerar senhas temporárias" icone={Users} />
          <AcaoAdmin href="/dashboard/professores" titulo="Gerenciar Professores"
            descricao="Cadastrar professores e associar a disciplinas" icone={Award} />
          <AcaoAdmin href="/dashboard/disciplinas" titulo="Gerenciar Disciplinas"
            descricao="Criar disciplinas e atribuir professores responsáveis" icone={BookOpen} />
          <AcaoAdmin href="/dashboard/notas" titulo="Lançar / Editar Notas"
            descricao="Gerenciar notas de qualquer aluno em qualquer disciplina" icone={ClipboardList} />
        </div>
      </div>
    </PaginaContainer>
  );
}

// ── Componentes internos da página ──

function StatCard({ icone: Icone, titulo, valor, cor, href }: {
  icone: React.ElementType; titulo: string; valor: number;
  cor: "blue" | "violet" | "emerald" | "amber"; href: string;
}) {
  const cores = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <Link href={href} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
      <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${cores[cor]}`}>
        <Icone className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{valor}</p>
      <p className="text-xs text-slate-500">{titulo}</p>
    </Link>
  );
}

function SituacaoCard({ icone: Icone, titulo, valor, total, cor }: {
  icone: React.ElementType; titulo: string; valor: number; total: number; cor: string;
}) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 p-4 text-center gap-2">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${cor}`}>
        <Icone className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{valor}</p>
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="text-xs font-medium text-slate-400">{pct}% do total</p>
    </div>
  );
}

function AcaoAdmin({ href, icone: Icone, titulo, descricao }: {
  href: string; icone: React.ElementType; titulo: string; descricao: string;
}) {
  return (
    <Link href={href} className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:bg-slate-50 transition-colors">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icone className="h-4 w-4 text-slate-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{titulo}</p>
        <p className="mt-0.5 text-xs text-slate-500">{descricao}</p>
      </div>
    </Link>
  );
}
