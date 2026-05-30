"use client";

/**
 * Componentes de UI reutilizáveis
 * Centralizados em um único arquivo para facilitar importações.
 * Cada componente segue o padrão de design do sistema (cores neutras, bordas suaves).
 */

import React from "react";
import { X, AlertTriangle } from "lucide-react";

// ─────────────────────────────────────────────
// BADGE — exibe status/situação com cor semântica
// ─────────────────────────────────────────────
interface BadgeProps {
  texto: string;
  variante?: "aprovado" | "recuperacao" | "reprovado" | "neutro" | "info";
}

export function Badge({ texto, variante = "neutro" }: BadgeProps) {
  const estilos = {
    aprovado: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    recuperacao: "bg-amber-50 text-amber-700 border border-amber-200",
    reprovado: "bg-red-50 text-red-700 border border-red-200",
    neutro: "bg-slate-100 text-slate-600 border border-slate-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estilos[variante]}`}>
      {texto}
    </span>
  );
}

// Converte a string de situação para a variante correta do Badge
export function BadgeSituacao({ situacao }: { situacao?: string | null }) {
  if (!situacao) return <span className="text-xs text-slate-400">—</span>;

  const mapa: Record<string, BadgeProps["variante"]> = {
    Aprovado: "aprovado",
    Recuperação: "recuperacao",
    Reprovado: "reprovado",
  };

  return <Badge texto={situacao} variante={mapa[situacao] ?? "neutro"} />;
}

// ─────────────────────────────────────────────
// CARD — container padrão com borda e sombra suave
// ─────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL — janela de diálogo sobreposta
// ─────────────────────────────────────────────
interface ModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: React.ReactNode;
  largura?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ aberto, onFechar, titulo, children, largura = "md" }: ModalProps) {
  if (!aberto) return null;

  const larguras = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    // Overlay escurecido — clicar fora fecha o modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div className={`w-full ${larguras[largura]} rounded-xl bg-white shadow-xl animate-slide-in`}>
        {/* Cabeçalho do modal */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">{titulo}</h3>
          <button
            onClick={onFechar}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Conteúdo do modal */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL DE CONFIRMAÇÃO — para ações destrutivas
// ─────────────────────────────────────────────
interface ModalConfirmacaoProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: () => void;
  titulo: string;
  descricao: string;
  carregando?: boolean;
}

export function ModalConfirmacao({
  aberto,
  onFechar,
  onConfirmar,
  titulo,
  descricao,
  carregando,
}: ModalConfirmacaoProps) {
  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo={titulo} largura="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-sm text-slate-600">{descricao}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onFechar} className="btn-secondary" disabled={carregando}>
            Cancelar
          </button>
          <button onClick={onConfirmar} className="btn-danger" disabled={carregando}>
            {carregando ? "Aguarde..." : "Confirmar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// CAMPO DE FORMULÁRIO com label e mensagem de erro
// ─────────────────────────────────────────────
interface CampoFormProps {
  label: string;
  erro?: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
}

export function CampoForm({ label, erro, obrigatorio, children }: CampoFormProps) {
  return (
    <div>
      <label className="label">
        {label}
        {obrigatorio && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {/* Mensagem de erro do campo */}
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// ESTADO VAZIO — exibido quando não há dados na listagem
// ─────────────────────────────────────────────
interface EstadoVazioProps {
  icone: React.ElementType;
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}

export function EstadoVazio({ icone: Icone, titulo, descricao, acao }: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icone className="h-6 w-6 text-slate-400" />
      </div>
      <p className="font-medium text-slate-700">{titulo}</p>
      {descricao && <p className="mt-1 text-sm text-slate-500">{descricao}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// SPINNER de carregamento
// ─────────────────────────────────────────────
export function Spinner({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      <p className="text-sm text-slate-500">{texto}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// CONTAINER DE PÁGINA — wrapper padrão com padding
// ─────────────────────────────────────────────
export function PaginaContainer({
  titulo,
  subtitulo,
  acao,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho da página com título e botão de ação opcional */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{titulo}</h1>
          {subtitulo && (
            <p className="mt-0.5 text-sm text-slate-500">{subtitulo}</p>
          )}
        </div>
        {acao && <div className="flex-shrink-0">{acao}</div>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// TABELA responsiva com estilos padrão do sistema
// ─────────────────────────────────────────────
interface TabelaProps {
  cabecalhos: string[];
  children: React.ReactNode;
  vazia?: boolean;
  componenteVazio?: React.ReactNode;
}

export function Tabela({ cabecalhos, children, vazia, componenteVazio }: TabelaProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {cabecalhos.map((cab) => (
              <th
                key={cab}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {cab}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vazia ? (
            <tr>
              <td colSpan={cabecalhos.length}>
                {componenteVazio}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
