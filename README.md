# 🎓 App Scholar — Sistema de Boletim Acadêmico

**FATEC Jacareí · Desenvolvimento de Software Multiplataforma**

Sistema web completo de gerenciamento acadêmico com três perfis de acesso: **Administrador**, **Professor** e **Aluno**.

---

## 📋 Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

---

## 🚀 Como rodar localmente

### 1. Clone o projeto e acesse a pasta raiz

```bash
git clone <url-do-repositorio>
cd app-scholar
```

### 2. Configure as variáveis de ambiente

**Backend:**
```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com os dados do seu PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/app_scholar"
JWT_SECRET="sua_chave_secreta_aqui"
```

**Frontend:**
```bash
cp frontend/.env.local.example frontend/.env.local
```

### 3. Instale todas as dependências

```bash
npm run install:all
```

### 4. Configure o banco de dados (migração + seed)

```bash
cd backend && npm run db:setup
```

Isso irá:
- Criar o banco de dados automaticamente
- Executar todas as migrations do Prisma
- Popular com dados fictícios para teste

### 5. Inicie o projeto completo (frontend + backend)

Da raiz do projeto:
```bash
npm run dev
```

Ou da pasta frontend:
```bash
cd frontend && npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **API Health:** http://localhost:3001/health

---

## 🔐 Dados de Acesso para Teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| **Admin** | admin@scholar.fatec.br | Admin@123 |
| **Professor** | carlos.souza@scholar.fatec.br | Prof@2024 |
| **Professor** | ana.lima@scholar.fatec.br | Prof@2024 |
| **Professor** | roberto.fernandes@scholar.fatec.br | Prof@2024 |
| **Aluno** | gustavo.hammes@aluno.fatec.br | Aluno@2024 |
| **Aluno** | mariana.costa@aluno.fatec.br | Aluno@2024 |
| **Aluno** | pedro.alves@aluno.fatec.br | Aluno@2024 |
| **Aluno** | julia.santos@aluno.fatec.br | Aluno@2024 |
| **Aluno** | rafael.lima@aluno.fatec.br | Aluno@2024 |

> Os alunos são marcados com `primeiroAcesso: true` — ao logar serão redirecionados para trocar a senha.

---

## 📁 Estrutura do Projeto

```
app-scholar/
├── package.json                    # Raiz: concurrently para rodar tudo com npm run dev
│
├── backend/                        # Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma           # Modelo de dados: Usuario, Aluno, Professor, Disciplina, Nota
│   │   └── seed.ts                 # Dados fictícios para teste local
│   └── src/
│       ├── server.ts               # Ponto de entrada do Express
│       ├── lib/prisma.ts           # Singleton do Prisma Client
│       ├── middleware/
│       │   ├── auth.middleware.ts  # Validação do JWT
│       │   └── role.middleware.ts  # Controle de acesso por perfil (RBAC)
│       ├── controllers/            # Lógica de negócio por recurso
│       └── routes/                 # Definição dos endpoints REST
│
└── frontend/                       # Next.js 14 + TypeScript + Tailwind CSS
    └── src/
        ├── app/
        │   ├── login/              # Página de login
        │   └── dashboard/          # Área autenticada
        │       ├── page.tsx        # Painel principal (por perfil)
        │       ├── alunos/         # Gerenciamento de alunos
        │       ├── professores/    # Gerenciamento de professores
        │       ├── disciplinas/    # Gerenciamento de disciplinas
        │       ├── notas/          # Lançamento de notas
        │       ├── boletim/        # Boletim do aluno
        │       ├── perfil/         # Dados pessoais + troca de senha
        │       └── admin/          # Painel administrativo
        ├── components/
        │   ├── layout/             # Sidebar e Header
        │   └── ui/                 # Componentes reutilizáveis
        ├── contexts/AuthContext.tsx # Estado global de autenticação
        ├── lib/api.ts              # Cliente Axios com interceptors
        └── types/index.ts          # Interfaces TypeScript
```

---

## 🔒 Permissões por Perfil

| Funcionalidade | Admin | Professor | Aluno |
|----------------|-------|-----------|-------|
| Ver todos os alunos | ✅ | ✅ (suas turmas) | ❌ |
| Criar aluno | ✅ | ❌ | ❌ |
| Editar aluno | ✅ (tudo) | ❌ | ✅ (próprios dados) |
| Ver professores | ✅ | ✅ | ✅ |
| Criar professor | ✅ | ❌ | ❌ |
| Editar professor | ✅ (tudo) | ✅ (próprios dados) | ❌ |
| Ver disciplinas | ✅ | ✅ (próprias) | ✅ |
| Criar disciplina | ✅ | ❌ | ❌ |
| Editar disciplina | ✅ (tudo) | ✅ (descrição/CH) | ❌ |
| Lançar notas | ✅ | ✅ (próprias disciplinas) | ❌ |
| Ver boletim | ✅ | ✅ (seus alunos) | ✅ (próprio) |

---

## 🛠️ Tecnologias

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + bcryptjs
- Arquitetura: Controllers → Routes → Middleware

**Frontend**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (paleta neutra)
- Axios (cliente HTTP com interceptors)
- React Hot Toast (notificações)
- Lucide React (ícones)

---

## 📌 Regra de Cálculo de Notas

```
média = (nota1 + nota2) / 2

>= 6.0  → Aprovado
>= 4.0  → Recuperação
< 4.0   → Reprovado
```

A média e situação são **calculadas automaticamente** no backend ao salvar as notas.

---

## 🔄 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` (raiz) | Inicia frontend e backend simultaneamente |
| `npm run install:all` | Instala dependências de todos os pacotes |
| `cd backend && npm run db:setup` | Migra e popula o banco de dados |
| `cd backend && npm run db:reset` | Reseta e repopula o banco |
| `cd backend && npm run dev` | Inicia apenas o backend |
| `cd frontend && npm run dev` | Inicia apenas o frontend |
