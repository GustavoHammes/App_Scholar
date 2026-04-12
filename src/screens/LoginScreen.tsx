import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';
import { RootStackParamList } from '../navigation/types';

// --- Tipos ---
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

interface FormErrors {
  email?: string;
  senha?: string;
}

// --- Componente ---
const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) newErrors.email = 'O e-mail é obrigatório.';
    if (!senha.trim()) newErrors.senha = 'A senha é obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (): void => {
    setGlobalError('');
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      const result = login(email, senha);
      setLoading(false);
      if (!result.success) {
        setGlobalError(result.message ?? 'Erro ao realizar login.');
      }
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header visual */}
        <View style={styles.headerBg}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.appName}>App Scholar</Text>
          <Text style={styles.appSubtitle}>Sistema Acadêmico</Text>
        </View>

        {/* Card de login */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>
          <Text style={styles.cardSubtitle}>Entre com suas credenciais institucionais</Text>

          {globalError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {globalError}</Text>
            </View>
          ) : null}

          <AppInput
            label="E-mail ou Login"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              setErrors((e) => ({ ...e, email: undefined }));
            }}
            placeholder="seu.email@fatec.sp.gov.br"
            keyboardType="email-address"
            error={errors.email}
          />

          <AppInput
            label="Senha"
            value={senha}
            onChangeText={(text: string) => {
              setSenha(text);
              setErrors((e) => ({ ...e, senha: undefined }));
            }}
            placeholder="••••••••"
            secureTextEntry
            error={errors.senha}
          />

          <AppButton
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          <Text style={styles.hint}>
            💡 Use qualquer e-mail e senha para entrar (dados simulados)
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.primary },
  container: { flexGrow: 1 },
  headerBg: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: spacing.xxl + 16,
    paddingBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: { fontSize: 40 },
  appName: {
    color: '#FFF',
    fontSize: fontSize.xxl,
    fontWeight: '800',
    letterSpacing: 1,
  },
  appSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  loginBtn: { marginTop: spacing.sm },
  hint: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});

export default LoginScreen;
