/**
 * Tela de Login
 * Formulário de autenticação com validação e feedback de erro.
 */

import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { Cores, estilosBase } from "@/components/ui";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha e-mail e senha para continuar.");
      return;
    }

    setCarregando(true);
    try {
      await login(email.trim().toLowerCase(), senha);
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Verifique suas credenciais e tente novamente.";
      Alert.alert("Erro ao entrar", msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    // KeyboardAvoidingView sobe o conteúdo quando o teclado abre
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={estilos.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho com logo e nome */}
        <View style={estilos.cabecalho}>
          <View style={estilos.logoContainer}>
            <Ionicons name="school" size={32} color="#fff" />
          </View>
          <Text style={estilos.titulo}>App Scholar</Text>
          <Text style={estilos.subtitulo}>
            Sistema de Boletim Acadêmico{"\n"}FATEC Jacareí
          </Text>
        </View>

        {/* Card com formulário de login */}
        <View style={estilos.card}>
          {/* Campo e-mail */}
          <View style={estilos.grupo}>
            <Text style={estilosBase.label}>E-mail institucional</Text>
            <TextInput
              style={estilosBase.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seu.nome@scholar.fatec.br"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!carregando}
            />
          </View>

          {/* Campo senha com toggle de visibilidade */}
          <View style={estilos.grupo}>
            <Text style={estilosBase.label}>Senha</Text>
            <View style={estilos.inputSenhaWrapper}>
              <TextInput
                style={[estilosBase.input, estilos.inputSenha]}
                value={senha}
                onChangeText={setSenha}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                editable={!carregando}
              />
              <TouchableOpacity
                style={estilos.olho}
                onPress={() => setMostrarSenha((v) => !v)}
              >
                <Ionicons
                  name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Cores.textoSecundario}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão de login */}
          <TouchableOpacity
            style={[estilos.botao, carregando && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={carregando}
            activeOpacity={0.85}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.botaoTexto}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <Text style={estilos.rodape}>
          Curso: Desenvolvimento de Software Multiplataforma
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Cores.fundo,
    justifyContent: "center",
    padding: 24,
    gap: 24,
  },
  cabecalho: {
    alignItems: "center",
    gap: 8,
  },
  logoContainer: {
    width: 64, height: 64,
    borderRadius: 16,
    backgroundColor: Cores.primario,
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  titulo: {
    fontSize: 26, fontWeight: "700",
    color: Cores.textoPrincipal,
  },
  subtitulo: {
    fontSize: 13, color: Cores.textoSecundario,
    textAlign: "center", lineHeight: 20,
  },
  card: {
    backgroundColor: Cores.branco,
    borderRadius: 16,
    borderWidth: 1, borderColor: Cores.borda,
    padding: 20,
    gap: 4,
  },
  grupo: { marginBottom: 12 },
  inputSenhaWrapper: { position: "relative" },
  inputSenha: { paddingRight: 44 },
  olho: {
    position: "absolute", right: 12,
    top: 0, bottom: 0,
    justifyContent: "center",
  },
  botao: {
    marginTop: 8,
    backgroundColor: Cores.primario,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff", fontWeight: "700", fontSize: 15,
  },
  rodape: {
    textAlign: "center", fontSize: 11,
    color: "#94a3b8",
  },
});
