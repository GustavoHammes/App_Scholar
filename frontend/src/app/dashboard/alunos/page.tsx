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
  PaginaContainer, Tabela, Modal, ModalConfirmacao,
  CampoForm, BadgeSituacao, EstadoVazio, Spinner,
} from "@/components/ui";
import api, { buscarEnderecoPorCep } from "@/lib/api";
import { Aluno } from "@/types";

// Campos do formulário de cadastro/edição
interface FormAluno {
  nome: string; matricula: string; curso: string; email: string;
  telefone: string; cep: string; endereco: string; cidade: string; estado: string;
}

const FORM_VAZIO: FormAluno = {
  nome: "", matricula: "", curso: "", email: "",
  telefone: "", cep: "", endereco: "", cidade: "", estado: "",
};

export default function AlunosPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === "ADMIN";

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  // Estado do modal de cadastro/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Aluno | null>(null);
  const [form, setForm] = useState<FormAluno>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  // Estado do modal de confirmação de desativação
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [desativando, setDesativando] = useState(false);

  // Senha temporária exibida após criação de novo aluno
  const [senhaTemp, setSenhaTemp] = useState<string | null>(null);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

  useEffect(() => { carregarAlunos(); }, []);

  async function carregarAlunos() {
    setCarregando(true);
    try {
      const res = await api.get<Aluno[]>("/alunos");
      setAlunos(res.data);
    } catch {
      toast.error("Erro ao carregar alunos");
    } finally {
      setCarregando(false);
    }
  }

  // Filtra alunos conforme o texto de busca (nome ou matrícula)
  const alunosFiltrados = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.matricula.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirModalNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirModalEditar(aluno: Aluno) {
    setEditando(aluno);
    setForm({
      nome: aluno.nome, matricula: aluno.matricula, curso: aluno.curso,
      email: aluno.usuario?.email ?? "",
      telefone: aluno.telefone ?? "", cep: aluno.cep ?? "",
      endereco: aluno.endereco ?? "", cidade: aluno.cidade ?? "", estado: aluno.estado ?? "",
    });
    setModalAberto(true);
  }

  // Busca endereço automaticamente ao informar o CEP
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
    if (!form.nome || !form.matricula || !form.curso || (!editando && !form.email)) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/alunos/${editando.id}`, form);
        toast.success("Aluno atualizado com sucesso");
      } else {
        const res = await api.post("/alunos", form);
        // Exibe a senha temporária gerada automaticamente
        if (res.data.senhaTemporaria) {
          setSenhaTemp(res.data.senhaTemporaria);
          setModalSenhaAberto(true);
        }
        toast.success("Aluno cadastrado com sucesso");
      }
      setModalAberto(false);
      carregarAlunos();
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
      carregarAlunos();
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
      subtitulo={`${alunosFiltrados.length} aluno(s) encontrado(s)`}
      acao={
        isAdmin ? (
          <button className="btn-primary" onClick={abrirModalNovo}>
            <Plus className="h-4 w-4" />
            Novo Aluno
          </button>
        ) : undefined
      }
    >
      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou matrícula..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input-base pl-9"
        />
      </div>

      {/* Tabela de alunos */}
      <Tabela
        cabecalhos={["Aluno", "Matrícula", "Curso", "Contato", "Status", ...(isAdmin ? ["Ações"] : [])]}
        vazia={alunosFiltrados.length === 0}
        componenteVazio={
          <EstadoVazio icone={Users} titulo="Nenhum aluno encontrado" descricao={busca ? "Tente outro termo de busca" : undefined} />
        }
      >
        {alunosFiltrados.map((aluno) => (
          <tr key={aluno.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3">
              <p className="font-medium text-slate-800">{aluno.nome}</p>
              <p className="text-xs text-slate-500">{aluno.usuario?.email}</p>
            </td>
            <td className="px-4 py-3 font-mono text-sm text-slate-600">{aluno.matricula}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{aluno.curso}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{aluno.telefone ?? "—"}</td>
            <td className="px-4 py-3">
              <BadgeSituacao situacao={aluno.usuario?.ativo === false ? "Reprovado" : "Aprovado"} />
            </td>
            {isAdmin && (
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => abrirModalEditar(aluno)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Editar aluno"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmandoId(aluno.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Desativar aluno"
                  >
                    <UserX className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </Tabela>

      {/* Modal de cadastro/edição de aluno */}
      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo={editando ? "Editar Aluno" : "Novo Aluno"}
        largura="lg"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoForm label="Nome completo" obrigatorio>
            <input className="input-base" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do aluno" />
          </CampoForm>

          <CampoForm label="Matrícula" obrigatorio>
            <input className="input-base" value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} placeholder="DSM2024001" disabled={!!editando} />
          </CampoForm>

          <CampoForm label="E-mail institucional" obrigatorio>
            <input className="input-base" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="aluno@aluno.fatec.br" disabled={!!editando} />
          </CampoForm>

          <CampoForm label="Curso" obrigatorio>
            <input className="input-base" value={form.curso} onChange={(e) => setForm({ ...form, curso: e.target.value })} placeholder="Nome do curso" />
          </CampoForm>

          <CampoForm label="Telefone">
            <input className="input-base" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(12) 99999-9999" />
          </CampoForm>

          <CampoForm label="CEP">
            <input className="input-base" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} onBlur={handleCepBlur} placeholder="00000-000" />
          </CampoForm>

          <div className="sm:col-span-2">
            <CampoForm label="Endereço">
              <input className="input-base" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, bairro" />
            </CampoForm>
          </div>

          <CampoForm label="Cidade">
            <input className="input-base" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Jacareí" />
          </CampoForm>

          <CampoForm label="Estado (UF)">
            <input className="input-base" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="SP" maxLength={2} />
          </CampoForm>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar aluno"}
          </button>
        </div>
      </Modal>

      {/* Modal exibindo a senha temporária gerada */}
      <Modal aberto={modalSenhaAberto} onFechar={() => setModalSenhaAberto(false)} titulo="Aluno cadastrado!" largura="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            O aluno foi cadastrado. Compartilhe a senha temporária abaixo. O aluno deverá alterá-la no primeiro acesso.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <KeyRound className="h-4 w-4 flex-shrink-0 text-slate-500" />
            <span className="font-mono text-lg font-bold tracking-wider text-slate-800">{senhaTemp}</span>
          </div>
          <button className="btn-primary w-full" onClick={() => { navigator.clipboard.writeText(senhaTemp ?? ""); toast.success("Senha copiada!"); }}>
            Copiar senha
          </button>
        </div>
      </Modal>

      {/* Modal de confirmação de desativação */}
      <ModalConfirmacao
        aberto={confirmandoId !== null}
        onFechar={() => setConfirmandoId(null)}
        onConfirmar={handleDesativar}
        titulo="Desativar aluno"
        descricao="Tem certeza que deseja desativar este aluno? Ele não conseguirá mais acessar o sistema, mas os dados serão preservados."
        carregando={desativando}
      />
    </PaginaContainer>
  );
}
