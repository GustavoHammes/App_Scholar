/**
 * Tela de Disciplinas — Mobile
 */

import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, StyleSheet, Alert, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Spinner, Cores, Card, Badge, EstadoVazio } from "@/components/ui";
import api from "@/lib/api";
import { Disciplina } from "@/types";

export default function DisciplinasScreen() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const res = await api.get<Disciplina[]>("/disciplinas");
      setDisciplinas(res.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as disciplinas.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  const filtradas = disciplinas.filter(
    (d) =>
      d.nome.toLowerCase().includes(busca.toLowerCase()) ||
      d.curso.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) return <Spinner />;

  return (
    <View style={{ flex: 1, backgroundColor: Cores.fundo }}>
      <View style={est.buscaContainer}>
        <Ionicons name="search-outline" size={18} color={Cores.textoSecundario} style={{ marginRight: 8 }} />
        <TextInput style={est.input} placeholder="Buscar por nome ou curso..."
          placeholderTextColor="#94a3b8" value={busca} onChangeText={setBusca} />
      </View>
      <FlatList
        data={filtradas}
        keyExtractor={(d) => d.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} />}
        ListEmptyComponent={<EstadoVazio titulo="Nenhuma disciplina encontrada" />}
        renderItem={({ item }) => (
          <Card style={{ padding: 16, gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <Text style={est.nome} numberOfLines={2}>{item.nome}</Text>
              <Badge texto={`${item.semestre}º sem.`} variante="info" />
            </View>
            {item.descricao && (
              <Text style={est.descricao} numberOfLines={2}>{item.descricao}</Text>
            )}
            <View style={est.separador} />
            <View style={{ gap: 5 }}>
              <InfoRow icone="person-outline" texto={`Prof. ${item.professor?.nome ?? "—"}`} />
              <InfoRow icone="school-outline" texto={item.curso?.nome ?? "Curso não informado"} />
              <InfoRow icone="time-outline" texto={`${item.cargaHoraria}h · ${item._count?.notas ?? 0} alunos`} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

function InfoRow({ icone, texto }: { icone: string; texto: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Ionicons name={icone as never} size={14} color={Cores.textoSecundario} />
      <Text style={{ fontSize: 13, color: Cores.textoSecundario, flex: 1 }}>{texto}</Text>
    </View>
  );
}

const est = StyleSheet.create({
  buscaContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Cores.branco,
    borderBottomWidth: 1, borderBottomColor: Cores.borda,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 14, color: Cores.textoPrincipal },
  nome: { fontSize: 15, fontWeight: "600", color: Cores.textoPrincipal, flex: 1 },
  descricao: { fontSize: 13, color: Cores.textoSecundario, lineHeight: 18 },
  separador: { height: 1, backgroundColor: Cores.borda },
});
