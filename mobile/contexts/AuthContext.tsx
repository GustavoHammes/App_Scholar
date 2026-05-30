"use client";

/**
 * Contexto de Autenticação — Mobile
 * Gerencia login, logout e persistência da sessão via AsyncStorage.
 * Funciona igual ao da versão web, mas adaptado para React Native.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import api, { STORAGE_TOKEN, STORAGE_USUARIO } from "@/lib/api";
import { Usuario } from "@/types";

interface AuthContextData {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao montar, tenta restaurar a sessão salva no AsyncStorage
  useEffect(() => {
    async function restaurarSessao() {
      try {
        const usuarioSalvo = await AsyncStorage.getItem(STORAGE_USUARIO);
        if (usuarioSalvo) {
          setUsuario(JSON.parse(usuarioSalvo));
        }
      } catch {
        // Dados corrompidos — limpa o storage
        await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USUARIO]);
      } finally {
        setCarregando(false);
      }
    }
    restaurarSessao();
  }, []);

  async function login(email: string, senha: string) {
    const response = await api.post("/auth/login", { email, senha });
    const { token, usuario: novoUsuario } = response.data;

    // Persiste token e dados no AsyncStorage
    await AsyncStorage.setItem(STORAGE_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_USUARIO, JSON.stringify(novoUsuario));

    setUsuario(novoUsuario);

    // Redireciona conforme o estado do primeiro acesso
    if (novoUsuario.primeiroAcesso) {
      router.replace("/(tabs)/perfil");
    } else {
      router.replace("/(tabs)/");
    }
  }

  async function logout() {
    await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USUARIO]);
    setUsuario(null);
    router.replace("/login");
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}
