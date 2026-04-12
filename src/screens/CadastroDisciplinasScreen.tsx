import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AppHeader from '../components/AppHeader';
import { colors, spacing, fontSize, borderRadius, shadow } from '../styles/theme';
import { RootStackParamList } from '../navigation/types';

// --- Tipos ---
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CadastroDisciplinas'>;

interface Props {
  navigation: NavigationProp;
}

interface DisciplinaForm {
  nome: string;
  cargaHoraria: string;
  professor: string;
  curso: string;
  semestre: string;
}

type DisciplinaFormErrors = Partial<Record<keyof DisciplinaForm, string>>;

const FORM_INICIAL: DisciplinaForm = {
  nome: '',
  cargaHoraria: '',
  professor: '',
  curso: '',
  semestre: '',
};

const PROFESSORES_MOCK: string[] = [
  'Prof. Dr. Carlos Santos',
  'Profa. Ma. Ana Lima',
  'Prof. Esp. Pedro Rocha',
  'Profa. Dra. Juliana Costa',
];

// --- Componente ---
const CadastroDisciplinasScreen = ({ navigation }: Props) => {
  const [form, setForm] = useState<DisciplinaForm>(FORM_INICIAL);
  const [errors, setErrors] = useState<DisciplinaFormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [professores, setProfessores] = useState<string[]>([]);

  useEffect(() => {
    console.log('[CadastroDisciplinas] Carregando professores...');
    setTimeout(() => {
      setProfessores(PROFESSORES_MOCK);
      console.log('[CadastroDisciplinas] Professores carregados:', PROFESSORES_MOCK.length);
    }, 300);
  }, []);

  const updateField = (field: keyof DisciplinaForm, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: DisciplinaFormErrors = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome da disciplina é obrigatório.';
    if (!form.cargaHoraria.trim()) newErrors.cargaHoraria = 'Carga horária é obrigatória.';
    if (!form.professor.trim()) newErrors.professor = 'Professor responsável é obrigatório.';
    if (!form.curso.trim()) newErrors.curso = 'Curso é obrigatório.';
    if (!form.semestre.trim()) newErrors.semestre = 'Semestre é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvar = (): void => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      console.log('[CadastroDisciplinas] Disciplina cadastrada:', form);
      setLoading(false);
      Alert.alert(
        'Sucesso! ✅',
        `Disciplina "${form.nome}" cadastrada com sucesso!`,
        [
          { text: 'Cadastrar outra', onPress: () => setForm(FORM_INICIAL) },
          { text: 'Voltar', onPress: () => navigation.goBack() },
        ]
      );
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Cadastro de Disciplinas" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Dados da Disciplina</Text>

          <AppInput
            label="Nome da Disciplina *"
            value={form.nome}
            onChangeText={(v) => updateField('nome', v)}
            placeholder="Ex: Programação para Dispositivos Móveis I"
            error={errors.nome}
          />
          <AppInput
            label="Carga Horária (h) *"
            value={form.cargaHoraria}
            onChangeText={(v) => updateField('cargaHoraria', v)}
            placeholder="Ex: 80"
            keyboardType="numeric"
            error={errors.cargaHoraria}
          />
          <AppInput
            label="Professor Responsável *"
            value={form.professor}
            onChangeText={(v) => updateField('professor', v)}
            placeholder="Ex: Prof. Dr. André Olímpio"
            error={errors.professor}
          />

          {/* Sugestões de professores mockados */}
          {professores.length > 0 && (
            <View style={styles.suggestionsBox}>
              <Text style={styles.suggestionsLabel}>Professores cadastrados:</Text>
              {professores.map((p, i) => (
                <Text
                  key={i}
                  style={styles.suggestion}
                  onPress={() => updateField('professor', p)}
                >
                  • {p}
                </Text>
              ))}
            </View>
          )}

          <AppInput
            label="Curso *"
            value={form.curso}
            onChangeText={(v) => updateField('curso', v)}
            placeholder="Ex: DSM"
            error={errors.curso}
            autoCapitalize="characters"
          />
          <AppInput
            label="Semestre *"
            value={form.semestre}
            onChangeText={(v) => updateField('semestre', v)}
            placeholder="Ex: 3"
            keyboardType="numeric"
            maxLength={1}
            error={errors.semestre}
          />
        </View>

        <AppButton title="Salvar Disciplina" onPress={handleSalvar} loading={loading} />
        <AppButton
          title="Cancelar"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionsBox: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionsLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestion: {
    fontSize: fontSize.sm,
    color: colors.primaryLight,
    paddingVertical: spacing.xs,
    fontWeight: '500',
  },
});

export default CadastroDisciplinasScreen;
