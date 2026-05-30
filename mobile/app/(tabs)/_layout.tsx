/**
 * Layout das Tabs — Área autenticada
 * Filtra as abas visíveis com base no perfil do usuário logado.
 * Admin vê tudo | Professor vê suas abas | Aluno vê as suas.
 */

import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner, Cores } from "@/components/ui";
import { View } from "react-native";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

// Definição de cada aba com seus metadados de acesso
interface ConfigAba {
  nome: string;
  titulo: string;
  iconeAtivo: NomeIcone;
  iconeInativo: NomeIcone;
  perfisPermitidos: ("ADMIN" | "PROFESSOR" | "ALUNO")[];
}

const ABAS: ConfigAba[] = [
  {
    nome: "index",
    titulo: "Painel",
    iconeAtivo: "grid",
    iconeInativo: "grid-outline",
    perfisPermitidos: ["ADMIN", "PROFESSOR", "ALUNO"],
  },
  {
    nome: "alunos",
    titulo: "Alunos",
    iconeAtivo: "people",
    iconeInativo: "people-outline",
    perfisPermitidos: ["ADMIN", "PROFESSOR"],
  },
  {
    nome: "professores",
    titulo: "Professores",
    iconeAtivo: "person",
    iconeInativo: "person-outline",
    perfisPermitidos: ["ADMIN", "ALUNO"],
  },
  {
    nome: "disciplinas",
    titulo: "Disciplinas",
    iconeAtivo: "book",
    iconeInativo: "book-outline",
    perfisPermitidos: ["ADMIN", "PROFESSOR", "ALUNO"],
  },
  {
    nome: "notas",
    titulo: "Notas",
    iconeAtivo: "clipboard",
    iconeInativo: "clipboard-outline",
    perfisPermitidos: ["ADMIN", "PROFESSOR"],
  },
  {
    nome: "boletim",
    titulo: "Boletim",
    iconeAtivo: "document-text",
    iconeInativo: "document-text-outline",
    perfisPermitidos: ["ALUNO"],
  },
  {
    nome: "perfil",
    titulo: "Perfil",
    iconeAtivo: "person-circle",
    iconeInativo: "person-circle-outline",
    perfisPermitidos: ["ADMIN", "PROFESSOR", "ALUNO"],
  },
];

export default function TabsLayout() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={{ flex: 1, backgroundColor: Cores.fundo }}>
        <Spinner />
      </View>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!usuario) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        // Estilo da barra de abas inferior
        tabBarActiveTintColor: Cores.primario,
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: Cores.branco,
          borderTopColor: Cores.borda,
          borderTopWidth: 1,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10, fontWeight: "500", marginBottom: 4,
        },
        // Header superior com nome do sistema e perfil do usuário
        headerStyle: { backgroundColor: Cores.primario },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600", fontSize: 16 },
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <Ionicons name="person-circle-outline" size={24} color="#fff" />
          </View>
        ),
      }}
    >
      {ABAS.map((aba) => {
        // Oculta a aba se o perfil do usuário não tiver permissão
        const temAcesso = aba.perfisPermitidos.includes(usuario.perfil);

        return (
          <Tabs.Screen
            key={aba.nome}
            name={aba.nome}
            options={{
              title: aba.titulo,
              // tabBarButton retornando null oculta visualmente a aba
              tabBarButton: temAcesso ? undefined : () => null,
              tabBarIcon: ({ focused, color }) => (
                <Ionicons
                  name={focused ? aba.iconeAtivo : aba.iconeInativo}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
