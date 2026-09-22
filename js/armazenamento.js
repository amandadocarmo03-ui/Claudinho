/*
 * Camada de dados.
 * Nesta primeira versão tudo fica salvo no navegador (localStorage).
 * Quando o site virar aplicativo com vários membros usando ao mesmo
 * tempo, basta trocar as funções carregar/salvar por chamadas a um
 * banco online (Firebase, Supabase etc.) — o resto do app não muda.
 */
(function () {
  const CHAVE = "clube-do-livro:v1";

  function copia(obj) { return JSON.parse(JSON.stringify(obj)); }

  function estadoPadrao() {
    const ini = copia(window.DADOS_INICIAIS);
    return {
      versao: ini.versao,
      clube: ini.clube,
      prateleiras: ini.prateleiras,
      livros: ini.livros,
      encontros: ini.encontros,
      parceiros: ini.parceiros,
      membros: [],
      presencas: [],   // { membroId, encontroId, em }
      leituras: [],    // { membroId, livroId, nota, resenha, em }
      candidatos: [],  // { id, titulo, autor, indicadoPor, em }
      votos: {},       // { membroId: candidatoId }
      citacoes: []     // { id, texto, livroId, pagina, membroId, em }
    };
  }

  // Quando a lista oficial (dados-iniciais.js) ganha uma versão nova,
  // traz os livros e prateleiras novos sem apagar o que o clube registrou.
  function migrar(salvo) {
    const ini = window.DADOS_INICIAIS;
    if ((salvo.versao || 0) >= ini.versao) return salvo;
    if ((salvo.versao || 0) < 2) {
      salvo.livros = salvo.livros.filter((l) => !l.exemplo);
      salvo.prateleiras = salvo.prateleiras.filter((p) => p.id !== "ano1" && p.id !== "ano2");
      if (salvo.clube.nome === "Clube do Livro") Object.assign(salvo.clube, { nome: ini.clube.nome, lema: ini.clube.lema });
    }
    if ((salvo.versao || 0) < 4 && ["Cansei de Ser! Vou Ler um Livro", "Cansei! Vou ler um livro!"].includes(salvo.clube.nome)) salvo.clube.nome = ini.clube.nome;
    ini.prateleiras.forEach((p, i) => {
      if (!salvo.prateleiras.some((x) => x.id === p.id)) salvo.prateleiras.splice(i, 0, copia(p));
    });
    salvo.livros.forEach((l) => {
      if (!salvo.prateleiras.some((p) => p.id === l.prateleira)) l.prateleira = "atual";
    });
    ini.livros.forEach((l) => {
      if (!salvo.livros.some((x) => x.id === l.id)) salvo.livros.push(copia(l));
    });
    salvo.versao = ini.versao;
    return salvo;
  }

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return estadoPadrao();
      return migrar(Object.assign(estadoPadrao(), JSON.parse(bruto)));
    } catch (e) {
      return estadoPadrao();
    }
  }

  let estado = carregar();

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      console.warn("Não foi possível salvar os dados.", e);
    }
  }

  window.Dados = {
    get: () => estado,
    salvar,
    novoId: (prefixo) => prefixo + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    exportar: () => JSON.stringify(estado, null, 2),
    importar(texto) {
      const obj = JSON.parse(texto);
      if (!obj || !Array.isArray(obj.livros)) throw new Error("Arquivo inválido");
      estado = Object.assign(estadoPadrao(), obj);
      salvar();
    },
    reiniciar() {
      estado = estadoPadrao();
      salvar();
    }
  };
})();
