# App Scholar — Sistema Acadêmico Web e Mobile

Projeto desenvolvido para a disciplina de **Programação Mobile** da **FATEC Jacareí**.

O **App Scholar** é um sistema acadêmico completo, com backend, painel web e aplicativo mobile. A proposta é permitir o gerenciamento de alunos, professores, disciplinas e notas, com controle de acesso por perfil.

O sistema possui três perfis principais:

- **Administrador:** gerencia usuários, alunos, professores, disciplinas e notas.
- **Professor:** visualiza suas disciplinas e lança notas dos alunos.
- **Aluno:** consulta seus dados, disciplinas e boletim acadêmico.

---

## Tecnologias utilizadas

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- bcryptjs para criptografia de senhas

### Frontend Web

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- React Hot Toast
- Lucide React

### Mobile

- React Native
- Expo
- Expo Router
- TypeScript
- Axios
- AsyncStorage
- Expo Go

---

## Funcionalidades

### Autenticação

- Login com e-mail e senha
- Token JWT
- Controle de sessão
- Redirecionamento conforme o perfil do usuário
- Proteção de rotas

### Administrador

- Cadastro e gerenciamento de alunos
- Cadastro e gerenciamento de professores
- Cadastro e gerenciamento de disciplinas
- Lançamento e edição de notas
- Visualização geral do sistema

### Professor

- Visualização de professores
- Visualização das próprias disciplinas
- Consulta de alunos
- Lançamento de notas
- Consulta de boletins relacionados às suas turmas

### Aluno

- Consulta do próprio boletim
- Visualização de disciplinas
- Visualização e edição de dados pessoais
- Troca de senha
- Acesso pelo aplicativo mobile via Expo Go

---

## Estrutura do projeto

```txt
app-scholar/
├── backend/                  # API Node.js + Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma     # Modelagem do banco de dados
│   │   └── seed.ts           # Dados iniciais para teste
│   └── src/
│       ├── controllers/      # Regras de negócio
│       ├── routes/           # Rotas da API
│       ├── middleware/       # Autenticação e permissões
│       ├── lib/              # Configurações auxiliares
│       └── server.ts         # Inicialização do servidor
│
├── frontend/                 # Painel web em Next.js
│   └── src/
│       ├── app/              # Páginas e rotas
│       ├── components/       # Componentes reutilizáveis
│       ├── contexts/         # Contexto de autenticação
│       ├── lib/              # Cliente Axios
│       └── types/            # Tipagens TypeScript
│
├── mobile/                   # Aplicativo mobile em Expo
│   ├── app/                  # Rotas do Expo Router
│   ├── components/           # Componentes visuais
│   ├── contexts/             # Contexto de autenticação
│   ├── constants/            # Configurações, cores e API
│   ├── lib/                  # Cliente Axios
│   └── types/                # Tipagens TypeScript
│
├── package.json              # Scripts principais do monorepo
└── README.md
```

---

## Requisitos

Antes de rodar o projeto, é necessário ter instalado:

- Node.js 18 ou superior
- npm
- PostgreSQL
- Expo Go no celular, caso queira testar o aplicativo mobile

---

## Configuração do backend

Acesse a pasta do backend:

```bash
cd backend
```

Crie o arquivo `.env` com base no exemplo:

```bash
cp .env.example .env
```

Configure a conexão com o PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/app_scholar"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
```

Depois, volte para a raiz do projeto:

```bash
cd ..
```

---

## Configuração do frontend web

Acesse a pasta do frontend:

```bash
cd frontend
```

Crie o arquivo `.env.local` com base no exemplo:

```bash
cp .env.local.example .env.local
```

Conteúdo esperado:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Depois, volte para a raiz:

```bash
cd ..
```

---

## Instalação

Na raiz do projeto, instale todas as dependências:

```bash
npm run install:all
```

Esse comando instala as dependências da raiz, do backend, do frontend e do mobile.

---

## Banco de dados

Para criar as tabelas e popular o banco com dados de teste, execute:

```bash
npm run db:setup
```

Para resetar o banco e popular novamente:

```bash
npm run db:reset
```

O seed cria usuários de teste, professores, alunos, cursos, disciplinas e notas.

---

## Como rodar o backend e o frontend web

Na raiz do projeto, execute:

```bash
npm run dev
```

Esse comando inicia:

- Backend: `http://localhost:3001`
- Frontend web: `http://localhost:3000`

Teste a API pelo health check:

```txt
http://localhost:3001/health
```

---

## Como rodar o aplicativo mobile com Expo Go

Acesse a pasta do app mobile:

```bash
cd mobile
```

Antes de iniciar, configure o IP local da sua máquina no arquivo:

```txt
mobile/constants/api.ts
```

Procure esta linha:

```ts
const IP_LOCAL = "SEU_IP_AQUI";
```

Substitua pelo IPv4 do computador onde o backend está rodando.

No Windows, descubra o IP com:

```bash
ipconfig
```

Procure por **Endereço IPv4**.

Exemplo:

```ts
const IP_LOCAL = "192.168.1.105";
```

Depois rode:

```bash
npm run dev
```

Abra o aplicativo **Expo Go** no celular e escaneie o QR Code exibido no terminal.

Importante: o computador e o celular precisam estar conectados na mesma rede Wi-Fi.

---

## Dados de acesso para teste

### Administrador

```txt
E-mail: admin@scholar.fatec.br
Senha: Admin@123
```

### Professor

```txt
E-mail: carlos.souza@scholar.fatec.br
Senha: Prof@2024
```

```txt
E-mail: ana.lima@scholar.fatec.br
Senha: Prof@2024
```

### Aluno

Os alunos são gerados automaticamente pelo seed.

```txt
Senha padrão dos alunos: Aluno@2024
```

Caso algum e-mail específico não funcione, confira os usuários gerados no arquivo:

```txt
backend/prisma/seed.ts
```

---

## Regra de cálculo das notas

A média do aluno é calculada automaticamente pelo backend:

```txt
média = (nota1 + nota2) / 2
```

Situações possíveis:

```txt
Média maior ou igual a 6.0  → Aprovado
Média maior ou igual a 4.0  → Recuperação
Média menor que 4.0        → Reprovado
```

---

## Permissões por perfil

| Funcionalidade | Admin | Professor | Aluno |
|---|---:|---:|---:|
| Visualizar alunos | Sim | Sim | Não |
| Cadastrar alunos | Sim | Não | Não |
| Editar aluno | Sim | Não | Apenas próprios dados |
| Visualizar professores | Sim | Sim | Sim |
| Cadastrar professores | Sim | Não | Não |
| Editar professor | Sim | Apenas próprios dados | Não |
| Visualizar disciplinas | Sim | Próprias disciplinas | Sim |
| Cadastrar disciplinas | Sim | Não | Não |
| Lançar notas | Sim | Sim | Não |
| Visualizar boletim | Sim | Sim | Apenas próprio boletim |

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run install:all` | Instala as dependências da raiz, backend, frontend e mobile |
| `npm run dev` | Inicia backend e frontend web ao mesmo tempo |
| `npm run dev:backend` | Inicia apenas o backend |
| `npm run dev:frontend` | Inicia apenas o frontend web |
| `npm run dev:mobile` | Inicia o aplicativo mobile com Expo |
| `npm run db:setup` | Sincroniza o banco e executa o seed |
| `npm run db:reset` | Reseta o banco e executa o seed novamente |
| `npm run build` | Gera build do backend e frontend |

---

## Como testar o projeto

1. Inicie o PostgreSQL.
2. Configure o `.env` do backend.
3. Rode `npm run install:all`.
4. Rode `npm run db:setup`.
5. Rode `npm run dev`.
6. Acesse o frontend web em `http://localhost:3000`.
7. Para testar no celular, rode `npm run dev:mobile` e abra pelo Expo Go.

---

## Observações sobre o mobile

O aplicativo mobile foi desenvolvido para funcionar no celular usando **Expo Go**.

Como o backend roda localmente no computador, é necessário configurar o IP local da máquina no arquivo `mobile/constants/api.ts`.

O uso de `localhost` não funciona em celular físico, pois o celular entende `localhost` como ele mesmo, e não como o computador onde o backend está rodando.

---

## Autor

Desenvolvido por **Gustavo Hammes**  
FATEC Jacareí — Desenvolvimento de Software Multiplataforma
