/**
 * Seed do banco de dados
 * 4 cursos · 8 professores · 10 alunos por curso · disciplinas com semestres passados e atual
 *
 * Para repopular:
 * npm run db:reset
 * ou
 * npx prisma db seed
 */

import { PrismaClient, Perfil } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function calcularNota(nota1: number, nota2: number) {
  const media = parseFloat(((nota1 + nota2) / 2).toFixed(1));
  const situacao =
    media >= 6.0 ? "Aprovado" : media >= 4.0 ? "Recuperação" : "Reprovado";

  return { media, situacao };
}

function notaAleatoria(min = 4.0, max = 10.0) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.nota.deleteMany();
  await prisma.disciplina.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.curso.deleteMany();
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
    {
      email: "carlos.souza@scholar.fatec.br",
      nome: "Carlos Eduardo Souza",
      titulacao: "Mestre",
      area: "Engenharia de Software",
      tempoDocencia: 8,
    },
    {
      email: "ana.lima@scholar.fatec.br",
      nome: "Ana Claudia Lima",
      titulacao: "Doutora",
      area: "Banco de Dados e Sistemas Distribuídos",
      tempoDocencia: 12,
    },
    {
      email: "roberto.fernandes@scholar.fatec.br",
      nome: "Roberto Alves Fernandes",
      titulacao: "Especialista",
      area: "Desenvolvimento Mobile e Web",
      tempoDocencia: 5,
    },
    {
      email: "marina.santos@scholar.fatec.br",
      nome: "Marina Rodrigues Santos",
      titulacao: "Mestre",
      area: "Administração e Gestão Empresarial",
      tempoDocencia: 7,
    },
    {
      email: "felipe.nascimento@scholar.fatec.br",
      nome: "Felipe Nascimento Barros",
      titulacao: "Doutor",
      area: "Ciências Ambientais e Sustentabilidade",
      tempoDocencia: 10,
    },
    {
      email: "juliana.pereira@scholar.fatec.br",
      nome: "Juliana Pereira Costa",
      titulacao: "Mestre",
      area: "Matemática e Análise de Sistemas",
      tempoDocencia: 6,
    },
    {
      email: "andre.costa@scholar.fatec.br",
      nome: "Andre Silva Costa",
      titulacao: "Especialista",
      area: "Redes e Infraestrutura",
      tempoDocencia: 4,
    },
    {
      email: "patricia.moreira@scholar.fatec.br",
      nome: "Patricia Alves Moreira",
      titulacao: "Doutora",
      area: "Gestão Ambiental e Sustentabilidade",
      tempoDocencia: 9,
    },
  ];

  const senhaProfHash = await bcrypt.hash("Prof@2024", salt);
  const professores: { id: number; nome: string }[] = [];

  for (const professorData of professoresData) {
    const usuario = await prisma.usuario.create({
      data: {
        email: professorData.email,
        senha: senhaProfHash,
        perfil: Perfil.PROFESSOR,
        primeiroAcesso: false,
      },
    });

    const professor = await prisma.professor.create({
      data: {
        usuarioId: usuario.id,
        nome: professorData.nome,
        titulacao: professorData.titulacao,
        area: professorData.area,
        tempoDocencia: professorData.tempoDocencia,
      },
    });

    professores.push({ id: professor.id, nome: professor.nome });
  }

  const pCarlos = professores[0];
  const pAna = professores[1];
  const pRoberto = professores[2];
  const pMarina = professores[3];
  const pFelipe = professores[4];
  const pJuliana = professores[5];
  const pAndre = professores[6];
  const pPatricia = professores[7];

  if (
    !pCarlos ||
    !pAna ||
    !pRoberto ||
    !pMarina ||
    !pFelipe ||
    !pJuliana ||
    !pAndre ||
    !pPatricia
  ) {
    throw new Error("Falha ao criar professores para o seed.");
  }

  console.log(`✅ ${professores.length} professores criados`);

  // ── CURSOS ──────────────────────────────────────────────────
  const cursosData = [
    {
      sigla: "DSM",
      nome: "Desenvolvimento de Software Multiplataforma",
      area: "Tecnologia da Informação",
      duracaoSemestres: 6,
      coordenadorId: pCarlos.id,
      descricao:
        "Curso focado em desenvolvimento web, mobile, banco de dados, APIs e projetos integradores.",
    },
    {
      sigla: "GEI",
      nome: "Gestão Empresarial e Inovação",
      area: "Gestão e Negócios",
      duracaoSemestres: 6,
      coordenadorId: pMarina.id,
      descricao:
        "Curso voltado para administração, inovação, empreendedorismo e gestão de projetos.",
    },
    {
      sigla: "MAN",
      nome: "Meio Ambiente e Sustentabilidade",
      area: "Meio Ambiente",
      duracaoSemestres: 6,
      coordenadorId: pFelipe.id,
      descricao:
        "Curso voltado para sustentabilidade, recursos naturais e gestão ambiental.",
    },
    {
      sigla: "ADS",
      nome: "Análise e Desenvolvimento de Sistemas",
      area: "Tecnologia da Informação",
      duracaoSemestres: 6,
      coordenadorId: pAna.id,
      descricao:
        "Curso focado em análise, desenvolvimento, banco de dados, redes e APIs.",
    },
  ];

  const cursosCriados = await Promise.all(
    cursosData.map((curso) =>
      prisma.curso.create({
        data: {
          nome: curso.nome,
          area: curso.area,
          duracaoSemestres: curso.duracaoSemestres,
          coordenadorId: curso.coordenadorId,
          descricao: curso.descricao,
          ativo: true,
        },
      })
    )
  );

  const cursoPorNome = Object.fromEntries(
    cursosCriados.map((curso) => [curso.nome, curso])
  ) as Record<string, (typeof cursosCriados)[number]>;

  const cursoPorSigla = Object.fromEntries(
    cursosData.map((curso, index) => [
      curso.sigla,
      {
        ...cursosCriados[index]!,
        sigla: curso.sigla,
      },
    ])
  ) as Record<string, (typeof cursosCriados)[number] & { sigla: string }>;

  console.log(`✅ ${cursosCriados.length} cursos criados`);

  // ── DISCIPLINAS ────────────────────────────────────────────
  // ativo: false = semestre encerrado | true = semestre atual
  const disciplinasData = [
    // DSM — Desenvolvimento de Software Multiplataforma
    {
      nome: "Lógica de Programação",
      cargaHoraria: 80,
      professorId: pJuliana.id,
      cursoId: cursoPorNome["Desenvolvimento de Software Multiplataforma"].id,
      semestre: 1,
      ativo: false,
      descricao: "Fundamentos de lógica, algoritmos e pseudocódigo.",
    },
    {
      nome: "Estrutura de Dados",
      cargaHoraria: 60,
      professorId: pCarlos.id,
      cursoId: cursoPorNome["Desenvolvimento de Software Multiplataforma"].id,
      semestre: 1,
      ativo: false,
      descricao: "Listas, filas, pilhas, árvores e algoritmos de ordenação.",
    },
    {
      nome: "Banco de Dados Relacional",
      cargaHoraria: 80,
      professorId: pAna.id,
      cursoId: cursoPorNome["Desenvolvimento de Software Multiplataforma"].id,
      semestre: 2,
      ativo: false,
      descricao: "Modelagem e administração de bancos com PostgreSQL.",
    },
    {
      nome: "Desenvolvimento Web Full Stack",
      cargaHoraria: 80,
      professorId: pRoberto.id,
      cursoId: cursoPorNome["Desenvolvimento de Software Multiplataforma"].id,
      semestre: 2,
      ativo: false,
      descricao: "Frontend e backend com React, Node.js e Express.",
    },
    {
      nome: "Engenharia de Software",
      cargaHoraria: 60,
      professorId: pCarlos.id,
      cursoId: cursoPorNome["Desenvolvimento de Software Multiplataforma"].id,
      semestre: 3,
      ativo: false,
      descricao: "Boas práticas, padrões de projeto e metodologias ágeis.",
    },
    {
      nome: "Programação para Dispositivos Móveis I",
      cargaHoraria: 80,
      professorId: pAndre.id,
      cursoId: cursoPorNome["Desenvolvimento de Software Multiplataforma"].id,
      semestre: 3,
      ativo: false,
      descricao: "Desenvolvimento mobile com React Native e Expo.",
    },
    {
      nome: "Computação em Nuvem",
      cargaHoraria: 40,
      professorId: pAna.id,
      cursoId: cursoPorNome["Desenvolvimento de Software Multiplataforma"].id,
      semestre: 4,
      ativo: true,
      descricao: "Conceitos de cloud computing, AWS, Azure e DevOps.",
    },
    {
      nome: "Programação para Dispositivos Móveis II",
      cargaHoraria: 80,
      professorId: pRoberto.id,
      cursoId: cursoPorNome["Desenvolvimento de Software Multiplataforma"].id,
      semestre: 4,
      ativo: true,
      descricao: "Publicação de apps, notificações push e APIs nativas.",
    },

    // GEI — Gestão Empresarial e Inovação
    {
      nome: "Fundamentos de Administração",
      cargaHoraria: 60,
      professorId: pMarina.id,
      cursoId: cursoPorNome["Gestão Empresarial e Inovação"].id,
      semestre: 1,
      ativo: false,
      descricao: "Teorias administrativas, funções e estruturas organizacionais.",
    },
    {
      nome: "Matemática Financeira",
      cargaHoraria: 60,
      professorId: pJuliana.id,
      cursoId: cursoPorNome["Gestão Empresarial e Inovação"].id,
      semestre: 1,
      ativo: false,
      descricao: "Juros simples, compostos, descontos e análise de investimentos.",
    },
    {
      nome: "Marketing Digital",
      cargaHoraria: 40,
      professorId: pMarina.id,
      cursoId: cursoPorNome["Gestão Empresarial e Inovação"].id,
      semestre: 2,
      ativo: false,
      descricao: "Estratégias de marketing em ambientes digitais.",
    },
    {
      nome: "Contabilidade Gerencial",
      cargaHoraria: 60,
      professorId: pJuliana.id,
      cursoId: cursoPorNome["Gestão Empresarial e Inovação"].id,
      semestre: 2,
      ativo: false,
      descricao: "Demonstrações financeiras e análise de custos.",
    },
    {
      nome: "Gestão de Projetos",
      cargaHoraria: 60,
      professorId: pMarina.id,
      cursoId: cursoPorNome["Gestão Empresarial e Inovação"].id,
      semestre: 3,
      ativo: true,
      descricao: "PMI, Scrum, Kanban e gestão de riscos.",
    },
    {
      nome: "Empreendedorismo e Inovação",
      cargaHoraria: 40,
      professorId: pCarlos.id,
      cursoId: cursoPorNome["Gestão Empresarial e Inovação"].id,
      semestre: 3,
      ativo: true,
      descricao: "Criação de startups, MVP e modelos de negócio.",
    },

    // MAN — Meio Ambiente e Sustentabilidade
    {
      nome: "Ecologia Geral",
      cargaHoraria: 60,
      professorId: pFelipe.id,
      cursoId: cursoPorNome["Meio Ambiente e Sustentabilidade"].id,
      semestre: 1,
      ativo: false,
      descricao: "Ecossistemas, cadeias alimentares e biodiversidade.",
    },
    {
      nome: "Química Ambiental",
      cargaHoraria: 60,
      professorId: pPatricia.id,
      cursoId: cursoPorNome["Meio Ambiente e Sustentabilidade"].id,
      semestre: 1,
      ativo: false,
      descricao: "Poluição química, tratamento de efluentes e resíduos.",
    },
    {
      nome: "Legislação Ambiental",
      cargaHoraria: 40,
      professorId: pFelipe.id,
      cursoId: cursoPorNome["Meio Ambiente e Sustentabilidade"].id,
      semestre: 2,
      ativo: false,
      descricao: "CONAMA, licenciamento ambiental e compliance.",
    },
    {
      nome: "Gestão de Resíduos Sólidos",
      cargaHoraria: 60,
      professorId: pPatricia.id,
      cursoId: cursoPorNome["Meio Ambiente e Sustentabilidade"].id,
      semestre: 2,
      ativo: false,
      descricao: "PNRS, logística reversa e gestão integrada.",
    },
    {
      nome: "Recursos Hídricos",
      cargaHoraria: 80,
      professorId: pFelipe.id,
      cursoId: cursoPorNome["Meio Ambiente e Sustentabilidade"].id,
      semestre: 3,
      ativo: true,
      descricao: "Bacias hidrográficas, saneamento e qualidade da água.",
    },
    {
      nome: "Energias Renováveis",
      cargaHoraria: 60,
      professorId: pPatricia.id,
      cursoId: cursoPorNome["Meio Ambiente e Sustentabilidade"].id,
      semestre: 3,
      ativo: true,
      descricao: "Solar, eólica, biomassa e eficiência energética.",
    },

    // ADS — Análise e Desenvolvimento de Sistemas
    {
      nome: "Algoritmos e Programação",
      cargaHoraria: 80,
      professorId: pJuliana.id,
      cursoId: cursoPorNome["Análise e Desenvolvimento de Sistemas"].id,
      semestre: 1,
      ativo: false,
      descricao: "Lógica computacional e programação em Python.",
    },
    {
      nome: "Arquitetura de Computadores",
      cargaHoraria: 60,
      professorId: pAndre.id,
      cursoId: cursoPorNome["Análise e Desenvolvimento de Sistemas"].id,
      semestre: 1,
      ativo: false,
      descricao: "Hardware, sistemas operacionais e organização de memória.",
    },
    {
      nome: "Redes de Computadores",
      cargaHoraria: 60,
      professorId: pAndre.id,
      cursoId: cursoPorNome["Análise e Desenvolvimento de Sistemas"].id,
      semestre: 2,
      ativo: false,
      descricao: "Protocolos TCP/IP, modelo OSI e configuração de redes.",
    },
    {
      nome: "Análise Orientada a Objetos",
      cargaHoraria: 80,
      professorId: pCarlos.id,
      cursoId: cursoPorNome["Análise e Desenvolvimento de Sistemas"].id,
      semestre: 2,
      ativo: false,
      descricao: "UML, diagramas de classe, sequência e casos de uso.",
    },
    {
      nome: "Desenvolvimento de APIs REST",
      cargaHoraria: 80,
      professorId: pRoberto.id,
      cursoId: cursoPorNome["Análise e Desenvolvimento de Sistemas"].id,
      semestre: 3,
      ativo: true,
      descricao: "Node.js, Express, autenticação JWT e documentação Swagger.",
    },
    {
      nome: "Banco de Dados NoSQL",
      cargaHoraria: 60,
      professorId: pAna.id,
      cursoId: cursoPorNome["Análise e Desenvolvimento de Sistemas"].id,
      semestre: 3,
      ativo: true,
      descricao: "MongoDB, Redis, modelagem orientada a documentos.",
    },
  ];

  const disciplinasCriadas = await Promise.all(
    disciplinasData.map((disciplina) =>
      prisma.disciplina.create({ data: disciplina })
    )
  );

  const discPorCurso: Record<number, typeof disciplinasCriadas> = {};

  for (const disciplina of disciplinasCriadas) {
    if (!discPorCurso[disciplina.cursoId]) {
      discPorCurso[disciplina.cursoId] = [];
    }

    discPorCurso[disciplina.cursoId].push(disciplina);
  }

  console.log(`✅ ${disciplinasCriadas.length} disciplinas criadas`);

  // ── ALUNOS — 10 por curso ──────────────────────────────────
  const cursos = [
    cursoPorSigla.DSM,
    cursoPorSigla.GEI,
    cursoPorSigla.MAN,
    cursoPorSigla.ADS,
  ];

  const nomesPrimeiros = [
    "Ana",
    "Bruno",
    "Carlos",
    "Diana",
    "Eduardo",
    "Fernanda",
    "Gabriel",
    "Helena",
    "Igor",
    "Juliana",
  ];

  const nomesUltimos = [
    "Santos",
    "Silva",
    "Oliveira",
    "Souza",
    "Lima",
    "Pereira",
    "Costa",
    "Rodrigues",
    "Alves",
    "Nascimento",
  ];

  const senhaAlunoHash = await bcrypt.hash("Aluno@2024", salt);
  const todosOsAlunos: { id: number; cursoId: number }[] = [];

  for (const curso of cursos) {
    for (let i = 1; i <= 10; i++) {
      const primeiro = nomesPrimeiros[(i - 1) % nomesPrimeiros.length];
      const ultimo = nomesUltimos[(i - 1) % nomesUltimos.length];
      const nome = `${primeiro} ${ultimo}`;
      const email = `${primeiro.toLowerCase()}.${ultimo.toLowerCase()}${i}.${curso.sigla.toLowerCase()}@aluno.fatec.br`;
      const matricula = `${curso.sigla}2024${String(i).padStart(3, "0")}`;

      const usuario = await prisma.usuario.create({
        data: {
          email,
          senha: senhaAlunoHash,
          perfil: Perfil.ALUNO,
          primeiroAcesso: false,
        },
      });

      const aluno = await prisma.aluno.create({
        data: {
          usuarioId: usuario.id,
          nome,
          matricula,
          cursoId: curso.id,
          telefone: `(12) 9${Math.floor(8000 + Math.random() * 1999)}-${Math.floor(
            1000 + Math.random() * 8999
          )}`,
          cidade: i % 2 === 0 ? "Jacareí" : "São José dos Campos",
          estado: "SP",
        },
      });

      todosOsAlunos.push({ id: aluno.id, cursoId: curso.id });
    }
  }

  console.log(`✅ ${todosOsAlunos.length} alunos criados (10 por curso)`);

  // ── NOTAS — gera para todas as disciplinas encerradas + atual ──
  let totalNotas = 0;

  for (const aluno of todosOsAlunos) {
    const disciplinasDoAluno = discPorCurso[aluno.cursoId] ?? [];

    for (const disciplina of disciplinasDoAluno) {
      const nota1 = notaAleatoria(4.5, 10.0);
      const nota2 = disciplina.ativo
        ? notaAleatoria(5.0, 10.0)
        : notaAleatoria(4.0, 10.0);

      const { media, situacao } = calcularNota(nota1, nota2);

      await prisma.nota.create({
        data: {
          alunoId: aluno.id,
          disciplinaId: disciplina.id,
          nota1,
          nota2,
          media,
          situacao,
        },
      });

      totalNotas++;
    }
  }

  console.log(`✅ ${totalNotas} notas lançadas`);

  const resumoCursos = await prisma.curso.findMany({
    include: {
      coordenador: {
        select: {
          nome: true,
        },
      },
      _count: {
        select: {
          alunos: true,
          disciplinas: true,
        },
      },
    },
    orderBy: {
      nome: "asc",
    },
  });

  console.log("\n✅ Seed concluído!");
  console.log("─────────────────────────────────────────────────────");

  console.log("\n📚 CURSOS CADASTRADOS:");
  console.table(
    resumoCursos.map((curso) => ({
      ID: curso.id,
      Curso: curso.nome,
      Área: curso.area,
      Duração: `${curso.duracaoSemestres} semestres`,
      Coordenador: curso.coordenador?.nome ?? "Não definido",
      Alunos: curso._count.alunos,
      Disciplinas: curso._count.disciplinas,
      Status: curso.ativo ? "Ativo" : "Inativo",
    }))
  );

  console.log("\n👤 ACESSOS PARA TESTE:");
  console.table([
    {
      Perfil: "ADMIN",
      Email: "admin@scholar.fatec.br",
      Senha: "Admin@123",
    },
    {
      Perfil: "PROFESSOR",
      Email: "carlos.souza@scholar.fatec.br",
      Senha: "Prof@2024",
    },
    {
      Perfil: "PROFESSOR",
      Email: "ana.lima@scholar.fatec.br",
      Senha: "Prof@2024",
    },
    {
      Perfil: "ALUNO DSM",
      Email: "ana.santos1.dsm@aluno.fatec.br",
      Senha: "Aluno@2024",
    },
    {
      Perfil: "ALUNO GEI",
      Email: "ana.santos1.gei@aluno.fatec.br",
      Senha: "Aluno@2024",
    },
    {
      Perfil: "ALUNO MAN",
      Email: "ana.santos1.man@aluno.fatec.br",
      Senha: "Aluno@2024",
    },
    {
      Perfil: "ALUNO ADS",
      Email: "ana.santos1.ads@aluno.fatec.br",
      Senha: "Aluno@2024",
    },
  ]);

  console.log("─────────────────────────────────────────────────────");
}

main()
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
