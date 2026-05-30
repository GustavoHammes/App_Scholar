/**
 * Tela do Boletim — Mobile (exclusiva do Aluno)
 * Exibe todas as notas, média e situação do aluno logado.
 */

import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { Spinner, Cores, Card, BadgeSituacao, EstadoVazio } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Aluno, Nota } from "@/types";

export default function BoletimScreen() {
  const { usuario } = useAuth();
  const [alunoAtual, setAlunoAtual] = useState<Aluno | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const alunosRes = await api.get<Aluno[]>("/alunos");
      const aluno = alunosRes.data[0];
      if (aluno) {
        setAlunoAtual(aluno);
        const notasRes = await api.get<Nota[]>(`/notas/aluno/${aluno.id}`);
        setNotas(notasRes.data);
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  if (carregando) return <Spinner texto="Carregando boletim..." />;

  const notasComMedia = notas.filter((n) => n.media != null);
  const mediaGeral = notasComMedia.length > 0
    ? (notasComMedia.reduce((s, n) => s + (n.media ?? 0), 0) / notasComMedia.length).toFixed(1)
    : null;

  const aprovadas = notas.filter((n) => n.situacao === "Aprovado").length;
  const recuperacao = notas.filter((n) => n.situacao === "Recuperação").length;
  const reprovadas = notas.filter((n) => n.situacao === "Reprovado").length;

  // Agrupa por semestre para melhor visualização
  const porSemestre = notas.reduce<Record<number, Nota[]>>((acc, n) => {
    const sem = n.disciplina?.semestre ?? 0;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(n);
    return acc;
  }, {});

  const semestres = Object.keys(porSemestre).map(Number).sort((a, b) => a - b);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Cores.fundo }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} />}
    >
      {/* Identificação do aluno */}
      {alunoAtual && (
        <View style={est.banner}>
          <View style={{ flex: 1 }}>
            <Text style={est.bannerLabel}>Aluno</Text>
            <Text style={est.bannerNome}>{alunoAtual.nome}</Text>
            <Text style={est.bannerInfo}>
              {alunoAtual.matricula} · {alunoAtual.curso}
            </Text>
          </View>
          {mediaGeral && (
            <View style={est.mediaBanner}>
              <Text style={est.mediaBannerLabel}>Média Geral</Text>
              <Text style={[est.mediaBannerValor, {
                color: Number(mediaGeral) >= 6 ? "#4ade80" : Number(mediaGeral) >= 4 ? "#fbbf24" : "#f87171",
              }]}>
                {mediaGeral}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Cards de resumo */}
      {notas.length > 0 && (
        <View style={est.statsRow}>
          <ResumoCard titulo="Total" valor={notas.length} cor={Cores.textoPrincipal} />
          <ResumoCard titulo="Aprovadas" valor={aprovadas} cor={Cores.aprovado} />
          <ResumoCard titulo="Recup." valor={recuperacao} cor={Cores.recuperacao} />
          <ResumoCard titulo="Reprov." valor={reprovadas} cor={Cores.reprovado} />
        </View>
      )}

      {/* Notas por semestre */}
      {notas.length === 0 ? (
        <EstadoVazio titulo="Nenhuma nota lançada" descricao="As notas aparecerão aqui quando forem lançadas." />
      ) : (
        semestres.map((sem) => (
          <View key={sem} style={{ gap: 8 }}>
            <Text style={est.semTitulo}>{sem}º Semestre</Text>
            <Card>
              {porSemestre[sem].map((nota, i) => (
                <View key={nota.id}>
                  {i > 0 && <View style={{ height: 1, backgroundColor: Cores.borda }} />}
                  <View style={est.notaRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={est.notaNome} numberOfLines={2}>
                        {nota.disciplina?.nome ?? "—"}
                      </Text>
                      <Text style={est.notaProf}>
                        Prof. {nota.disciplina?.professor?.nome ?? "—"}
                      </Text>
                      <View style={est.notasValores}>
                        <Text style={est.notaValorTexto}>N1: <Text style={est.notaValor}>{nota.nota1 ?? "—"}</Text></Text>
                        <Text style={est.notaValorTexto}>N2: <Text style={est.notaValor}>{nota.nota2 ?? "—"}</Text></Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 6 }}>
                      <Text style={[est.media, {
                        color: !nota.media ? Cores.textoSecundario
                          : nota.media >= 6 ? Cores.aprovado
                          : nota.media >= 4 ? Cores.recuperacao
                          : Cores.reprovado,
                      }]}>
                        {nota.media ?? "—"}
                      </Text>
                      <BadgeSituacao situacao={nota.situacao} />
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function ResumoCard({ titulo, valor, cor }: { titulo: string; valor: number; cor: string }) {
  return (
    <View style={est.resumoCard}>
      <Text style={[est.resumoValor, { color: cor }]}>{valor}</Text>
      <Text style={est.resumoTitulo}>{titulo}</Text>
    </View>
  );
}

const est = StyleSheet.create({
  banner: {
    backgroundColor: Cores.primario, borderRadius: 16,
    padding: 18, flexDirection: "row", alignItems: "center",
  },
  bannerLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 2 },
  bannerNome: { fontSize: 18, fontWeight: "700", color: "#fff" },
  bannerInfo: { fontSize: 12, color: "#94a3b8", marginTop: 3 },
  mediaBanner: { alignItems: "center", gap: 2 },
  mediaBannerLabel: { fontSize: 11, color: "#94a3b8" },
  mediaBannerValor: { fontSize: 28, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 8 },
  resumoCard: {
    flex: 1, backgroundColor: Cores.branco, borderRadius: 10,
    borderWidth: 1, borderColor: Cores.borda,
    padding: 10, alignItems: "center", gap: 2,
  },
  resumoValor: { fontSize: 20, fontWeight: "700" },
  resumoTitulo: { fontSize: 10, color: Cores.textoSecundario, fontWeight: "500" },
  semTitulo: {
    fontSize: 11, fontWeight: "600",
    color: Cores.textoSecundario,
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  notaRow: {
    flexDirection: "row", padding: 14, gap: 10,
    alignItems: "flex-start",
  },
  notaNome: { fontSize: 14, fontWeight: "600", color: Cores.textoPrincipal },
  notaProf: { fontSize: 12, color: Cores.textoSecundario, marginTop: 2 },
  notasValores: { flexDirection: "row", gap: 12, marginTop: 6 },
  notaValorTexto: { fontSize: 12, color: Cores.textoSecundario },
  notaValor: { fontWeight: "600", color: Cores.textoPrincipal },
  media: { fontSize: 24, fontWeight: "700" },
});
