"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, BookOpen, ClipboardList, FileText, TrendingUp, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, BadgeSituacao, Spinner } from "@/components/ui";
import api from "@/lib/api";
import { Aluno, Disciplina, Professor, Nota } from "@/types";

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [totalProfessores, setTotalProfessores] = useState(0);
  const [totalDisciplinas, setTotalDisciplinas] = useState(0);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [alunoAtual, setAlunoAtual] = useState<Aluno | null>(null);

  useEffect(() => {
    if (!usuario) return;
    carregarDados();
  }, [usuario]);

  async function carregarDados() {
    setCarregando(true);
    try {
      if (usuario?.perfil === "ADMIN") {
        const [alunos, professores, disciplinas] = await Promise.all([
          api.get<Aluno[]>("/alunos"),
          api.get<Professor[]>("/professores"),
          api.get<Disciplina[]>("/disciplinas"),
        ]);
        setTotalAlunos(alunos.data.length);
        setTotalProfessores(professores.data.length);
        setTotalDisciplinas(disciplinas.data.length);

      } else if (usuario?.perfil === "PROFESSOR") {
        const [alunos, disciplinas] = await Promise.all([
          api.get<Aluno[]>("/alunos"),
          api.get<Disciplina[]>("/disciplinas"),
        ]);
        setTotalAlunos(alunos.data.length);
        setTotalDisciplinas(disciplinas.data.length);

      } else if (usuario?.perfil === "ALUNO") {
        const alunosRes = await api.get<Aluno[]>("/alunos");
        const meuAluno = alunosRes.data[0];
        if (!meuAluno) return;
        setAlunoAtual(meuAluno);
        const notasRes = await api.get<Nota[]>(`/notas/aluno/${meuAluno.id}`);
        setNotas(notasRes.data);
      }
    } catch (error) {
      console.error("[DASHBOARD] Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) return <Spinner texto="Carregando painel..." />;

  const notasComMedia = notas.filter((n) => n.media != null);
  const mediaGeral = notasComMedia.length > 0
    ? (notasComMedia.reduce((s, n) => s + (n.media ?? 0), 0) / notasComMedia.length).toFixed(1)
    : null;

  return (
    <div className="flex flex-col gap-6">

      {/* Banner de boas-vindas */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
        <p className="text-sm font-medium text-slate-300">Bem-vindo(a) de volta,</p>
        <h1 className="mt-1 text-2xl font-bold">{usuario?.nome}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {usuario?.perfil === "ADMIN" && "Você tem acesso completo ao sistema."}
          {usuario?.perfil === "PROFESSOR" && "Gerencie suas turmas e notas por aqui."}
          {usuario?.perfil === "ALUNO" && `Matrícula: ${alunoAtual?.matricula ?? "—"} · ${alunoAtual?.curso ?? ""}`}
        </p>
      </div>

      {/* ── ADMIN ── */}
      {usuario?.perfil === "ADMIN" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icone={Users} titulo="Total de Alunos" valor={totalAlunos} href="/dashboard/alunos" cor="blue" />
            <StatCard icone={Award} titulo="Professores" valor={totalProfessores} href="/dashboard/professores" cor="violet" />
            <StatCard icone={BookOpen} titulo="Disciplinas" valor={totalDisciplinas} href="/dashboard/disciplinas" cor="emerald" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AcaoRapida href="/dashboard/alunos" icone={Users} titulo="Gerenciar Alunos" descricao="Cadastrar, editar e desativar alunos" />
            <AcaoRapida href="/dashboard/professores" icone={Award} titulo="Gerenciar Professores" descricao="Cadastrar e editar professores" />
            <AcaoRapida href="/dashboard/disciplinas" icone={BookOpen} titulo="Gerenciar Disciplinas" descricao="Criar e editar disciplinas" />
            <AcaoRapida href="/dashboard/notas" icone={ClipboardList} titulo="Gerenciar Notas" descricao="Lançar e alterar notas de alunos" />
          </div>
        </>
      )}

      {/* ── PROFESSOR ── */}
      {usuario?.perfil === "PROFESSOR" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icone={Users} titulo="Alunos nas Turmas" valor={totalAlunos} href="/dashboard/alunos" cor="blue" />
            <StatCard icone={BookOpen} titulo="Minhas Disciplinas" valor={totalDisciplinas} href="/dashboard/disciplinas" cor="emerald" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AcaoRapida href="/dashboard/notas" icone={ClipboardList} titulo="Lançar Notas" descricao="Adicionar ou alterar notas dos alunos" />
            <AcaoRapida href="/dashboard/alunos" icone={Users} titulo="Ver Alunos" descricao="Visualizar alunos das suas turmas" />
            <AcaoRapida href="/dashboard/disciplinas" icone={BookOpen} titulo="Minhas Disciplinas" descricao="Ver e editar informações das disciplinas" />
            <AcaoRapida href="/dashboard/perfil" icone={Award} titulo="Meu Perfil" descricao="Atualizar seus dados profissionais" />
          </div>
        </>
      )}

      {/* ── ALUNO ── */}
      {usuario?.perfil === "ALUNO" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Disciplinas</p>
              <p className="mt-1 text-3xl font-bold text-slate-800">{notas.length}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Média Geral</p>
              <p className={`mt-1 text-3xl font-bold ${
                !mediaGeral ? "text-slate-400"
                : Number(mediaGeral) >= 6 ? "text-emerald-600"
                : Number(mediaGeral) >= 4 ? "text-amber-600"
                : "text-red-600"
              }`}>
                {mediaGeral ?? "—"}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Aprovações</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600">
                {notas.filter((n) => n.situacao === "Aprovado").length}
                <span className="text-lg text-slate-400">/{notas.length}</span>
              </p>
            </Card>
          </div>

          {notas.length > 0 ? (
            <Card>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Desempenho por Disciplina</h3>
                </div>
                <Link href="/dashboard/boletim" className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                  Ver boletim completo →
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {notas.slice(0, 5).map((nota) => (
                  <div key={nota.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {nota.disciplina?.nome ?? "Disciplina"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Nota 1: {nota.nota1 ?? "—"} · Nota 2: {nota.nota2 ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-700">{nota.media ?? "—"}</span>
                      <BadgeSituacao situacao={nota.situacao} />
                    </div>
                  </div>
                ))}
              </div>
              {notas.length > 5 && (
                <div className="border-t border-slate-200 px-5 py-3">
                  <Link href="/dashboard/boletim" className="text-xs text-slate-500 hover:text-slate-700">
                    + {notas.length - 5} disciplinas — Ver boletim completo
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-500">Nenhuma nota lançada ainda</p>
              <p className="text-xs text-slate-400">As notas aparecerão aqui quando forem lançadas pelos professores.</p>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AcaoRapida href="/dashboard/boletim" icone={FileText} titulo="Meu Boletim" descricao="Visualizar todas as notas e situação" />
            <AcaoRapida href="/dashboard/disciplinas" icone={BookOpen} titulo="Disciplinas" descricao="Ver disciplinas e professores" />
            <AcaoRapida href="/dashboard/professores" icone={Award} titulo="Professores" descricao="Consultar dados dos professores" />
            <AcaoRapida href="/dashboard/perfil" icone={Users} titulo="Meu Perfil" descricao="Atualizar dados pessoais" />
          </div>
        </>
      )}

    </div>
  );
}

function StatCard({ icone: Icone, titulo, valor, href, cor }: {
  icone: React.ElementType;
  titulo: string;
  valor: number;
  href: string;
  cor: "blue" | "violet" | "emerald";
}) {
  const cores = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <Link href={href}>
      <Card className="p-5 hover:border-slate-300 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{titulo}</p>
            <p className="mt-1 text-3xl font-bold text-slate-800">{valor}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cores[cor]}`}>
            <Icone className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function AcaoRapida({ href, icone: Icone, titulo, descricao }: {
  href: string;
  icone: React.ElementType;
  titulo: string;
  descricao: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-4 p-4 hover:border-slate-300 transition-colors cursor-pointer">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icone className="h-4 w-4 text-slate-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{titulo}</p>
          <p className="truncate text-xs text-slate-500">{descricao}</p>
        </div>
      </Card>
    </Link>
  );
}