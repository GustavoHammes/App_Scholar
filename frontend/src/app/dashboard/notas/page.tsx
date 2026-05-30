"use client";

/**
 * Página de Lançamento de Notas
 * Professor e Admin: selecionar disciplina → ver alunos → lançar/alterar notas
 * O cálculo de média e situação é feito automaticamente no backend.
 */

import { useEffect, useState } from "react";
import { ClipboardList, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PaginaContainer, BadgeSituacao, EstadoVazio, Spinner } from "@/components/ui";
import api from "@/lib/api";
import { Disciplina, Aluno, Nota } from "@/types";

export default function NotasPage() {
  const { usuario } = useAuth();

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);

  // Mapa de valores editados em tempo real: { alunoId: { nota1, nota2 } }
  const [edicoes, setEdicoes] = useState<Record<number, { nota1: string; nota2: string }>>({});
  const [salvandoId, setSalvandoId] = useState<number | null>(null);

  useEffect(() => { carregarDisciplinas(); }, []);

  async function carregarDisciplinas() {
  setCarregando(true);
  try {
    const res = await api.get<Disciplina[]>("/disciplinas");
    // Professor e Admin só veem disciplinas do semestre atual para lançar notas
    // Semestres encerrados têm notas bloqueadas no backend
    const apenasAtivas = res.data.filter((d) => d.ativo);
    setDisciplinas(apenasAtivas);
  } catch {
    toast.error("Erro ao carregar disciplinas");
  } finally {
    setCarregando(false);
  }
}

  // Carrega alunos e notas quando uma disciplina é selecionada
  async function selecionarDisciplina(id: number) {
    setDisciplinaId(id);
    setCarregandoAlunos(true);
    setEdicoes({});

    try {
      const [alunosRes, notasRes] = await Promise.all([
        api.get<Aluno[]>("/alunos"),
        api.get<Nota[]>(`/notas/disciplina/${id}`),
      ]);

      setAlunos(alunosRes.data);
      setNotas(notasRes.data);

      // Pré-preenche o mapa de edições com os valores existentes
      const mapaEdicoes: Record<number, { nota1: string; nota2: string }> = {};
      for (const nota of notasRes.data) {
        mapaEdicoes[nota.alunoId] = {
          nota1: nota.nota1?.toString() ?? "",
          nota2: nota.nota2?.toString() ?? "",
        };
      }
      setEdicoes(mapaEdicoes);
    } catch {
      toast.error("Erro ao carregar dados da disciplina");
    } finally {
      setCarregandoAlunos(false);
    }
  }

  // Retorna a nota existente de um aluno nesta disciplina
  function getNotaAluno(alunoId: number) {
    return notas.find((n) => n.alunoId === alunoId);
  }

  async function salvarNota(alunoId: number) {
    if (!disciplinaId) return;

    const edicao = edicoes[alunoId];
    const nota1 = edicao?.nota1 !== "" ? Number(edicao?.nota1) : undefined;
    const nota2 = edicao?.nota2 !== "" ? Number(edicao?.nota2) : undefined;

    // Validação: notas devem estar entre 0 e 10
    if (nota1 !== undefined && (nota1 < 0 || nota1 > 10)) {
      toast.error("Nota 1 deve estar entre 0 e 10"); return;
    }
    if (nota2 !== undefined && (nota2 < 0 || nota2 > 10)) {
      toast.error("Nota 2 deve estar entre 0 e 10"); return;
    }

    setSalvandoId(alunoId);
    try {
      const notaExistente = getNotaAluno(alunoId);

      if (notaExistente) {
        // Atualiza nota existente
        const res = await api.put(`/notas/${notaExistente.id}`, { nota1, nota2 });
        // Atualiza o estado local com a nota recalculada
        setNotas((prev) => prev.map((n) => n.id === notaExistente.id ? { ...n, ...res.data } : n));
      } else {
        // Cria nova nota
        const res = await api.post("/notas", { alunoId, disciplinaId, nota1, nota2 });
        setNotas((prev) => [...prev, res.data]);
      }

      toast.success("Nota salva com sucesso");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Erro ao salvar nota");
    } finally {
      setSalvandoId(null);
    }
  }

  if (carregando) return <Spinner />;

  const disciplinaSelecionada = disciplinas.find((d) => d.id === disciplinaId);

  return (
    <PaginaContainer titulo="Lançamento de Notas" subtitulo="Selecione uma disciplina para gerenciar as notas">
      {/* Seletor de disciplina */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <label className="label">Disciplina</label>
        <select
          className="input-base max-w-lg"
          value={disciplinaId ?? ""}
          onChange={(e) => e.target.value && selecionarDisciplina(Number(e.target.value))}
        >
          <p className="mt-2 text-xs text-slate-400">
  Apenas disciplinas do semestre atual são exibidas. Semestres encerrados têm notas bloqueadas.
</p>
          <option value="">Selecione uma disciplina...</option>
          {disciplinas.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome} — {d.curso} ({d.semestre}º semestre)
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de notas */}
      {disciplinaId && (
        <>
          {carregandoAlunos ? (
            <Spinner texto="Carregando alunos..." />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white">
              {/* Cabeçalho com nome da disciplina */}
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-semibold text-slate-800">{disciplinaSelecionada?.nome}</h3>
                <p className="text-xs text-slate-500">
                  Prof. {disciplinaSelecionada?.professor?.nome ?? "—"} ·
                  {disciplinaSelecionada?.cargaHoraria}h · {alunos.length} aluno(s)
                </p>
              </div>

              {alunos.length === 0 ? (
                <EstadoVazio icone={ClipboardList} titulo="Nenhum aluno encontrado" descricao="Não há alunos vinculados a esta disciplina." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aluno</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Matrícula</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nota 1</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nota 2</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Média</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Situação</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {alunos.map((aluno) => {
                        const notaAluno = getNotaAluno(aluno.id);
                        const edicao = edicoes[aluno.id] ?? { nota1: "", nota2: "" };

                        return (
                          <tr key={aluno.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-800">{aluno.nome}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{aluno.matricula}</td>

                            {/* Campo Nota 1 */}
                            <td className="px-4 py-3">
                              <input
                                type="number" min="0" max="10" step="0.1"
                                className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                                value={edicao.nota1}
                                onChange={(e) => setEdicoes((prev) => ({ ...prev, [aluno.id]: { ...prev[aluno.id], nota1: e.target.value } }))}
                                placeholder="0.0"
                              />
                            </td>

                            {/* Campo Nota 2 */}
                            <td className="px-4 py-3">
                              <input
                                type="number" min="0" max="10" step="0.1"
                                className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                                value={edicao.nota2}
                                onChange={(e) => setEdicoes((prev) => ({ ...prev, [aluno.id]: { ...prev[aluno.id], nota2: e.target.value } }))}
                                placeholder="0.0"
                              />
                            </td>

                            {/* Média calculada automaticamente (exibição somente) */}
                            <td className="px-4 py-3">
                              <span className={`text-base font-bold ${!notaAluno?.media ? "text-slate-400" : notaAluno.media >= 6 ? "text-emerald-600" : notaAluno.media >= 4 ? "text-amber-600" : "text-red-600"}`}>
                                {notaAluno?.media ?? "—"}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <BadgeSituacao situacao={notaAluno?.situacao} />
                            </td>

                            {/* Botão salvar por linha */}
                            <td className="px-4 py-3">
                              <button
                                onClick={() => salvarNota(aluno.id)}
                                disabled={salvandoId === aluno.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                              >
                                <Save className="h-3 w-3" />
                                {salvandoId === aluno.id ? "..." : "Salvar"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PaginaContainer>
  );
}
