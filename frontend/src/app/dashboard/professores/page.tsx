"use client";

/**
 * Página de Professores
 * Admin: lista completa com cadastro e edição
 * Aluno: visualização somente leitura
 */

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, KeyRound, Award } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  PaginaContainer, Tabela, Modal, CampoForm, EstadoVazio, Spinner,
} from "@/components/ui";
import api from "@/lib/api";
import { Professor } from "@/types";

interface FormProfessor {
  nome: string; email: string; titulacao: string; area: string; tempoDocencia: string;
}

const FORM_VAZIO: FormProfessor = { nome: "", email: "", titulacao: "", area: "", tempoDocencia: "" };

export default function ProfessoresPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === "ADMIN";

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Professor | null>(null);
  const [form, setForm] = useState<FormProfessor>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [senhaTemp, setSenhaTemp] = useState<string | null>(null);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

  useEffect(() => { carregarProfessores(); }, []);

  async function carregarProfessores() {
    setCarregando(true);
    try {
      const res = await api.get<Professor[]>("/professores");
      setProfessores(res.data);
    } catch {
      toast.error("Erro ao carregar professores");
    } finally {
      setCarregando(false);
    }
  }

  const filtrados = professores.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.area ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  function abrirModalNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirModalEditar(prof: Professor) {
    setEditando(prof);
    setForm({
      nome: prof.nome, email: prof.usuario?.email ?? "",
      titulacao: prof.titulacao ?? "", area: prof.area ?? "",
      tempoDocencia: prof.tempoDocencia?.toString() ?? "",
    });
    setModalAberto(true);
  }

  async function handleSalvar() {
    if (!form.nome || (!editando && !form.email)) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/professores/${editando.id}`, form);
        toast.success("Professor atualizado");
      } else {
        const res = await api.post("/professores", form);
        if (res.data.senhaTemporaria) {
          setSenhaTemp(res.data.senhaTemporaria);
          setModalSenhaAberto(true);
        }
        toast.success("Professor cadastrado");
      }
      setModalAberto(false);
      carregarProfessores();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Spinner />;

  return (
    <PaginaContainer
      titulo="Professores"
      subtitulo={`${filtrados.length} professor(es)`}
      acao={isAdmin ? (
        <button className="btn-primary" onClick={abrirModalNovo}>
          <Plus className="h-4 w-4" />Novo Professor
        </button>
      ) : undefined}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Buscar por nome ou área..." value={busca}
          onChange={(e) => setBusca(e.target.value)} className="input-base pl-9" />
      </div>

      <Tabela
        cabecalhos={["Professor", "Titulação", "Área de Atuação", "Tempo de Docência", "Disciplinas", ...(isAdmin ? ["Ações"] : [])]}
        vazia={filtrados.length === 0}
        componenteVazio={<EstadoVazio icone={Award} titulo="Nenhum professor encontrado" />}
      >
        {filtrados.map((prof) => (
          <tr key={prof.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3">
              <p className="font-medium text-slate-800">{prof.nome}</p>
              <p className="text-xs text-slate-500">{prof.usuario?.email}</p>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{prof.titulacao ?? "—"}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{prof.area ?? "—"}</td>
            <td className="px-4 py-3 text-sm text-slate-600">
              {prof.tempoDocencia ? `${prof.tempoDocencia} ano(s)` : "—"}
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{prof.disciplinas?.length ?? 0}</td>
            {isAdmin && (
              <td className="px-4 py-3">
                <button onClick={() => abrirModalEditar(prof)}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </td>
            )}
          </tr>
        ))}
      </Tabela>

      {/* Modal de cadastro/edição */}
      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)}
        titulo={editando ? "Editar Professor" : "Novo Professor"} largura="md">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CampoForm label="Nome completo" obrigatorio>
              <input className="input-base" value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do professor" />
            </CampoForm>
          </div>
          <div className="sm:col-span-2">
            <CampoForm label="E-mail institucional" obrigatorio>
              <input className="input-base" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="professor@scholar.fatec.br" disabled={!!editando} />
            </CampoForm>
          </div>
          <CampoForm label="Titulação">
            <input className="input-base" value={form.titulacao}
              onChange={(e) => setForm({ ...form, titulacao: e.target.value })} placeholder="Mestre, Doutor..." />
          </CampoForm>
          <CampoForm label="Tempo de Docência (anos)">
            <input className="input-base" type="number" min="0" value={form.tempoDocencia}
              onChange={(e) => setForm({ ...form, tempoDocencia: e.target.value })} placeholder="0" />
          </CampoForm>
          <div className="sm:col-span-2">
            <CampoForm label="Área de Atuação">
              <input className="input-base" value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Ex: Engenharia de Software" />
            </CampoForm>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar professor"}
          </button>
        </div>
      </Modal>

      {/* Modal de senha temporária */}
      <Modal aberto={modalSenhaAberto} onFechar={() => setModalSenhaAberto(false)}
        titulo="Professor cadastrado!" largura="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">Compartilhe a senha temporária. O professor deverá alterá-la no primeiro acesso.</p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <KeyRound className="h-4 w-4 text-slate-500" />
            <span className="font-mono text-lg font-bold text-slate-800">{senhaTemp}</span>
          </div>
          <button className="btn-primary w-full" onClick={() => { navigator.clipboard.writeText(senhaTemp ?? ""); toast.success("Copiado!"); }}>
            Copiar senha
          </button>
        </div>
      </Modal>
    </PaginaContainer>
  );
}
