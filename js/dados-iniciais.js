/*
 * DADOS INICIAIS DO CLUBE
 * ------------------------------------------------------------
 * Aqui fica a lista oficial de livros lidos pelo clube
 * (importada da planilha do clube).
 * Novos livros podem ser incluídos aqui ou pelo "Modo curadoria".
 *
 * Cada livro:
 *   { id, titulo, autor, prateleira, mes, ano, exemplo }
 *   - prateleira: o id de uma das prateleiras definidas abaixo
 *   - mes / ano:  quando o clube leu (opcional)
 *   - exemplo:    true = livro de demonstração (apague ao incluir os reais)
 */
window.DADOS_INICIAIS = {
  versao: 4,

  clube: {
    nome: "Cansei! Vou ler um livro.",
    lema: "Clube do livro · desde 2024",
    pinCuradoria: "1234"
  },

  // Aba "A criadora" e destaque da página inicial.
  // foto: caminho da imagem (ex.: "img/criadora.jpg"); vazio mostra um espaço reservado.
  // apresentacao: vazio mostra um texto provisório avisando que falta o texto real.
  criadora: {
    nome: "",
    instagram: "canseideserblogger",
    foto: "img/criadora.jpg",
    apresentacao: ""
  },

  prateleiras: [
    { id: "2024", rotulo: "2024 · Primeiro ano" },
    { id: "2025", rotulo: "2025 · Segundo ano" },
    { id: "2026-1", rotulo: "2026 · 1º semestre" },
    { id: "atual", rotulo: "Lendo agora & próximos" }
  ],

  livros: [
    { id: "2024-01", titulo: "Se Deus me chamar não vou", autor: "Mariana Salomão Carrara", prateleira: "2024", mes: 1, ano: 2024 },
    { id: "2024-02", titulo: "O filho de mil homens", autor: "Valter Hugo Mãe", prateleira: "2024", mes: 2, ano: 2024 },
    { id: "2024-03", titulo: "Do começo ao fim", autor: "Marcelo Rubens Paiva", prateleira: "2024", mes: 3, ano: 2024 },
    { id: "2024-04", titulo: "O estranho que veio do mar", autor: "Mitch Albom", prateleira: "2024", mes: 4, ano: 2024 },
    { id: "2024-05", titulo: "A ilha das árvores perdidas", autor: "Elif Shafak", prateleira: "2024", mes: 5, ano: 2024 },
    { id: "2024-06", titulo: "É assim que acaba", autor: "Colleen Hoover", prateleira: "2024", mes: 6, ano: 2024 },
    { id: "2024-07", titulo: "O reverso da medalha", autor: "Sidney Sheldon", prateleira: "2024", mes: 7, ano: 2024 },
    { id: "2024-08", titulo: "Primeiro eu tive que morrer", autor: "Lorena Portela", prateleira: "2024", mes: 8, ano: 2024 },
    { id: "2024-09", titulo: "Véspera", autor: "Carla Madeira", prateleira: "2024", mes: 9, ano: 2024 },
    { id: "2024-10", titulo: "O sorriso da hiena", autor: "Gustavo Ávila", prateleira: "2024", mes: 10, ano: 2024 },
    { id: "2024-11", titulo: "Breve inventário de pequenas solidões", autor: "Tiago Feijó", prateleira: "2024", mes: 11, ano: 2024 },
    { id: "2024-12", titulo: "Dezenove minutos", autor: "Jodi Picoult", prateleira: "2024", mes: 12, ano: 2024 },
    { id: "2025-01", titulo: "Três", autor: "Valérie Perrin", prateleira: "2025", mes: 1, ano: 2025 },
    { id: "2025-02", titulo: "Admirável mundo novo", autor: "Aldous Huxley", prateleira: "2025", mes: 2, ano: 2025 },
    { id: "2025-03", titulo: "Senhora", autor: "José de Alencar", prateleira: "2025", mes: 3, ano: 2025 },
    { id: "2025-04", titulo: "A cirurgiã", autor: "Leslie Wolfe", prateleira: "2025", mes: 4, ano: 2025 },
    { id: "2025-05a", titulo: "Pequena coreografia do adeus", autor: "Aline Bei", prateleira: "2025", mes: 5, ano: 2025 },
    { id: "2025-05b", titulo: "Peso do pássaro morto", autor: "Aline Bei", prateleira: "2025", mes: 5, ano: 2025 },
    { id: "2025-06", titulo: "Daqui a cinco anos", autor: "Rebecca Serle", prateleira: "2025", mes: 6, ano: 2025 },
    { id: "2025-07", titulo: "A cabeça do santo", autor: "Socorro Acioli", prateleira: "2025", mes: 7, ano: 2025 },
    { id: "2025-08", titulo: "Um teto todo seu", autor: "Virginia Woolf", prateleira: "2025", mes: 8, ano: 2025 },
    { id: "2025-09", titulo: "A redoma de vidro", autor: "Sylvia Plath", prateleira: "2025", mes: 9, ano: 2025 },
    { id: "2025-10", titulo: "A empregada", autor: "Freida McFadden", prateleira: "2025", mes: 10, ano: 2025 },
    { id: "2025-11", titulo: "Tudo que deixamos inacabado", autor: "Rebecca Yarros", prateleira: "2025", mes: 11, ano: 2025 },
    { id: "2025-12", titulo: "Antes que o café esfrie", autor: "Toshikazu Kawaguchi", prateleira: "2025", mes: 12, ano: 2025 },
    { id: "2026-01", titulo: "A roda", autor: "André Luis de Bastos", prateleira: "2026-1", mes: 1, ano: 2026 },
    { id: "2026-02", titulo: "Phantasma", autor: "Kaylie Smith", prateleira: "2026-1", mes: 2, ano: 2026 },
    { id: "2026-03", titulo: "Os sussurros", autor: "Ashley Audrain", prateleira: "2026-1", mes: 3, ano: 2026 },
    { id: "2026-04", titulo: "10 minutos e 38 segundos neste mundo estranho", autor: "Elif Shafak", prateleira: "2026-1", mes: 4, ano: 2026 },
    { id: "2026-05", titulo: "O alquimista", autor: "Paulo Coelho", prateleira: "2026-1", mes: 5, ano: 2026 },
    { id: "2026-06", titulo: "A sombra do vento", autor: "Carlos Ruiz Zafón", prateleira: "2026-1", mes: 6, ano: 2026 }
  ],

  encontros: [],

  // Clube Online: área para assinantes, com encontros online e materiais.
  // Os valores abaixo são de exemplo — ajuste no modo curadoria ou aqui.
  clubeOnline: {
    valoresDeExemplo: true,
    sala: "",
    planos: [
      { id: "mensal", nome: "Mensal", preco: 29.9, periodo: "mês", descricao: "Acesso completo, renovado todo mês. Cancele quando quiser." },
      { id: "anual", nome: "Anual", preco: 299, periodo: "ano", descricao: "Doze meses de clube pelo preço de dez.", destaque: "2 meses grátis" }
    ],
    beneficios: [
      "Encontro online todo mês, ao vivo, para conversar sobre o livro",
      "Sala exclusiva com o link dos encontros e as gravações",
      "Materiais de leitura: guias, perguntas para debate e indicações",
      "Presenças nos encontros online também contam pontos no ranking",
      "Selo “Sala virtual” no seu perfil"
    ],
    materiais: []
  },

  parceiros: [
    {
      id: "exp1",
      nome: "Livraria Parceira (exemplo)",
      categoria: "Livraria",
      beneficio: "10% de desconto em todo o acervo",
      codigo: "CLUBE10",
      validade: "",
      contato: "@livrariaparceira",
      presencasMinimas: 0,
      exemplo: true
    },
    {
      id: "exp2",
      nome: "Café Literário (exemplo)",
      categoria: "Café",
      beneficio: "Um café coado cortesia no dia do encontro",
      codigo: "Mostrar a carteirinha",
      validade: "",
      contato: "",
      presencasMinimas: 3,
      exemplo: true
    }
  ]
};
