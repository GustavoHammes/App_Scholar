# App Scholar — Sistema Acadêmico Multiplataforma

Sistema acadêmico desenvolvido para gerenciamento de uma instituição de ensino, com módulos para **alunos**, **professores**, **cursos**, **disciplinas**, **notas** e **boletim acadêmico**.

O projeto foi desenvolvido com arquitetura separada em **backend**, **frontend web** e **aplicativo mobile**, utilizando API REST para comunicação entre as camadas e PostgreSQL como banco de dados.

---

## 📌 Objetivo do projeto

O **App Scholar** tem como objetivo centralizar e facilitar o gerenciamento acadêmico de uma instituição, permitindo que administradores, professores e alunos acessem funcionalidades específicas de acordo com seu perfil.

O sistema permite:

- cadastro e autenticação de usuários;
- gerenciamento de alunos;
- gerenciamento de professores;
- gerenciamento de cursos;
- gerenciamento de disciplinas;
- lançamento e alteração de notas;
- visualização de boletim;
- acesso web e mobile.

---

## 🧩 Novo módulo implementado: Cursos

Foi implementado um módulo complementar de **cadastro e gerenciamento de cursos**, atendendo aos seguintes requisitos:

- tela de listagem de cursos existentes;
- tela de cadastro de cursos;
- edição de cursos;
- exclusão/desativação de cursos;
- integração com PostgreSQL via Prisma;
- criação de API REST para cursos;
- ajuste do módulo de alunos para vinculação ao curso;
- ajuste do módulo de disciplinas para vinculação ao curso;
- ajuste da tela de notas para exibir corretamente o curso relacionado.

### Campos do cadastro de curso

Cada curso possui:

- nome do curso;
- área;
- duração em semestres;
- coordenador;
- descrição;
- status ativo/inativo.

---

## 👥 Perfis de acesso

O sistema possui três perfis principais:

### Administrador

Possui acesso completo ao sistema.

Funcionalidades:

- gerenciar alunos;
- gerenciar professores;
- gerenciar cursos;
- gerenciar disciplinas;
- lançar e alterar notas;
- acessar painel administrativo.

### Professor

Possui acesso às informações acadêmicas relacionadas às suas disciplinas.

Funcionalidades:

- visualizar disciplinas;
- lançar notas;
- consultar alunos relacionados.

### Aluno

Possui acesso de consulta.

Funcionalidades:

- visualizar o próprio boletim;
- consultar informações acadêmicas disponíveis.

---

## 🛠️ Tecnologias utilizadas

### Backend

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- Bcrypt para criptografia de senha
- API REST

### Frontend Web

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- Lucide React

### Mobile

- React Native
- Expo / Expo Go
- Expo SDK 54
- TypeScript
- Axios
- AsyncStorage
- Expo Router

### Banco de dados

- PostgreSQL
- Prisma Migrate
- Prisma Client
- Seed para dados de teste

---

## 📁 Estrutura do projeto

```txt
App_Scholar/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── lib/
│   │   └── server.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── dashboard/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
│
├── mobile/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   ├── types/
│   ├── app.json
│   └── package.json
│
└── README.md
```

---

## 🗄️ Modelagem principal do banco

A modelagem foi ajustada para que **Curso** seja uma entidade própria no banco de dados.

Relacionamentos principais:

```txt
Usuario
 ├── Aluno
 └── Professor

Curso
 ├── Alunos
 ├── Disciplinas
 └── Coordenador Professor

Disciplina
 ├── Professor
 ├── Curso
 └── Notas

Nota
 ├── Aluno
 └── Disciplina
```

### Principais tabelas

- `usuarios`
- `alunos`
- `professores`
- `cursos`
- `disciplinas`
- `notas`

---

## 🚀 Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/GustavoHammes/App_Scholar.git
cd App_Scholar
```

---

## ⚙️ Configuração do backend

Acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` dentro da pasta `backend`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/app_scholar"
JWT_SECRET="sua_chave_secreta"
PORT=3001
```

> Ajuste o `DATABASE_URL` conforme o usuário, senha, porta e nome do banco configurados no PostgreSQL.

Formate e gere o Prisma Client:

```bash
npx prisma format
npx prisma generate
```

Aplique o schema no banco:

```bash
npx prisma migrate dev
```

Ou, em ambiente de teste, sincronize diretamente:

```bash
npx prisma db push
```

Execute o seed:

```bash
npx prisma db seed
```

Inicie o backend:

```bash
npm run dev
```

O backend ficará disponível em:

```txt
http://localhost:3001
```

---

## 💻 Configuração do frontend web

Em outro terminal, acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

O frontend ficará disponível em:

```txt
http://localhost:3000
```

---

## 📱 Configuração do mobile

Em outro terminal, acesse a pasta do mobile:

```bash
cd mobile
```

Instale as dependências:

```bash
npm install
```

Corrija dependências compatíveis com o Expo SDK utilizado:

```bash
npx expo install --fix
```

Verifique a saúde do projeto Expo:

```bash
npx expo-doctor
```

Inicie o aplicativo:

```bash
npx expo start -c
```

Depois, escaneie o QR Code com o **Expo Go**.

---

## 🔐 Acessos de teste

Após rodar o seed, o terminal exibirá os acessos disponíveis para teste.

Exemplos de usuários:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@scholar.fatec.br` | `Admin@123` |
| Professor | `carlos.souza@scholar.fatec.br` | `Prof@2024` |
| Professor | `ana.lima@scholar.fatec.br` | `Prof@2024` |
| Aluno DSM | `ana.santos1.dsm@aluno.fatec.br` | `Aluno@2024` |
| Aluno GEI | `ana.santos1.gei@aluno.fatec.br` | `Aluno@2024` |
| Aluno MAN | `ana.santos1.man@aluno.fatec.br` | `Aluno@2024` |
| Aluno ADS | `ana.santos1.ads@aluno.fatec.br` | `Aluno@2024` |

---

## 📚 Principais rotas da API

### Autenticação

```txt
POST /api/auth/login
POST /api/auth/primeiro-acesso
GET  /api/auth/me
```

### Alunos

```txt
GET    /api/alunos
GET    /api/alunos/:id
POST   /api/alunos
PUT    /api/alunos/:id
DELETE /api/alunos/:id
GET    /api/alunos/:id/boletim
```

### Professores

```txt
GET    /api/professores
GET    /api/professores/:id
POST   /api/professores
PUT    /api/professores/:id
DELETE /api/professores/:id
```

### Cursos

```txt
GET    /api/cursos
GET    /api/cursos/:id
POST   /api/cursos
PUT    /api/cursos/:id
DELETE /api/cursos/:id
```

### Disciplinas

```txt
GET    /api/disciplinas
GET    /api/disciplinas/:id
POST   /api/disciplinas
PUT    /api/disciplinas/:id
DELETE /api/disciplinas/:id
```

### Notas

```txt
GET    /api/notas
POST   /api/notas
PUT    /api/notas/:id
DELETE /api/notas/:id
```

---

## 🧪 Exemplos de teste da API no PowerShell

### Login como administrador

```powershell
$login = Invoke-RestMethod `
  -Uri "http://localhost:3001/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "email": "admin@scholar.fatec.br",
    "senha": "Admin@123"
  }'

$TOKEN = $login.token
```

### Listar cursos

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3001/api/cursos" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $TOKEN" }
```

### Cadastrar curso

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3001/api/cursos" `
  -Method POST `
  -Headers @{
    Authorization = "Bearer $TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body '{
    "nome": "Logística e Transportes",
    "area": "Gestão e Negócios",
    "duracaoSemestres": 6,
    "coordenadorId": 1,
    "descricao": "Curso voltado para logística, transporte e gestão operacional."
  }'
```

### Cadastrar disciplina vinculada a curso

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3001/api/disciplinas" `
  -Method POST `
  -Headers @{
    Authorization = "Bearer $TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body '{
    "nome": "Desenvolvimento Mobile",
    "cargaHoraria": 80,
    "professorId": 1,
    "cursoId": 1,
    "semestre": 4,
    "descricao": "Disciplina focada em desenvolvimento de aplicativos móveis."
  }'
```

---

## 📌 Funcionalidades implementadas

### Backend

- autenticação com JWT;
- autorização por perfil;
- CRUD de alunos;
- CRUD de professores;
- CRUD de cursos;
- CRUD de disciplinas;
- CRUD de notas;
- boletim do aluno;
- seed com dados de teste;
- relacionamento entre alunos, cursos, disciplinas e notas.

### Frontend Web

- login;
- dashboard administrativo;
- tela de alunos;
- tela de professores;
- tela de cursos;
- tela de disciplinas;
- tela de lançamento de notas;
- tela de perfil;
- proteção de rotas;
- layout com menu lateral;
- interface adaptada aos perfis.

### Mobile

- autenticação;
- navegação por abas;
- integração com API REST;
- telas acadêmicas principais;
- compatibilidade com Expo SDK 54;
- execução via Expo Go.

---

## 🧯 Problemas comuns e soluções

### Erro: `Objects are not valid as a React child`

Esse erro acontece quando o React tenta renderizar um objeto diretamente.

Exemplo incorreto:

```tsx
{aluno.curso}
```

Forma correta:

```tsx
{aluno.curso?.nome ?? "Curso não informado"}
```

Isso ocorre porque `curso` agora é um objeto relacionado no Prisma, não mais uma string.

---

### Erro: `The table public.notas does not exist`

Esse erro indica que o Prisma Client foi gerado, mas as tabelas ainda não foram criadas no PostgreSQL.

Solução em ambiente de desenvolvimento:

```bash
npx prisma db push --force-reset
npx prisma generate
npx prisma db seed
```

---

### Erro: `EPERM operation not permitted query_engine-windows.dll.node`

Esse erro acontece quando algum processo Node está usando o Prisma Client no Windows.

Solução:

```powershell
taskkill /F /IM node.exe /T
Remove-Item -Recurse -Force .\node_modules\.prisma
npx prisma generate
```

---

### Erro no Expo: `Cannot find module babel-preset-expo`

Instale o preset:

```bash
npm install -D babel-preset-expo
npx expo start -c
```

---

### Erro no Expo: assets não encontrados

Verifique se existem estes arquivos:

```txt
mobile/assets/icon.png
mobile/assets/splash.png
mobile/assets/adaptive-icon.png
mobile/assets/favicon.png
```

Caso não existam, crie os arquivos ou ajuste os caminhos no `app.json`.

---

## 🧑‍💻 Autor

Desenvolvido por **Gustavo Hammes**.

Projeto acadêmico desenvolvido para a disciplina de desenvolvimento de software multiplataforma.

---

## 📄 Licença

Este projeto é de uso acadêmico.
