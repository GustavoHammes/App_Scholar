"use client";

/**
 * Página de Disciplinas
 * Admin: CRUD completo (criar, editar tudo, deletar)
 * Professor: visualiza as próprias e pode editar descrição/carga horária
 * Aluno: somente visualização
 */

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  PaginaContainer, Tabela, Modal, ModalConfirmacao,
  CampoForm, EstadoVazio, Spinner, Badge,
} from "@/components/ui";
import api from "@/lib/api";
import { Disciplina, Professor } from "@/types";

interface FormDisciplina {
  nome: string; cargaHoraria: string; professorId: string;
  curso: string; semestre: string; descricao: string;
}

const FORM_VAZIO: FormDisciplina = {
  nome: "", cargaHoraria: "", professorId: "", curso: "", semestre: "", descricao: "",
};

export default function DisciplinasPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === "ADMIN";
  const isProfessor = usuario?.perfil === "PROFESSOR";

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Disciplina | null>(null);
  const [form, setForm] = useState<FormDisciplina>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => { carregarDados(); }, []);
  const [cursoAluno, setCursoAluno] = useState<string | null>(null);

  async function carregarDados() {
  setCarregando(true);
  try {
    const [discRes, profRes] = await Promise.all([
      api.get<Disciplina[]>("/disciplinas"),
      isAdmin ? api.get<Professor[]>("/professores") : Promise.resolve({ data: [] }),
    ]);

    let disciplinasVisiveis = discRes.data;

    // Aluno só vê disciplinas do próprio curso
    if (usuario?.perfil === "ALUNO") {
      const alunosRes = await api.get("/alunos");
      const meuAluno = alunosRes.data[0];
      if (meuAluno?.curso) {
        setCursoAluno(meuAluno.curso);
        disciplinasVisiveis = discRes.data.filter(
          (d) => d.curso === meuAluno.curso
        );
      }
    }

    setDisciplinas(disciplinasVisiveis);
    setProfessores(profRes.data);
  } catch {
    toast.error("Erro ao carregar disciplinas");
  } finally {
    setCarregando(false);
  }
}

  const filtradas = disciplinas.filter(
    (d) =>
      d.nome.toLowerCase().includes(busca.toLowerCase()) ||
      d.curso.toLowerCase().includes(busca.toLowerCase())
  );

  // Verifica se o professor logado pode editar esta disciplina
  function podeEditar(disc: Disciplina) {
    if (isAdmin) return true;
    if (isProfessor) return true; // O backend valida se é a disciplina dele
    return false;
  }

  function abrirModalNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirModalEditar(disc: Disciplina) {
    setEditando(disc);
    setForm({
      nome: disc.nome, cargaHoraria: disc.cargaHoraria.toString(),
      professorId: disc.professorId.toString(), curso: disc.curso,
      semestre: disc.semestre.toString(), descricao: disc.descricao ?? "",
    });
    setModalAberto(true);
  }

  async function handleSalvar() {
    if (isAdmin && (!form.nome || !form.cargaHoraria || !form.professorId || !form.curso || !form.semestre)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        // Professor envia apenas os campos que tem permissão de alterar
        const dadosEnvio = isAdmin ? form : { descricao: form.descricao, cargaHoraria: form.cargaHoraria };
        await api.put(`/disciplinas/${editando.id}`, dadosEnvio);
        toast.success("Disciplina atualizada");
      } else {
        await api.post("/disciplinas", form);
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
    } catch {
      toast.error("Erro ao remover disciplina");
    } finally {
      setDeletando(false);
    }
  }

  if (carregando) return <Spinner />;

  return (
    <PaginaContainer
      titulo="Disciplinas"
      subtitulo={`${filtradas.length} disciplina(s)`}
      acao={isAdmin ? (
        <button className="btn-primary" onClick={abrirModalNovo}>
          <Plus className="h-4 w-4" />Nova Disciplina
        </button>
      ) : undefined}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Buscar por nome ou curso..."
          value={busca} onChange={(e) => setBusca(e.target.value)} className="input-base pl-9" />
      </div>

      <Tabela
        cabecalhos={["Disciplina", "Professor", "Curso", "Semestre", "C.H.", "Alunos", ...(podeEditar(disciplinas[0] ?? {} as Disciplina) ? ["Ações"] : [])]}
        vazia={filtradas.length === 0}
        componenteVazio={<EstadoVazio icone={BookOpen} titulo="Nenhuma disciplina encontrada" />}
      >
        {filtradas.map((disc) => (
          <tr key={disc.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3">
              <p className="font-medium text-slate-800">{disc.nome}</p>
              {disc.descricao && <p className="mt-0.5 truncate max-w-xs text-xs text-slate-500">{disc.descricao}</p>}
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{disc.professor?.nome ?? "—"}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{disc.curso}</td>
            <td className="px-4 py-3">
              <Badge texto={`${disc.semestre}º sem.`} variante="info" />
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{disc.cargaHoraria}h</td>
            <td className="px-4 py-3 text-sm text-slate-600">{disc._count?.notas ?? 0}</td>
            {(isAdmin || isProfessor) && (
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => abrirModalEditar(disc)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {isAdmin && (
                    <button onClick={() => setConfirmandoId(disc.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </Tabela>

      {/* Modal de criação/edição */}
      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)}
        titulo={editando ? "Editar Disciplina" : "Nova Disciplina"} largura="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Admin edita tudo. Professor edita apenas campos informativos */}
          {isAdmin && (
            <div className="sm:col-span-2">
              <CampoForm label="Nome da disciplina" obrigatorio>
                <input className="input-base" value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome da disciplina" disabled={!!editando} />
              </CampoForm>
            </div>
          )}

          {isAdmin && (
            <CampoForm label="Professor responsável" obrigatorio>
              <select className="input-base" value={form.professorId}
                onChange={(e) => setForm({ ...form, professorId: e.target.value })}>
                <option value="">Selecione...</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </CampoForm>
          )}

          <CampoForm label="Carga Horária (horas)" obrigatorio={isAdmin}>
            <input className="input-base" type="number" min="1" value={form.cargaHoraria}
              onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })} placeholder="80" />
          </CampoForm>

          {isAdmin && (
            <>
              <div className="sm:col-span-1">
                <CampoForm label="Curso" obrigatorio>
                  <input className="input-base" value={form.curso}
                    onChange={(e) => setForm({ ...form, curso: e.target.value })} placeholder="Nome do curso" />
                </CampoForm>
              </div>
              <CampoForm label="Semestre" obrigatorio>
                <input className="input-base" type="number" min="1" max="8" value={form.semestre}
                  onChange={(e) => setForm({ ...form, semestre: e.target.value })} placeholder="1" />
              </CampoForm>
            </>
          )}

          <div className="sm:col-span-2">
            <CampoForm label="Descrição">
              <textarea className="input-base resize-none" rows={3} value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descrição da disciplina, ementa, objetivos..." />
            </CampoForm>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar disciplina"}
          </button>
        </div>
      </Modal>

      <ModalConfirmacao aberto={confirmandoId !== null} onFechar={() => setConfirmandoId(null)}
        onConfirmar={handleDeletar} titulo="Remover Disciplina"
        descricao="Tem certeza? Esta ação removerá a disciplina e todas as notas associadas."
        carregando={deletando} />
    </PaginaContainer>
  );
}
