/**
 * Tela de Notas — Mobile
 * Professor/Admin seleciona a disciplina e lança as notas dos alunos.
 */

import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  Alert, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Spinner, Cores, BadgeSituacao, EstadoVazio } from "@/components/ui";
import api from "@/lib/api";
import { Disciplina, Aluno, Nota } from "@/types";

export default function NotasScreen() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);
  const [edicoes, setEdicoes] = useState<Record<number, { nota1: string; nota2: string }>>({});
  const [salvandoId, setSalvandoId] = useState<number | null>(null);
  const [mostrarSeletor, setMostrarSeletor] = useState(false);

  useEffect(() => { carregarDisciplinas(); }, []);

  async function carregarDisciplinas() {
    try {
      const res = await api.get<Disciplina[]>("/disciplinas");
      setDisciplinas(res.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar disciplinas.");
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarDisciplina(id: number) {
    setDisciplinaId(id);
    setMostrarSeletor(false);
    setCarregandoAlunos(true);
    setEdicoes({});
    try {
      const [alunosRes, notasRes] = await Promise.all([
        api.get<Aluno[]>("/alunos"),
        api.get<Nota[]>(`/notas/disciplina/${id}`),
      ]);
      setAlunos(alunosRes.data);
      setNotas(notasRes.data);
      // Pré-preenche com as notas já lançadas
      const mapa: Record<number, { nota1: string; nota2: string }> = {};
      for (const n of notasRes.data) {
        mapa[n.alunoId] = { nota1: n.nota1?.toString() ?? "", nota2: n.nota2?.toString() ?? "" };
      }
      setEdicoes(mapa);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setCarregandoAlunos(false);
    }
  }

  async function salvarNota(alunoId: number) {
    if (!disciplinaId) return;
    const ed = edicoes[alunoId];
    const nota1 = ed?.nota1 !== "" ? Number(ed?.nota1) : undefined;
    const nota2 = ed?.nota2 !== "" ? Number(ed?.nota2) : undefined;

    if (nota1 !== undefined && (nota1 < 0 || nota1 > 10)) { Alert.alert("Nota inválida", "Nota 1 deve ser entre 0 e 10"); return; }
    if (nota2 !== undefined && (nota2 < 0 || nota2 > 10)) { Alert.alert("Nota inválida", "Nota 2 deve ser entre 0 e 10"); return; }

    setSalvandoId(alunoId);
    try {
      const existente = notas.find((n) => n.alunoId === alunoId);
      if (existente) {
        const res = await api.put(`/notas/${existente.id}`, { nota1, nota2 });
        setNotas((prev) => prev.map((n) => n.id === existente.id ? { ...n, ...res.data } : n));
      } else {
        const res = await api.post("/notas", { alunoId, disciplinaId, nota1, nota2 });
        setNotas((prev) => [...prev, res.data]);
      }
      Alert.alert("✅ Nota salva", "Nota registrada com sucesso!");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      Alert.alert("Erro", msg ?? "Não foi possível salvar a nota.");
    } finally {
      setSalvandoId(null);
    }
  }

  const disciplinaSelecionada = disciplinas.find((d) => d.id === disciplinaId);

  if (carregando) return <Spinner />;

  return (
    <View style={{ flex: 1, backgroundColor: Cores.fundo }}>
      {/* Seletor de disciplina */}
      <TouchableOpacity style={est.seletor} onPress={() => setMostrarSeletor(!mostrarSeletor)} activeOpacity={0.8}>
        <Ionicons name="book-outline" size={18} color={Cores.textoSecundario} />
        <Text style={est.seletorTexto} numberOfLines={1}>
          {disciplinaSelecionada?.nome ?? "Selecione uma disciplina..."}
        </Text>
        <Ionicons name={mostrarSeletor ? "chevron-up" : "chevron-down"} size={18} color={Cores.textoSecundario} />
      </TouchableOpacity>

      {/* Lista de opções de disciplina */}
      {mostrarSeletor && (
        <View style={est.opcoes}>
          {disciplinas.map((d) => (
            <TouchableOpacity key={d.id} style={est.opcao} onPress={() => selecionarDisciplina(d.id)}>
              <Text style={est.opcaoTexto}>{d.nome}</Text>
              <Text style={est.opcaoSub}>{d.curso} · {d.semestre}º sem.</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Lista de alunos com campos de nota */}
      {disciplinaId && (
        carregandoAlunos ? <Spinner texto="Carregando alunos..." /> : (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}>
            {alunos.length === 0
              ? <EstadoVazio titulo="Nenhum aluno encontrado" />
              : alunos.map((aluno) => {
                const notaAluno = notas.find((n) => n.alunoId === aluno.id);
                const ed = edicoes[aluno.id] ?? { nota1: "", nota2: "" };

                return (
                  <View key={aluno.id} style={est.alunoCard}>
                    <View style={est.alunoHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={est.alunoNome}>{aluno.nome}</Text>
                        <Text style={est.alunoMatricula}>{aluno.matricula}</Text>
                      </View>
                      {notaAluno?.media != null && (
                        <View style={{ alignItems: "flex-end", gap: 3 }}>
                          <Text style={[est.media, { color: notaAluno.media >= 6 ? Cores.aprovado : notaAluno.media >= 4 ? Cores.recuperacao : Cores.reprovado }]}>
                            {notaAluno.media}
                          </Text>
                          <BadgeSituacao situacao={notaAluno.situacao} />
                        </View>
                      )}
                    </View>

                    <View style={est.notasRow}>
                      <View style={est.notaCampo}>
                        <Text style={est.notaLabel}>Nota 1</Text>
                        <TextInput
                          style={est.notaInput}
                          value={ed.nota1}
                          onChangeText={(v) => setEdicoes((p) => ({ ...p, [aluno.id]: { ...p[aluno.id], nota1: v } }))}
                          keyboardType="decimal-pad"
                          placeholder="0.0"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>
                      <View style={est.notaCampo}>
                        <Text style={est.notaLabel}>Nota 2</Text>
                        <TextInput
                          style={est.notaInput}
                          value={ed.nota2}
                          onChangeText={(v) => setEdicoes((p) => ({ ...p, [aluno.id]: { ...p[aluno.id], nota2: v } }))}
                          keyboardType="decimal-pad"
                          placeholder="0.0"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>
                      <TouchableOpacity
                        style={[est.botaoSalvar, salvandoId === aluno.id && { opacity: 0.6 }]}
                        onPress={() => salvarNota(aluno.id)}
                        disabled={salvandoId === aluno.id}
                      >
                        {salvandoId === aluno.id
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <Ionicons name="checkmark" size={18} color="#fff" />
                        }
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
          </ScrollView>
        )
      )}
    </View>
  );
}

const est = StyleSheet.create({
  seletor: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Cores.branco,
    borderBottomWidth: 1, borderBottomColor: Cores.borda,
    padding: 14,
  },
  seletorTexto: { flex: 1, fontSize: 14, color: Cores.textoPrincipal, fontWeight: "500" },
  opcoes: {
    backgroundColor: Cores.branco,
    borderBottomWidth: 1, borderBottomColor: Cores.borda,
    maxHeight: 220,
  },
  opcao: {
    padding: 14,
    borderBottomWidth: 1, borderBottomColor: Cores.borda,
  },
  opcaoTexto: { fontSize: 14, fontWeight: "500", color: Cores.textoPrincipal },
  opcaoSub: { fontSize: 12, color: Cores.textoSecundario, marginTop: 2 },
  alunoCard: {
    backgroundColor: Cores.branco, borderRadius: 12,
    borderWidth: 1, borderColor: Cores.borda, padding: 14, gap: 12,
  },
  alunoHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  alunoNome: { fontSize: 14, fontWeight: "600", color: Cores.textoPrincipal },
  alunoMatricula: { fontSize: 12, color: Cores.textoSecundario, fontFamily: "monospace", marginTop: 2 },
  media: { fontSize: 22, fontWeight: "700" },
  notasRow: { flexDirection: "row", gap: 10, alignItems: "flex-end" },
  notaCampo: { flex: 1, gap: 4 },
  notaLabel: { fontSize: 11, color: Cores.textoSecundario, fontWeight: "500" },
  notaInput: {
    borderWidth: 1, borderColor: Cores.borda,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10,
    fontSize: 14, color: Cores.textoPrincipal, backgroundColor: Cores.branco,
    textAlign: "center",
  },
  botaoSalvar: {
    width: 44, height: 44,
    backgroundColor: Cores.primario,
    borderRadius: 8,
    alignItems: "center", justifyContent: "center",
    alignSelf: "flex-end",
  },
});
