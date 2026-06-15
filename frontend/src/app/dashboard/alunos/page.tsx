"use client";

/**
 * Página de Alunos
 * Admin: lista completa com cadastro e edição
 * Professor: visualização dos alunos das suas turmas (somente leitura)
 */

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, UserX, KeyRound, Users } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/contexts/AuthContext";
import {
  PaginaContainer,
  Tabela,
  Modal,
  ModalConfirmacao,
  CampoForm,
  EstadoVazio,
  Spinner,
} from "@/components/ui";
import api, { buscarEnderecoPorCep } from "@/lib/api";
import { Aluno, Curso } from "@/types";

interface FormAluno {
  nome: string;
  matricula: string;
  cursoId: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
}

const FORM_VAZIO: FormAluno = {
  nome: "",
  matricula: "",
  cursoId: "",
  email: "",
  telefone: "",
  cep: "",
  endereco: "",
  cidade: "",
  estado: "",
};

export default function AlunosPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === "ADMIN";

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Aluno | null>(null);
  const [form, setForm] = useState<FormAluno>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [desativando, setDesativando] = useState(false);

  const [senhaTemp, setSenhaTemp] = useState<string | null>(null);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [alunosRes, cursosRes] = await Promise.all([
        api.get("/alunos"),
        api.get("/cursos"),
      ]);

      setAlunos(alunosRes.data);
      setCursos(cursosRes.data);
    } catch (error) {
      console.error("[ALUNOS] Erro ao carregar dados:", error);
      toast.error("Erro ao carregar alunos");
    } finally {
      setCarregando(false);
    }
  }

  const alunosFiltrados = alunos.filter((a) => {
    const termo = busca.toLowerCase();
    const nomeCurso = a.curso?.nome ?? "";

    return (
      a.nome.toLowerCase().includes(termo) ||
      a.matricula.toLowerCase().includes(termo) ||
      nomeCurso.toLowerCase().includes(termo)
    );
  });

  function abrirModalNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirModalEditar(aluno: Aluno) {
    setEditando(aluno);
    setForm({
      nome: aluno.nome,
      matricula: aluno.matricula,
      cursoId: aluno.cursoId ? String(aluno.cursoId) : "",
      email: aluno.usuario?.email ?? "",
      telefone: aluno.telefone ?? "",
      cep: aluno.cep ?? "",
      endereco: aluno.endereco ?? "",
      cidade: aluno.cidade ?? "",
      estado: aluno.estado ?? "",
    });
    setModalAberto(true);
  }

  async function handleCepBlur() {
    if (form.cep.replace(/\D/g, "").length !== 8) return;

    try {
      const endereco = await buscarEnderecoPorCep(form.cep);

      if (!endereco.erro) {
        setForm((f) => ({
          ...f,
          endereco: `${endereco.logradouro}, ${endereco.bairro}`,
          cidade: endereco.localidade,
          estado: endereco.uf,
        }));
        toast.success("Endereço preenchido automaticamente");
      }
    } catch {
      // ViaCEP indisponível — o usuário pode preencher manualmente
    }
  }

  async function handleSalvar() {
    if (!form.nome || !form.matricula || !form.cursoId || (!editando && !form.email)) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const payload = {
      nome: form.nome,
      matricula: form.matricula,
      cursoId: Number(form.cursoId),
      email: form.email,
      telefone: form.telefone || undefined,
      cep: form.cep || undefined,
      endereco: form.endereco || undefined,
      cidade: form.cidade || undefined,
      estado: form.estado || undefined,
    };

    setSalvando(true);

    try {
      if (editando) {
        await api.put(`/alunos/${editando.id}`, payload);
        toast.success("Aluno atualizado com sucesso");
      } else {
        const res = await api.post("/alunos", payload);

        if (res.data.senhaTemporaria) {
          setSenhaTemp(res.data.senhaTemporaria);
          setModalSenhaAberto(true);
        }

        toast.success("Aluno cadastrado com sucesso");
      }

      setModalAberto(false);
      carregarDados();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Erro ao salvar aluno");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDesativar() {
    if (!confirmandoId) return;

    setDesativando(true);

    try {
      await api.patch(`/alunos/${confirmandoId}/desativar`);
      toast.success("Aluno desativado");
      setConfirmandoId(null);
      carregarDados();
    } catch {
      toast.error("Erro ao desativar aluno");
    } finally {
      setDesativando(false);
    }
  }

  if (carregando) return <Spinner />;

  return (
    <PaginaContainer
      titulo="Alunos"
      subtitulo="Cadastro e gerenciamento de alunos"
      acao={
        isAdmin ? (
          <button onClick={abrirModalNovo} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Novo Aluno
          </button>
        ) : undefined
      }
    >
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, matrícula ou curso"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <Tabela
        cabecalhos={["Aluno", "Matrícula", "Curso", "Telefone", isAdmin ? "Ações" : ""]}
        vazia={alunosFiltrados.length === 0}
        componenteVazio={
          <EstadoVazio
            icone={Users}
            titulo="Nenhum aluno encontrado"
            descricao="Cadastre um novo aluno ou altere o termo da busca."
          />
        }
      >
        {alunosFiltrados.map((aluno) => (
          <tr key={aluno.id} className="border-b border-slate-100 last:border-0">
            <td className="px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{aluno.nome}</p>
                <p className="text-xs text-slate-500">{aluno.usuario?.email}</p>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{aluno.matricula}</td>
            <td className="px-4 py-3 text-sm text-slate-600">
              {aluno.curso?.nome ?? "Curso não informado"}
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{aluno.telefone ?? "—"}</td>
            {isAdmin && (
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => abrirModalEditar(aluno)}
                    className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    title="Editar aluno"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmandoId(aluno.id)}
                    className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Desativar aluno"
                  >
                    <UserX size={16} />
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </Tabela>

      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo={editando ? "Editar Aluno" : "Novo Aluno"}
        largura="lg"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CampoForm label="Nome" obrigatorio>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="input-base"
              placeholder="Nome do aluno"
            />
          </CampoForm>

          <CampoForm label="Matrícula" obrigatorio>
            <input
              value={form.matricula}
              onChange={(e) => setForm({ ...form, matricula: e.target.value })}
              className="input-base"
              placeholder="DSM2024001"
              disabled={!!editando}
            />
          </CampoForm>

          <CampoForm label="E-mail" obrigatorio={!editando}>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-base"
              placeholder="aluno@aluno.fatec.br"
              disabled={!!editando}
            />
          </CampoForm>

          <CampoForm label="Curso" obrigatorio>
            <select
              value={form.cursoId}
              onChange={(e) => setForm({ ...form, cursoId: e.target.value })}
              className="input-base"
            >
              <option value="">Selecione um curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nome}
                </option>
              ))}
            </select>
          </CampoForm>

          <CampoForm label="Telefone">
            <input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="input-base"
              placeholder="(12) 99999-9999"
            />
          </CampoForm>

          <CampoForm label="CEP">
            <input
              value={form.cep}
              onChange={(e) => setForm({ ...form, cep: e.target.value })}
              onBlur={handleCepBlur}
              className="input-base"
              placeholder="00000-000"
            />
          </CampoForm>

          <div className="md:col-span-2">
            <CampoForm label="Endereço">
              <input
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                className="input-base"
                placeholder="Rua, número, bairro"
              />
            </CampoForm>
          </div>

          <CampoForm label="Cidade">
            <input
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              className="input-base"
              placeholder="Jacareí"
            />
          </CampoForm>

          <CampoForm label="Estado">
            <input
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="input-base"
              placeholder="SP"
              maxLength={2}
            />
          </CampoForm>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setModalAberto(false)} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSalvar} disabled={salvando} className="btn-primary">
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar aluno"}
          </button>
        </div>
      </Modal>

      <Modal aberto={modalSenhaAberto} onFechar={() => setModalSenhaAberto(false)} titulo="Aluno cadastrado!" largura="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            O aluno foi cadastrado. Compartilhe a senha temporária abaixo. O aluno deverá alterá-la no primeiro acesso.
          </p>
          <div className="rounded-lg bg-slate-100 p-3 text-center font-mono text-lg font-semibold text-slate-900">
            {senhaTemp}
          </div>
          <button
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(senhaTemp ?? "");
              toast.success("Senha copiada!");
            }}
          >
            <KeyRound size={16} />
            Copiar senha
          </button>
        </div>
      </Modal>

      <ModalConfirmacao
        aberto={!!confirmandoId}
        onFechar={() => setConfirmandoId(null)}
        onConfirmar={handleDesativar}
        titulo="Desativar aluno"
        descricao="Tem certeza que deseja desativar este aluno? Ele não conseguirá mais acessar o sistema, mas os dados serão preservados."
        carregando={desativando}
      />
    </PaginaContainer>
  );
}
