/**
 * Tela de Cursos — Mobile
 * Lista cursos cadastrados e permite busca por nome, área ou coordenador.
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Spinner, Cores, Card, EstadoVazio } from "@/components/ui";
import api from "@/lib/api";
import { Curso } from "@/types";

export default function CursosScreen() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const res = await api.get("/cursos?incluirInativos=true");
      setCursos(res.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os cursos.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  const filtrados = cursos.filter((curso) => {
    const termo = busca.toLowerCase();

    return (
      curso.nome.toLowerCase().includes(termo) ||
      curso.area.toLowerCase().includes(termo) ||
      (curso.coordenador?.nome ?? "").toLowerCase().includes(termo)
    );
  });

  if (carregando) return <Spinner />;

  return (
    <View style={estilos.tela}>
      <View style={estilos.buscaContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color={Cores.textoSecundario}
          style={estilos.buscaIcone}
        />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por curso, área ou coordenador"
          placeholderTextColor={Cores.textoSecundario}
          style={estilos.buscaInput}
        />
      </View>

      <Text style={estilos.contador}>{filtrados.length} curso(s)</Text>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregar();
            }}
          />
        }
        ListEmptyComponent={
          <EstadoVazio
            titulo="Nenhum curso encontrado"
            descricao="Os cursos cadastrados aparecerão aqui."
          />
        }
        renderItem={({ item }) => (
          <Card style={estilos.card}>
            <View style={estilos.cardTopo}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nome}>{item.nome}</Text>
                <Text style={estilos.area}>{item.area}</Text>
              </View>

              <View
                style={[
                  estilos.status,
                  { backgroundColor: item.ativo ? "#dcfce7" : "#fee2e2" },
                ]}
              >
                <Text
                  style={[
                    estilos.statusTexto,
                    { color: item.ativo ? "#166534" : "#991b1b" },
                  ]}
                >
                  {item.ativo ? "Ativo" : "Inativo"}
                </Text>
              </View>
            </View>

            <View style={estilos.separador} />

            <View style={estilos.cardInfo}>
              <InfoItem icone="time-outline" texto={`${item.duracaoSemestres} semestres`} />
              <InfoItem
                icone="person-outline"
                texto={`Coord.: ${item.coordenador?.nome ?? "Não definido"}`}
              />
              <InfoItem icone="people-outline" texto={`${item._count?.alunos ?? 0} aluno(s)`} />
              <InfoItem
                icone="book-outline"
                texto={`${item._count?.disciplinas ?? 0} disciplina(s)`}
              />
              {item.descricao ? <Text style={estilos.descricao}>{item.descricao}</Text> : null}
            </View>
          </Card>
        )}
      />
    </View>
  );
}

function InfoItem({ icone, texto }: { icone: string; texto: string }) {
  return (
    <View style={estilos.infoItem}>
      <Ionicons name={icone as any} size={15} color={Cores.textoSecundario} />
      <Text style={estilos.infoTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  buscaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Cores.branco,
    borderBottomWidth: 1,
    borderBottomColor: Cores.borda,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buscaIcone: { marginRight: 8 },
  buscaInput: { flex: 1, fontSize: 14, color: Cores.textoPrincipal },
  contador: {
    fontSize: 12,
    color: Cores.textoSecundario,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    fontWeight: "500",
  },
  lista: { padding: 16, gap: 10, paddingBottom: 32 },
  card: { padding: 0 },
  cardTopo: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  nome: { fontSize: 15, fontWeight: "700", color: Cores.textoPrincipal },
  area: { fontSize: 12, color: Cores.textoSecundario, marginTop: 2 },
  status: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusTexto: { fontSize: 11, fontWeight: "700" },
  separador: { height: 1, backgroundColor: Cores.borda },
  cardInfo: { padding: 14, gap: 7 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoTexto: { fontSize: 13, color: Cores.textoSecundario, flex: 1 },
  descricao: { marginTop: 6, fontSize: 13, color: Cores.textoSecundario, lineHeight: 18 },
});
