/*
 * DADOS INICIAIS DO CLUBE
 * ------------------------------------------------------------
 * Aqui fica a lista oficial de livros lidos. Para cadastrar os
 * livros de verdade, basta substituir os exemplos abaixo
 * (ou usar o "Modo curadoria" no próprio site).
 *
 * Cada livro:
 *   { id, titulo, autor, prateleira, mes, ano, exemplo }
 *   - prateleira: o id de uma das prateleiras definidas abaixo
 *   - mes / ano:  quando o clube leu (opcional)
 *   - exemplo:    true = livro de demonstração (apague ao incluir os reais)
 */
window.DADOS_INICIAIS = {
  versao: 1,

  clube: {
    nome: "Clube do Livro",
    lema: "Ex libris, inter amicos",
    pinCuradoria: "1234"
  },

  prateleiras: [
    { id: "ano1", rotulo: "Primeiro ano" },
    { id: "ano2", rotulo: "Segundo ano" },
    { id: "2026-1", rotulo: "2026 · 1º semestre" },
    { id: "atual", rotulo: "Lendo agora & próximos" }
  ],

  livros: [
    { id: "ex1", titulo: "Dom Casmurro", autor: "Machado de Assis", prateleira: "ano1", mes: 3, ano: 2024, exemplo: true },
    { id: "ex2", titulo: "Orgulho e Preconceito", autor: "Jane Austen", prateleira: "ano1", mes: 4, ano: 2024, exemplo: true },
    { id: "ex3", titulo: "Cem Anos de Solidão", autor: "Gabriel García Márquez", prateleira: "ano2", mes: 2, ano: 2025, exemplo: true },
    { id: "ex4", titulo: "A Hora da Estrela", autor: "Clarice Lispector", prateleira: "ano2", mes: 3, ano: 2025, exemplo: true },
    { id: "ex5", titulo: "O Morro dos Ventos Uivantes", autor: "Emily Brontë", prateleira: "2026-1", mes: 2, ano: 2026, exemplo: true }
  ],

  encontros: [],

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
