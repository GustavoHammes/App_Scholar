"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  User,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Card, BadgeSituacao, Spinner } from "@/components/ui";
import api from "@/lib/api";
import { Aluno, Curso, Disciplina, Nota, Professor } from "@/types";

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [totalProfessores, setTotalProfessores] = useState(0);
  const [totalCursos, setTotalCursos] = useState(0);
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
        const [alunos, professores, cursos, disciplinas] = await Promise.all([
          api.get<Aluno[]>("/alunos"),
          api.get<Professor[]>("/professores"),
          api.get<Curso[]>("/cursos"),
          api.get<Disciplina[]>("/disciplinas"),
        ]);

        setTotalAlunos(alunos.data.length);
        setTotalProfessores(professores.data.length);
        setTotalCursos(cursos.data.length);
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

  if (carregando) return <Spinner />;

  const notasComMedia = notas.filter((n) => n.media != null);
  const mediaGeral =
    notasComMedia.length > 0
      ? (
          notasComMedia.reduce((s, n) => s + (n.media ?? 0), 0) /
          notasComMedia.length
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-800 p-6 text-white shadow-sm">
        <p className="text-sm text-slate-300">Bem-vindo(a) de volta,</p>
        <h1 className="mt-1 text-2xl font-bold">{usuario?.nome}</h1>
        <p className="mt-2 text-sm text-slate-300">
          {usuario?.perfil === "ADMIN" && "Você tem acesso completo ao sistema."}
          {usuario?.perfil === "PROFESSOR" && "Gerencie suas turmas e notas por aqui."}
          {usuario?.perfil === "ALUNO" &&
            `Matrícula: ${alunoAtual?.matricula ?? "—"} · ${alunoAtual?.curso?.nome ?? ""}`}
        </p>
      </section>

      {usuario?.perfil === "ADMIN" && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard icone={Users} titulo="Total de alunos" valor={totalAlunos} href="/dashboard/alunos" cor="blue" />
            <StatCard icone={User} titulo="Professores" valor={totalProfessores} href="/dashboard/professores" cor="violet" />
            <StatCard icone={GraduationCap} titulo="Cursos" valor={totalCursos} href="/dashboard/cursos" cor="blue" />
            <StatCard icone={BookOpen} titulo="Disciplinas" valor={totalDisciplinas} href="/dashboard/disciplinas" cor="emerald" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AcaoRapida href="/dashboard/alunos" icone={Users} titulo="Gerenciar Alunos" descricao="Cadastrar, editar e desativar alunos" />
            <AcaoRapida href="/dashboard/professores" icone={User} titulo="Gerenciar Professores" descricao="Cadastrar e editar professores" />
            <AcaoRapida href="/dashboard/cursos" icone={GraduationCap} titulo="Gerenciar Cursos" descricao="Cadastrar, editar e remover cursos" />
            <AcaoRapida href="/dashboard/disciplinas" icone={BookOpen} titulo="Gerenciar Disciplinas" descricao="Criar e editar disciplinas" />
            <AcaoRapida href="/dashboard/notas" icone={ClipboardList} titulo="Gerenciar Notas" descricao="Lançar e alterar notas de alunos" />
          </div>
        </>
      )}

      {usuario?.perfil === "PROFESSOR" && (
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard icone={Users} titulo="Alunos" valor={totalAlunos} href="/dashboard/alunos" cor="blue" />
          <StatCard icone={BookOpen} titulo="Disciplinas" valor={totalDisciplinas} href="/dashboard/disciplinas" cor="emerald" />
          <AcaoRapida href="/dashboard/notas" icone={ClipboardList} titulo="Lançar Notas" descricao="Registrar notas dos alunos" />
        </div>
      )}

      {usuario?.perfil === "ALUNO" && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Disciplinas</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{notas.length}</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Média Geral</p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  Number(mediaGeral) >= 6
                    ? "text-emerald-600"
                    : Number(mediaGeral) >= 4
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {mediaGeral ?? "—"}
              </p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Aprovações</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {notas.filter((n) => n.situacao === "Aprovado").length}/{notas.length}
              </p>
            </Card>
          </div>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Desempenho por Disciplina</h2>
              <Link href="/dashboard/boletim" className="text-sm font-medium text-blue-600 hover:underline">
                Ver boletim completo →
              </Link>
            </div>

            {notas.length > 0 ? (
              <div className="space-y-3">
                {notas.slice(0, 5).map((nota) => (
                  <div key={nota.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <p className="font-medium text-slate-900">{nota.disciplina?.nome ?? "Disciplina"}</p>
                      <p className="text-xs text-slate-500">
                        Nota 1: {nota.nota1 ?? "—"} · Nota 2: {nota.nota2 ?? "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{nota.media ?? "—"}</p>
                      <BadgeSituacao situacao={nota.situacao} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <FileText className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="font-medium text-slate-600">Nenhuma nota lançada ainda</p>
                <p className="text-sm text-slate-400">As notas aparecerão aqui quando forem lançadas pelos professores.</p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({
  icone: Icone,
  titulo,
  valor,
  href,
  cor,
}: {
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
      <Card className="transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{valor}</p>
          </div>
          <div className={`rounded-lg p-3 ${cores[cor]}`}>
            <Icone size={22} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function AcaoRapida({
  href,
  icone: Icone,
  titulo,
  descricao,
}: {
  href: string;
  icone: React.ElementType;
  titulo: string;
  descricao: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
        <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
          <Icone size={20} />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{titulo}</p>
          <p className="text-sm text-slate-500">{descricao}</p>
        </div>
      </Card>
    </Link>
  );
}
