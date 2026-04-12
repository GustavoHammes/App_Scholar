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
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CadastroProfessores'>;

interface Props {
  navigation: NavigationProp;
}

interface ProfessorForm {
  nome: string;
  titulacao: string;
  areaAtuacao: string;
  tempoDocencia: string;
  email: string;
}

type ProfessorFormErrors = Partial<Record<keyof ProfessorForm, string>>;

const FORM_INICIAL: ProfessorForm = {
  nome: '',
  titulacao: '',
  areaAtuacao: '',
  tempoDocencia: '',
  email: '',
};

// --- Componente ---
const CadastroProfessoresScreen = ({ navigation }: Props) => {
  const [form, setForm] = useState<ProfessorForm>(FORM_INICIAL);
  const [errors, setErrors] = useState<ProfessorFormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('[CadastroProfessores] Tela inicializada');
  }, []);

  const updateField = (field: keyof ProfessorForm, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: ProfessorFormErrors = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório.';
    if (!form.titulacao.trim()) newErrors.titulacao = 'Titulação é obrigatória.';
    if (!form.areaAtuacao.trim()) newErrors.areaAtuacao = 'Área de atuação é obrigatória.';
    if (!form.tempoDocencia.trim()) newErrors.tempoDocencia = 'Tempo de docência é obrigatório.';
    if (!form.email.trim()) newErrors.email = 'E-mail é obrigatório.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'E-mail inválido.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvar = (): void => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      console.log('[CadastroProfessores] Professor cadastrado:', form);
      setLoading(false);
      Alert.alert(
        'Sucesso! ✅',
        `Professor(a) ${form.nome} cadastrado(a) com sucesso!`,
        [
          { text: 'Cadastrar outro', onPress: () => setForm(FORM_INICIAL) },
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
      <AppHeader title="Cadastro de Professores" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧑‍🏫 Dados do Professor</Text>

          <AppInput
            label="Nome Completo *"
            value={form.nome}
            onChangeText={(v) => updateField('nome', v)}
            placeholder="Prof. Dr. Maria Oliveira"
            error={errors.nome}
            autoCapitalize="words"
          />
          <AppInput
            label="Titulação *"
            value={form.titulacao}
            onChangeText={(v) => updateField('titulacao', v)}
            placeholder="Ex: Doutor, Mestre, Especialista"
            error={errors.titulacao}
          />
          <AppInput
            label="Área de Atuação *"
            value={form.areaAtuacao}
            onChangeText={(v) => updateField('areaAtuacao', v)}
            placeholder="Ex: Ciência da Computação"
            error={errors.areaAtuacao}
          />
          <AppInput
            label="Tempo de Docência (anos) *"
            value={form.tempoDocencia}
            onChangeText={(v) => updateField('tempoDocencia', v)}
            placeholder="Ex: 10"
            keyboardType="numeric"
            error={errors.tempoDocencia}
          />
          <AppInput
            label="E-mail *"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            placeholder="professor@fatec.sp.gov.br"
            keyboardType="email-address"
            error={errors.email}
          />
        </View>

        <AppButton title="Salvar Professor" onPress={handleSalvar} loading={loading} />
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
});

export default CadastroProfessoresScreen;
