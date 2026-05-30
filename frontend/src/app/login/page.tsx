"use client";

/**
 * Página de Login
 * - Exibe erro inline quando as credenciais são inválidas
 * - Botão "Esqueci minha senha" abre modal de redefinição direta
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, GraduationCap, AlertCircle } from "lucide-react";
import { Modal, CampoForm } from "@/components/ui";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Erro inline exibido abaixo do formulário
  const [erro, setErro] = useState("");

  // Estado do modal de recuperação de senha
  const [modalRecuperacao, setModalRecuperacao] = useState(false);
  const [emailRecup, setEmailRecup] = useState("");
  const [novaSenhaRecup, setNovaSenhaRecup] = useState("");
  const [confirmaSenhaRecup, setConfirmaSenhaRecup] = useState("");
  const [salvandoRecup, setSalvandoRecup] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); // limpa erro anterior

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha e-mail e senha para continuar.");
      return;
    }

    setCarregando(true);
    try {
      await login(email, senha);
    } catch (error: unknown) {
      const mensagem =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Credenciais inválidas. Verifique seu e-mail e senha.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinirSenha() {
    if (!emailRecup.trim()) {
      toast.error("Informe o e-mail cadastrado"); return;
    }
    if (novaSenhaRecup.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres"); return;
    }
    if (novaSenhaRecup !== confirmaSenhaRecup) {
      toast.error("As senhas não coincidem"); return;
    }

    setSalvandoRecup(true);
    try {
      await api.post("/auth/redefinir-senha", {
        email: emailRecup,
        novaSenha: novaSenhaRecup,
      });
      toast.success("Senha redefinida! Faça login com a nova senha.");
      setModalRecuperacao(false);
      setEmailRecup(""); setNovaSenhaRecup(""); setConfirmaSenhaRecup("");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "E-mail não encontrado no sistema.");
    } finally {
      setSalvandoRecup(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">App Scholar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sistema de Boletim Acadêmico — FATEC Jacareí
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">E-mail institucional</label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setErro(""); }}
                className="input-base" placeholder="seu.nome@scholar.fatec.br"
                autoComplete="email" autoFocus disabled={carregando}
              />
            </div>

            <div>
              <label htmlFor="senha" className="label">Senha</label>
              <div className="relative">
                <input
                  id="senha" type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro(""); }}
                  className="input-base pr-10" placeholder="••••••••"
                  autoComplete="current-password" disabled={carregando}
                />
                <button type="button" onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}>
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Erro inline — aparece só quando há falha */}
            {erro && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{erro}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2" disabled={carregando}>
              {carregando ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Entrando...</>
              ) : "Entrar"}
            </button>
          </form>

          {/* Link de recuperação de senha */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setModalRecuperacao(true)}
              className="text-sm text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline transition-colors"
            >
              Esqueci minha senha
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Curso: Desenvolvimento de Software Multiplataforma
        </p>
      </div>

      {/* Modal de redefinição de senha */}
      <Modal aberto={modalRecuperacao} onFechar={() => setModalRecuperacao(false)}
        titulo="Redefinir Senha" largura="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Informe seu e-mail cadastrado e defina uma nova senha de acesso.
          </p>
          <CampoForm label="E-mail institucional" obrigatorio>
            <input className="input-base" type="email" value={emailRecup}
              onChange={(e) => setEmailRecup(e.target.value)}
              placeholder="seu.nome@scholar.fatec.br" />
          </CampoForm>
          <CampoForm label="Nova senha" obrigatorio>
            <input className="input-base" type="password" value={novaSenhaRecup}
              onChange={(e) => setNovaSenhaRecup(e.target.value)}
              placeholder="Mínimo 6 caracteres" />
          </CampoForm>
          <CampoForm label="Confirmar nova senha" obrigatorio>
            <input className="input-base" type="password" value={confirmaSenhaRecup}
              onChange={(e) => setConfirmaSenhaRecup(e.target.value)}
              placeholder="Repita a nova senha" />
          </CampoForm>
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setModalRecuperacao(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleRedefinirSenha} disabled={salvandoRecup}>
              {salvandoRecup ? "Salvando..." : "Redefinir senha"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}