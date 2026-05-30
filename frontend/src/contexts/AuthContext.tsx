"use client";

/**
 * Contexto de Autenticação
 * Gerencia o estado global do usuário logado: login, logout e dados do perfil.
 * Persiste os dados no localStorage para sobreviver a recarregamentos de página.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Usuario } from "@/types";

// Formato dos dados armazenados no contexto
interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

// Chaves usadas no localStorage para persistência
const STORAGE_TOKEN = "scholar_token";
const STORAGE_USUARIO = "scholar_usuario";

// Criação do contexto com valor padrão vazio
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Estado do usuário e token. null = não autenticado
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // true enquanto estiver verificando se há sessão salva no localStorage
  const [carregando, setCarregando] = useState(true);

  // ─────────────────────────────────────────────
  // Ao montar, tenta restaurar a sessão salva
  // ─────────────────────────────────────────────
  useEffect(() => {
    const tokenSalvo = localStorage.getItem(STORAGE_TOKEN);
    const usuarioSalvo = localStorage.getItem(STORAGE_USUARIO);

    if (tokenSalvo && usuarioSalvo) {
      try {
        setToken(tokenSalvo);
        setUsuario(JSON.parse(usuarioSalvo));
      } catch {
        // Dados corrompidos — limpa o localStorage
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USUARIO);
      }
    }

    setCarregando(false);
  }, []);

  // ─────────────────────────────────────────────
  // LOGIN
  // Autentica o usuário e armazena os dados da sessão
  // ─────────────────────────────────────────────
  async function login(email: string, senha: string) {
    const response = await api.post("/auth/login", { email, senha });
    const { token: novoToken, usuario: novoUsuario } = response.data;

    // Persiste no localStorage para sobreviver ao recarregamento
    localStorage.setItem(STORAGE_TOKEN, novoToken);
    localStorage.setItem(STORAGE_USUARIO, JSON.stringify(novoUsuario));

    setToken(novoToken);
    setUsuario(novoUsuario);

    // Se for o primeiro acesso, redireciona para troca de senha obrigatória
    if (novoUsuario.primeiroAcesso) {
      router.push("/dashboard/perfil?primeiroAcesso=true");
    } else {
      router.push("/dashboard");
    }
  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // Remove os dados da sessão e redireciona para o login
  // ─────────────────────────────────────────────
  function logout() {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USUARIO);

    setToken(null);
    setUsuario(null);

    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ usuario, token, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir o contexto de autenticação em qualquer componente
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}
