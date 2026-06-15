"use client";

/**
 * Página de Lançamento de Notas
 * Professor e Admin: selecionar disciplina → ver alunos → lançar/alterar notas.
 * O cálculo de média e situação é feito automaticamente no backend.
 */

import { useEffect, useState } from "react";
import { ClipboardList, Save } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/contexts/AuthContext";
import {
  PaginaContainer,
  BadgeSituacao,
  EstadoVazio,
  Spinner,
} from "@/components/ui";
import api from "@/lib/api";
import { Aluno, Disciplina, Nota } from "@/types";

type CursoResumo = {
  id: number;
  nome: string;
  area?: string;
};

type CursoCampo = string | CursoResumo | null | undefined;

type DisciplinaComCurso = Omit<Disciplina, "curso"> & {
  cursoId?: number;
  curso?: CursoCampo;
  ativo?: boolean;
};

type AlunoComCurso = Omit<Aluno, "curso"> & {
  cursoId?: number;
  curso?: CursoCampo;
};

type NotaComAluno = Omit<Nota, "nota1" | "nota2" | "media" | "situacao"> & {
  nota1?: number | null;
  nota2?: number | null;
  media?: number | null;
  situacao?: string | null;
  alunoId: number;
  disciplinaId: number;
};

type EdicaoNota = {
  nota1: string;
  nota2: string;
};

function getNomeCurso(curso: CursoCampo) {
  if (!curso) return "Curso não informado";
  if (typeof curso === "string") return curso;
  return curso.nome ?? "Curso não informado";
}

function getCursoId(curso: CursoCampo, cursoId?: number) {
  if (cursoId) return cursoId;
  if (curso && typeof curso === "object") return curso.id;
  return undefined;
}

export default function NotasPage() {
  const { usuario } = useAuth();

  const [disciplinas, setDisciplinas] = useState<DisciplinaComCurso[]>([]);
  const [alunos, setAlunos] = useState<AlunoComCurso[]>([]);
  const [notas, setNotas] = useState<NotaComAluno[]>([]);
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);
  const [salvandoId, setSalvandoId] = useState<number | null>(null);

  // Mapa de valores editados em tempo real: { alunoId: { nota1, nota2 } }
  const [edicoes, setEdicoes] = useState<Record<number, EdicaoNota>>({});

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  async function carregarDisciplinas() {
    setCarregando(true);

    try {
      const res = await api.get<DisciplinaComCurso[]>("/disciplinas");

      // Professor e Admin só veem disciplinas ativas para lançar notas.
      const apenasAtivas = res.data.filter((disciplina) => disciplina.ativo !== false);
      setDisciplinas(apenasAtivas);
    } catch {
      toast.error("Erro ao carregar disciplinas");
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarDisciplina(id: number) {
    setDisciplinaId(id);
    setCarregandoAlunos(true);
    setEdicoes({});

    try {
      const disciplinaSelecionada = disciplinas.find((disciplina) => disciplina.id === id);
      const cursoIdDaDisciplina = getCursoId(
        disciplinaSelecionada?.curso,
        disciplinaSelecionada?.cursoId
      );

      const [alunosRes, notasRes] = await Promise.all([
        api.get<AlunoComCurso[]>("/alunos"),
        api.get<NotaComAluno[]>(`/notas/disciplina/${id}`),
      ]);

      const alunosDaDisciplina = cursoIdDaDisciplina
        ? alunosRes.data.filter((aluno) => getCursoId(aluno.curso, aluno.cursoId) === cursoIdDaDisciplina)
        : alunosRes.data;

      setAlunos(alunosDaDisciplina);
      setNotas(notasRes.data);

      const mapaEdicoes: Record<number, EdicaoNota> = {};

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

  function limparSelecao() {
    setDisciplinaId(null);
    setAlunos([]);
    setNotas([]);
    setEdicoes({});
  }

  function getNotaAluno(alunoId: number) {
    return notas.find((nota) => nota.alunoId === alunoId);
  }

  async function salvarNota(alunoId: number) {
    if (!disciplinaId) return;

    const edicao = edicoes[alunoId] ?? { nota1: "", nota2: "" };
    const nota1 = edicao.nota1 !== "" ? Number(edicao.nota1) : undefined;
    const nota2 = edicao.nota2 !== "" ? Number(edicao.nota2) : undefined;

    if (nota1 !== undefined && (nota1 < 0 || nota1 > 10)) {
      toast.error("Nota 1 deve estar entre 0 e 10");
      return;
    }

    if (nota2 !== undefined && (nota2 < 0 || nota2 > 10)) {
      toast.error("Nota 2 deve estar entre 0 e 10");
      return;
    }

    setSalvandoId(alunoId);

    try {
      const notaExistente = getNotaAluno(alunoId);

      if (notaExistente) {
        const res = await api.put<NotaComAluno>(`/notas/${notaExistente.id}`, {
          nota1,
          nota2,
        });

        setNotas((prev) =>
          prev.map((nota) =>
            nota.id === notaExistente.id ? { ...nota, ...res.data } : nota
          )
        );
      } else {
        const res = await api.post<NotaComAluno>("/notas", {
          alunoId,
          disciplinaId,
          nota1,
          nota2,
        });

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

  if (usuario?.perfil === "ALUNO") {
    return (
      <PaginaContainer
        titulo="Lançar Notas"
        subtitulo="Esta área é restrita para administradores e professores."
      >
        <EstadoVazio
          icone={ClipboardList}
          titulo="Acesso restrito"
          descricao="Alunos não podem lançar notas. Para consultar suas notas, acesse a área de boletim ou meu perfil."
        />
      </PaginaContainer>
    );
  }

  const disciplinaSelecionada = disciplinas.find((disciplina) => disciplina.id === disciplinaId);

  return (
    <PaginaContainer
      titulo="Lançar Notas"
      subtitulo="Selecione uma disciplina para lançar ou alterar as notas dos alunos."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Disciplina
          </label>

          <select
            value={disciplinaId ?? ""}
            onChange={(e) => {
              if (!e.target.value) {
                limparSelecao();
                return;
              }

              selecionarDisciplina(Number(e.target.value));
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Selecione uma disciplina...</option>

            {disciplinas.map((disciplina) => (
              <option key={disciplina.id} value={disciplina.id}>
                {disciplina.nome} — {getNomeCurso(disciplina.curso)} ({disciplina.semestre}º semestre)
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-slate-500">
            Apenas disciplinas ativas são exibidas. Disciplinas encerradas ficam bloqueadas para lançamento de notas.
          </p>
        </div>

        {disciplinaId && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {carregandoAlunos ? (
              <Spinner texto="Carregando alunos e notas..." />
            ) : (
              <>
                <div className="border-b border-slate-200 p-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {disciplinaSelecionada?.nome}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Prof. {disciplinaSelecionada?.professor?.nome ?? "—"} · {disciplinaSelecionada?.cargaHoraria}h · {getNomeCurso(disciplinaSelecionada?.curso)} · {alunos.length} aluno(s)
                  </p>
                </div>

                {alunos.length === 0 ? (
                  <EstadoVazio
                    icone={ClipboardList}
                    titulo="Nenhum aluno encontrado"
                    descricao="Não existem alunos vinculados ao curso desta disciplina."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Aluno</th>
                          <th className="px-5 py-3">Matrícula</th>
                          <th className="px-5 py-3">Curso</th>
                          <th className="px-5 py-3">Nota 1</th>
                          <th className="px-5 py-3">Nota 2</th>
                          <th className="px-5 py-3">Média</th>
                          <th className="px-5 py-3">Situação</th>
                          <th className="px-5 py-3 text-right">Ação</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {alunos.map((aluno) => {
                          const notaAluno = getNotaAluno(aluno.id);
                          const edicao = edicoes[aluno.id] ?? { nota1: "", nota2: "" };

                          return (
                            <tr key={aluno.id} className="hover:bg-slate-50">
                              <td className="px-5 py-3 font-medium text-slate-800">
                                {aluno.nome}
                              </td>

                              <td className="px-5 py-3 text-slate-600">
                                {aluno.matricula}
                              </td>

                              <td className="px-5 py-3 text-slate-600">
                                {getNomeCurso(aluno.curso)}
                              </td>

                              <td className="px-5 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={edicao.nota1}
                                  onChange={(e) =>
                                    setEdicoes((prev) => ({
                                      ...prev,
                                      [aluno.id]: {
                                        ...prev[aluno.id],
                                        nota1: e.target.value,
                                        nota2: prev[aluno.id]?.nota2 ?? "",
                                      },
                                    }))
                                  }
                                  placeholder="0.0"
                                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                />
                              </td>

                              <td className="px-5 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={edicao.nota2}
                                  onChange={(e) =>
                                    setEdicoes((prev) => ({
                                      ...prev,
                                      [aluno.id]: {
                                        ...prev[aluno.id],
                                        nota1: prev[aluno.id]?.nota1 ?? "",
                                        nota2: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="0.0"
                                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                />
                              </td>

                              <td className="px-5 py-3 font-semibold text-slate-700">
                                {notaAluno?.media ?? "—"}
                              </td>

                              <td className="px-5 py-3">
                                <BadgeSituacao situacao={notaAluno?.situacao} />
                              </td>

                              <td className="px-5 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => salvarNota(aluno.id)}
                                  disabled={salvandoId === aluno.id}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                                >
                                  <Save size={14} />
                                  {salvandoId === aluno.id ? "Salvando..." : "Salvar"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PaginaContainer>
  );
}
