/**
 * Layout das Tabs — Área autenticada
 * Filtra as abas visíveis com base no perfil do usuário logado.
 */

import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { Spinner, Cores } from "@/components/ui";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

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
    nome: "cursos",
    titulo: "Cursos",
    iconeAtivo: "school",
    iconeInativo: "school-outline",
    perfisPermitidos: ["ADMIN", "PROFESSOR", "ALUNO"],
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
      <View style={{ flex: 1 }}>
        <Spinner />
      </View>
    );
  }

  if (!usuario) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Cores.branco },
        headerTitleStyle: { color: Cores.textoPrincipal, fontWeight: "700" },
        tabBarActiveTintColor: Cores.primario,
        tabBarInactiveTintColor: Cores.textoSecundario,
        tabBarStyle: {
          backgroundColor: Cores.branco,
          borderTopColor: Cores.borda,
        },
      }}
    >
      {ABAS.map((aba) => {
        const temAcesso = aba.perfisPermitidos.includes(usuario.perfil);

        return (
          <Tabs.Screen
            key={aba.nome}
            name={aba.nome}
            options={{
              title: aba.titulo,
              href: temAcesso ? undefined : null,
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
