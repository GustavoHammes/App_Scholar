import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { colors, spacing, fontSize } from '../styles/theme';

// --- Tipos ---
interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

// --- Componente ---
const AppHeader = ({ title, onBack, rightAction }: AppHeaderProps) => {
  return (
    <View style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>{rightAction ?? null}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
  },
  left: { width: 40 },
  right: { width: 40, alignItems: 'flex-end' },
  backBtn: { padding: spacing.xs },
  backIcon: { color: '#FFF', fontSize: fontSize.xl, fontWeight: '300' },
  title: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
});

export default AppHeader;
