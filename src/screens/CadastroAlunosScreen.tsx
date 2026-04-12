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
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CadastroAlunos'>;

interface Props {
  navigation: NavigationProp;
}

interface AlunoForm {
  nome: string;
  matricula: string;
  curso: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
}

type AlunoFormErrors = Partial<Record<keyof AlunoForm, string>>;

const FORM_INICIAL: AlunoForm = {
  nome: '',
  matricula: '',
  curso: '',
  email: '',
  telefone: '',
  cep: '',
  endereco: '',
  cidade: '',
  estado: '',
};

// --- Componente ---
const CadastroAlunosScreen = ({ navigation }: Props) => {
  const [form, setForm] = useState<AlunoForm>(FORM_INICIAL);
  const [errors, setErrors] = useState<AlunoFormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('[CadastroAlunos] Tela inicializada');
    return () => {
      console.log('[CadastroAlunos] Tela desmontada');
    };
  }, []);

  const updateField = (field: keyof AlunoForm, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: AlunoFormErrors = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório.';
    if (!form.matricula.trim()) newErrors.matricula = 'Matrícula é obrigatória.';
    if (!form.curso.trim()) newErrors.curso = 'Curso é obrigatório.';
    if (!form.email.trim()) newErrors.email = 'E-mail é obrigatório.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'E-mail inválido.';
    if (!form.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório.';
    if (!form.cep.trim()) newErrors.cep = 'CEP é obrigatório.';
    if (!form.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório.';
    if (!form.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória.';
    if (!form.estado.trim()) newErrors.estado = 'Estado é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvar = (): void => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      console.log('[CadastroAlunos] Aluno cadastrado:', form);
      setLoading(false);
      Alert.alert(
        'Sucesso! ✅',
        `Aluno ${form.nome} cadastrado com sucesso!`,
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
      <AppHeader title="Cadastro de Alunos" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dados Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Dados Pessoais</Text>

          <AppInput
            label="Nome Completo *"
            value={form.nome}
            onChangeText={(v) => updateField('nome', v)}
            placeholder="João da Silva"
            error={errors.nome}
            autoCapitalize="words"
          />
          <AppInput
            label="Matrícula *"
            value={form.matricula}
            onChangeText={(v) => updateField('matricula', v)}
            placeholder="Ex: 2024001234"
            error={errors.matricula}
            keyboardType="numeric"
          />
          <AppInput
            label="Curso *"
            value={form.curso}
            onChangeText={(v) => updateField('curso', v)}
            placeholder="Ex: DSM, ADS, GE..."
            error={errors.curso}
            autoCapitalize="characters"
          />
          <AppInput
            label="E-mail *"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            placeholder="joao@email.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <AppInput
            label="Telefone *"
            value={form.telefone}
            onChangeText={(v) => updateField('telefone', v)}
            placeholder="(12) 99999-9999"
            keyboardType="phone-pad"
            error={errors.telefone}
          />
        </View>

        {/* Endereço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Endereço</Text>

          <AppInput
            label="CEP *"
            value={form.cep}
            onChangeText={(v) => updateField('cep', v)}
            placeholder="12345-678"
            keyboardType="numeric"
            error={errors.cep}
          />
          <AppInput
            label="Endereço *"
            value={form.endereco}
            onChangeText={(v) => updateField('endereco', v)}
            placeholder="Rua das Flores, 123"
            error={errors.endereco}
          />
          <AppInput
            label="Cidade *"
            value={form.cidade}
            onChangeText={(v) => updateField('cidade', v)}
            placeholder="Jacareí"
            error={errors.cidade}
          />
          <AppInput
            label="Estado *"
            value={form.estado}
            onChangeText={(v) => updateField('estado', v)}
            placeholder="SP"
            autoCapitalize="characters"
            maxLength={2}
            error={errors.estado}
          />
        </View>

        <AppButton title="Salvar Aluno" onPress={handleSalvar} loading={loading} />
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

export default CadastroAlunosScreen;
