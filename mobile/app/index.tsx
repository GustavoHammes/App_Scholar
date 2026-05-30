/**
 * Tela raiz — redireciona conforme estado de autenticação
 * Usuário logado → tabs | Não logado → login
 */

import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui";
import { View, StyleSheet } from "react-native";
import { Cores } from "@/components/ui";

export default function Index() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={estilos.container}>
        <Spinner texto="Verificando sessão..." />
      </View>
    );
  }

  return <Redirect href={usuario ? "/(tabs)/" : "/login"} />;
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Cores.fundo,
  },
});
