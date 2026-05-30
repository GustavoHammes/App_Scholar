"use client";

/**
 * Boletim do Aluno — redesenhado com cards por semestre
 * Semestre atual: expandido por padrão
 * Semestres anteriores: colapsáveis como histórico
 */

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BadgeSituacao, Spinner, EstadoVazio } from "@/components/ui";
import api from "@/lib/api";
import { Aluno, Nota } from "@/types";

export default function BoletimPage() {
  const { usuario } = useAuth();
  const [alunoAtual, setAlunoAtual] = useState<Aluno | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [carregando, setCarregando] = useState(true);
  // Controla quais semestres do histórico estão expandidos
  const [semestresAbertos, setSemestresAbertos] = useState<Set<number>>(new Set());

  useEffect(() => { carregarBoletim(); }, []);

  async function carregarBoletim() {
    try {
      const alunosRes = await api.get<Aluno[]>("/alunos");
      const aluno = alunosRes.data[0];
      if (aluno) {
        setAlunoAtual(aluno);
        const notasRes = await api.get<Nota[]>(`/notas/aluno/${aluno.id}`);
        setNotas(notasRes.data);
      }
    } finally {
      setCarregando(false);
    }
  }

  function toggleSemestre(sem: number) {
    setSemestresAbertos((prev) => {
      const novo = new Set(prev);
      novo.has(sem) ? novo.delete(sem) : novo.add(sem);
      return novo;
    });
  }

  if (carregando) return <Spinner texto="Carregando boletim..." />;

  // Separa notas do semestre atual das anteriores usando o campo ativo da disciplina
  const notasAtuais    = notas.filter((n) => n.disciplina?.ativo === true);
  const notasAnteriores = notas.filter((n) => n.disciplina?.ativo === false);

  // Agrupa as notas anteriores por semestre
  const porSemestre = notasAnteriores.reduce<Record<number, Nota[]>>((acc, n) => {
    const sem = n.disciplina?.semestre ?? 0;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(n);
    return acc;
  }, {});
  const semestresAnteriores = Object.keys(porSemestre).map(Number).sort((a, b) => b - a);

  // Totais gerais para o resumo
  const todasNotas     = notas.filter((n) => n.situacao);
  const aprovadas      = todasNotas.filter((n) => n.situacao === "Aprovado").length;
  const recuperacao    = todasNotas.filter((n) => n.situacao === "Recuperação").length;
  const reprovadas     = todasNotas.filter((n) => n.situacao === "Reprovado").length;
  const mediaGeral     = todasNotas.length > 0
    ? (todasNotas.reduce((s, n) => s + (n.media ?? 0), 0) / todasNotas.length).toFixed(1)
    : null;

  return (
    <div className="flex flex-col gap-6">

      {/* Banner do aluno */}
      {alunoAtual && (
        <div className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 p-5 text-white flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Aluno</p>
            <h2 className="mt-1 text-xl font-bold">{alunoAtual.nome}</h2>
            <p className="text-sm text-slate-300 mt-0.5">
              Matrícula: <span className="font-mono font-semibold">{alunoAtual.matricula}</span>
            </p>
            <p className="text-sm text-slate-400">{alunoAtual.curso}</p>
          </div>
          {mediaGeral && (
            <div className="flex flex-col items-center rounded-xl bg-white/10 px-5 py-3 text-center flex-shrink-0">
              <p className="text-xs text-slate-400">Média Geral</p>
              <p className={`text-3xl font-bold mt-1 ${Number(mediaGeral) >= 6 ? "text-emerald-400" : Number(mediaGeral) >= 4 ? "text-amber-400" : "text-red-400"}`}>
                {mediaGeral}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Resumo geral */}
      {todasNotas.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <ResumoCard titulo="Total" valor={todasNotas.length} cor="text-slate-700" icone={BookOpen} />
          <ResumoCard titulo="Aprovadas" valor={aprovadas} cor="text-emerald-600" icone={CheckCircle} />
          <ResumoCard titulo="Recuperação" valor={recuperacao} cor="text-amber-600" icone={Clock} />
          <ResumoCard titulo="Reprovadas" valor={reprovadas} cor="text-red-600" icone={XCircle} />
        </div>
      )}

      {notas.length === 0 && (
        <EstadoVazio icone={BookOpen} titulo="Nenhuma nota lançada ainda"
          descricao="Suas notas aparecerão aqui quando forem lançadas pelos professores." />
      )}

      {/* ── SEMESTRE EM ANDAMENTO ─────────────────────── */}
      {notasAtuais.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
              Semestre em andamento
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {notasAtuais.map((nota) => (
              <CardDisciplinaAtual key={nota.id} nota={nota} />
            ))}
          </div>
        </div>
      )}

      {/* ── HISTÓRICO ACADÊMICO ───────────────────────── */}
      {semestresAnteriores.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Histórico acadêmico
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {semestresAnteriores.map((sem) => {
              const notasSem = porSemestre[sem];
              const aberto = semestresAbertos.has(sem);
              const medSem = notasSem.filter((n) => n.media).length > 0
                ? (notasSem.reduce((s, n) => s + (n.media ?? 0), 0) / notasSem.filter((n) => n.media).length).toFixed(1)
                : null;
              const aprovSem = notasSem.filter((n) => n.situacao === "Aprovado").length;
              const reprovSem = notasSem.filter((n) => n.situacao === "Reprovado").length;
              const recupSem = notasSem.filter((n) => n.situacao === "Recuperação").length;

              return (
                <div key={sem} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  {/* Cabeçalho clicável do semestre */}
                  <button
                    onClick={() => toggleSemestre(sem)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <span className="text-sm font-bold text-slate-600">{sem}º</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-800">{sem}º Semestre</p>
                        <p className="text-xs text-slate-500">
                          {notasSem.length} disciplina(s) · {aprovSem} aprovado(s)
                          {recupSem > 0 && ` · ${recupSem} recuperação`}
                          {reprovSem > 0 && ` · ${reprovSem} reprovado(s)`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {medSem && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Média do semestre</p>
                          <p className={`text-lg font-bold ${Number(medSem) >= 6 ? "text-emerald-600" : Number(medSem) >= 4 ? "text-amber-600" : "text-red-600"}`}>
                            {medSem}
                          </p>
                        </div>
                      )}
                      {aberto
                        ? <ChevronUp className="h-4 w-4 text-slate-400" />
                        : <ChevronDown className="h-4 w-4 text-slate-400" />
                      }
                    </div>
                  </button>

                  {/* Tabela expandida */}
                  {aberto && (
                    <div className="border-t border-slate-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            {["Disciplina", "Professor", "N1", "N2", "Média", "Situação"].map((h) => (
                              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {notasSem.map((nota) => (
                            <tr key={nota.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-800">{nota.disciplina?.nome ?? "—"}</td>
                              <td className="px-4 py-3 text-slate-500 text-xs">{nota.disciplina?.professor?.nome ?? "—"}</td>
                              <td className="px-4 py-3 font-mono text-center">{nota.nota1 ?? "—"}</td>
                              <td className="px-4 py-3 font-mono text-center">{nota.nota2 ?? "—"}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-bold ${!nota.media ? "text-slate-400" : nota.media >= 6 ? "text-emerald-600" : nota.media >= 4 ? "text-amber-600" : "text-red-600"}`}>
                                  {nota.media ?? "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3"><BadgeSituacao situacao={nota.situacao} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Card para disciplina do semestre atual
function CardDisciplinaAtual({ nota }: { nota: Nota }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {nota.disciplina?.nome ?? "—"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Prof. {nota.disciplina?.professor?.nome ?? "—"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {nota.disciplina?.cargaHoraria}h · {nota.disciplina?.semestre}º semestre
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-2xl font-bold ${!nota.media ? "text-slate-400" : nota.media >= 6 ? "text-emerald-600" : nota.media >= 4 ? "text-amber-600" : "text-red-600"}`}>
            {nota.media ?? "—"}
          </span>
          <BadgeSituacao situacao={nota.situacao} />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-xs text-slate-500">
        <span>Nota 1: <span className="font-semibold text-slate-700">{nota.nota1 ?? "—"}</span></span>
        <span>Nota 2: <span className="font-semibold text-slate-700">{nota.nota2 ?? "—"}</span></span>
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor, cor, icone: Icone }: {
  titulo: string; valor: number; cor: string; icone: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <Icone className={`mx-auto h-4 w-4 mb-1 ${cor}`} />
      <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
      <p className="text-xs text-slate-500 mt-0.5">{titulo}</p>
    </div>
  );
}