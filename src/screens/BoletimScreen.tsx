import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import { colors, spacing, fontSize, borderRadius, shadow } from '../styles/theme';
import { RootStackParamList } from '../navigation/types';

// --- Tipos ---
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Boletim'>;

interface Props {
  navigation: NavigationProp;
}

type Situacao = 'Aprovado' | 'Reprovado' | 'Recuperação';

interface BoletimItem {
  id: number;
  disciplina: string;
  nota1: number;
  nota2: number;
  media: number;
  situacao: Situacao;
}

interface SituacaoStyle {
  bg: string;
  text: string;
  icon: string;
}

// --- Dados simulados ---
const BOLETIM_MOCK: BoletimItem[] = [
  { id: 1, disciplina: 'Programação para Dispositivos Móveis I', nota1: 8.5, nota2: 9.0, media: 8.75, situacao: 'Aprovado' },
  { id: 2, disciplina: 'Banco de Dados Relacional', nota1: 7.0, nota2: 6.5, media: 6.75, situacao: 'Aprovado' },
  { id: 3, disciplina: 'Engenharia de Software', nota1: 5.0, nota2: 4.5, media: 4.75, situacao: 'Reprovado' },
  { id: 4, disciplina: 'Desenvolvimento Web', nota1: 6.0, nota2: 5.5, media: 5.75, situacao: 'Recuperação' },
  { id: 5, disciplina: 'Redes de Computadores', nota1: 9.5, nota2: 8.0, media: 8.75, situacao: 'Aprovado' },
  { id: 6, disciplina: 'Inteligência Artificial', nota1: 7.5, nota2: 8.0, media: 7.75, situacao: 'Aprovado' },
];

const getSituacaoStyle = (situacao: Situacao): SituacaoStyle => {
  switch (situacao) {
    case 'Aprovado':
      return { bg: '#E8F5E9', text: colors.approved, icon: '✅' };
    case 'Reprovado':
      return { bg: '#FFEBEE', text: colors.failed, icon: '❌' };
    case 'Recuperação':
      return { bg: '#FFF3E0', text: colors.recovering, icon: '⚠️' };
  }
};

// --- Componente ---
const BoletimScreen = ({ navigation }: Props) => {
  const [boletim, setBoletim] = useState<BoletimItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('[Boletim] Carregando boletim acadêmico...');
    setTimeout(() => {
      setBoletim(BOLETIM_MOCK);
      setLoading(false);
      console.log('[Boletim] Dados carregados:', BOLETIM_MOCK.length, 'disciplinas');
    }, 800);
  }, []);

  const aprovadas: number = boletim.filter((d) => d.situacao === 'Aprovado').length;
  const reprovadas: number = boletim.filter((d) => d.situacao === 'Reprovado').length;
  const recuperacao: number = boletim.filter((d) => d.situacao === 'Recuperação').length;
  const mediaGeral: string = boletim.length
    ? (boletim.reduce((acc, d) => acc + d.media, 0) / boletim.length).toFixed(2)
    : '0.00';

  return (
    <View style={styles.flex}>
      <AppHeader title="Boletim Acadêmico" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando boletim...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Resumo */}
          <View style={styles.resumeCard}>
            <Text style={styles.resumeTitle}>📊 Resumo do Semestre</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.approved }]}>{aprovadas}</Text>
                <Text style={styles.statLabel}>Aprovadas</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.recovering }]}>{recuperacao}</Text>
                <Text style={styles.statLabel}>Recuperação</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.failed }]}>{reprovadas}</Text>
                <Text style={styles.statLabel}>Reprovadas</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{mediaGeral}</Text>
                <Text style={styles.statLabel}>Média Geral</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Disciplinas</Text>

          {/* Cabeçalho da tabela */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colHeader, { flex: 3 }]}>Disciplina</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>N1</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>N2</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Méd</Text>
            <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'center' }]}>Situação</Text>
          </View>

          {/* Linhas */}
          {boletim.map((item, index) => {
            const s = getSituacaoStyle(item.situacao);
            return (
              <View
                key={item.id}
                style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
              >
                <Text style={[styles.cell, { flex: 3, fontWeight: '600' }]} numberOfLines={2}>
                  {item.disciplina}
                </Text>
                <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>{item.nota1}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>{item.nota2}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: 'center', fontWeight: '700', color: s.text }]}>
                  {item.media.toFixed(1)}
                </Text>
                <View style={[styles.situacaoChip, { flex: 1.5, backgroundColor: s.bg }]}>
                  <Text style={[styles.situacaoText, { color: s.text }]}>
                    {s.icon} {item.situacao}
                  </Text>
                </View>
              </View>
            );
          })}

          <Text style={styles.obs}>* Dados simulados para fins acadêmicos.</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textSecondary, marginTop: spacing.md, fontSize: fontSize.md },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  resumeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  resumeTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: fontSize.xl, fontWeight: '900' },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: 2,
  },
  colHeader: {
    color: '#FFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: 2,
    borderRadius: borderRadius.sm,
  },
  rowEven: { backgroundColor: colors.surface },
  rowOdd: { backgroundColor: colors.inputBg },
  cell: { fontSize: fontSize.sm, color: colors.textPrimary },
  situacaoChip: {
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    alignItems: 'center',
  },
  situacaoText: { fontSize: 9, fontWeight: '700' },
  obs: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    marginTop: spacing.lg,
  },
});

export default BoletimScreen;
