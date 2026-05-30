/**
 * Componentes de UI reutilizáveis — Mobile
 * Padrão visual neutro e profissional, alinhado com a versão web.
 */

import React from "react";
import {
  View, Text, ActivityIndicator, TouchableOpacity,
  StyleSheet, ViewStyle, TextStyle,
} from "react-native";

// ─── PALETA DE CORES DO SISTEMA ─────────────────────────────
export const Cores = {
  fundo: "#f8fafc",       // slate-50
  branco: "#ffffff",
  borda: "#e2e8f0",       // slate-200
  textoPrincipal: "#0f172a",  // slate-900
  textoSecundario: "#64748b", // slate-500
  primario: "#334155",    // slate-700
  primarioHover: "#1e293b",   // slate-800
  aprovado: "#059669",    // emerald-600
  aprovadoBg: "#ecfdf5",  // emerald-50
  recuperacao: "#d97706", // amber-600
  recuperacaoBg: "#fffbeb",
  reprovado: "#dc2626",   // red-600
  reprovadoBg: "#fef2f2",
  infoBg: "#eff6ff",      // blue-50
  infoText: "#1d4ed8",    // blue-700
};

// ─── SPINNER de carregamento ─────────────────────────────────
export function Spinner({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <View style={estilosBase.centralizador}>
      <ActivityIndicator size="large" color={Cores.primario} />
      <Text style={estilosBase.textoCarregando}>{texto}</Text>
    </View>
  );
}

// ─── CARD ────────────────────────────────────────────────────
export function Card({
  children, style,
}: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[estilosBase.card, style]}>{children}</View>
  );
}

// ─── BADGE de situação ───────────────────────────────────────
type VarianteBadge = "aprovado" | "recuperacao" | "reprovado" | "neutro" | "info";

const variantesBadge: Record<VarianteBadge, { bg: string; text: string }> = {
  aprovado:    { bg: Cores.aprovadoBg,    text: Cores.aprovado },
  recuperacao: { bg: Cores.recuperacaoBg, text: Cores.recuperacao },
  reprovado:   { bg: Cores.reprovadoBg,   text: Cores.reprovado },
  neutro:      { bg: "#f1f5f9",           text: Cores.textoSecundario },
  info:        { bg: Cores.infoBg,        text: Cores.infoText },
};

export function Badge({
  texto, variante = "neutro",
}: { texto: string; variante?: VarianteBadge }) {
  const v = variantesBadge[variante];
  return (
    <View style={[estilosBase.badge, { backgroundColor: v.bg }]}>
      <Text style={[estilosBase.badgeTexto, { color: v.text }]}>{texto}</Text>
    </View>
  );
}

// Converte a situação do backend para o badge correto
export function BadgeSituacao({ situacao }: { situacao?: string | null }) {
  if (!situacao) return <Text style={{ color: Cores.textoSecundario, fontSize: 13 }}>—</Text>;
  const mapa: Record<string, VarianteBadge> = {
    Aprovado: "aprovado", Recuperação: "recuperacao", Reprovado: "reprovado",
  };
  return <Badge texto={situacao} variante={mapa[situacao] ?? "neutro"} />;
}

// ─── BOTÃO PRIMÁRIO ──────────────────────────────────────────
export function BotaoPrimario({
  titulo, onPress, carregando, desabilitado, style,
}: {
  titulo: string; onPress: () => void; carregando?: boolean;
  desabilitado?: boolean; style?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={carregando || desabilitado}
      style={[estilosBase.botaoPrimario, (carregando || desabilitado) && { opacity: 0.5 }, style]}
      activeOpacity={0.8}
    >
      {carregando ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={estilosBase.botaoPrimarioTexto}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── BOTÃO SECUNDÁRIO ────────────────────────────────────────
export function BotaoSecundario({
  titulo, onPress, style,
}: { titulo: string; onPress: () => void; style?: ViewStyle }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[estilosBase.botaoSecundario, style]}
      activeOpacity={0.7}
    >
      <Text style={estilosBase.botaoSecundarioTexto}>{titulo}</Text>
    </TouchableOpacity>
  );
}

// ─── CAMPO DE FORMULÁRIO ─────────────────────────────────────
export function LabelCampo({
  children, style,
}: { children: string; style?: TextStyle }) {
  return (
    <Text style={[estilosBase.label, style]}>{children}</Text>
  );
}

// ─── ESTADO VAZIO ────────────────────────────────────────────
export function EstadoVazio({
  titulo, descricao,
}: { titulo: string; descricao?: string }) {
  return (
    <View style={estilosBase.centralizador}>
      <Text style={estilosBase.tituloVazio}>{titulo}</Text>
      {descricao && (
        <Text style={estilosBase.descricaoVazio}>{descricao}</Text>
      )}
    </View>
  );
}

// ─── SEPARADOR HORIZONTAL ────────────────────────────────────
export function Separador() {
  return <View style={estilosBase.separador} />;
}

// ─── ESTILOS BASE ────────────────────────────────────────────
export const estilosBase = StyleSheet.create({
  centralizador: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 40, gap: 8,
  },
  textoCarregando: {
    marginTop: 8, fontSize: 13, color: Cores.textoSecundario,
  },
  card: {
    backgroundColor: Cores.branco,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Cores.borda,
    overflow: "hidden",
  },
  badge: {
    borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeTexto: { fontSize: 11, fontWeight: "600" },
  botaoPrimario: {
    backgroundColor: Cores.primario, borderRadius: 10,
    paddingVertical: 14, alignItems: "center", justifyContent: "center",
  },
  botaoPrimarioTexto: { color: "#fff", fontWeight: "600", fontSize: 15 },
  botaoSecundario: {
    borderRadius: 10, borderWidth: 1, borderColor: Cores.borda,
    paddingVertical: 12, alignItems: "center",
  },
  botaoSecundarioTexto: {
    color: Cores.textoPrincipal, fontWeight: "500", fontSize: 14,
  },
  label: {
    fontSize: 13, fontWeight: "500", color: Cores.textoSecundario,
    marginBottom: 6,
  },
  tituloVazio: {
    fontSize: 15, fontWeight: "600", color: Cores.textoSecundario,
  },
  descricaoVazio: {
    fontSize: 13, color: "#94a3b8", textAlign: "center", marginTop: 4,
  },
  separador: {
    height: 1, backgroundColor: Cores.borda,
  },
  // Estilos de input reutilizáveis
  input: {
    borderWidth: 1, borderColor: Cores.borda, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Cores.textoPrincipal, backgroundColor: Cores.branco,
  },
});
