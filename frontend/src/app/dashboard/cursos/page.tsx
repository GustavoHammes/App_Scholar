"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";

import {
  PaginaContainer,
  Tabela,
  Modal,
  ModalConfirmacao,
  CampoForm,
  EstadoVazio,
  Spinner,
} from "@/components/ui";
import api from "@/lib/api";
import { Curso, Professor } from "@/types";

interface FormCurso {
  nome: string;
  area: string;
  duracaoSemestres: string;
  coordenadorId: string;
  descricao: string;
  ativo: boolean;
}

const FORM_VAZIO: FormCurso = {
  nome: "",
  area: "",
  duracaoSemestres: "6",
  coordenadorId: "",
  descricao: "",
  ativo: true,
};

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Curso | null>(null);
  const [form, setForm] = useState<FormCurso>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [cursosRes, professoresRes] = await Promise.all([
        api.get("/cursos?incluirInativos=true"),
        api.get("/professores"),
      ]);

      setCursos(cursosRes.data);
      setProfessores(professoresRes.data);
    } catch (error) {
      console.error("[CURSOS] Erro ao carregar dados:", error);
      toast.error("Erro ao carregar cursos");
    } finally {
      setCarregando(false);
    }
  }

  const cursosFiltrados = cursos.filter((curso) => {
    const termo = busca.toLowerCase();

    return (
      curso.nome.toLowerCase().includes(termo) ||
      curso.area.toLowerCase().includes(termo) ||
      (curso.coordenador?.nome ?? "").toLowerCase().includes(termo)
    );
  });

  function abrirNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirEdicao(curso: Curso) {
    setEditando(curso);
    setForm({
      nome: curso.nome,
      area: curso.area,
      duracaoSemestres: String(curso.duracaoSemestres),
      coordenadorId: curso.coordenadorId ? String(curso.coordenadorId) : "",
      descricao: curso.descricao ?? "",
      ativo: curso.ativo,
    });
    setModalAberto(true);
  }

  async function salvar() {
    if (!form.nome || !form.area || !form.duracaoSemestres) {
      toast.error("Preencha nome, área e duração");
      return;
    }

    const payload = {
      nome: form.nome,
      area: form.area,
      duracaoSemestres: Number(form.duracaoSemestres),
      coordenadorId: form.coordenadorId ? Number(form.coordenadorId) : null,
      descricao: form.descricao || undefined,
      ativo: form.ativo,
    };

    setSalvando(true);

    try {
      if (editando) {
        await api.put(`/cursos/${editando.id}`, payload);
        toast.success("Curso atualizado com sucesso");
      } else {
        await api.post("/cursos", payload);
        toast.success("Curso cadastrado com sucesso");
      }

      setModalAberto(false);
      carregarDados();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Erro ao salvar curso");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!confirmandoId) return;

    setExcluindo(true);

    try {
      const res = await api.delete(`/cursos/${confirmandoId}`);
      toast.success(res.data.message ?? "Curso removido com sucesso");
      setConfirmandoId(null);
      carregarDados();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Erro ao excluir curso");
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) return <Spinner />;

  return (
    <PaginaContainer
      titulo="Cursos"
      subtitulo="Cadastro e gerenciamento dos cursos da instituição"
      acao={
        <button onClick={abrirNovo} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Novo Curso
        </button>
      }
    >
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por curso, área ou coordenador"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <Tabela
        cabecalhos={["Curso", "Área", "Duração", "Coordenador", "Vínculos", "Status", "Ações"]}
        vazia={cursosFiltrados.length === 0}
        componenteVazio={
          <EstadoVazio
            icone={BookOpen}
            titulo="Nenhum curso encontrado"
            descricao="Cadastre o primeiro curso da instituição."
          />
        }
      >
        {cursosFiltrados.map((curso) => (
          <tr key={curso.id} className="border-b border-slate-100 last:border-0">
            <td className="px-4 py-3">
              <p className="font-medium text-slate-900">{curso.nome}</p>
              {curso.descricao && <p className="mt-1 max-w-md text-xs text-slate-500">{curso.descricao}</p>}
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{curso.area}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{curso.duracaoSemestres} semestres</td>
            <td className="px-4 py-3 text-sm text-slate-600">{curso.coordenador?.nome ?? "—"}</td>
            <td className="px-4 py-3 text-sm text-slate-600">
              {(curso._count?.alunos ?? 0)} alunos · {(curso._count?.disciplinas ?? 0)} disciplinas
            </td>
            <td className="px-4 py-3">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  curso.ativo ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}
              >
                {curso.ativo ? "Ativo" : "Inativo"}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => abrirEdicao(curso)}
                  className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  title="Editar curso"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmandoId(curso.id)}
                  className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Excluir curso"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Tabela>

      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo={editando ? "Editar Curso" : "Novo Curso"}
        largura="lg"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CampoForm label="Nome do curso" obrigatorio>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="input-base"
              placeholder="Desenvolvimento de Software Multiplataforma"
            />
          </CampoForm>

          <CampoForm label="Área" obrigatorio>
            <input
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="input-base"
              placeholder="Tecnologia da Informação"
            />
          </CampoForm>

          <CampoForm label="Duração em semestres" obrigatorio>
            <input
              type="number"
              min={1}
              value={form.duracaoSemestres}
              onChange={(e) => setForm({ ...form, duracaoSemestres: e.target.value })}
              className="input-base"
            />
          </CampoForm>

          <CampoForm label="Coordenador">
            <select
              value={form.coordenadorId}
              onChange={(e) => setForm({ ...form, coordenadorId: e.target.value })}
              className="input-base"
            >
              <option value="">Sem coordenador</option>
              {professores.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </CampoForm>

          <div className="md:col-span-2">
            <CampoForm label="Descrição">
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="input-base min-h-24 resize-none"
                placeholder="Resumo do curso"
              />
            </CampoForm>
          </div>

          {editando && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              />
              Curso ativo
            </label>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setModalAberto(false)} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando} className="btn-primary">
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar curso"}
          </button>
        </div>
      </Modal>

      <ModalConfirmacao
        aberto={!!confirmandoId}
        onFechar={() => setConfirmandoId(null)}
        onConfirmar={excluir}
        titulo="Excluir curso"
        descricao="Tem certeza que deseja excluir este curso? Se ele possuir alunos ou disciplinas vinculadas, ele será apenas desativado para preservar o histórico."
        carregando={excluindo}
      />
    </PaginaContainer>
  );
}
