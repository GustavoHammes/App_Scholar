/**
 * Tela do Painel (Home)
 * Exibe boas-vindas personalizadas e atalhos conforme o perfil.
 */

import { useEffect, useState } from "react";
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner, Cores, Card, BadgeSituacao } from "@/components/ui";
import api from "@/lib/api";
import { Aluno, Nota } from "@/types";

function getSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function PainelScreen() {
  const { usuario } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [totalDisciplinas, setTotalDisciplinas] = useState(0);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [alunoAtual, setAlunoAtual] = useState<Aluno | null>(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      if (usuario?.perfil === "ADMIN" || usuario?.perfil === "PROFESSOR") {
        const [al, disc] = await Promise.all([
          api.get("/alunos"), api.get("/disciplinas"),
        ]);
        setTotalAlunos(al.data.length);
        setTotalDisciplinas(disc.data.length);
      } else if (usuario?.perfil === "ALUNO") {
        const alunosRes = await api.get<Aluno[]>("/alunos");
        const aluno = alunosRes.data[0];
        if (aluno) {
          setAlunoAtual(aluno);
          const notasRes = await api.get<Nota[]>(`/notas/aluno/${aluno.id}`);
          setNotas(notasRes.data);
        }
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  if (carregando) return <Spinner />;

  const notasComMedia = notas.filter((n) => n.media != null);
  const mediaGeral = notasComMedia.length > 0
    ? (notasComMedia.reduce((s, n) => s + (n.media ?? 0), 0) / notasComMedia.length).toFixed(1)
    : null;

  const labelPerfil = { ADMIN: "Administrador", PROFESSOR: "Professor", ALUNO: "Aluno" }[usuario!.perfil];

  return (
    <ScrollView
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} />
      }
    >
      {/* Banner de boas-vindas */}
      <View style={estilos.banner}>
        <Text style={estilos.bannerSaudacao}>{getSaudacao()},</Text>
        <Text style={estilos.bannerNome}>{usuario?.nome}</Text>
        <Text style={estilos.bannerPerfil}>{labelPerfil}</Text>
        {usuario?.perfil === "ALUNO" && alunoAtual && (
          <Text style={estilos.bannerMatricula}>
            {alunoAtual.matricula} · {alunoAtual.curso}
          </Text>
        )}
      </View>

      {/* ── PAINEL ADMIN / PROFESSOR ── */}
      {(usuario?.perfil === "ADMIN" || usuario?.perfil === "PROFESSOR") && (
        <>
          <View style={estilos.statsRow}>
            <StatCard titulo="Alunos" valor={totalAlunos} icone="people" cor="#3b82f6" />
            <StatCard titulo="Disciplinas" valor={totalDisciplinas} icone="book" cor="#059669" />
          </View>
          <Text style={estilos.secaoTitulo}>Ações rápidas</Text>
          <View style={estilos.acoesGrid}>
            <AcaoCard titulo="Alunos" icone="people-outline" rota="/(tabs)/alunos" />
            <AcaoCard titulo="Disciplinas" icone="book-outline" rota="/(tabs)/disciplinas" />
            <AcaoCard titulo="Notas" icone="clipboard-outline" rota="/(tabs)/notas" />
            <AcaoCard titulo="Perfil" icone="person-circle-outline" rota="/(tabs)/perfil" />
          </View>
        </>
      )}

      {/* ── PAINEL ALUNO ── */}
      {usuario?.perfil === "ALUNO" && (
        <>
          <View style={estilos.statsRow}>
            <StatCard titulo="Disciplinas" valor={notas.length} icone="book" cor="#3b82f6" />
            <StatCard titulo="Aprovações" valor={notas.filter((n) => n.situacao === "Aprovado").length} icone="checkmark-circle" cor="#059669" />
            {mediaGeral && (
              <StatCard titulo="Média" valor={Number(mediaGeral)} icone="trending-up" cor={Number(mediaGeral) >= 6 ? "#059669" : Number(mediaGeral) >= 4 ? "#d97706" : "#dc2626"} />
            )}
          </View>

          {/* Últimas notas */}
          {notas.length > 0 && (
            <>
              <Text style={estilos.secaoTitulo}>Últimas notas</Text>
              <Card>
                {notas.slice(0, 4).map((nota, i) => (
                  <View key={nota.id}>
                    {i > 0 && <View style={estilos.separador} />}
                    <View style={estilos.notaRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={estilos.notaDisciplina} numberOfLines={1}>
                          {nota.disciplina?.nome ?? "—"}
                        </Text>
                        <Text style={estilos.notaDetalhe}>
                          N1: {nota.nota1 ?? "—"} · N2: {nota.nota2 ?? "—"}
                        </Text>
                      </View>
                      <View style={estilos.notaMedia}>
                        <Text style={[estilos.mediaValor, { color: !nota.media ? Cores.textoSecundario : nota.media >= 6 ? Cores.aprovado : nota.media >= 4 ? Cores.recuperacao : Cores.reprovado }]}>
                          {nota.media ?? "—"}
                        </Text>
                        <BadgeSituacao situacao={nota.situacao} />
                      </View>
                    </View>
                  </View>
                ))}
                {notas.length > 4 && (
                  <TouchableOpacity style={estilos.verMais} onPress={() => router.push("/(tabs)/boletim")}>
                    <Text style={estilos.verMaisTexto}>Ver boletim completo →</Text>
                  </TouchableOpacity>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

function StatCard({ titulo, valor, icone, cor }: { titulo: string; valor: number; icone: string; cor: string }) {
  return (
    <View style={[estilos.statCard, { flex: 1 }]}>
      <View style={[estilos.statIcone, { backgroundColor: cor + "20" }]}>
        <Ionicons name={icone as never} size={18} color={cor} />
      </View>
      <Text style={estilos.statValor}>{valor}</Text>
      <Text style={estilos.statTitulo}>{titulo}</Text>
    </View>
  );
}

function AcaoCard({ titulo, icone, rota }: { titulo: string; icone: string; rota: string }) {
  return (
    <TouchableOpacity style={estilos.acaoCard} onPress={() => router.push(rota as never)} activeOpacity={0.7}>
      <View style={estilos.acaoIcone}>
        <Ionicons name={icone as never} size={22} color={Cores.primario} />
      </View>
      <Text style={estilos.acaoTitulo}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  conteudo: { padding: 16, gap: 16, paddingBottom: 32 },
  banner: {
    backgroundColor: Cores.primario, borderRadius: 16,
    padding: 20, gap: 2,
  },
  bannerSaudacao: { fontSize: 13, color: "#94a3b8" },
  bannerNome: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: 2 },
  bannerPerfil: { fontSize: 13, color: "#94a3b8" },
  bannerMatricula: { fontSize: 12, color: "#64748b", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    backgroundColor: Cores.branco, borderRadius: 12,
    borderWidth: 1, borderColor: Cores.borda,
    padding: 14, alignItems: "center", gap: 4,
  },
  statIcone: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValor: { fontSize: 24, fontWeight: "700", color: Cores.textoPrincipal },
  statTitulo: { fontSize: 11, color: Cores.textoSecundario, fontWeight: "500" },
  secaoTitulo: { fontSize: 13, fontWeight: "600", color: Cores.textoSecundario, textTransform: "uppercase", letterSpacing: 0.8 },
  acoesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  acaoCard: {
    width: "47%", backgroundColor: Cores.branco,
    borderRadius: 12, borderWidth: 1, borderColor: Cores.borda,
    padding: 16, alignItems: "center", gap: 8,
  },
  acaoIcone: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  acaoTitulo: { fontSize: 13, fontWeight: "600", color: Cores.textoPrincipal },
  separador: { height: 1, backgroundColor: Cores.borda, marginHorizontal: 16 },
  notaRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  notaDisciplina: { fontSize: 14, fontWeight: "600", color: Cores.textoPrincipal, flex: 1 },
  notaDetalhe: { fontSize: 12, color: Cores.textoSecundario, marginTop: 2 },
  notaMedia: { alignItems: "flex-end", gap: 4 },
  mediaValor: { fontSize: 20, fontWeight: "700" },
  verMais: { padding: 14, alignItems: "center", borderTopWidth: 1, borderTopColor: Cores.borda },
  verMaisTexto: { fontSize: 13, color: Cores.textoSecundario, fontWeight: "500" },
});
