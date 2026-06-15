"use client";

/**
 * Página de Disciplinas
 * Admin: CRUD completo
 * Professor: visualiza suas disciplinas e edita descrição/carga horária
 * Aluno: visualização das disciplinas do próprio curso
 */

import { useEffect, useState } from "react";
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  Badge,
  CampoForm,
  EstadoVazio,
  Modal,
  ModalConfirmacao,
  PaginaContainer,
  Spinner,
  Tabela,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Aluno, Curso, Disciplina, Professor } from "@/types";

interface FormDisciplina {
  nome: string;
  cargaHoraria: string;
  professorId: string;
  cursoId: string;
  semestre: string;
  descricao: string;
  ativo: boolean;
}

const FORM_VAZIO: FormDisciplina = {
  nome: "",
  cargaHoraria: "",
  professorId: "",
  cursoId: "",
  semestre: "",
  descricao: "",
  ativo: true,
};

export default function DisciplinasPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === "ADMIN";
  const isProfessor = usuario?.perfil === "PROFESSOR";

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Disciplina | null>(null);
  const [form, setForm] = useState<FormDisciplina>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [discRes, profRes, cursosRes] = await Promise.all([
        api.get<Disciplina[]>("/disciplinas"),
        isAdmin ? api.get<Professor[]>("/professores") : Promise.resolve({ data: [] as Professor[] }),
        api.get<Curso[]>("/cursos"),
      ]);

      let disciplinasVisiveis = discRes.data;

      if (usuario?.perfil === "ALUNO") {
        const alunosRes = await api.get<Aluno[]>("/alunos");
        const meuAluno = alunosRes.data[0];

        if (meuAluno?.cursoId) {
          disciplinasVisiveis = discRes.data.filter((disciplina) => disciplina.cursoId === meuAluno.cursoId);
        }
      }

      setDisciplinas(disciplinasVisiveis);
      setProfessores(profRes.data);
      setCursos(cursosRes.data.filter((curso) => curso.ativo));
    } catch (error) {
      console.error("[DISCIPLINAS] Erro ao carregar dados:", error);
      toast.error("Erro ao carregar disciplinas");
    } finally {
      setCarregando(false);
    }
  }

  const filtradas = disciplinas.filter((disciplina) => {
    const termo = busca.toLowerCase();

    return (
      disciplina.nome.toLowerCase().includes(termo) ||
      (disciplina.curso?.nome ?? "").toLowerCase().includes(termo) ||
      (disciplina.professor?.nome ?? "").toLowerCase().includes(termo)
    );
  });

  function podeEditar(disciplina: Disciplina) {
    if (isAdmin) return true;
    if (isProfessor) return true;
    return false;
  }

  function abrirModalNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirModalEditar(disciplina: Disciplina) {
    setEditando(disciplina);
    setForm({
      nome: disciplina.nome,
      cargaHoraria: String(disciplina.cargaHoraria),
      professorId: String(disciplina.professorId),
      cursoId: String(disciplina.cursoId),
      semestre: String(disciplina.semestre),
      descricao: disciplina.descricao ?? "",
      ativo: disciplina.ativo ?? true,
    });
    setModalAberto(true);
  }

  async function handleSalvar() {
    if (isAdmin && (!form.nome || !form.cargaHoraria || !form.professorId || !form.cursoId || !form.semestre)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSalvando(true);

    try {
      if (editando) {
        const dadosEnvio = isAdmin
          ? {
              nome: form.nome,
              cargaHoraria: Number(form.cargaHoraria),
              professorId: Number(form.professorId),
              cursoId: Number(form.cursoId),
              semestre: Number(form.semestre),
              descricao: form.descricao,
              ativo: form.ativo,
            }
          : {
              descricao: form.descricao,
              cargaHoraria: Number(form.cargaHoraria),
            };

        await api.put(`/disciplinas/${editando.id}`, dadosEnvio);
        toast.success("Disciplina atualizada");
      } else {
        await api.post("/disciplinas", {
          nome: form.nome,
          cargaHoraria: Number(form.cargaHoraria),
          professorId: Number(form.professorId),
          cursoId: Number(form.cursoId),
          semestre: Number(form.semestre),
          descricao: form.descricao,
          ativo: form.ativo,
        });
        toast.success("Disciplina criada");
      }

      setModalAberto(false);
      carregarDados();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Erro ao salvar disciplina");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar() {
    if (!confirmandoId) return;

    setDeletando(true);

    try {
      await api.delete(`/disciplinas/${confirmandoId}`);
      toast.success("Disciplina removida");
      setConfirmandoId(null);
      carregarDados();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Erro ao remover disciplina");
    } finally {
      setDeletando(false);
    }
  }

  if (carregando) return <Spinner />;

  return (
    <PaginaContainer
      titulo="Disciplinas"
      subtitulo={`${filtradas.length} disciplina(s) encontradas`}
      acao={
        isAdmin ? (
          <button onClick={abrirModalNovo} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nova Disciplina
          </button>
        ) : undefined
      }
    >
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por disciplina, curso ou professor"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          <strong className="text-slate-900">{disciplinas.length}</strong> cadastradas
        </div>
      </div>

      <Tabela
        cabecalhos={["Disciplina", "Professor", "Curso", "Carga", "Semestre", "Notas", "Status", "Ações"]}
        vazia={filtradas.length === 0}
        componenteVazio={
          <EstadoVazio
            icone={BookOpen}
            titulo="Nenhuma disciplina encontrada"
            descricao="Cadastre disciplinas vinculadas aos cursos existentes."
          />
        }
      >
        {filtradas.map((disciplina) => (
          <tr key={disciplina.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
            <td className="px-4 py-3">
              <p className="font-medium text-slate-900">{disciplina.nome}</p>
              {disciplina.descricao && <p className="mt-1 max-w-md text-xs text-slate-500">{disciplina.descricao}</p>}
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{disciplina.professor?.nome ?? "—"}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{disciplina.curso?.nome ?? "Curso não informado"}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{disciplina.cargaHoraria}h</td>
            <td className="px-4 py-3 text-sm text-slate-600">{disciplina.semestre}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{disciplina._count?.notas ?? 0}</td>
            <td className="px-4 py-3">
              <Badge texto={disciplina.ativo === false ? "Inativa" : "Ativa"} variante={disciplina.ativo === false ? "neutro" : "aprovado"} />
            </td>
            <td className="px-4 py-3">
              {(isAdmin || isProfessor) && (
                <div className="flex items-center gap-2">
                  {podeEditar(disciplina) && (
                    <button
                      onClick={() => abrirModalEditar(disciplina)}
                      className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      title="Editar disciplina"
                    >
                      <Pencil size={16} />
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => setConfirmandoId(disciplina.id)}
                      className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Excluir disciplina"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </td>
          </tr>
        ))}
      </Tabela>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo={editando ? "Editar Disciplina" : "Nova Disciplina"} largura="lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isAdmin && (
            <CampoForm label="Nome da disciplina" obrigatorio>
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="input-base"
                placeholder="Ex.: Banco de Dados Relacional"
              />
            </CampoForm>
          )}

          {isAdmin && (
            <CampoForm label="Professor responsável" obrigatorio>
              <select
                value={form.professorId}
                onChange={(e) => setForm({ ...form, professorId: e.target.value })}
                className="input-base"
              >
                <option value="">Selecione...</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </CampoForm>
          )}

          <CampoForm label="Carga Horária (horas)" obrigatorio>
            <input
              type="number"
              min={1}
              value={form.cargaHoraria}
              onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })}
              className="input-base"
              placeholder="80"
            />
          </CampoForm>

          {isAdmin && (
            <>
              <CampoForm label="Curso" obrigatorio>
                <select value={form.cursoId} onChange={(e) => setForm({ ...form, cursoId: e.target.value })} className="input-base">
                  <option value="">Selecione...</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nome}
                    </option>
                  ))}
                </select>
              </CampoForm>

              <CampoForm label="Semestre" obrigatorio>
                <input
                  type="number"
                  min={1}
                  value={form.semestre}
                  onChange={(e) => setForm({ ...form, semestre: e.target.value })}
                  className="input-base"
                  placeholder="1"
                />
              </CampoForm>
            </>
          )}

          <div className="md:col-span-2">
            <CampoForm label="Descrição">
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="input-base min-h-24 resize-none"
                placeholder="Descrição da disciplina, ementa, objetivos..."
              />
            </CampoForm>
          </div>

          {isAdmin && editando && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              />
              Disciplina ativa
            </label>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setModalAberto(false)}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar disciplina"}
          </button>
        </div>
      </Modal>

      <ModalConfirmacao
        aberto={confirmandoId !== null}
        onFechar={() => setConfirmandoId(null)}
        onConfirmar={handleDeletar}
        titulo="Remover Disciplina"
        descricao="Tem certeza? Esta ação removerá a disciplina e as notas vinculadas a ela."
        carregando={deletando}
      />
    </PaginaContainer>
  );
}
