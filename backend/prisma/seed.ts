/**
 * Seed do banco de dados
 * 4 cursos · 8 professores · ~10 alunos por curso · disciplinas com semestres passados e atual
 * Para repopular: npm run db:reset
 */

import { PrismaClient, Perfil } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function calcularNota(nota1: number, nota2: number) {
  const media = parseFloat(((nota1 + nota2) / 2).toFixed(1));
  const situacao = media >= 6.0 ? "Aprovado" : media >= 4.0 ? "Recuperação" : "Reprovado";
  return { media, situacao };
}

// Gera nota aleatória entre min e max com 1 casa decimal
function notaAleatoria(min = 4.0, max = 10.0) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.nota.deleteMany();
  await prisma.disciplina.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.usuario.deleteMany();

  const salt = 10;

  // ── ADMIN ──────────────────────────────────────────────────
  await prisma.usuario.create({
    data: {
      email: "admin@scholar.fatec.br",
      senha: await bcrypt.hash("Admin@123", salt),
      perfil: Perfil.ADMIN,
      primeiroAcesso: false,
    },
  });

  // ── PROFESSORES ────────────────────────────────────────────
  const professoresData = [
    { email: "carlos.souza@scholar.fatec.br",       nome: "Carlos Eduardo Souza",     titulacao: "Mestre",       area: "Engenharia de Software",              tempoDocencia: 8 },
    { email: "ana.lima@scholar.fatec.br",            nome: "Ana Claudia Lima",          titulacao: "Doutora",      area: "Banco de Dados e Sistemas Distribuídos", tempoDocencia: 12 },
    { email: "roberto.fernandes@scholar.fatec.br",  nome: "Roberto Alves Fernandes",   titulacao: "Especialista", area: "Desenvolvimento Mobile e Web",         tempoDocencia: 5 },
    { email: "marina.santos@scholar.fatec.br",      nome: "Marina Rodrigues Santos",   titulacao: "Mestre",       area: "Administração e Gestão Empresarial",   tempoDocencia: 7 },
    { email: "felipe.nascimento@scholar.fatec.br",  nome: "Felipe Nascimento Barros",  titulacao: "Doutor",       area: "Ciências Ambientais e Sustentabilidade", tempoDocencia: 10 },
    { email: "juliana.pereira@scholar.fatec.br",    nome: "Juliana Pereira Costa",     titulacao: "Mestre",       area: "Matemática e Análise de Sistemas",     tempoDocencia: 6 },
    { email: "andre.costa@scholar.fatec.br",        nome: "Andre Silva Costa",         titulacao: "Especialista", area: "Redes e Infraestrutura",               tempoDocencia: 4 },
    { email: "patricia.moreira@scholar.fatec.br",   nome: "Patricia Alves Moreira",    titulacao: "Doutora",      area: "Gestão Ambiental e Sustentabilidade",  tempoDocencia: 9 },
  ];

  const senhaProfHash = await bcrypt.hash("Prof@2024", salt);
  const professores: { id: number; nome: string }[] = [];

  for (const pd of professoresData) {
    const usuario = await prisma.usuario.create({
      data: { email: pd.email, senha: senhaProfHash, perfil: Perfil.PROFESSOR, primeiroAcesso: false },
    });
    const prof = await prisma.professor.create({
      data: { usuarioId: usuario.id, nome: pd.nome, titulacao: pd.titulacao, area: pd.area, tempoDocencia: pd.tempoDocencia },
    });
    professores.push({ id: prof.id, nome: prof.nome });
  }

  const [pCarlos, pAna, pRoberto, pMarina, pFelipe, pJuliana, pAndre, pPatricia] = professores;

  // ── DISCIPLINAS ────────────────────────────────────────────
  // ativo: false = semestre encerrado (notas bloqueadas) | true = semestre atual

  const disciplinasData = [
    // ── DSM — Desenvolvimento de Software Multiplataforma ──
    { nome: "Lógica de Programação",                  cargaHoraria: 80,  professorId: pJuliana.id,  curso: "Desenvolvimento de Software Multiplataforma", semestre: 1, ativo: false, descricao: "Fundamentos de lógica, algoritmos e pseudocódigo." },
    { nome: "Estrutura de Dados",                     cargaHoraria: 60,  professorId: pCarlos.id,   curso: "Desenvolvimento de Software Multiplataforma", semestre: 1, ativo: false, descricao: "Listas, filas, pilhas, árvores e algoritmos de ordenação." },
    { nome: "Banco de Dados Relacional",              cargaHoraria: 80,  professorId: pAna.id,      curso: "Desenvolvimento de Software Multiplataforma", semestre: 2, ativo: false, descricao: "Modelagem e administração de bancos com PostgreSQL." },
    { nome: "Desenvolvimento Web Full Stack",         cargaHoraria: 80,  professorId: pRoberto.id,  curso: "Desenvolvimento de Software Multiplataforma", semestre: 2, ativo: false, descricao: "Frontend e backend com React, Node.js e Express." },
    { nome: "Engenharia de Software",                 cargaHoraria: 60,  professorId: pCarlos.id,   curso: "Desenvolvimento de Software Multiplataforma", semestre: 3, ativo: false, descricao: "Boas práticas, padrões de projeto e metodologias ágeis." },
    { nome: "Programação para Dispositivos Móveis I", cargaHoraria: 80,  professorId: pAndre.id,    curso: "Desenvolvimento de Software Multiplataforma", semestre: 3, ativo: false, descricao: "Desenvolvimento mobile com React Native e Expo." },
    { nome: "Computação em Nuvem",                    cargaHoraria: 40,  professorId: pAna.id,      curso: "Desenvolvimento de Software Multiplataforma", semestre: 4, ativo: true,  descricao: "Conceitos de cloud computing, AWS, Azure e DevOps." },
    { nome: "Programação para Dispositivos Móveis II",cargaHoraria: 80,  professorId: pRoberto.id,  curso: "Desenvolvimento de Software Multiplataforma", semestre: 4, ativo: true,  descricao: "Publicação de apps, notificações push e APIs nativas." },

    // ── GEI — Gestão Empresarial e Inovação ──
    { nome: "Fundamentos de Administração",           cargaHoraria: 60,  professorId: pMarina.id,   curso: "Gestão Empresarial e Inovação", semestre: 1, ativo: false, descricao: "Teorias administrativas, funções e estruturas organizacionais." },
    { nome: "Matemática Financeira",                  cargaHoraria: 60,  professorId: pJuliana.id,  curso: "Gestão Empresarial e Inovação", semestre: 1, ativo: false, descricao: "Juros simples, compostos, descontos e análise de investimentos." },
    { nome: "Marketing Digital",                      cargaHoraria: 40,  professorId: pMarina.id,   curso: "Gestão Empresarial e Inovação", semestre: 2, ativo: false, descricao: "Estratégias de marketing em ambientes digitais." },
    { nome: "Contabilidade Gerencial",                cargaHoraria: 60,  professorId: pJuliana.id,  curso: "Gestão Empresarial e Inovação", semestre: 2, ativo: false, descricao: "Demonstrações financeiras e análise de custos." },
    { nome: "Gestão de Projetos",                     cargaHoraria: 60,  professorId: pMarina.id,   curso: "Gestão Empresarial e Inovação", semestre: 3, ativo: true,  descricao: "PMI, Scrum, Kanban e gestão de riscos." },
    { nome: "Empreendedorismo e Inovação",            cargaHoraria: 40,  professorId: pCarlos.id,   curso: "Gestão Empresarial e Inovação", semestre: 3, ativo: true,  descricao: "Criação de startups, MVP e modelos de negócio." },

    // ── MAN — Meio Ambiente e Sustentabilidade ──
    { nome: "Ecologia Geral",                         cargaHoraria: 60,  professorId: pFelipe.id,   curso: "Meio Ambiente e Sustentabilidade", semestre: 1, ativo: false, descricao: "Ecossistemas, cadeias alimentares e biodiversidade." },
    { nome: "Química Ambiental",                      cargaHoraria: 60,  professorId: pPatricia.id, curso: "Meio Ambiente e Sustentabilidade", semestre: 1, ativo: false, descricao: "Poluição química, tratamento de efluentes e resíduos." },
    { nome: "Legislação Ambiental",                   cargaHoraria: 40,  professorId: pFelipe.id,   curso: "Meio Ambiente e Sustentabilidade", semestre: 2, ativo: false, descricao: "CONAMA, licenciamento ambiental e compliance." },
    { nome: "Gestão de Resíduos Sólidos",             cargaHoraria: 60,  professorId: pPatricia.id, curso: "Meio Ambiente e Sustentabilidade", semestre: 2, ativo: false, descricao: "PNRS, logística reversa e gestão integrada." },
    { nome: "Recursos Hídricos",                      cargaHoraria: 80,  professorId: pFelipe.id,   curso: "Meio Ambiente e Sustentabilidade", semestre: 3, ativo: true,  descricao: "Bacias hidrográficas, saneamento e qualidade da água." },
    { nome: "Energias Renováveis",                    cargaHoraria: 60,  professorId: pPatricia.id, curso: "Meio Ambiente e Sustentabilidade", semestre: 3, ativo: true,  descricao: "Solar, eólica, biomassa e eficiência energética." },

    // ── ADS — Análise e Desenvolvimento de Sistemas ──
    { nome: "Algoritmos e Programação",               cargaHoraria: 80,  professorId: pJuliana.id,  curso: "Análise e Desenvolvimento de Sistemas", semestre: 1, ativo: false, descricao: "Lógica computacional e programação em Python." },
    { nome: "Arquitetura de Computadores",            cargaHoraria: 60,  professorId: pAndre.id,    curso: "Análise e Desenvolvimento de Sistemas", semestre: 1, ativo: false, descricao: "Hardware, sistemas operacionais e organização de memória." },
    { nome: "Redes de Computadores",                  cargaHoraria: 60,  professorId: pAndre.id,    curso: "Análise e Desenvolvimento de Sistemas", semestre: 2, ativo: false, descricao: "Protocolos TCP/IP, modelo OSI e configuração de redes." },
    { nome: "Análise Orientada a Objetos",            cargaHoraria: 80,  professorId: pCarlos.id,   curso: "Análise e Desenvolvimento de Sistemas", semestre: 2, ativo: false, descricao: "UML, diagramas de classe, sequência e casos de uso." },
    { nome: "Desenvolvimento de APIs REST",           cargaHoraria: 80,  professorId: pRoberto.id,  curso: "Análise e Desenvolvimento de Sistemas", semestre: 3, ativo: true,  descricao: "Node.js, Express, autenticação JWT e documentação Swagger." },
    { nome: "Banco de Dados NoSQL",                   cargaHoraria: 60,  professorId: pAna.id,      curso: "Análise e Desenvolvimento de Sistemas", semestre: 3, ativo: true,  descricao: "MongoDB, Redis, modelagem orientada a documentos." },
  ];

  const disciplinasCriadas = await Promise.all(
    disciplinasData.map((d) => prisma.disciplina.create({ data: d }))
  );

  // Agrupa disciplinas por curso para facilitar a criação de notas
  const discPorCurso: Record<string, typeof disciplinasCriadas> = {};
  for (const d of disciplinasCriadas) {
    if (!discPorCurso[d.curso]) discPorCurso[d.curso] = [];
    discPorCurso[d.curso].push(d);
  }

  console.log(`✅ ${disciplinasCriadas.length} disciplinas criadas`);

  // ── ALUNOS — 10 por curso ──────────────────────────────────
  const cursos = [
    { sigla: "DSM", nome: "Desenvolvimento de Software Multiplataforma" },
    { sigla: "GEI", nome: "Gestão Empresarial e Inovação" },
    { sigla: "MAN", nome: "Meio Ambiente e Sustentabilidade" },
    { sigla: "ADS", nome: "Análise e Desenvolvimento de Sistemas" },
  ];

  const nomesPrimeiros = ["Ana","Bruno","Carlos","Diana","Eduardo","Fernanda","Gabriel","Helena","Igor","Juliana","Lucas","Mariana","Nicolas","Olivia","Pedro","Rafaela","Samuel","Thais","Vinicius","Yasmin"];
  const nomesUltimos  = ["Silva","Santos","Oliveira","Souza","Lima","Pereira","Costa","Rodrigues","Alves","Nascimento"];

  const senhaAlunoHash = await bcrypt.hash("Aluno@2024", salt);
  const todoOsAlunos: { id: number; curso: string }[] = [];

  for (const curso of cursos) {
    for (let i = 1; i <= 10; i++) {
      const primeiro = nomesPrimeiros[(i - 1) % nomesPrimeiros.length];
      const ultimo   = nomesUltimos[i % nomesUltimos.length];
      const nome     = `${primeiro} ${ultimo}`;
      // Inclui a sigla do curso para garantir e-mails únicos entre cursos diferentes
const email = `${primeiro.toLowerCase()}.${ultimo.toLowerCase()}${i}.${curso.sigla.toLowerCase()}@aluno.fatec.br`;
      const matricula = `${curso.sigla}2024${String(i).padStart(3, "0")}`;

      const usuario = await prisma.usuario.create({
        data: { email, senha: senhaAlunoHash, perfil: Perfil.ALUNO, primeiroAcesso: false },
      });
      const aluno = await prisma.aluno.create({
        data: {
          usuarioId: usuario.id, nome, matricula,
          curso: curso.nome,
          telefone: `(12) 9${Math.floor(8000 + Math.random() * 1999)}-${Math.floor(1000 + Math.random() * 8999)}`,
          cidade: i % 2 === 0 ? "Jacareí" : "São José dos Campos",
          estado: "SP",
        },
      });
      todoOsAlunos.push({ id: aluno.id, curso: curso.nome });
    }
  }

  console.log(`✅ ${todoOsAlunos.length} alunos criados (10 por curso)`);

  // ── NOTAS — gera para todas as disciplinas encerradas + atual ──
  let totalNotas = 0;

  for (const aluno of todoOsAlunos) {
    const disciplinasDoAluno = discPorCurso[aluno.curso] ?? [];

    for (const disc of disciplinasDoAluno) {
      const nota1 = notaAleatoria(4.5, 10.0);
      // Disciplinas do semestre atual têm notas um pouco mais variadas
      const nota2 = disc.ativo ? notaAleatoria(5.0, 10.0) : notaAleatoria(4.0, 10.0);
      const { media, situacao } = calcularNota(nota1, nota2);

      await prisma.nota.create({
        data: {
          alunoId: aluno.id,
          disciplinaId: disc.id,
          nota1, nota2, media, situacao,
        },
      });
      totalNotas++;
    }
  }

  console.log(`✅ ${totalNotas} notas lançadas`);
  console.log("\n🎓 Seed concluído!");
  console.log("─────────────────────────────────────────────────────");
  console.log("ADMIN:      admin@scholar.fatec.br        / Admin@123");
  console.log("PROFESSOR:  carlos.souza@scholar.fatec.br / Prof@2024");
  console.log("PROFESSOR:  ana.lima@scholar.fatec.br     / Prof@2024");
  console.log("ALUNO DSM:  ana.silva1@aluno.fatec.br     / Aluno@2024");
  console.log("ALUNO GEI:  ana.santos1@aluno.fatec.br    / Aluno@2024");
  console.log("ALUNO MAN:  ana.oliveira1@aluno.fatec.br  / Aluno@2024");
  console.log("ALUNO ADS:  ana.souza1@aluno.fatec.br     / Aluno@2024");
  console.log("─────────────────────────────────────────────────────");
}

main()
  .catch((e) => { console.error("❌ Erro:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });