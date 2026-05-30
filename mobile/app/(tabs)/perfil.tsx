/**
 * Tela de Perfil — Mobile
 * Exibe os dados do usuário e permite alterar a senha.
 * Avisa sobre primeiro acesso obrigatório.
 */

import { useState } from "react";
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  Alert, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { Cores, BotaoPrimario, estilosBase } from "@/components/ui";
import api from "@/lib/api";

export default function PerfilScreen() {
  const { usuario, logout } = useAuth();

  // Estado do formulário de troca de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [trocando, setTrocando] = useState(false);

  async function handleTrocarSenha() {
    if (!senhaAtual || !novaSenha || !confirmaSenha) {
      Alert.alert("Atenção", "Preencha todos os campos de senha.");
      return;
    }
    if (novaSenha !== confirmaSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setTrocando(true);
    try {
      await api.put("/auth/senha", { senhaAtual, novaSenha });
      Alert.alert("✅ Sucesso", "Senha alterada com sucesso!");
      setSenhaAtual(""); setNovaSenha(""); setConfirmaSenha("");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      Alert.alert("Erro", msg ?? "Não foi possível alterar a senha.");
    } finally {
      setTrocando(false);
    }
  }

  const labelPerfil = { ADMIN: "Administrador", PROFESSOR: "Professor", ALUNO: "Aluno" }[usuario!.perfil];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Cores.fundo }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
    >
      {/* Aviso de primeiro acesso */}
      {usuario?.primeiroAcesso && (
        <View style={est.aviso}>
          <Ionicons name="warning-outline" size={20} color="#92400e" />
          <View style={{ flex: 1 }}>
            <Text style={est.avisoTitulo}>Troca de senha obrigatória</Text>
            <Text style={est.avisoDesc}>
              Por segurança, altere sua senha antes de continuar usando o sistema.
            </Text>
          </View>
        </View>
      )}

      {/* Card com dados do usuário */}
      <View style={est.perfilCard}>
        <View style={est.avatarGrande}>
          <Text style={est.avatarLetra}>{usuario?.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={est.nomeUsuario}>{usuario?.nome}</Text>
        <Text style={est.emailUsuario}>{usuario?.email}</Text>
        <View style={est.badgePerfil}>
          <Text style={est.badgePerfilTexto}>{labelPerfil}</Text>
        </View>
      </View>

      {/* Formulário de troca de senha */}
      <View style={est.secao}>
        <View style={est.secaoHeader}>
          <Ionicons name="lock-closed-outline" size={16} color={Cores.textoSecundario} />
          <Text style={est.secaoTitulo}>Alterar Senha</Text>
        </View>

        <View style={{ gap: 10 }}>
          <View>
            <Text style={estilosBase.label}>Senha atual</Text>
            <TextInput style={estilosBase.input} value={senhaAtual} onChangeText={setSenhaAtual}
              secureTextEntry placeholder="••••••••" placeholderTextColor="#94a3b8" />
          </View>
          <View>
            <Text style={estilosBase.label}>Nova senha</Text>
            <TextInput style={estilosBase.input} value={novaSenha} onChangeText={setNovaSenha}
              secureTextEntry placeholder="Mínimo 6 caracteres" placeholderTextColor="#94a3b8" />
          </View>
          <View>
            <Text style={estilosBase.label}>Confirmar nova senha</Text>
            <TextInput style={estilosBase.input} value={confirmaSenha} onChangeText={setConfirmaSenha}
              secureTextEntry placeholder="Repita a nova senha" placeholderTextColor="#94a3b8" />
          </View>
          <BotaoPrimario titulo="Alterar senha" onPress={handleTrocarSenha} carregando={trocando} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Botão de logout */}
      <TouchableOpacity style={est.botaoLogout} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={Cores.reprovado} />
        <Text style={est.botaoLogoutTexto}>Sair do sistema</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const est = StyleSheet.create({
  aviso: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "#fef3c7",
    borderRadius: 12, borderWidth: 1, borderColor: "#fde68a",
    padding: 14,
  },
  avisoTitulo: { fontSize: 13, fontWeight: "600", color: "#92400e" },
  avisoDesc: { fontSize: 12, color: "#b45309", marginTop: 2, lineHeight: 17 },
  perfilCard: {
    backgroundColor: Cores.branco, borderRadius: 16,
    borderWidth: 1, borderColor: Cores.borda,
    padding: 24, alignItems: "center", gap: 6,
  },
  avatarGrande: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#e2e8f0",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  avatarLetra: { fontSize: 28, fontWeight: "700", color: Cores.primario },
  nomeUsuario: { fontSize: 18, fontWeight: "700", color: Cores.textoPrincipal },
  emailUsuario: { fontSize: 13, color: Cores.textoSecundario },
  badgePerfil: {
    marginTop: 4, backgroundColor: "#f1f5f9",
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4,
  },
  badgePerfilTexto: { fontSize: 12, color: Cores.textoSecundario, fontWeight: "600" },
  secao: {
    backgroundColor: Cores.branco, borderRadius: 16,
    borderWidth: 1, borderColor: Cores.borda,
    padding: 16, gap: 14,
  },
  secaoHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  secaoTitulo: { fontSize: 15, fontWeight: "600", color: Cores.textoPrincipal },
  botaoLogout: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 12,
    borderWidth: 1, borderColor: "#fecaca",
    backgroundColor: "#fff5f5", padding: 14,
  },
  botaoLogoutTexto: { fontSize: 14, fontWeight: "600", color: Cores.reprovado },
});
