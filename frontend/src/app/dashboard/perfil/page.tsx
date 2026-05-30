"use client";

/**
 * Página de Perfil do Usuário
 * Permite ao usuário alterar sua senha e atualizar dados pessoais/profissionais.
 * Quando acessada com ?primeiroAcesso=true, exibe aviso de troca obrigatória de senha.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, User, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CampoForm, Spinner } from "@/components/ui";
import api from "@/lib/api";
import { Aluno, Professor } from "@/types";

export default function PerfilPage() {
  const { usuario } = useAuth();
  const searchParams = useSearchParams();
  const isPrimeiroAcesso = searchParams.get("primeiroAcesso") === "true";

  // Dados do perfil carregados da API
  const [dadosAluno, setDadosAluno] = useState<Aluno | null>(null);
  const [dadosProfessor, setDadosProfessor] = useState<Professor | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Estado do formulário de troca de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  // Estado do formulário de edição de dados pessoais
  const [editandoDados, setEditandoDados] = useState(false);
  const [formDados, setFormDados] = useState<Record<string, string>>({});
  const [salvandoDados, setSalvandoDados] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [usuario]);

  async function carregarDados() {
    if (!usuario) return;
    setCarregando(true);
    try {
      if (usuario.perfil === "ALUNO") {
        const res = await api.get<Aluno[]>("/alunos");
        const aluno = res.data[0];
        setDadosAluno(aluno);
        if (aluno) {
          setFormDados({
            nome: aluno.nome, telefone: aluno.telefone ?? "",
            cep: aluno.cep ?? "", endereco: aluno.endereco ?? "",
            cidade: aluno.cidade ?? "", estado: aluno.estado ?? "",
          });
        }
      } else if (usuario.perfil === "PROFESSOR") {
        const res = await api.get<Professor[]>("/professores");
        const prof = res.data.find((p) => p.usuarioId === usuario.id);
        setDadosProfessor(prof ?? null);
        if (prof) {
          setFormDados({
            nome: prof.nome, titulacao: prof.titulacao ?? "",
            area: prof.area ?? "", tempoDocencia: prof.tempoDocencia?.toString() ?? "",
          });
        }
      }
    } finally {
      setCarregando(false);
    }
  }

  async function handleTrocarSenha(e: React.FormEvent) {
    e.preventDefault();

    if (novaSenha !== confirmaSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (novaSenha.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    setTrocandoSenha(true);
    try {
      await api.put("/auth/senha", { senhaAtual, novaSenha });
      toast.success("Senha alterada com sucesso!");
      setSenhaAtual(""); setNovaSenha(""); setConfirmaSenha("");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Erro ao trocar senha");
    } finally {
      setTrocandoSenha(false);
    }
  }

  async function handleSalvarDados(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoDados(true);
    try {
      if (usuario?.perfil === "ALUNO" && dadosAluno) {
        await api.put(`/alunos/${dadosAluno.id}`, formDados);
        toast.success("Dados atualizados com sucesso!");
        setEditandoDados(false);
        carregarDados();
      } else if (usuario?.perfil === "PROFESSOR" && dadosProfessor) {
        await api.put(`/professores/${dadosProfessor.id}`, formDados);
        toast.success("Dados atualizados com sucesso!");
        setEditandoDados(false);
        carregarDados();
      }
    } catch {
      toast.error("Erro ao atualizar dados");
    } finally {
      setSalvandoDados(false);
    }
  }

  if (carregando) return <Spinner />;

  const nomeExibido = dadosAluno?.nome ?? dadosProfessor?.nome ?? usuario?.nome ?? "—";

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="text-sm text-slate-500">Gerencie suas informações pessoais e senha de acesso</p>
      </div>

      {/* Aviso de primeiro acesso */}
      {isPrimeiroAcesso && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Troca de senha obrigatória</p>
            <p className="mt-0.5 text-sm text-amber-700">
              Este é seu primeiro acesso. Por segurança, altere sua senha antes de continuar.
            </p>
          </div>
        </div>
      )}

      {/* Card com dados do usuário */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold">
              {nomeExibido.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{nomeExibido}</p>
              <p className="text-xs text-slate-500">{usuario?.email}</p>
            </div>
          </div>
          {usuario?.perfil !== "ADMIN" && !editandoDados && (
            <button className="btn-secondary text-xs" onClick={() => setEditandoDados(true)}>
              <User className="h-3.5 w-3.5" />Editar dados
            </button>
          )}
        </div>

        {/* Dados informativos (visualização) */}
        {!editandoDados && (
          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
            {usuario?.perfil === "ALUNO" && dadosAluno && (
              <>
                <InfoItem titulo="Matrícula" valor={dadosAluno.matricula} />
                <InfoItem titulo="Curso" valor={dadosAluno.curso} />
                <InfoItem titulo="Telefone" valor={dadosAluno.telefone} />
                <InfoItem titulo="CEP" valor={dadosAluno.cep} />
                <div className="sm:col-span-2">
                  <InfoItem titulo="Endereço" valor={dadosAluno.endereco ? `${dadosAluno.endereco}, ${dadosAluno.cidade} - ${dadosAluno.estado}` : undefined} />
                </div>
              </>
            )}
            {usuario?.perfil === "PROFESSOR" && dadosProfessor && (
              <>
                <InfoItem titulo="Titulação" valor={dadosProfessor.titulacao} />
                <InfoItem titulo="Área de Atuação" valor={dadosProfessor.area} />
                <InfoItem titulo="Tempo de Docência" valor={dadosProfessor.tempoDocencia ? `${dadosProfessor.tempoDocencia} ano(s)` : undefined} />
                <InfoItem titulo="Disciplinas" valor={`${dadosProfessor.disciplinas?.length ?? 0} disciplina(s)`} />
              </>
            )}
            {usuario?.perfil === "ADMIN" && (
              <InfoItem titulo="Perfil" valor="Administrador — acesso total ao sistema" />
            )}
          </div>
        )}

        {/* Formulário de edição de dados */}
        {editandoDados && usuario?.perfil !== "ADMIN" && (
          <form onSubmit={handleSalvarDados} className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
            {usuario?.perfil === "ALUNO" && (
              <>
                <CampoForm label="Telefone">
                  <input className="input-base" value={formDados.telefone ?? ""}
                    onChange={(e) => setFormDados({ ...formDados, telefone: e.target.value })} placeholder="(12) 99999-9999" />
                </CampoForm>
                <CampoForm label="CEP">
                  <input className="input-base" value={formDados.cep ?? ""}
                    onChange={(e) => setFormDados({ ...formDados, cep: e.target.value })} placeholder="00000-000" />
                </CampoForm>
                <div className="sm:col-span-2">
                  <CampoForm label="Endereço">
                    <input className="input-base" value={formDados.endereco ?? ""}
                      onChange={(e) => setFormDados({ ...formDados, endereco: e.target.value })} placeholder="Rua, número, bairro" />
                  </CampoForm>
                </div>
                <CampoForm label="Cidade">
                  <input className="input-base" value={formDados.cidade ?? ""}
                    onChange={(e) => setFormDados({ ...formDados, cidade: e.target.value })} />
                </CampoForm>
                <CampoForm label="Estado (UF)">
                  <input className="input-base" value={formDados.estado ?? ""}
                    onChange={(e) => setFormDados({ ...formDados, estado: e.target.value })} maxLength={2} />
                </CampoForm>
              </>
            )}
            {usuario?.perfil === "PROFESSOR" && (
              <>
                <CampoForm label="Nome completo">
                  <input className="input-base" value={formDados.nome ?? ""}
                    onChange={(e) => setFormDados({ ...formDados, nome: e.target.value })} />
                </CampoForm>
                <CampoForm label="Titulação">
                  <input className="input-base" value={formDados.titulacao ?? ""}
                    onChange={(e) => setFormDados({ ...formDados, titulacao: e.target.value })} />
                </CampoForm>
                <div className="sm:col-span-2">
                  <CampoForm label="Área de Atuação">
                    <input className="input-base" value={formDados.area ?? ""}
                      onChange={(e) => setFormDados({ ...formDados, area: e.target.value })} />
                  </CampoForm>
                </div>
                <CampoForm label="Tempo de Docência (anos)">
                  <input className="input-base" type="number" value={formDados.tempoDocencia ?? ""}
                    onChange={(e) => setFormDados({ ...formDados, tempoDocencia: e.target.value })} />
                </CampoForm>
              </>
            )}
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setEditandoDados(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={salvandoDados}>
                {salvandoDados ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Formulário de troca de senha */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Alterar senha</h3>
        </div>

        <form onSubmit={handleTrocarSenha} className="flex flex-col gap-4">
          <CampoForm label="Senha atual" obrigatorio>
            <input className="input-base" type="password" value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)} placeholder="••••••••" />
          </CampoForm>
          <CampoForm label="Nova senha" obrigatorio>
            <input className="input-base" type="password" value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </CampoForm>
          <CampoForm label="Confirmar nova senha" obrigatorio>
            <input className="input-base" type="password" value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)} placeholder="Repita a nova senha" />
          </CampoForm>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={trocandoSenha}>
              {trocandoSenha ? "Alterando..." : "Alterar senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente auxiliar para exibir informação em modo somente leitura
function InfoItem({ titulo, valor }: { titulo: string; valor?: string | null }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{valor ?? "—"}</p>
    </div>
  );
}
