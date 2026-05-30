/**
 * Tela de Alunos — Mobile
 * Admin: lista completa com busca
 * Professor: alunos das suas turmas
 */

import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, StyleSheet,
  TouchableOpacity, Alert, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner, Cores, Card, EstadoVazio } from "@/components/ui";
import api from "@/lib/api";
import { Aluno } from "@/types";

export default function AlunosScreen() {
  const { usuario } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const res = await api.get<Aluno[]>("/alunos");
      setAlunos(res.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os alunos.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  const filtrados = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.matricula.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) return <Spinner />;

  return (
    <View style={estilos.tela}>
      {/* Campo de busca */}
      <View style={estilos.buscaContainer}>
        <Ionicons name="search-outline" size={18} color={Cores.textoSecundario} style={estilos.buscaIcone} />
        <TextInput
          style={estilos.buscaInput}
          placeholder="Buscar por nome ou matrícula..."
          placeholderTextColor="#94a3b8"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <Text style={estilos.contador}>{filtrados.length} aluno(s)</Text>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} />
        }
        ListEmptyComponent={
          <EstadoVazio titulo="Nenhum aluno encontrado" descricao={busca ? "Tente outro termo de busca" : undefined} />
        }
        renderItem={({ item }) => (
          <Card style={estilos.card}>
            {/* Avatar inicial + dados principais */}
            <View style={estilos.cardTopo}>
              <View style={estilos.avatar}>
                <Text style={estilos.avatarLetra}>{item.nome.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nome}>{item.nome}</Text>
                <Text style={estilos.email}>{item.usuario?.email}</Text>
              </View>
              {/* Indicador de primeiro acesso */}
              {item.usuario?.primeiroAcesso && (
                <View style={estilos.badgePrimeiroAcesso}>
                  <Text style={estilos.badgePrimeiroAcessoTexto}>1º acesso</Text>
                </View>
              )}
            </View>

            <View style={estilos.separador} />

            {/* Detalhes do aluno */}
            <View style={estilos.cardInfo}>
              <InfoItem icone="card-outline" texto={item.matricula} />
              <InfoItem icone="school-outline" texto={item.curso} />
              {item.telefone && <InfoItem icone="call-outline" texto={item.telefone} />}
              {item.cidade && (
                <InfoItem icone="location-outline" texto={`${item.cidade} - ${item.estado}`} />
              )}
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
      <Ionicons name={icone as never} size={14} color={Cores.textoSecundario} />
      <Text style={estilos.infoTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  buscaContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Cores.branco,
    borderBottomWidth: 1, borderBottomColor: Cores.borda,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  buscaIcone: { marginRight: 8 },
  buscaInput: { flex: 1, fontSize: 14, color: Cores.textoPrincipal },
  contador: {
    fontSize: 12, color: Cores.textoSecundario,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, fontWeight: "500",
  },
  lista: { padding: 16, gap: 10, paddingBottom: 32 },
  card: { padding: 0 },
  cardTopo: {
    flexDirection: "row", alignItems: "center",
    padding: 14, gap: 12,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#e2e8f0",
    alignItems: "center", justifyContent: "center",
  },
  avatarLetra: { fontSize: 16, fontWeight: "700", color: Cores.primario },
  nome: { fontSize: 15, fontWeight: "600", color: Cores.textoPrincipal },
  email: { fontSize: 12, color: Cores.textoSecundario, marginTop: 1 },
  badgePrimeiroAcesso: {
    backgroundColor: "#fef3c7", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  badgePrimeiroAcessoTexto: { fontSize: 10, color: "#92400e", fontWeight: "600" },
  separador: { height: 1, backgroundColor: Cores.borda },
  cardInfo: { padding: 14, gap: 6 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoTexto: { fontSize: 13, color: Cores.textoSecundario, flex: 1 },
});
