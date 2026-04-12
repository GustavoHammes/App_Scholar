import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, fontSize, borderRadius, shadow } from '../styles/theme';
import { RootStackParamList } from '../navigation/types';

// --- Tipos ---
type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardNavigationProp;
}

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  screen: keyof RootStackParamList;
  color: string;
}

// --- Dados dos cards do menu ---
const MENU_ITEMS: MenuItem[] = [
  {
    id: 'alunos',
    icon: '👤',
    title: 'Alunos',
    subtitle: 'Cadastrar e gerenciar',
    screen: 'CadastroAlunos',
    color: '#1A3C6E',
  },
  {
    id: 'professores',
    icon: '🧑‍🏫',
    title: 'Professores',
    subtitle: 'Cadastrar e gerenciar',
    screen: 'CadastroProfessores',
    color: '#2756A0',
  },
  {
    id: 'disciplinas',
    icon: '📚',
    title: 'Disciplinas',
    subtitle: 'Cadastrar e gerenciar',
    screen: 'CadastroDisciplinas',
    color: '#1565C0',
  },
  {
    id: 'boletim',
    icon: '📊',
    title: 'Boletim',
    subtitle: 'Visualizar notas',
    screen: 'Boletim',
    color: '#E8A020',
  },
];

// --- Componente ---
const DashboardScreen = ({ navigation }: Props) => {
  const { user, logout } = useAuth();
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.userName}>{user?.name ?? 'Usuário'} 👋</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutIcon}>⎋</Text>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner informativo */}
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>🎓</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>App Scholar</Text>
            <Text style={styles.bannerSub}>Sistema Acadêmico — FATEC Jacareí</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Módulos do Sistema</Text>

        {/* Grid de cards */}
        <View style={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { borderTopColor: item.color }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              <Text style={[styles.arrow, { color: item.color }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl + 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm },
  userName: { color: '#FFF', fontSize: fontSize.xl, fontWeight: '800' },
  logoutBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoutIcon: { fontSize: 18, color: '#FFF' },
  logoutText: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.xs, fontWeight: '600' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  banner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  bannerIcon: { fontSize: 32, marginRight: spacing.md },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.textPrimary },
  bannerSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '47%',
    borderTopWidth: 4,
    ...shadow.card,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 24 },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.textPrimary },
  cardSubtitle: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm },
  arrow: { fontSize: fontSize.lg, fontWeight: '700' },
});

export default DashboardScreen;
