"use client";

/**
 * Página raiz — redireciona automaticamente com base no estado de autenticação
 * Usuário autenticado → dashboard | Não autenticado → login
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando) {
      // Define o destino com base no estado de autenticação
      router.replace(usuario ? "/dashboard" : "/login");
    }
  }, [usuario, carregando, router]);

  // Exibe um indicador de carregamento enquanto verifica a sessão
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    </div>
  );
}
