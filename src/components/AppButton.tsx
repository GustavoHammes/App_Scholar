import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

// --- Tipos ---
interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  style?: ViewStyle;
}

// --- Componente ---
const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  style,
}: AppButtonProps) => {
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      style={[styles.button, isSecondary ? styles.secondary : styles.primary, style]}
      onPress={onPress}
      activeOpacity={0.82}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : '#FFF'} />
      ) : (
        <Text style={[styles.text, isSecondary ? styles.textSecondary : styles.textPrimary]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textPrimary: { color: '#FFF' },
  textSecondary: { color: colors.primary },
});

export default AppButton;
