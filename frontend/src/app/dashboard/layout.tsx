"use client";

/**
 * Layout do Dashboard
 * Envolve todas as páginas autenticadas com a Sidebar e o Header.
 * Redireciona para o login se o usuário não estiver autenticado.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Spinner } from "@/components/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  // Redireciona para o login se não houver sessão ativa
  useEffect(() => {
    if (!carregando && !usuario) {
      router.replace("/login");
    }
  }, [usuario, carregando, router]);

  // Exibe tela de carregamento enquanto verifica a autenticação
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner texto="Verificando sessão..." />
      </div>
    );
  }

  // Não renderiza nada enquanto aguarda o redirecionamento
  if (!usuario) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar fixa na lateral esquerda */}
      <Sidebar />

      {/* Área principal que ocupa o restante da tela */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header fixo no topo */}
        <Header />

        {/* Conteúdo com scroll vertical */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
