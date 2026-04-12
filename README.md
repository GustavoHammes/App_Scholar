# App Scholar — FATEC Jacareí (TypeScript)
### Atividade Avaliativa — Programação para Dispositivos Móveis I
**Professor:** André Olímpio  
**Curso:** Desenvolvimento de Software Multiplataforma

---

## 🚀 Como Rodar

```bash
npm install
npx expo start
```

Escaneie o QR Code no **Expo Go**. Use qualquer e-mail + senha para entrar.

---

## 📁 Estrutura do Projeto

```
AppScholar/
├── App.tsx                              # Raiz — React.FC tipado
├── tsconfig.json                        # Configuração TypeScript (strict mode)
├── package.json
└── src/
    ├── context/
    │   └── AuthContext.tsx              # useContext + interfaces User, LoginResult, AuthContextData
    ├── navigation/
    │   ├── types.ts                     # RootStackParamList — tipagem das rotas
    │   └── AppNavigator.tsx             # Stack Navigator tipado
    ├── screens/
    │   ├── LoginScreen.tsx              # useState<string>, FormErrors, NativeStackNavigationProp
    │   ├── DashboardScreen.tsx          # MenuItem interface, keyof RootStackParamList
    │   ├── CadastroAlunosScreen.tsx     # AlunoForm, Partial<Record<keyof AlunoForm, string>>
    │   ├── CadastroProfessoresScreen.tsx
    │   ├── CadastroDisciplinasScreen.tsx
    │   └── BoletimScreen.tsx            # BoletimItem, Situacao (union type), SituacaoStyle
    ├── components/
    │   ├── AppInput.tsx                 # Estende TextInputProps
    │   ├── AppButton.tsx                # Props com ViewStyle tipado
    │   └── AppHeader.tsx                # ReactNode para rightAction
    └── styles/
        └── theme.ts                     # Objetos com "as const" para inferência precisa
```

---

## ✅ Conceitos TypeScript utilizados

| Conceito | Onde é usado |
|---|---|
| `interface` | `User`, `AlunoForm`, `BoletimItem`, `MenuItem`, etc. |
| `type` union | `Situacao = 'Aprovado' \| 'Reprovado' \| 'Recuperação'` |
| `Partial<Record<keyof T, string>>` | Erros de formulário tipados |
| `React.FC` | Componentes funcionais tipados |
| `NativeStackNavigationProp<List, Route>` | Props de navegação |
| `as const` | Objetos de tema com inferência de literal types |
| `extends TextInputProps` | Componente de input que herda props nativas |
| `ReactNode` | Prop `rightAction` do AppHeader |
| `useState<T>` | Todos os estados com tipo explícito |
| Strict mode | Habilitado no `tsconfig.json` |
