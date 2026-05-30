/**
 * Tela de Professores — Mobile
 * Lista professores com suas disciplinas e área de atuação.
 */

import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput,
  StyleSheet, Alert, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Spinner, Cores, Card, EstadoVazio } from "@/components/ui";
import api from "@/lib/api";
import { Professor } from "@/types";

export default function ProfessoresScreen() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const res = await api.get<Professor[]>("/professores");
      setProfessores(res.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os professores.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  const filtrados = professores.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.area ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) return <Spinner />;

  return (
    <View style={{ flex: 1, backgroundColor: Cores.fundo }}>
      <View style={est.buscaContainer}>
        <Ionicons name="search-outline" size={18} color={Cores.textoSecundario} style={{ marginRight: 8 }} />
        <TextInput style={est.buscaInput} placeholder="Buscar por nome ou área..."
          placeholderTextColor="#94a3b8" value={busca} onChangeText={setBusca} />
      </View>
      <FlatList
        data={filtrados}
        keyExtractor={(p) => p.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} />}
        ListEmptyComponent={<EstadoVazio titulo="Nenhum professor encontrado" />}
        renderItem={({ item }) => (
          <Card style={{ padding: 16, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View style={est.avatar}>
                <Text style={est.avatarLetra}>{item.nome.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={est.nome}>{item.nome}</Text>
                <Text style={est.email}>{item.usuario?.email}</Text>
              </View>
            </View>
            <View style={est.separador} />
            <View style={{ gap: 5 }}>
              {item.titulacao && <InfoRow icone="ribbon-outline" texto={item.titulacao} />}
              {item.area && <InfoRow icone="briefcase-outline" texto={item.area} />}
              {item.tempoDocencia != null && <InfoRow icone="time-outline" texto={`${item.tempoDocencia} ano(s) de docência`} />}
              <InfoRow icone="book-outline" texto={`${item.disciplinas?.length ?? 0} disciplina(s)`} />
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
  buscaInput: { flex: 1, fontSize: 14, color: Cores.textoPrincipal },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  avatarLetra: { fontSize: 16, fontWeight: "700", color: Cores.primario },
  nome: { fontSize: 15, fontWeight: "600", color: Cores.textoPrincipal },
  email: { fontSize: 12, color: Cores.textoSecundario, marginTop: 1 },
  separador: { height: 1, backgroundColor: Cores.borda },
});
