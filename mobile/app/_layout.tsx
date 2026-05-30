/**
 * Layout raiz do Expo Router
 * Envolve toda a navegação com o AuthProvider para disponibilizar
 * o contexto de autenticação em todas as telas.
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Barra de status com ícones claros (compatível com fundo escuro do header) */}
      <StatusBar style="light" />

      <Stack screenOptions={{ headerShown: false }}>
        {/* Tela de login — sem header */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        {/* Área autenticada com tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
