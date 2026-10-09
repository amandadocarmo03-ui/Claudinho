/* =========================================================
   Clube do Livro — aplicação
   ========================================================= */
(function () {
  const D = () => Dados.get();
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const conteudo = $("#conteudo");
  const modal = $("#modal");

  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const MESES_LONGOS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const CORES_LOMBADA = ["#6e1f2a", "#1f3b2d", "#1d2a44", "#5a3a1c", "#4b2140", "#2f4a4a", "#7a4a1e", "#3c3c24", "#5b1a1a", "#243b5a", "#3d2b1f", "#51603a"];

  /* ---------- Utilidades ---------- */
  function esc(txt) {
    return String(txt ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function hash(txt) {
    let h = 0;
    for (const c of String(txt)) h = (h * 31 + c.charCodeAt(0)) | 0;
    return Math.abs(h);
  }
  function hoje() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function dataLocal(iso) {
    if (!iso) return null;
    const [a, m, d] = iso.split("-").map(Number);
    return new Date(a, m - 1, d);
  }
  function formatarData(iso) {
    const d = dataLocal(iso);
    return d ? `${d.getDate()} de ${MESES_LONGOS[d.getMonth()]} de ${d.getFullYear()}` : "";
  }
  function estrelasFixas(n) {
    const v = Math.round(n || 0);
    return `<span class="estrelas--fixa" aria-label="${v} de 5 estrelas">${"★".repeat(v)}${"☆".repeat(5 - v)}</span>`;
  }
  function avisar(msg) {
    const el = $("#aviso");
    el.textContent = msg;
    el.classList.add("visivel");
    clearTimeout(avisar._t);
    avisar._t = setTimeout(() => el.classList.remove("visivel"), 2600);
  }
  function abrirModal(html) {
    $("#modal-corpo").innerHTML = `<button class="modal__fechar" type="button" data-fechar aria-label="Fechar">×</button>${html}`;
    if (!modal.open) modal.showModal();
  }
  function fecharModal() { if (modal.open) modal.close(); }
  // Confirmação dentro da própria página (as caixas nativas do navegador
  // são bloqueadas em alguns ambientes, como apps e pré-visualizações).
  function confirmar(mensagem, acao) {
    abrirModal(`
      <h3>Tem certeza?</h3>
      <p>${esc(mensagem)}</p>
      <div class="ficha__acoes">
        <button class="botao botao--perigo" type="button" id="confirmar-sim">Sim, continuar</button>
        <button class="botao botao--secundario" type="button" data-fechar>Cancelar</button>
      </div>`);
    $("#confirmar-sim").addEventListener("click", () => { fecharModal(); acao(); });
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-fechar]")) fecharModal();
  });
  function dadosDoFormulario(form) {
    const obj = {};
    new FormData(form).forEach((v, k) => { obj[k] = typeof v === "string" ? v.trim() : v; });
    return obj;
  }
  const SOBRANCELHAS = {
    estante: "Acervo do clube", encontros: "Agenda", checkin: "Meu diário", membros: "Comunidade", ranking: "Quadro de honra",
    beneficios: "Clube de vantagens", votacao: "Votação", citacoes: "Mural", painel: "Em números"
  };
  // Título com a última palavra em destaque (itálico vermelho), como nos títulos editoriais.
  function tituloDestacado(titulo) {
    const partes = titulo.trim().split(" ");
    if (partes.length < 2) return esc(titulo);
    const ultima = partes.pop();
    return `${esc(partes.join(" "))} <em>${esc(ultima)}</em>`;
  }
  function cabecalho(titulo, subtitulo) {
    const sob = SOBRANCELHAS[rotaAtual()] || "";
    return `<div class="cabecalho-secao">
      <div class="cabecalho-secao__titulo">${sob ? `<span class="sobrancelha">${sob}</span>` : ""}<h2>${tituloDestacado(titulo)}</h2></div>
      <p>${subtitulo}</p>
    </div>`;
  }
  const icone = (nome) => `<svg class="icone" aria-hidden="true"><use href="#i-${nome}"/></svg>`;

  /* ---------- Identidade: quem está usando o site ---------- */
  const CHAVE_EU = "clube-do-livro:eu";
  function euId() { try { return localStorage.getItem(CHAVE_EU); } catch (e) { return null; } }
  function eu() { return D().membros.find((m) => m.id === euId()) || null; }
  function definirEu(id) {
    try { id ? localStorage.setItem(CHAVE_EU, id) : localStorage.removeItem(CHAVE_EU); } catch (e) {}
  }
  function seletorMembro() {
    const membros = [...D().membros].sort((a, b) => a.nome.localeCompare(b.nome));
    if (!membros.length) {
      return `<div class="caixa-destaque">Nenhum membro cadastrado ainda. <a href="#membros">Faça seu cadastro</a> para fazer check-in e ver seus benefícios.</div>`;
    }
    const e = eu();
    if (!e) {
      return `<div class="sessao">
        <span>Entre para fazer check-in, somar pontos e ver seus benefícios.</span>
        <button class="botao botao--pequeno" type="button" data-entrar>Entrar</button>
      </div>`;
    }
    const p = pontosDe(e.id);
    return `<div class="sessao sessao--ativa">
      <span class="avatar">${esc(iniciais(e.nome))}</span>
      <span class="sessao__quem"><b>${esc(e.nome)}</b><small>${esc(nivelDe(p).nome)} · ${p} pontos · ${posicaoDe(e.id)}º no ranking</small></span>
      <span class="sessao__acoes"><a href="#checkin">Minha jornada</a><a href="#" data-sair>Sair</a></span>
    </div>`;
  }
  function ligarSeletorMembro() {
    $$("[data-entrar]").forEach((b) => b.addEventListener("click", () => abrirEntrar()));
    $$("[data-sair]").forEach((a) => a.addEventListener("click", (ev) => { ev.preventDefault(); definirEu(null); avisar("Até a próxima leitura!"); renderizar(); }));
  }

  /* ---------- Modo curadoria ---------- */
  const CHAVE_CURADORIA = "clube-do-livro:curadoria";
  function emCuradoria() { return document.body.classList.contains("curadoria"); }
  function aplicarCuradoria(ativo) {
    document.body.classList.toggle("curadoria", ativo);
    $("#botao-curadoria").classList.toggle("ativo", ativo);
    try { sessionStorage.setItem(CHAVE_CURADORIA, ativo ? "1" : ""); } catch (e) {}
  }
  $("#botao-curadoria").addEventListener("click", () => {
    if (emCuradoria()) { aplicarCuradoria(false); avisar("Modo curadoria encerrado"); renderizar(); return; }
    abrirModal(`
      <h3>Modo curadoria</h3>
      <p>Área da organização do clube: cadastrar livros, encontros, parceiros e fazer backup.</p>
      <form class="formulario" id="form-pin">
        <label>Senha de curadoria <input name="pin" type="password" inputmode="numeric" autocomplete="off" required></label>
        <button class="botao" type="submit">Entrar</button>
        <small>A senha inicial é <b>1234</b> — troque no Painel assim que entrar.</small>
      </form>`);
    $("#form-pin").addEventListener("submit", (e) => {
      e.preventDefault();
      if (dadosDoFormulario(e.target).pin === String(D().clube.pinCuradoria)) {
        aplicarCuradoria(true); fecharModal(); avisar("Curadoria aberta"); renderizar();
      } else {
        avisar("Senha incorreta");
      }
    });
  });

  /* ---------- Consultas ---------- */
  const livro = (id) => D().livros.find((l) => l.id === id);
  const membro = (id) => D().membros.find((m) => m.id === id);
  const leiturasDe = (membroId) => D().leituras.filter((l) => l.membroId === membroId);
  const presencasDe = (membroId) => D().presencas.filter((p) => p.membroId === membroId);
  const leitoresDe = (livroId) => D().leituras.filter((l) => l.livroId === livroId);
  function mediaNotas(livroId) {
    const notas = leitoresDe(livroId).map((l) => l.nota).filter(Boolean);
    return notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;
  }
  function livrosOrdenados(lista) {
    return [...lista].sort((a, b) => ((a.ano || 0) - (b.ano || 0)) || ((a.mes || 0) - (b.mes || 0)) || a.titulo.localeCompare(b.titulo));
  }
  /* =========================================================
     JOGO: pontos, níveis, conquistas, sequência e ranking
     ========================================================= */
  const PONTOS = { presenca: 50, leitura: 30, resenha: 15, citacao: 10, indicacao: 10 };
  const NIVEIS = [
    { min: 0, nome: "Página 1" },
    { min: 100, nome: "Capítulo aberto" },
    { min: 250, nome: "Leitura em dia" },
    { min: 500, nome: "Traça de livro" },
    { min: 900, nome: "Bibliófilo(a)" },
    { min: 1500, nome: "Lenda da estante" }
  ];
  const CONQUISTAS = [
    { id: "primeira-cadeira", icone: "🪑", nome: "Primeira cadeira", meta: "Ir ao primeiro encontro", ok: (s) => s.presencas >= 1 },
    { id: "cadeira-cativa", icone: "🛋️", nome: "Cadeira cativa", meta: "Ir a 5 encontros", ok: (s) => s.presencas >= 5 },
    { id: "guardia-sarau", icone: "🕯️", nome: "Guardiã(o) do sarau", meta: "Ir a 12 encontros", ok: (s) => s.presencas >= 12 },
    { id: "em-sequencia", icone: "🔥", nome: "Em sequência", meta: "3 encontros seguidos", ok: (s) => s.melhorSequencia >= 3 },
    { id: "maratona", icone: "⚡", nome: "Maratona", meta: "6 encontros seguidos", ok: (s) => s.melhorSequencia >= 6 },
    { id: "primeiro-capitulo", icone: "📖", nome: "Primeiro capítulo", meta: "Registrar 1 livro lido", ok: (s) => s.lidos >= 1 },
    { id: "leitura-assidua", icone: "📚", nome: "Leitura assídua", meta: "Registrar 5 livros", ok: (s) => s.lidos >= 5 },
    { id: "traca", icone: "🐛", nome: "Traça de biblioteca", meta: "Registrar 10 livros", ok: (s) => s.lidos >= 10 },
    { id: "acervo-vivo", icone: "🏛️", nome: "Acervo vivo", meta: "Registrar 20 livros", ok: (s) => s.lidos >= 20 },
    { id: "pena-afiada", icone: "🪶", nome: "Pena afiada", meta: "Escrever 3 resenhas", ok: (s) => s.resenhas >= 3 },
    { id: "frases", icone: "✒️", nome: "Colecionador(a) de frases", meta: "Pregar 3 citações no mural", ok: (s) => s.citacoes >= 3 },
    { id: "voz-da-estante", icone: "🗳️", nome: "Voz da estante", meta: "Indicar um livro para votação", ok: (s) => s.indicacoes >= 1 },
    { id: "sala-virtual", icone: "💻", nome: "Sala virtual", meta: "Assinar o Clube Online", ok: (s) => s.assinante }
  ];

  const encontrosRealizados = () => [...D().encontros].filter((e) => dataLocal(e.data) <= hoje()).sort((a, b) => a.data.localeCompare(b.data));
  const foiAo = (membroId, encontroId) => D().presencas.some((p) => p.membroId === membroId && p.encontroId === encontroId);

  // Sequência: encontros seguidos com presença. Encontros online só contam
  // para quem foi — faltar a um online não quebra a sequência.
  function sequenciasDe(membroId) {
    let atual = 0, melhor = 0;
    encontrosRealizados()
      .filter((e) => e.tipo !== "online" || foiAo(membroId, e.id))
      .forEach((e) => {
        if (foiAo(membroId, e.id)) { atual += 1; melhor = Math.max(melhor, atual); } else atual = 0;
      });
    return { atual, melhor };
  }

  // desde: Date opcional para limitar a contagem (ex.: só este ano).
  function estatisticasDe(membroId, desde) {
    const depois = (iso) => !desde || (iso && new Date(iso) >= desde);
    const presencas = D().presencas.filter((p) => {
      if (p.membroId !== membroId) return false;
      const enc = D().encontros.find((e) => e.id === p.encontroId);
      return enc && (!desde || dataLocal(enc.data) >= desde);
    }).length;
    const leituras = leiturasDe(membroId).filter((l) => depois(l.em));
    const seq = sequenciasDe(membroId);
    return {
      presencas,
      lidos: leituras.length,
      resenhas: leituras.filter((l) => l.resenha).length,
      citacoes: D().citacoes.filter((c) => c.membroId === membroId && depois(c.em)).length,
      indicacoes: D().candidatos.filter((c) => c.indicadoPor === membroId && depois(c.em)).length,
      sequencia: seq.atual,
      melhorSequencia: seq.melhor,
      assinante: !!assinaturaAtiva(membroId)
    };
  }

  function pontosDe(membroId, desde) {
    const s = estatisticasDe(membroId, desde);
    return s.presencas * PONTOS.presenca + s.lidos * PONTOS.leitura + s.resenhas * PONTOS.resenha
      + s.citacoes * PONTOS.citacao + s.indicacoes * PONTOS.indicacao;
  }

  function nivelDe(pontos) {
    let i = 0;
    NIVEIS.forEach((n, k) => { if (pontos >= n.min) i = k; });
    const prox = NIVEIS[i + 1];
    return {
      indice: i,
      nome: NIVEIS[i].nome,
      proximo: prox ? prox.nome : null,
      faltam: prox ? prox.min - pontos : 0,
      pct: prox ? Math.round(((pontos - NIVEIS[i].min) / (prox.min - NIVEIS[i].min)) * 100) : 100
    };
  }

  const conquistasDe = (membroId) => {
    const s = estatisticasDe(membroId);
    return CONQUISTAS.filter((c) => c.ok(s));
  };
  // Mantido para os selos exibidos no painel e nas fichas.
  const selosDe = (membroId) => conquistasDe(membroId).map((c) => `${c.icone} ${c.nome}`);

  const CRITERIOS = { pontos: "Pontos", presencas: "Encontros", lidos: "Leituras" };
  function ranking(criterio = "pontos", desde) {
    return D().membros.map((m) => {
      const s = estatisticasDe(m.id, desde);
      return { m, pontos: pontosDe(m.id, desde), presencas: s.presencas, lidos: s.lidos, nivel: nivelDe(pontosDe(m.id)) };
    }).sort((a, b) => (b[criterio] - a[criterio]) || (b.pontos - a.pontos) || a.m.nome.localeCompare(b.m.nome));
  }
  const posicaoDe = (membroId) => ranking().findIndex((r) => r.m.id === membroId) + 1;

  const iniciais = (nome) => String(nome || "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const primeiroNome = (m) => m.apelido || m.nome.split(" ")[0];

  // Guarda a situação antes de uma ação e comemora o que mudou depois.
  const retratoJogo = (membroId) => ({ pontos: pontosDe(membroId), nivel: nivelDe(pontosDe(membroId)).indice, conquistas: conquistasDe(membroId).map((c) => c.id) });
  function celebrar(membroId, antes) {
    if (!antes || membroId !== euId()) return;
    const depois = retratoJogo(membroId);
    const ganho = depois.pontos - antes.pontos;
    const novas = CONQUISTAS.filter((c) => depois.conquistas.includes(c.id) && !antes.conquistas.includes(c.id));
    if (depois.nivel > antes.nivel) {
      const n = nivelDe(depois.pontos);
      abrirModal(`<div class="celebracao">
        <span class="celebracao__emblema">${depois.nivel + 1}</span>
        <span class="sobrancelha">Você subiu de nível!</span>
        <h3>${esc(n.nome)}</h3>
        <p>${depois.pontos} pontos${n.proximo ? ` · faltam ${n.faltam} para <b>${esc(n.proximo)}</b>` : " · nível máximo do clube"}</p>
        ${novas.length ? `<p>${novas.map((c) => `${c.icone} ${esc(c.nome)}`).join(" · ")}</p>` : ""}
        <a class="botao" href="#ranking" data-fechar>Ver o ranking</a>
      </div>`);
    } else if (novas.length) {
      avisar(`${novas[0].icone} Nova conquista: ${novas[0].nome}${ganho > 0 ? ` · +${ganho} pontos` : ""}`);
    } else if (ganho > 0) {
      avisar(`+${ganho} pontos ✦`);
    }
  }

  /* ---------- Entrar / sair ---------- */
  function abrirEntrar(depois) {
    const membros = [...D().membros].sort((a, b) => a.nome.localeCompare(b.nome));
    abrirModal(`
      <span class="sobrancelha">Área do membro</span>
      <h3>Entrar no clube</h3>
      ${membros.length ? `
      <form class="formulario" id="form-entrar">
        <label>Seu e-mail ou nome
          <input name="quem" id="entrar-quem" list="lista-entrar" autocomplete="email" required>
          <datalist id="lista-entrar">${membros.map((m) => `<option value="${esc(m.email || m.nome)}">${esc(m.nome)}</option>`).join("")}</datalist>
        </label>
        <button class="botao" type="submit">Entrar</button>
        <p class="aviso-texto" style="margin:0">Versão de teste: o acesso é só pelo e-mail ou nome da ficha. A senha chega junto com o ambiente online.</p>
      </form>` : `<p>Ainda não há membros cadastrados.</p>`}
      <p style="margin-top:16px">Ainda não tem ficha? <a href="#membros" data-fechar>Faça seu cadastro</a></p>`);
    const f = $("#form-entrar");
    if (!f) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = normalizar(dadosDoFormulario(f).quem);
      const achados = D().membros.filter((m) => normalizar(m.email) === q || normalizar(m.nome) === q || normalizar(m.apelido) === q);
      const parecidos = achados.length ? achados : D().membros.filter((m) => normalizar(m.nome).startsWith(q));
      if (parecidos.length !== 1) { avisar(parecidos.length ? "Mais de um membro com esse nome — use o e-mail" : "Não encontrei essa ficha"); return; }
      definirEu(parecidos[0].id);
      if (depois) { fecharModal(); depois(); } else boasVindas();
      renderizar();
    });
  }

  function boasVindas() {
    const e = eu();
    if (!e) return;
    const p = pontosDe(e.id);
    const n = nivelDe(p);
    const s = estatisticasDe(e.id);
    const pos = posicaoDe(e.id);
    const proximo = [...D().encontros].filter((x) => dataLocal(x.data) >= hoje()).sort((a, b) => a.data.localeCompare(b.data))[0];
    abrirModal(`<div class="celebracao">
      <span class="avatar avatar--grande">${esc(iniciais(e.nome))}</span>
      <span class="sobrancelha">Que bom te ver</span>
      <h3>Olá, ${esc(primeiroNome(e))}!</h3>
      <div class="mini-placar">
        <div><strong>${p}</strong><span>pontos</span></div>
        <div><strong>${pos ? pos + "º" : "—"}</strong><span>no ranking</span></div>
        <div><strong>${s.sequencia}</strong><span>em sequência</span></div>
      </div>
      <p>Nível <b>${esc(n.nome)}</b>${n.proximo ? ` · faltam ${n.faltam} pontos para <b>${esc(n.proximo)}</b>` : ""}</p>
      ${proximo ? `<p>Próximo encontro: <b>${formatarData(proximo.data)}</b>${proximo.local ? " · " + esc(proximo.local) : ""}</p>` : ""}
      <div class="heroi__acoes" style="justify-content:center">
        <a class="botao" href="#checkin" data-fechar>Minha jornada</a>
        <a class="botao botao--secundario" href="#ranking" data-fechar>Ranking</a>
      </div>
    </div>`);
  }

  // Cartão da jornada: nível, barra de pontos, posição e conquistas.
  function jornadaHTML(membroId) {
    const m = membro(membroId);
    const p = pontosDe(membroId);
    const n = nivelDe(p);
    const s = estatisticasDe(membroId);
    const minhas = conquistasDe(membroId).map((c) => c.id);
    return `<section class="jornada">
      <div class="jornada__topo">
        <span class="avatar avatar--grande">${esc(iniciais(m.nome))}</span>
        <div>
          <span class="sobrancelha">Nível ${n.indice + 1} · ${esc(n.nome)}</span>
          <h3>${esc(m.nome)}</h3>
          <div class="xp"><div class="xp__barra"><span style="width:${n.pct}%"></span></div>
            <small>${p} pontos${n.proximo ? ` · faltam ${n.faltam} para ${esc(n.proximo)}` : " · nível máximo"}</small></div>
        </div>
      </div>
      <div class="mini-placar">
        <div><strong>${posicaoDe(membroId)}º</strong><span>no ranking</span></div>
        <div><strong>${s.presencas}</strong><span>encontros</span></div>
        <div><strong>${s.lidos}</strong><span>livros</span></div>
        <div><strong>${s.sequencia}${s.sequencia >= 2 ? " 🔥" : ""}</strong><span>em sequência</span></div>
      </div>
      <h4 class="jornada__subtitulo">Conquistas · ${minhas.length} de ${CONQUISTAS.length}</h4>
      <ul class="conquistas">
        ${CONQUISTAS.map((c) => `<li class="conquista ${minhas.includes(c.id) ? "" : "conquista--bloqueada"}" title="${esc(c.meta)}">
          <span class="conquista__icone">${c.icone}</span><b>${esc(c.nome)}</b><small>${esc(c.meta)}</small></li>`).join("")}
      </ul>
    </section>`;
  }

  /* =========================================================
     RANKING
     ========================================================= */
  const filtroRanking = { criterio: "presencas", periodo: "ano" };
  function telaRanking() {
    const ano = new Date().getFullYear();
    const desde = filtroRanking.periodo === "ano" ? new Date(ano, 0, 1) : null;
    const lista = ranking(filtroRanking.criterio, desde);
    const crit = filtroRanking.criterio;
    const valor = (r) => r[crit];
    const unidade = { pontos: "pts", presencas: "encontros", lidos: "livros" }[crit];
    const podio = lista.slice(0, 3);
    const ordemPodio = [podio[1], podio[0], podio[2]].filter(Boolean);
    conteudo.innerHTML = `
      ${cabecalho("Ranking do clube", "Quem mais foi aos encontros, quem mais leu e quem mais pontuou. Cada presença vale 50 pontos.")}
      ${seletorMembro()}
      <div class="barra-acoes">
        <div class="pilulas" role="group" aria-label="Critério">
          ${Object.entries(CRITERIOS).map(([k, v]) => `<button type="button" class="pilula ${crit === k ? "ativa" : ""}" data-criterio="${k}">${v}</button>`).join("")}
        </div>
        <div class="pilulas" role="group" aria-label="Período">
          <button type="button" class="pilula ${filtroRanking.periodo === "ano" ? "ativa" : ""}" data-periodo="ano">Em ${ano}</button>
          <button type="button" class="pilula ${filtroRanking.periodo === "geral" ? "ativa" : ""}" data-periodo="geral">Desde sempre</button>
        </div>
      </div>
      ${lista.length ? `
      <div class="podio">
        ${ordemPodio.map((r) => {
          const pos = lista.indexOf(r) + 1;
          return `<div class="podio__lugar podio__lugar--${pos} ${r.m.id === euId() ? "eu" : ""}">
            <span class="avatar">${esc(iniciais(r.m.nome))}</span>
            <b>${esc(primeiroNome(r.m))}</b>
            <small>${valor(r)} ${unidade}</small>
            <div class="podio__degrau">${pos}º</div>
          </div>`;
        }).join("")}
      </div>
      <div class="rolagem-tabela"><table class="tabela tabela--ranking">
        <thead><tr><th>#</th><th>Membro</th><th>Nível</th><th>Encontros</th><th>Livros</th><th>Pontos</th></tr></thead>
        <tbody>${lista.map((r, i) => `<tr class="${r.m.id === euId() ? "eu" : ""}">
          <td>${i + 1}º</td><td><b>${esc(r.m.apelido || r.m.nome)}</b>${r.m.id === euId() ? " <span class='selo'>você</span>" : ""}</td>
          <td>${esc(r.nivel.nome)}</td><td>${r.presencas}</td><td>${r.lidos}</td><td><b>${r.pontos}</b></td></tr>`).join("")}</tbody>
      </table></div>` : `<p class="vazio">O ranking aparece assim que houver membros cadastrados.</p>`}

      <div class="grade" style="margin-top:36px">
        <div class="ficha">
          <h4>Como ganhar pontos</h4>
          <dl>
            <dt>Encontro</dt><dd>+${PONTOS.presenca} por presença (presencial ou online)</dd>
            <dt>Livro lido</dt><dd>+${PONTOS.leitura} por livro registrado</dd>
            <dt>Resenha</dt><dd>+${PONTOS.resenha} por resenha escrita</dd>
            <dt>Citação</dt><dd>+${PONTOS.citacao} por trecho no mural</dd>
            <dt>Indicação</dt><dd>+${PONTOS.indicacao} por livro indicado</dd>
          </dl>
        </div>
        <div class="ficha">
          <h4>Níveis</h4>
          <ol class="niveis">${NIVEIS.map((n, i) => `<li><b>${esc(n.nome)}</b><span>${n.min} pts</span></li>`).join("")}</ol>
        </div>
      </div>`;
    ligarSeletorMembro();
    $$("[data-criterio]").forEach((b) => b.addEventListener("click", () => { filtroRanking.criterio = b.dataset.criterio; telaRanking(); }));
    $$("[data-periodo]").forEach((b) => b.addEventListener("click", () => { filtroRanking.periodo = b.dataset.periodo; telaRanking(); }));
  }

  /* =========================================================
     CLUBE ONLINE
     ========================================================= */
  const dinheiro = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  function assinaturaAtiva(membroId) {
    return (D().assinaturas || []).find((a) => a.membroId === membroId && a.status === "ativa" && dataLocal(a.renovaEm) >= hoje()) || null;
  }
  const planoPorId = (id) => (D().online.planos || []).find((p) => p.id === id);
  function somarPeriodo(data, periodo) {
    const d = new Date(data);
    if (periodo === "ano") d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  }

  function telaOnline() {
    const cfg = D().online;
    const e = eu();
    const assinatura = e ? assinaturaAtiva(e.id) : null;
    const encontrosOnline = [...D().encontros].filter((x) => x.tipo === "online").sort((a, b) => a.data.localeCompare(b.data));
    const proximoOnline = encontrosOnline.find((x) => dataLocal(x.data) >= hoje());
    const assinantes = (D().assinaturas || []).filter((a) => a.status === "ativa");

    conteudo.innerHTML = `
      <section class="faixa-online">
        <div>
          <span class="sobrancelha">Clube Online</span>
          <h2>Leia com a gente de <em>onde estiver</em></h2>
          <p>Encontros ao vivo pela internet, sala exclusiva com gravações e materiais de leitura. Para participar, é só assinar.</p>
          ${assinatura
            ? `<p class="status-assinatura">✓ Você é assinante · plano ${esc(planoPorId(assinatura.plano)?.nome || assinatura.plano)} · renova em ${formatarData(assinatura.renovaEm)}</p>`
            : `<a class="botao" href="#" data-ir-planos>Quero assinar</a>`}
        </div>
        <ul class="lista-beneficios-online">${(cfg.beneficios || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      </section>

      ${assinatura ? `
      <h3 class="titulo-bloco">Sua sala</h3>
      <div class="grade">
        <div class="ficha ficha--sala">
          <span class="sobrancelha">Próximo encontro online</span>
          ${proximoOnline ? `<h4>${formatarData(proximoOnline.data)}${proximoOnline.hora ? " · " + esc(proximoOnline.hora) : ""}</h4>
            <p>${esc(livro(proximoOnline.livroId)?.titulo || proximoOnline.titulo || "Encontro do clube")}</p>
            ${(proximoOnline.link || cfg.sala) ? `<a class="botao" href="${esc(proximoOnline.link || cfg.sala)}" target="_blank" rel="noopener">${icone("tela")} Entrar na sala</a>` : `<p class="aviso-texto">O link da sala aparece aqui perto do dia.</p>`}`
            : `<p>Nenhum encontro online marcado ainda. Fique de olho na agenda!</p>`}
        </div>
        <div class="ficha">
          <span class="sobrancelha">Materiais e gravações</span>
          ${(cfg.materiais || []).length ? `<ul class="lista-materiais">${cfg.materiais.map((mt) => `<li><a href="${esc(mt.link)}" target="_blank" rel="noopener">${esc(mt.titulo)}</a>${mt.descricao ? `<small>${esc(mt.descricao)}</small>` : ""}
            <button class="botao botao--pequeno botao--perigo somente-curadoria" data-excluir-material="${mt.id}">Remover</button></li>`).join("")}</ul>`
            : `<p>Os materiais de leitura e as gravações dos encontros vão aparecer aqui.</p>`}
        </div>
      </div>
      <p style="margin-top:14px"><a href="#" id="gerenciar-assinatura">Gerenciar assinatura</a></p>` : ""}

      <h3 class="titulo-bloco" id="planos">Planos</h3>
      ${cfg.valoresDeExemplo ? `<p class="aviso-texto">Valores de exemplo — a definir.</p>` : ""}
      <div class="planos">
        ${(cfg.planos || []).map((p) => `<article class="plano ${p.destaque ? "plano--destaque" : ""}">
          ${p.destaque ? `<span class="plano__selo">${esc(p.destaque)}</span>` : ""}
          <span class="sobrancelha">${esc(p.nome)}</span>
          <p class="plano__preco"><strong>${dinheiro(p.preco)}</strong><span>/${esc(p.periodo)}</span></p>
          ${p.periodo === "ano" ? `<p class="plano__equivale">equivale a ${dinheiro(p.preco / 12)} por mês</p>` : ""}
          <p>${esc(p.descricao || "")}</p>
          ${assinatura && assinatura.plano === p.id
            ? `<span class="botao botao--secundario" aria-disabled="true">Seu plano atual</span>`
            : `<button class="botao ${p.destaque ? "" : "botao--verde"}" type="button" data-assinar="${p.id}">${assinatura ? "Mudar para este plano" : "Assinar " + esc(p.nome.toLowerCase())}</button>`}
        </article>`).join("")}
      </div>
      <p class="legenda-estante" style="margin-top:14px">Pagamento por Pix ou cartão de crédito, direto no site. Cancele quando quiser.</p>

      <h3 class="titulo-bloco">Dúvidas sobre o Clube Online</h3>
      <div class="perguntas">
        <details><summary>Qual a diferença para o clube presencial?</summary><p>O clube presencial continua igual. O Clube Online é para quem quer participar dos encontros pela internet e ter acesso à sala com gravações e materiais.</p></details>
        <details><summary>Como pago?</summary><p>Escolha o plano, selecione Pix ou cartão de crédito e conclua o pagamento no próprio site. A assinatura é ativada assim que o pagamento é aprovado.</p></details>
        <details><summary>Posso cancelar?</summary><p>Pode, a qualquer momento, em “Gerenciar assinatura”. O acesso continua até o fim do período já pago.</p></details>
      </div>

      <div class="somente-curadoria">
        <h3 class="titulo-bloco">Curadoria do Clube Online</h3>
        <div class="grade">
          <form class="formulario ficha" id="form-online-planos">
            <h4>Planos e sala</h4>
            ${(cfg.planos || []).map((p) => `<label>Preço do plano ${esc(p.nome)} (R$/${esc(p.periodo)}) <input name="preco-${p.id}" type="number" step="0.01" min="0" value="${p.preco}"></label>`).join("")}
            <label>Link padrão da sala (Zoom, Meet…) <input name="sala" type="url" value="${esc(cfg.sala || "")}" placeholder="https://"></label>
            <label class="caixa"><input type="checkbox" name="valoresDeExemplo" ${cfg.valoresDeExemplo ? "checked" : ""}> Mostrar aviso “valores de exemplo”</label>
            <button class="botao" type="submit">Salvar</button>
          </form>
          <form class="formulario ficha" id="form-material">
            <h4>Novo material ou gravação</h4>
            <label>Título <input name="titulo" required></label>
            <label>Link <input name="link" type="url" required placeholder="https://"></label>
            <label>Descrição <input name="descricao"></label>
            <button class="botao" type="submit">Adicionar</button>
          </form>
        </div>
        <h3 class="titulo-bloco">Assinantes (${assinantes.length})</h3>
        ${assinantes.length ? `<div class="rolagem-tabela"><table class="tabela">
          <thead><tr><th>Membro</th><th>Plano</th><th>Pagamento</th><th>Desde</th><th>Renova em</th></tr></thead>
          <tbody>${assinantes.map((a) => `<tr><td>${esc(membro(a.membroId)?.nome || "—")}</td><td>${esc(planoPorId(a.plano)?.nome || a.plano)}</td>
            <td>${a.metodo === "pix" ? "Pix" : "Cartão"}${a.demo ? " · teste" : ""}</td><td>${formatarData(a.inicio)}</td><td>${formatarData(a.renovaEm)}</td></tr>`).join("")}</tbody>
        </table></div>` : `<p class="vazio">Nenhum assinante ainda.</p>`}
        <p><small>Encontros online são marcados na aba Encontros, escolhendo o tipo “Online”.</small></p>
      </div>`;

    const irPlanos = $("[data-ir-planos]");
    if (irPlanos) irPlanos.addEventListener("click", (ev) => { ev.preventDefault(); $("#planos").scrollIntoView({ behavior: "smooth" }); });
    $$("[data-assinar]").forEach((b) => b.addEventListener("click", () => {
      const iniciar = () => checkout(b.dataset.assinar);
      eu() ? iniciar() : abrirEntrar(iniciar);
    }));
    const ger = $("#gerenciar-assinatura");
    if (ger) ger.addEventListener("click", (ev) => {
      ev.preventDefault();
      confirmar("Cancelar a assinatura do Clube Online? O acesso à sala termina agora nesta versão de teste.", () => {
        assinatura.status = "cancelada";
        Dados.salvar(); avisar("Assinatura cancelada"); telaOnline();
      });
    });
    $("#form-online-planos").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const f = dadosDoFormulario(ev.target);
      cfg.planos.forEach((p) => { const v = Number(f["preco-" + p.id]); if (!Number.isNaN(v)) p.preco = v; });
      cfg.sala = f.sala;
      cfg.valoresDeExemplo = !!f.valoresDeExemplo;
      Dados.salvar(); avisar("Clube Online atualizado"); telaOnline();
    });
    $("#form-material").addEventListener("submit", (ev) => {
      ev.preventDefault();
      cfg.materiais = cfg.materiais || [];
      cfg.materiais.push({ id: Dados.novoId("mt"), ...dadosDoFormulario(ev.target) });
      Dados.salvar(); avisar("Material adicionado"); telaOnline();
    });
    $$("[data-excluir-material]").forEach((b) => b.addEventListener("click", () => {
      cfg.materiais = cfg.materiais.filter((mt) => mt.id !== b.dataset.excluirMaterial);
      Dados.salvar(); telaOnline();
    }));
  }

  // Checkout em etapas: resumo e forma de pagamento → pagamento → confirmação.
  function checkout(planoId) {
    const plano = planoPorId(planoId);
    const m = eu();
    if (!plano || !m) return;
    let metodo = "pix";
    const avisoDemo = Pagamento.ehDemo ? `<p class="aviso-demo"><b>Ambiente de teste:</b> o pagamento é simulado e nada é cobrado. Na versão online, esta etapa abre o checkout seguro do provedor de pagamento — os dados do cartão ficam só com ele, nunca com o site.</p>` : "";

    const etapa1 = () => {
      abrirModal(`
        <ol class="etapas"><li class="ativa">Plano</li><li>Pagamento</li><li>Pronto</li></ol>
        <h3>Assinar o Clube Online</h3>
        <div class="resumo-plano"><span>Plano ${esc(plano.nome)}</span><strong>${dinheiro(plano.preco)}<small>/${esc(plano.periodo)}</small></strong></div>
        <p>Assinatura em nome de <b>${esc(m.nome)}</b>${m.email ? ` · ${esc(m.email)}` : ""}.</p>
        <fieldset class="metodos"><legend>Forma de pagamento</legend>
          <label class="metodo"><input type="radio" name="metodo" value="pix" checked><span><b>Pix</b><small>Aprovação na hora</small></span></label>
          <label class="metodo"><input type="radio" name="metodo" value="cartao"><span><b>Cartão de crédito</b><small>Cobrança automática a cada ${esc(plano.periodo)}</small></span></label>
        </fieldset>
        ${avisoDemo}
        <button class="botao" type="button" id="checkout-continuar" style="width:100%">Continuar para o pagamento</button>`);
      $("#checkout-continuar").addEventListener("click", () => {
        metodo = ($("input[name=metodo]:checked") || {}).value || "pix";
        etapa2();
      });
    };

    const etapa2 = () => {
      abrirModal(`
        <ol class="etapas"><li class="feita">Plano</li><li class="ativa">Pagamento</li><li>Pronto</li></ol>
        <h3>${metodo === "pix" ? "Pagar com Pix" : "Pagar com cartão"}</h3>
        <div class="resumo-plano"><span>Plano ${esc(plano.nome)}</span><strong>${dinheiro(plano.preco)}<small>/${esc(plano.periodo)}</small></strong></div>
        <div class="espaco-provedor">
          ${icone(metodo === "pix" ? "pix" : "cartao")}
          <p>${metodo === "pix"
            ? "Aqui aparece o QR Code e o código “copia e cola” do Pix, gerados pelo provedor de pagamento."
            : "Aqui aparece o formulário seguro do provedor de pagamento para os dados do cartão."}</p>
        </div>
        ${avisoDemo}
        <div class="ficha__acoes">
          <button class="botao" type="button" id="checkout-pagar">${Pagamento.ehDemo ? "Simular pagamento aprovado" : "Pagar"}</button>
          <button class="botao botao--secundario" type="button" id="checkout-voltar">Voltar</button>
        </div>`);
      $("#checkout-voltar").addEventListener("click", etapa1);
      $("#checkout-pagar").addEventListener("click", () => {
        const antes = retratoJogo(m.id);
        Pagamento.iniciar({ plano, membro: m, metodo }).then((r) => {
          if (!r.aprovado) { avisar("Pagamento não aprovado"); return; }
          D().assinaturas = (D().assinaturas || []).map((a) => (a.membroId === m.id && a.status === "ativa" ? { ...a, status: "substituida" } : a));
          const inicio = new Date().toISOString().slice(0, 10);
          D().assinaturas.push({ id: Dados.novoId("as"), membroId: m.id, plano: plano.id, metodo, status: "ativa", inicio, renovaEm: somarPeriodo(inicio, plano.periodo), referencia: r.referencia, demo: Pagamento.ehDemo });
          Dados.salvar();
          etapa3(antes);
        }).catch((err) => avisar(err.message));
      });
    };

    const etapa3 = (antes) => {
      const a = assinaturaAtiva(m.id);
      const novas = CONQUISTAS.filter((c) => conquistasDe(m.id).some((x) => x.id === c.id) && !antes.conquistas.includes(c.id));
      abrirModal(`
        <ol class="etapas"><li class="feita">Plano</li><li class="feita">Pagamento</li><li class="ativa">Pronto</li></ol>
        <div class="celebracao">
          <span class="celebracao__emblema">✓</span>
          <span class="sobrancelha">Assinatura ativa</span>
          <h3>Bem-vindo(a) ao Clube Online, ${esc(primeiroNome(m))}!</h3>
          <p>Plano ${esc(plano.nome)} · renova em ${formatarData(a.renovaEm)}</p>
          ${novas.length ? `<p>${novas.map((c) => `${c.icone} Nova conquista: <b>${esc(c.nome)}</b>`).join("<br>")}</p>` : ""}
          <a class="botao" href="#online" data-fechar id="checkout-ir">Ir para a minha sala</a>
        </div>`);
      $("#checkout-ir").addEventListener("click", () => { if (rotaAtual() === "online") setTimeout(telaOnline, 0); });
    };

    etapa1();
  }

  /* =========================================================
     ESTANTE
     ========================================================= */
  function lombadaHTML(l) {
    const h = hash(l.titulo + l.autor);
    const cor = l.cor || CORES_LOMBADA[h % CORES_LOMBADA.length];
    const altura = 172 + (h % 5) * 10;
    const largura = l.titulo.length > 34 ? 70 : l.titulo.length > 22 ? 58 : l.titulo.length > 12 ? 48 : 40;
    const lido = euId() && D().leituras.some((x) => x.livroId === l.id && x.membroId === euId());
    const busca = filtroEstante.texto ? (combinaBusca(l) ? "lombada--achada" : "lombada--apagada") : "";
    return `<button class="lombada ${lido ? "lombada--lido" : ""} ${busca}" type="button" data-livro="${l.id}"
        style="--cor:${cor};--altura:${altura}px;--largura:${largura}px"
        title="${esc(l.titulo)} — ${esc(l.autor)}${l.exemplo ? " (exemplo)" : ""}">
        ${lido ? `<span class="lombada__selo" aria-label="lido">✦</span>` : ""}
        <span class="lombada__texto"><span class="lombada__titulo">${esc(l.titulo)}</span><span class="lombada__autor">${esc(l.autor.split(" ").slice(-1)[0])}</span></span>
      </button>`;
  }

  const filtroEstante = { prateleira: "", texto: "" };
  const normalizar = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  function combinaBusca(l) {
    const q = normalizar(filtroEstante.texto);
    return !q || normalizar(l.titulo + " " + l.autor).includes(q);
  }

  function telaEstante() {
    const { livros } = D();
    const temExemplo = livros.some((l) => l.exemplo);
    const prateleiras = D().prateleiras.filter((p) => !filtroEstante.prateleira || p.id === filtroEstante.prateleira);
    const achados = filtroEstante.texto ? livros.filter(combinaBusca) : null;
    conteudo.innerHTML = `
      ${cabecalho("A estante do clube", `${livros.filter((l) => !l.exemplo).length} livros lidos juntos desde 2024, um por mês. Toque numa lombada para ver notas, leitores e resenhas.`)}
      ${temExemplo ? `<p class="legenda-estante">Os livros marcados como exemplo são só demonstração — entre na curadoria e cole a lista real do clube.</p>` : ""}
      <div class="barra-acoes">
        <div class="pilulas" role="group" aria-label="Filtrar por prateleira">
          <button type="button" class="pilula ${filtroEstante.prateleira ? "" : "ativa"}" data-prat="">Todas</button>
          ${D().prateleiras.map((p) => `<button type="button" class="pilula ${filtroEstante.prateleira === p.id ? "ativa" : ""}" data-prat="${p.id}">${esc(p.rotulo.split(" · ")[0])}</button>`).join("")}
        </div>
        ${achados ? `<p style="margin:0">${achados.length} livro(s) para “${esc(filtroEstante.texto)}” · <a href="#" id="limpar-busca">limpar busca</a></p>` : ""}
      </div>
      <div class="estante">
        ${prateleiras.map((p) => {
          const daPrateleira = livrosOrdenados(livros.filter((l) => l.prateleira === p.id));
          return `<section class="prateleira" aria-label="${esc(p.rotulo)}">
            <span class="prateleira__rotulo">${esc(p.rotulo)}</span>
            <div class="prateleira__livros">
              ${daPrateleira.length ? daPrateleira.map(lombadaHTML).join("") : `<p class="prateleira__vazia">Prateleira à espera de livros…</p>`}
            </div>
            <div class="prateleira__tabua"></div>
          </section>`;
        }).join("")}
      </div>
      <p class="legenda-estante">✦ marca os livros que você já registrou como lidos.</p>

      <div class="somente-curadoria">
        <h3 class="titulo-bloco">Adicionar livros à estante</h3>
        <div class="grade">
          <form class="formulario" id="form-livro">
            <label>Título <input name="titulo" required></label>
            <label>Autor(a) <input name="autor" required></label>
            <div class="campos">
              <label>Prateleira ${seletorPrateleira("prateleira")}</label>
              <label>Mês <input name="mes" type="number" min="1" max="12"></label>
              <label>Ano <input name="ano" type="number" min="1900" max="2100"></label>
            </div>
            <button class="botao" type="submit">Colocar na estante</button>
          </form>
          <form class="formulario" id="form-lote">
            <label>Colar uma lista (um livro por linha: <i>Título — Autor</i>)
              <textarea name="lista" rows="7" placeholder="Dom Casmurro — Machado de Assis&#10;A Hora da Estrela — Clarice Lispector"></textarea>
            </label>
            <div class="campos">
              <label>Prateleira ${seletorPrateleira("prateleira")}</label>
              <label>Ano <input name="ano" type="number" min="1900" max="2100"></label>
            </div>
            <label class="caixa"><input type="checkbox" name="mesSequencial" checked> Numerar meses em sequência (1º livro = mês 1…)</label>
            <button class="botao" type="submit">Adicionar lista</button>
          </form>
        </div>
        <h3 class="titulo-bloco">Prateleiras</h3>
        <form class="formulario" id="form-prateleira">
          <div class="campos">
            <label>Nova prateleira <input name="rotulo" placeholder="ex.: 2026 · 2º semestre" required></label>
          </div>
          <div><button class="botao botao--secundario" type="submit">Criar prateleira</button>
          ${temExemplo ? `<button class="botao botao--perigo" type="button" id="apagar-exemplos">Remover livros de exemplo</button>` : ""}</div>
        </form>
      </div>`;

    $$(".lombada").forEach((b) => b.addEventListener("click", () => detalheLivro(b.dataset.livro)));
    $$("[data-prat]").forEach((b) => b.addEventListener("click", () => { filtroEstante.prateleira = b.dataset.prat; telaEstante(); }));
    const limpar = $("#limpar-busca");
    if (limpar) limpar.addEventListener("click", (e) => { e.preventDefault(); filtroEstante.texto = ""; $("#busca-texto").value = ""; telaEstante(); });

    const formLivro = $("#form-livro");
    formLivro.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = dadosDoFormulario(formLivro);
      D().livros.push({ id: Dados.novoId("l"), titulo: f.titulo, autor: f.autor, prateleira: f.prateleira, mes: Number(f.mes) || null, ano: Number(f.ano) || null });
      Dados.salvar(); avisar("Livro colocado na estante"); telaEstante();
    });

    const formLote = $("#form-lote");
    formLote.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = dadosDoFormulario(formLote);
      const linhas = f.lista.split("\n").map((s) => s.trim()).filter(Boolean);
      linhas.forEach((linha, i) => {
        const partes = linha.replace(/^\d+[.)\-\s]+/, "").split(/\s[—–-]\s|\s*;\s*/);
        D().livros.push({
          id: Dados.novoId("l"),
          titulo: partes[0].trim(),
          autor: (partes[1] || "").trim() || "Autor(a) desconhecido(a)",
          prateleira: f.prateleira,
          mes: f.mesSequencial ? ((i % 12) + 1) : null,
          ano: Number(f.ano) || null
        });
      });
      Dados.salvar(); avisar(`${linhas.length} livros adicionados`); telaEstante();
    });

    $("#form-prateleira").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = dadosDoFormulario(e.target);
      D().prateleiras.push({ id: Dados.novoId("p"), rotulo: f.rotulo });
      Dados.salvar(); avisar("Prateleira criada"); telaEstante();
    });

    const apagar = $("#apagar-exemplos");
    if (apagar) apagar.addEventListener("click", () => {
      const ids = D().livros.filter((l) => l.exemplo).map((l) => l.id);
      D().livros = D().livros.filter((l) => !l.exemplo);
      D().leituras = D().leituras.filter((l) => !ids.includes(l.livroId));
      D().parceiros = D().parceiros.filter((p) => !p.exemplo);
      Dados.salvar(); avisar("Exemplos removidos"); telaEstante();
    });
  }

  function seletorPrateleira(nome, atual) {
    return `<select name="${nome}">${D().prateleiras.map((p) => `<option value="${p.id}" ${p.id === atual ? "selected" : ""}>${esc(p.rotulo)}</option>`).join("")}</select>`;
  }

  function detalheLivro(id) {
    const l = livro(id);
    if (!l) return;
    const leitores = leitoresDe(id);
    const media = mediaNotas(id);
    const cor = l.cor || CORES_LOMBADA[hash(l.titulo + l.autor) % CORES_LOMBADA.length];
    const resenhas = leitores.filter((x) => x.resenha);
    const eu_ = eu();
    const jaLi = eu_ && leitores.some((x) => x.membroId === eu_.id);
    const pratel = D().prateleiras.find((p) => p.id === l.prateleira);
    abrirModal(`
      <div class="detalhe-livro">
        <div class="capa" style="--cor:${cor}"><span>${esc(l.titulo)}</span><small>${esc(l.autor)}</small></div>
        <div>
          <h3>${esc(l.titulo)}</h3>
          <p class="destaque" style="font-family:var(--fonte-display);font-size:1.2rem">${esc(l.autor)}</p>
          <p>${pratel ? esc(pratel.rotulo) : ""}${l.mes ? ` · ${MESES_LONGOS[l.mes - 1]}` : ""}${l.ano ? ` de ${l.ano}` : ""}
            ${l.exemplo ? ` <span class="selo selo--exemplo">exemplo</span>` : ""}</p>
          <p>${media ? `${estrelasFixas(media)} ${media.toFixed(1)} ` : "Ainda sem notas "}· ${leitores.length} leitor(es)</p>
          ${eu_ ? (jaLi
            ? `<p>✦ Você já leu este livro.</p>`
            : `<a class="botao botao--verde" href="#checkin" data-fechar>Registrar minha leitura</a>`) : ""}
        </div>
      </div>
      ${leitores.length ? `<h3 class="titulo-bloco">Quem leu</h3><p>${leitores.map((x) => esc(membro(x.membroId)?.nome || "—")).join(", ")}</p>` : ""}
      ${resenhas.length ? `<h3 class="titulo-bloco">Resenhas</h3>${resenhas.map((r) => `
        <blockquote class="citacao" style="font-size:1.05rem;margin-bottom:12px">${esc(r.resenha)}
          <footer>— ${esc(membro(r.membroId)?.nome || "")} ${estrelasFixas(r.nota)}</footer></blockquote>`).join("")}` : ""}
      <div class="somente-curadoria">
        <h3 class="titulo-bloco">Editar</h3>
        <form class="formulario" id="form-editar-livro">
          <div class="campos">
            <label>Título <input name="titulo" value="${esc(l.titulo)}" required></label>
            <label>Autor(a) <input name="autor" value="${esc(l.autor)}" required></label>
            <label>Prateleira ${seletorPrateleira("prateleira", l.prateleira)}</label>
            <label>Mês <input name="mes" type="number" min="1" max="12" value="${l.mes || ""}"></label>
            <label>Ano <input name="ano" type="number" value="${l.ano || ""}"></label>
          </div>
          <div class="ficha__acoes">
            <button class="botao" type="submit">Salvar</button>
            <button class="botao botao--perigo" type="button" id="excluir-livro">Tirar da estante</button>
          </div>
        </form>
      </div>`);

    $("#form-editar-livro").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = dadosDoFormulario(e.target);
      Object.assign(l, { titulo: f.titulo, autor: f.autor, prateleira: f.prateleira, mes: Number(f.mes) || null, ano: Number(f.ano) || null, exemplo: false });
      Dados.salvar(); fecharModal(); avisar("Livro atualizado"); renderizar();
    });
    $("#excluir-livro").addEventListener("click", () => {
      confirmar(`Tirar "${l.titulo}" da estante?`, () => {
        D().livros = D().livros.filter((x) => x.id !== id);
        D().leituras = D().leituras.filter((x) => x.livroId !== id);
        Dados.salvar(); fecharModal(); avisar("Livro removido"); renderizar();
      });
    });
  }

  /* =========================================================
     ENCONTROS
     ========================================================= */
  function telaEncontros() {
    const encontros = [...D().encontros].sort((a, b) => a.data.localeCompare(b.data));
    const h = hoje();
    const proximos = encontros.filter((e) => dataLocal(e.data) >= h);
    const passados = encontros.filter((e) => dataLocal(e.data) < h).reverse();
    const eu_ = eu();

    const item = (e) => {
      const d = dataLocal(e.data);
      const passado = d < h;
      const l = livro(e.livroId);
      const presentes = D().presencas.filter((p) => p.encontroId === e.id);
      const confirmados = (e.confirmados || []);
      const fiz = eu_ && presentes.some((p) => p.membroId === eu_.id);
      const vou = eu_ && confirmados.includes(eu_.id);
      const ehHoje = d.getTime() === h.getTime();
      const online = e.tipo === "online";
      const assinante = eu_ && assinaturaAtiva(eu_.id);
      const linkSala = e.link || D().online.sala;
      let acao = "";
      if (online && !assinante && !fiz) {
        acao = `<a class="botao botao--pequeno botao--secundario" href="#online">Assinar para participar</a>`;
      } else if (eu_) {
        acao = passado || ehHoje
          ? `<button class="botao botao--pequeno ${fiz ? "botao--secundario" : "botao--verde"}" data-checkin="${e.id}">${fiz ? "✓ Estive lá" : "Fazer check-in"}</button>`
          : `<button class="botao botao--pequeno ${vou ? "botao--secundario" : ""}" data-confirmar="${e.id}">${vou ? "✓ Presença confirmada" : "Vou!"}</button>`;
        if (online && assinante && linkSala && !passado) acao += `<a class="botao botao--pequeno botao--verde" href="${esc(linkSala)}" target="_blank" rel="noopener">Entrar na sala</a>`;
      }
      return `<article class="encontro ${passado ? "encontro--passado" : ""}">
        <div class="encontro__data"><strong>${d.getDate()}</strong><span>${MESES[d.getMonth()]} ${d.getFullYear()}</span></div>
        <div>
          <h4>${l ? esc(l.titulo) : esc(e.titulo || "Encontro do clube")} ${online ? `<span class="chip-online">Online · assinantes</span>` : ""}</h4>
          <p>${e.hora ? esc(e.hora) + " · " : ""}${esc(e.local || (online ? "Sala online" : "Local a definir"))}</p>
          ${e.obs ? `<p><i>${esc(e.obs)}</i></p>` : ""}
          <p>${passado || ehHoje ? `${presentes.length} presença(s) registrada(s)` : `${confirmados.length} confirmação(ões)`}</p>
        </div>
        <div class="encontro__acoes">
          ${acao}
          <button class="botao botao--pequeno botao--secundario somente-curadoria" data-lista="${e.id}">Lista</button>
          <button class="botao botao--pequeno botao--perigo somente-curadoria" data-excluir-encontro="${e.id}">Excluir</button>
        </div>
      </article>`;
    };

    conteudo.innerHTML = `
      ${cabecalho("Encontros", "Datas marcadas no calendário do clube")}
      ${seletorMembro()}
      <h3 class="titulo-bloco">Próximos encontros</h3>
      ${proximos.length ? proximos.map(item).join("") : `<p class="vazio">Nenhum encontro marcado por enquanto.</p>`}
      <h3 class="titulo-bloco">Encontros que já aconteceram</h3>
      ${passados.length ? passados.map(item).join("") : `<p class="vazio">Os encontros registrados aparecerão aqui.</p>`}

      <div class="somente-curadoria">
        <h3 class="titulo-bloco">Marcar encontro</h3>
        <form class="formulario" id="form-encontro">
          <div class="campos">
            <label>Data <input name="data" type="date" required></label>
            <label>Horário <input name="hora" type="time"></label>
            <label>Livro do encontro
              <select name="livroId"><option value="">— outro / sem livro —</option>
                ${livrosOrdenados(D().livros).map((l) => `<option value="${l.id}">${esc(l.titulo)}</option>`).join("")}
              </select></label>
            <label>Título (se não houver livro) <input name="titulo"></label>
            <label>Local <input name="local" placeholder="Café, livraria…"></label>
            <label>Tipo
              <select name="tipo"><option value="presencial">Presencial</option><option value="online">Online (só assinantes)</option></select></label>
            <label>Link da sala (se online) <input name="link" type="url" placeholder="https://"></label>
          </div>
          <label>Observações <textarea name="obs" rows="2"></textarea></label>
          <button class="botao" type="submit">Marcar no calendário</button>
        </form>
        <p><small>Dica: encontros antigos também podem ser cadastrados com a data passada, para o histórico de presenças.</small></p>
      </div>`;

    ligarSeletorMembro();

    $$("[data-checkin]").forEach((b) => b.addEventListener("click", () => {
      alternarPresenca(eu_.id, b.dataset.checkin); telaEncontros();
    }));
    $$("[data-confirmar]").forEach((b) => b.addEventListener("click", () => {
      const enc = D().encontros.find((x) => x.id === b.dataset.confirmar);
      enc.confirmados = enc.confirmados || [];
      const i = enc.confirmados.indexOf(eu_.id);
      i >= 0 ? enc.confirmados.splice(i, 1) : enc.confirmados.push(eu_.id);
      Dados.salvar(); avisar(i >= 0 ? "Confirmação retirada" : "Presença confirmada — até lá!"); telaEncontros();
    }));
    $$("[data-lista]").forEach((b) => b.addEventListener("click", () => listaPresenca(b.dataset.lista)));
    $$("[data-excluir-encontro]").forEach((b) => b.addEventListener("click", () => {
      confirmar("Excluir este encontro e suas presenças?", () => {
        const id = b.dataset.excluirEncontro;
        D().encontros = D().encontros.filter((x) => x.id !== id);
        D().presencas = D().presencas.filter((x) => x.encontroId !== id);
        Dados.salvar(); telaEncontros();
      });
    }));
    $("#form-encontro").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const f = dadosDoFormulario(ev.target);
      D().encontros.push({ id: Dados.novoId("e"), ...f, confirmados: [] });
      Dados.salvar(); avisar("Encontro marcado"); telaEncontros();
    });
  }

  function alternarPresenca(membroId, encontroId) {
    const idx = D().presencas.findIndex((p) => p.membroId === membroId && p.encontroId === encontroId);
    if (idx >= 0) { D().presencas.splice(idx, 1); Dados.salvar(); avisar("Check-in desfeito"); return; }
    const antes = retratoJogo(membroId);
    D().presencas.push({ membroId, encontroId, em: new Date().toISOString() });
    Dados.salvar();
    if (membroId === euId()) celebrar(membroId, antes); else avisar("Presença marcada");
  }

  function listaPresenca(encontroId) {
    const enc = D().encontros.find((e) => e.id === encontroId);
    const membros = [...D().membros].sort((a, b) => a.nome.localeCompare(b.nome));
    const render = () => {
      abrirModal(`
        <h3>Lista de presença</h3>
        <p>${formatarData(enc.data)} · ${esc(livro(enc.livroId)?.titulo || enc.titulo || "Encontro")}</p>
        ${membros.length ? `<ul class="lista-check">${membros.map((m) => {
          const presente = D().presencas.some((p) => p.membroId === m.id && p.encontroId === encontroId);
          const confirmou = (enc.confirmados || []).includes(m.id);
          return `<li class="${presente ? "feito" : ""}"><span>${esc(m.nome)}${confirmou ? " <small>confirmou presença</small>" : ""}</span>
            <button class="botao botao--pequeno ${presente ? "botao--secundario" : "botao--verde"}" data-marcar="${m.id}">${presente ? "✓ Presente" : "Marcar"}</button></li>`;
        }).join("")}</ul>` : `<p class="vazio">Sem membros cadastrados.</p>`}`);
      $$("[data-marcar]").forEach((b) => b.addEventListener("click", () => { alternarPresenca(b.dataset.marcar, encontroId); render(); }));
    };
    render();
    modal.addEventListener("close", () => renderizar(), { once: true });
  }

  /* =========================================================
     CHECK-IN (diário de leitura)
     ========================================================= */
  function telaCheckin() {
    const eu_ = eu();
    let corpo = "";
    if (eu_) {
      const minhasLeituras = leiturasDe(eu_.id);
      const minhasPresencas = presencasDe(eu_.id);
      const encontros = [...D().encontros].filter((e) => dataLocal(e.data) <= hoje()).sort((a, b) => b.data.localeCompare(a.data));
      corpo = `
        ${jornadaHTML(eu_.id)}
        <div class="progresso">
          <div class="progresso__rotulo"><span>Sua estante</span><span>${minhasLeituras.length} de ${D().livros.length} livros</span></div>
          <div class="progresso__barra"><span style="width:${D().livros.length ? (minhasLeituras.length / D().livros.length) * 100 : 0}%"></span></div>
        </div>
        <h3 class="titulo-bloco">Livros que li</h3>
        <ul class="lista-check">
          ${livrosOrdenados(D().livros).map((l) => {
            const r = minhasLeituras.find((x) => x.livroId === l.id);
            return `<li class="${r ? "feito" : ""}">
              <span><b>${esc(l.titulo)}</b> <small>${esc(l.autor)}${r?.resenha ? " · resenha escrita" : ""}</small></span>
              <span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end">
                ${r ? estrelasFixas(r.nota) : ""}
                <button class="botao botao--pequeno ${r ? "botao--secundario" : "botao--verde"}" data-ler="${l.id}">${r ? "Editar" : "Li!"}</button>
              </span></li>`;
          }).join("") || `<p class="vazio">A estante ainda está vazia.</p>`}
        </ul>

        <h3 class="titulo-bloco">Encontros em que estive</h3>
        ${encontros.length ? `<ul class="lista-check">${encontros.map((e) => {
          const fui = minhasPresencas.some((p) => p.encontroId === e.id);
          if (e.tipo === "online" && !fui && !assinaturaAtiva(eu_.id)) return "";
          return `<li class="${fui ? "feito" : ""}"><span><b>${formatarData(e.data)}</b>
            <small>${esc(livro(e.livroId)?.titulo || e.titulo || "Encontro")} · ${esc(e.local || "")}</small></span>
            <button class="botao botao--pequeno ${fui ? "botao--secundario" : "botao--verde"}" data-presenca="${e.id}">${fui ? "✓ Estive lá" : "Check-in"}</button></li>`;
        }).join("")}</ul>` : `<p class="vazio">Nenhum encontro realizado ainda. Os encontros são cadastrados na aba Encontros.</p>`}`;
    }

    conteudo.innerHTML = `
      ${cabecalho("Minha jornada", "Seu diário de leituras e de encontros. Cada check-in soma pontos, sobe seu nível e libera conquistas.")}
      ${seletorMembro()}
      ${corpo}`;
    ligarSeletorMembro();

    $$("[data-presenca]").forEach((b) => b.addEventListener("click", () => { alternarPresenca(eu_.id, b.dataset.presenca); telaCheckin(); }));
    $$("[data-ler]").forEach((b) => b.addEventListener("click", () => registrarLeitura(b.dataset.ler)));
  }

  function registrarLeitura(livroId) {
    const eu_ = eu();
    const l = livro(livroId);
    const existente = D().leituras.find((x) => x.livroId === livroId && x.membroId === eu_.id);
    let nota = existente?.nota || 0;
    abrirModal(`
      <h3>${esc(l.titulo)}</h3>
      <p><i>${esc(l.autor)}</i></p>
      <form class="formulario" id="form-leitura">
        <label>Sua nota
          <span class="estrelas" id="estrelas">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-nota="${n}" aria-label="${n} estrela(s)">★</button>`).join("")}</span>
        </label>
        <label>Resenha curtinha (opcional)
          <textarea name="resenha" placeholder="O que ficou com você depois da última página?">${esc(existente?.resenha || "")}</textarea>
        </label>
        <div class="ficha__acoes">
          <button class="botao botao--verde" type="submit">${existente ? "Salvar" : "Registrar leitura"}</button>
          ${existente ? `<button class="botao botao--perigo" type="button" id="desfazer-leitura">Desmarcar como lido</button>` : ""}
        </div>
      </form>`);
    const pintar = () => $$("#estrelas button").forEach((b) => b.classList.toggle("acesa", Number(b.dataset.nota) <= nota));
    pintar();
    $$("#estrelas button").forEach((b) => b.addEventListener("click", () => { nota = Number(b.dataset.nota); pintar(); }));
    $("#form-leitura").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = dadosDoFormulario(e.target);
      const antes = retratoJogo(eu_.id);
      if (existente) Object.assign(existente, { nota, resenha: f.resenha });
      else D().leituras.push({ membroId: eu_.id, livroId, nota, resenha: f.resenha, em: new Date().toISOString() });
      Dados.salvar(); fecharModal(); renderizar();
      const ganhou = pontosDe(eu_.id) > antes.pontos;
      if (ganhou) celebrar(eu_.id, antes); else avisar("Leitura salva ✦");
    });
    const desfazer = $("#desfazer-leitura");
    if (desfazer) desfazer.addEventListener("click", () => {
      D().leituras = D().leituras.filter((x) => x !== existente);
      Dados.salvar(); fecharModal(); renderizar();
    });
  }

  /* =========================================================
     MEMBROS
     ========================================================= */
  const GENEROS = ["Clássicos", "Romance", "Fantasia", "Ficção científica", "Suspense", "Não ficção", "Poesia", "Biografias", "Literatura brasileira", "Contemporâneos"];

  function telaMembros() {
    const membros = [...D().membros].sort((a, b) => a.nome.localeCompare(b.nome));
    const curadoria = emCuradoria();
    conteudo.innerHTML = `
      ${cabecalho("Membros do Clube", `${membros.length} leitor(es) com ficha na biblioteca`)}
      <details class="caixa-destaque" ${membros.length ? "" : "open"}>
        <summary>Ficha de inscrição</summary>
        <form class="formulario" id="form-membro" style="margin-top:14px">
          <div class="campos">
            <label>Nome completo <input name="nome" required autocomplete="name"></label>
            <label>Como prefere ser chamado(a) <input name="apelido"></label>
            <label>E-mail <input name="email" type="email" autocomplete="email"></label>
            <label>WhatsApp <input name="telefone" type="tel" autocomplete="tel"></label>
            <label>Data de nascimento <input name="nascimento" type="date"></label>
            <label>Cidade <input name="cidade" autocomplete="address-level2"></label>
            <label>Instagram / Skoob / Goodreads <input name="rede" placeholder="@seuperfil"></label>
            <label>No clube desde <input name="desde" type="month"></label>
          </div>
          <fieldset>
            <legend>Gêneros favoritos</legend>
            <div class="filtros">${GENEROS.map((g) => `<label class="caixa"><input type="checkbox" name="genero" value="${g}"> ${g}</label>`).join("")}</div>
          </fieldset>
          <label>Um livro que marcou sua vida <input name="livroFavorito"></label>
          <label class="caixa"><input type="checkbox" name="consentimento" required> Autorizo o clube a guardar estes dados para organizar encontros e benefícios.</label>
          <button class="botao" type="submit">Assinar a ficha</button>
        </form>
      </details>

      <div class="barra-acoes">
        <input type="search" id="busca-membro" placeholder="Procurar membro…" style="flex:1;max-width:320px">
        <span class="somente-curadoria"><button class="botao botao--pequeno botao--secundario" id="exportar-membros" type="button">Baixar lista (CSV)</button></span>
      </div>
      <div class="grade" id="lista-membros">
        ${membros.map((m, i) => `
          <article class="ficha" data-nome="${esc((m.nome + " " + (m.apelido || "")).toLowerCase())}">
            <h4>Nº ${String(m.numero || i + 1).padStart(3, "0")} · ${esc(m.apelido || m.nome)}</h4>
            <dl>
              <dt>Nome</dt><dd>${esc(m.nome)}</dd>
              ${m.cidade ? `<dt>Cidade</dt><dd>${esc(m.cidade)}</dd>` : ""}
              ${m.desde ? `<dt>Desde</dt><dd>${esc(m.desde.split("-").reverse().join("/"))}</dd>` : ""}
              ${m.rede ? `<dt>Rede</dt><dd>${esc(m.rede)}</dd>` : ""}
              ${m.livroFavorito ? `<dt>Favorito</dt><dd><i>${esc(m.livroFavorito)}</i></dd>` : ""}
              <dt>Lidos</dt><dd>${leiturasDe(m.id).length} · presenças: ${presencasDe(m.id).length}</dd>
              ${curadoria && m.email ? `<dt>E-mail</dt><dd>${esc(m.email)}</dd>` : ""}
              ${curadoria && m.telefone ? `<dt>WhatsApp</dt><dd>${esc(m.telefone)}</dd>` : ""}
              ${curadoria && m.nascimento ? `<dt>Nasc.</dt><dd>${formatarData(m.nascimento)}</dd>` : ""}
            </dl>
            ${m.generos?.length ? `<div class="selos" style="margin-top:8px">${m.generos.map((g) => `<span class="selo">${esc(g)}</span>`).join("")}</div>` : ""}
            <div class="ficha__acoes somente-curadoria">
              <button class="botao botao--pequeno botao--perigo" data-excluir-membro="${m.id}">Remover</button>
            </div>
          </article>`).join("") || `<p class="vazio">Nenhuma ficha assinada ainda. Seja a primeira pessoa!</p>`}
      </div>`;

    $("#form-membro").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const f = dadosDoFormulario(form);
      const generos = new FormData(form).getAll("genero");
      delete f.genero; delete f.consentimento;
      const numero = D().membros.reduce((max, m) => Math.max(max, m.numero || 0), 0) + 1;
      const novo = { id: Dados.novoId("m"), numero, ...f, generos, cadastradoEm: new Date().toISOString() };
      D().membros.push(novo);
      definirEu(novo.id);
      Dados.salvar(); telaMembros(); boasVindas();
    });
    $("#busca-membro").addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      $$("#lista-membros .ficha").forEach((f) => { f.style.display = f.dataset.nome.includes(q) ? "" : "none"; });
    });
    $$("[data-excluir-membro]").forEach((b) => b.addEventListener("click", () => {
      const m = membro(b.dataset.excluirMembro);
      confirmar(`Remover ${m.nome} do clube? As leituras e presenças dele(a) também serão apagadas.`, () => {
        D().membros = D().membros.filter((x) => x.id !== m.id);
        D().leituras = D().leituras.filter((x) => x.membroId !== m.id);
        D().presencas = D().presencas.filter((x) => x.membroId !== m.id);
        if (euId() === m.id) definirEu(null);
        Dados.salvar(); telaMembros();
      });
    }));
    const exp = $("#exportar-membros");
    if (exp) exp.addEventListener("click", exportarMembrosCSV);
  }

  function exportarMembrosCSV() {
    const cols = ["numero", "nome", "apelido", "email", "telefone", "nascimento", "cidade", "rede", "desde", "livroFavorito"];
    const linhas = [cols.concat(["generos", "livrosLidos", "presencas"]).join(";")];
    D().membros.forEach((m) => {
      const vals = cols.map((c) => m[c] ?? "").concat([(m.generos || []).join(", "), leiturasDe(m.id).length, presencasDe(m.id).length]);
      linhas.push(vals.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"));
    });
    baixar("membros-clube-do-livro.csv", "﻿" + linhas.join("\n"), "text/csv");
  }

  function baixar(nome, texto, tipo) {
    const url = URL.createObjectURL(new Blob([texto], { type: tipo }));
    const a = document.createElement("a");
    a.href = url; a.download = nome; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* =========================================================
     BENEFÍCIOS
     ========================================================= */
  function telaBeneficios() {
    const eu_ = eu();
    const minhasPresencas = eu_ ? presencasDe(eu_.id).length : 0;
    const parceiros = [...D().parceiros].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome));
    const categorias = [...new Set(parceiros.map((p) => p.categoria))];

    conteudo.innerHTML = `
      ${cabecalho("Clube de Benefícios", "Mimos dos nossos parceiros para quem é do clube")}
      ${seletorMembro()}
      ${eu_ ? `
        <div class="carteirinha">
          <img src="img/logo.png" alt="${esc(D().clube.nome)}">
          <span class="carteirinha__rotulo">Carteirinha de membro · nº ${String(eu_.numero || 0).padStart(3, "0")}</span>
          <span class="carteirinha__nome">${esc(eu_.nome)}</span>
          <span class="carteirinha__meta">${leiturasDe(eu_.id).length} livros lidos · ${minhasPresencas} encontros${eu_.desde ? ` · desde ${esc(eu_.desde.split("-").reverse().join("/"))}` : ""}</span>
        </div>` : ""}

      ${categorias.length > 1 ? `<div class="pilulas" style="margin-bottom:22px">
        <button class="pilula ativa" data-cat="">Todos</button>
        ${categorias.map((c) => `<button class="pilula" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
      </div>` : ""}

      <div class="grade" id="grade-parceiros">
        ${parceiros.map((p) => {
          const min = Number(p.presencasMinimas) || 0;
          const liberado = eu_ && minhasPresencas >= min;
          const vencido = p.validade && dataLocal(p.validade) < hoje();
          return `<article class="cartao-beneficio ${liberado && !vencido ? "" : "cartao-beneficio--bloqueado"}" data-categoria="${esc(p.categoria)}">
            <span class="cartao-beneficio__categoria">${esc(p.categoria)}</span>
            <h4>${esc(p.nome)}</h4>
            <p class="cartao-beneficio__oferta">${esc(p.beneficio)}</p>
            ${liberado && !vencido && p.codigo ? `<div class="cartao-beneficio__codigo">${esc(p.codigo)}</div>` : ""}
            ${!eu_ ? `<p class="cartao-beneficio__meta">Escolha seu nome acima para ver o código.</p>` : ""}
            ${eu_ && !liberado ? `<p class="cartao-beneficio__meta">🔒 Libera com ${min} presença(s) em encontros — faltam ${min - minhasPresencas}.</p>` : ""}
            ${vencido ? `<p class="cartao-beneficio__meta">Benefício encerrado.</p>` : ""}
            ${p.validade && !vencido ? `<p class="cartao-beneficio__meta">Válido até ${formatarData(p.validade)}</p>` : ""}
            ${p.contato ? `<p class="cartao-beneficio__meta">${esc(p.contato)}</p>` : ""}
            ${p.exemplo ? `<span class="selo selo--exemplo">exemplo</span>` : ""}
            <div class="ficha__acoes somente-curadoria">
              <button class="botao botao--pequeno botao--perigo" data-excluir-parceiro="${p.id}">Remover</button>
            </div>
          </article>`;
        }).join("") || `<p class="vazio">Os primeiros parceiros chegam em breve.</p>`}
      </div>

      <div class="somente-curadoria">
        <h3 class="titulo-bloco">Cadastrar parceiro</h3>
        <form class="formulario" id="form-parceiro">
          <div class="campos">
            <label>Nome do parceiro <input name="nome" required></label>
            <label>Categoria <input name="categoria" list="categorias" placeholder="Livraria, Café, Papelaria…" required>
              <datalist id="categorias">${["Livraria", "Café", "Papelaria", "Sebo", "Cursos", "Bem-estar", "Restaurante", "Editora"].map((c) => `<option value="${c}">`).join("")}</datalist></label>
            <label>Benefício <input name="beneficio" placeholder="15% de desconto…" required></label>
            <label>Cupom / como usar <input name="codigo"></label>
            <label>Válido até <input name="validade" type="date"></label>
            <label>Contato / endereço <input name="contato"></label>
            <label>Presenças mínimas para liberar <input name="presencasMinimas" type="number" min="0" value="0"></label>
          </div>
          <button class="botao" type="submit">Adicionar parceiro</button>
        </form>
      </div>`;

    ligarSeletorMembro();
    $$("[data-cat]").forEach((b) => b.addEventListener("click", () => {
      $$("[data-cat]").forEach((x) => x.classList.toggle("ativa", x === b));
      $$("#grade-parceiros [data-categoria]").forEach((c) => { c.style.display = !b.dataset.cat || c.dataset.categoria === b.dataset.cat ? "" : "none"; });
    }));
    $$("[data-excluir-parceiro]").forEach((b) => b.addEventListener("click", () => {
      confirmar("Remover este parceiro?", () => {
        D().parceiros = D().parceiros.filter((p) => p.id !== b.dataset.excluirParceiro);
        Dados.salvar(); telaBeneficios();
      });
    }));
    $("#form-parceiro").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = dadosDoFormulario(e.target);
      D().parceiros.push({ id: Dados.novoId("pa"), ...f, presencasMinimas: Number(f.presencasMinimas) || 0 });
      Dados.salvar(); avisar("Parceiro adicionado"); telaBeneficios();
    });
  }

  /* =========================================================
     VOTAÇÃO — próxima leitura
     ========================================================= */
  function telaVotacao() {
    const eu_ = eu();
    const { candidatos, votos } = D();
    const contagem = {};
    Object.values(votos).forEach((c) => { contagem[c] = (contagem[c] || 0) + 1; });
    const total = Object.values(votos).length;
    const ordenados = [...candidatos].sort((a, b) => (contagem[b.id] || 0) - (contagem[a.id] || 0));
    const meuVoto = eu_ ? votos[eu_.id] : null;

    conteudo.innerHTML = `
      ${cabecalho("A Próxima Leitura", "Indique um livro e vote no que o clube vai ler")}
      ${seletorMembro()}
      <div class="grade">
        ${ordenados.map((c) => {
          const n = contagem[c.id] || 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          return `<article class="ficha candidato">
            <h4>${esc(c.titulo)}</h4>
            <p style="margin:0"><i>${esc(c.autor)}</i></p>
            <p style="margin:0"><small>Indicado por ${esc(membro(c.indicadoPor)?.nome || "alguém do clube")}</small></p>
            ${c.motivo ? `<p style="margin:0"><small>“${esc(c.motivo)}”</small></p>` : ""}
            <div class="barra-votos"><span style="width:${pct}%"></span></div>
            <small>${n} voto(s) · ${pct}%</small>
            <div class="ficha__acoes">
              ${eu_ ? `<button class="botao botao--pequeno ${meuVoto === c.id ? "botao--secundario" : ""}" data-votar="${c.id}">${meuVoto === c.id ? "✓ Meu voto" : "Votar"}</button>` : ""}
              <button class="botao botao--pequeno botao--verde somente-curadoria" data-eleger="${c.id}">Eleger → estante</button>
              <button class="botao botao--pequeno botao--perigo somente-curadoria" data-excluir-candidato="${c.id}">Remover</button>
            </div>
          </article>`;
        }).join("") || `<p class="vazio">Nenhuma indicação ainda.</p>`}
      </div>
      ${eu_ ? `
        <h3 class="titulo-bloco">Indicar um livro</h3>
        <form class="formulario" id="form-indicacao">
          <div class="campos">
            <label>Título <input name="titulo" required></label>
            <label>Autor(a) <input name="autor" required></label>
          </div>
          <label>Por que o clube deveria ler? <input name="motivo"></label>
          <button class="botao" type="submit">Indicar</button>
        </form>` : ""}
      <div class="somente-curadoria" style="margin-top:18px">
        <button class="botao botao--perigo botao--pequeno" id="zerar-votacao" type="button">Encerrar votação (apagar indicações e votos)</button>
      </div>`;

    ligarSeletorMembro();
    $$("[data-votar]").forEach((b) => b.addEventListener("click", () => {
      if (votos[eu_.id] === b.dataset.votar) delete votos[eu_.id]; else votos[eu_.id] = b.dataset.votar;
      Dados.salvar(); telaVotacao();
    }));
    $$("[data-excluir-candidato]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.excluirCandidato;
      D().candidatos = candidatos.filter((c) => c.id !== id);
      Object.keys(votos).forEach((k) => { if (votos[k] === id) delete votos[k]; });
      Dados.salvar(); telaVotacao();
    }));
    $$("[data-eleger]").forEach((b) => b.addEventListener("click", () => {
      const c = candidatos.find((x) => x.id === b.dataset.eleger);
      const prat = D().prateleiras.find((p) => p.id === "atual") || D().prateleiras[D().prateleiras.length - 1];
      D().livros.push({ id: Dados.novoId("l"), titulo: c.titulo, autor: c.autor, prateleira: prat.id, mes: new Date().getMonth() + 1, ano: new Date().getFullYear() });
      Dados.salvar(); avisar(`"${c.titulo}" foi para a estante`);
    }));
    const zerar = $("#zerar-votacao");
    zerar.addEventListener("click", () => {
      confirmar("Apagar todas as indicações e votos?", () => {
        D().candidatos = []; D().votos = {};
        Dados.salvar(); telaVotacao();
      });
    });
    const fi = $("#form-indicacao");
    if (fi) fi.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = dadosDoFormulario(fi);
      const antes = retratoJogo(eu_.id);
      candidatos.push({ id: Dados.novoId("c"), ...f, indicadoPor: eu_.id, em: new Date().toISOString() });
      Dados.salvar(); telaVotacao(); celebrar(eu_.id, antes);
    });
  }

  /* =========================================================
     CITAÇÕES
     ========================================================= */
  function telaCitacoes() {
    const eu_ = eu();
    const citacoes = [...D().citacoes].sort((a, b) => b.em.localeCompare(a.em));
    conteudo.innerHTML = `
      ${cabecalho("Mural de Citações", "Os trechos que sublinhamos juntos")}
      ${seletorMembro()}
      ${eu_ ? `
        <form class="formulario caixa-destaque" id="form-citacao">
          <label>Trecho <textarea name="texto" required></textarea></label>
          <div class="campos">
            <label>Livro <select name="livroId"><option value="">— outro —</option>${livrosOrdenados(D().livros).map((l) => `<option value="${l.id}">${esc(l.titulo)}</option>`).join("")}</select></label>
            <label>Página <input name="pagina"></label>
          </div>
          <button class="botao" type="submit">Pregar no mural</button>
        </form>` : ""}
      <div class="grade">
        ${citacoes.map((c) => `
          <blockquote class="citacao">${esc(c.texto)}
            <footer>${c.livroId && livro(c.livroId) ? `<i>${esc(livro(c.livroId).titulo)}</i>, ${esc(livro(c.livroId).autor)}` : ""}${c.pagina ? ` · p. ${esc(c.pagina)}` : ""}
              <br><small>sublinhado por ${esc(membro(c.membroId)?.nome || "—")}</small>
              ${(eu_ && eu_.id === c.membroId) || emCuradoria() ? ` · <a href="#" data-excluir-citacao="${c.id}">apagar</a>` : ""}
            </footer>
          </blockquote>`).join("") || `<p class="vazio">Nenhum trecho sublinhado ainda.</p>`}
      </div>`;
    ligarSeletorMembro();
    const fc = $("#form-citacao");
    if (fc) fc.addEventListener("submit", (e) => {
      e.preventDefault();
      const antes = retratoJogo(eu_.id);
      D().citacoes.push({ id: Dados.novoId("q"), ...dadosDoFormulario(fc), membroId: eu_.id, em: new Date().toISOString() });
      Dados.salvar(); telaCitacoes(); celebrar(eu_.id, antes);
    });
    $$("[data-excluir-citacao]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      D().citacoes = D().citacoes.filter((c) => c.id !== a.dataset.excluirCitacao);
      Dados.salvar(); telaCitacoes();
    }));
  }

  /* =========================================================
     PAINEL
     ========================================================= */
  function telaPainel() {
    const { membros, livros, encontros, presencas, leituras } = D();
    const realizados = encontros.filter((e) => dataLocal(e.data) <= hoje());
    const mediaPresenca = realizados.length ? (presencas.length / realizados.length).toFixed(1) : "0";
    const mesAtual = new Date().getMonth();
    const aniversariantes = membros.filter((m) => m.nascimento && dataLocal(m.nascimento).getMonth() === mesAtual)
      .sort((a, b) => dataLocal(a.nascimento).getDate() - dataLocal(b.nascimento).getDate());
    const quadro = ranking("pontos").slice(0, 5);
    const melhores = livros.map((l) => ({ l, media: mediaNotas(l.id), n: leitoresDe(l.id).filter((x) => x.nota).length }))
      .filter((x) => x.n).sort((a, b) => b.media - a.media).slice(0, 5);
    const autores = {};
    livros.filter((l) => !l.exemplo).forEach((l) => { autores[l.autor] = (autores[l.autor] || 0) + 1; });
    const autoresTop = Object.entries(autores).sort((a, b) => b[1] - a[1]).slice(0, 5);

    conteudo.innerHTML = `
      ${cabecalho("Painel do Clube", "Números, ranking e aniversários")}
      <div class="numeros">
        <div class="numero"><strong>${membros.length}</strong><span>membros</span></div>
        <div class="numero"><strong>${livros.filter((l) => !l.exemplo).length}</strong><span>livros na estante</span></div>
        <div class="numero"><strong>${realizados.length}</strong><span>encontros</span></div>
        <div class="numero"><strong>${mediaPresenca}</strong><span>presença média</span></div>
        <div class="numero"><strong>${leituras.length}</strong><span>leituras registradas</span></div>
      </div>

      <h3 class="titulo-bloco">🎂 Aniversariantes de ${MESES_LONGOS[mesAtual]}</h3>
      ${aniversariantes.length ? `<p>${aniversariantes.map((m) => `<b>${esc(m.apelido || m.nome)}</b> (dia ${dataLocal(m.nascimento).getDate()})`).join(" · ")}</p>` : `<p class="vazio">Ninguém sopra velinhas este mês.</p>`}

      <h3 class="titulo-bloco">Quadro de honra</h3>
      ${quadro.length ? `<div class="rolagem-tabela"><table class="tabela">
        <thead><tr><th>Membro</th><th>Nível</th><th>Encontros</th><th>Livros</th><th>Pontos</th></tr></thead>
        <tbody>${quadro.map((r) => `<tr><td>${esc(r.m.apelido || r.m.nome)}</td><td>${esc(r.nivel.nome)}</td><td>${r.presencas}</td><td>${r.lidos}</td><td><b>${r.pontos}</b></td></tr>`).join("")}</tbody>
      </table></div><p style="margin-top:12px"><a href="#ranking">Ver o ranking completo →</a></p>` : `<p class="vazio">O ranking aparece quando houver membros.</p>`}

      <div class="grade" style="margin-top:10px">
        <div>
          <h3 class="titulo-bloco">Mais bem avaliados</h3>
          ${melhores.length ? `<ol>${melhores.map((x) => `<li><i>${esc(x.l.titulo)}</i> — ${estrelasFixas(x.media)} <small>(${x.n})</small></li>`).join("")}</ol>` : `<p class="vazio">Sem notas ainda.</p>`}
        </div>
        <div>
          <h3 class="titulo-bloco">Autores mais lidos</h3>
          ${autoresTop.length ? `<ol>${autoresTop.map(([a, n]) => `<li>${esc(a)} <small>(${n})</small></li>`).join("")}</ol>` : `<p class="vazio">A estante ainda está sendo montada.</p>`}
        </div>
      </div>

      <div class="somente-curadoria">
        <h3 class="titulo-bloco">Configurações e backup</h3>
        <form class="formulario" id="form-clube">
          <div class="campos">
            <label>Nome do clube <input name="nome" value="${esc(D().clube.nome)}" required></label>
            <label>Lema <input name="lema" value="${esc(D().clube.lema)}"></label>
            <label>Nova senha de curadoria <input name="pinCuradoria" type="password" autocomplete="new-password" placeholder="deixe vazio para manter"></label>
          </div>
          <button class="botao" type="submit">Salvar</button>
        </form>
        <p style="margin-top:16px"><small>Nesta versão os dados ficam guardados neste navegador. Baixe um backup com frequência — ele pode ser importado em outro aparelho.</small></p>
        <div class="ficha__acoes">
          <button class="botao botao--verde" id="backup-baixar" type="button">Baixar backup</button>
          <label class="botao botao--secundario" style="flex-direction:row;font-variant:normal">Importar backup<input type="file" id="backup-importar" accept="application/json" hidden></label>
          <button class="botao botao--perigo" id="backup-zerar" type="button">Apagar tudo</button>
        </div>
        <h3 class="titulo-bloco">Dados de demonstração</h3>
        <p><small>Cria membros e encontros fictícios (marcados como demonstração) para ver o ranking, o pódio e as conquistas funcionando. Remova antes de usar o site de verdade.</small></p>
        <div class="ficha__acoes">
          <button class="botao botao--verde" id="demo-carregar" type="button">Carregar demonstração</button>
          <button class="botao botao--perigo" id="demo-remover" type="button">Remover demonstração</button>
        </div>
      </div>`;

    $("#form-clube").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = dadosDoFormulario(e.target);
      D().clube.nome = f.nome; D().clube.lema = f.lema;
      if (f.pinCuradoria) D().clube.pinCuradoria = f.pinCuradoria;
      Dados.salvar(); aplicarIdentidade(); avisar("Configurações salvas"); telaPainel();
    });
    $("#backup-baixar").addEventListener("click", () => baixar(`backup-clube-${new Date().toISOString().slice(0, 10)}.json`, Dados.exportar(), "application/json"));
    $("#backup-importar").addEventListener("change", async (e) => {
      const arq = e.target.files[0];
      if (!arq) return;
      try { Dados.importar(await arq.text()); aplicarIdentidade(); avisar("Backup importado"); renderizar(); }
      catch (err) { avisar("Não consegui ler esse arquivo"); }
    });
    $("#demo-carregar").addEventListener("click", () => { carregarDemonstracao(); avisar("Demonstração carregada"); telaPainel(); });
    $("#demo-remover").addEventListener("click", () => { removerDemonstracao(); avisar("Demonstração removida"); telaPainel(); });
    $("#backup-zerar").addEventListener("click", () => {
      confirmar("Apagar TODOS os dados do clube neste aparelho? Baixe um backup antes.", () => {
        Dados.reiniciar(); definirEu(null); aplicarIdentidade(); renderizar();
      });
    });
  }

  /* ---------- Demonstração (só para testes) ---------- */
  function removerDemonstracao() {
    const ids = D().membros.filter((m) => m.demo).map((m) => m.id);
    const encs = D().encontros.filter((e) => e.demo).map((e) => e.id);
    D().membros = D().membros.filter((m) => !m.demo);
    D().encontros = D().encontros.filter((e) => !e.demo);
    D().presencas = D().presencas.filter((p) => !ids.includes(p.membroId) && !encs.includes(p.encontroId));
    D().leituras = D().leituras.filter((l) => !ids.includes(l.membroId));
    D().assinaturas = (D().assinaturas || []).filter((a) => !ids.includes(a.membroId));
    if (ids.includes(euId())) definirEu(null);
    Dados.salvar();
  }
  function carregarDemonstracao() {
    removerDemonstracao();
    const nomes = ["Helena Duarte (demo)", "Rafael Moura (demo)", "Lívia Prado (demo)", "Teo Nogueira (demo)", "Marina Assis (demo)"];
    const ano = new Date().getFullYear();
    const encs = [];
    for (let i = 0; i < 6; i += 1) {
      const d = new Date(ano, new Date().getMonth() - 6 + i, 12);
      encs.push({ id: "demo-e" + i, data: d.toISOString().slice(0, 10), local: "Encontro de demonstração", titulo: "Encontro de demonstração", tipo: "presencial", confirmados: [], demo: true });
    }
    D().encontros.push(...encs);
    const presencas = [[0, 1, 2, 3, 4, 5], [0, 2, 3, 5], [1, 2, 3, 4], [5], [0, 1]];
    const livrosRecentes = livrosOrdenados(D().livros.filter((l) => !l.exemplo)).slice(-8);
    nomes.forEach((nome, i) => {
      const id = "demo-m" + i;
      D().membros.push({ id, nome, email: `demo${i + 1}@exemplo.com`, numero: 900 + i, demo: true });
      presencas[i].forEach((k) => D().presencas.push({ membroId: id, encontroId: encs[k].id, em: encs[k].data }));
      livrosRecentes.slice(0, [6, 3, 5, 1, 2][i]).forEach((l) => D().leituras.push({ membroId: id, livroId: l.id, nota: 4, resenha: i === 0 ? "Releria." : "", em: new Date().toISOString() }));
    });
    Dados.salvar();
  }

  /* =========================================================
     INÍCIO
     ========================================================= */
  const criadora = () => window.DADOS_INICIAIS.criadora || {};

  function retratoHTML(legenda) {
    const c = criadora();
    return `<figure class="retrato" style="margin:0">
      ${c.foto ? `<img src="${esc(c.foto)}" alt="${esc(c.nome || "Criadora do clube")}">` : `<span class="retrato__aviso">sua foto aqui</span>`}
      ${legenda ? `<figcaption class="retrato__legenda">${legenda}</figcaption>` : ""}
    </figure>`;
  }

  // O livro do momento: o primeiro da prateleira "atual" ou, se ela estiver vazia, a leitura mais recente.
  function livroDestaque() {
    const livros = D().livros.filter((l) => !l.exemplo);
    const atuais = livrosOrdenados(livros.filter((l) => l.prateleira === "atual"));
    if (atuais.length) return { livro: atuais[0], rotulo: "Lendo agora" };
    const ultimo = livrosOrdenados(livros).pop();
    return ultimo ? { livro: ultimo, rotulo: "Última leitura do clube" } : null;
  }

  function capaHTML(l) {
    const cor = l.cor || CORES_LOMBADA[hash(l.titulo + l.autor) % CORES_LOMBADA.length];
    return `<div class="capa" style="--cor:${cor}"><span>${esc(l.titulo)}</span><small>${esc(l.autor)}</small></div>`;
  }

  function telaInicio() {
    const livros = D().livros.filter((l) => !l.exemplo);
    const autores = new Set(livros.map((l) => l.autor)).size;
    const anos = livros.map((l) => l.ano).filter(Boolean);
    const primeiroAno = anos.length ? Math.min(...anos) : new Date().getFullYear();
    const anoDeClube = new Date().getFullYear() - primeiroAno + 1;
    const membros = D().membros.length;
    const destaque = livroDestaque();
    const c = criadora();
    const recentes = livrosOrdenados(livros).slice(-14);
    const parceiros = D().parceiros.slice(0, 3);
    const anoAtual = new Date(new Date().getFullYear(), 0, 1);
    const podioInicio = ranking("presencas", anoAtual).filter((r) => r.presencas > 0).slice(0, 3);

    conteudo.innerHTML = `
      <section class="heroi">
        <div class="container heroi__grade">
          <div>
            <span class="sobrancelha">Clube do livro · desde ${primeiroAno}</span>
            <h1>Cansou? Então <em>vem ler</em> com a gente.</h1>
            <p class="heroi__sub">Um livro por mês, encontros para conversar sobre ele e uma estante que cresce desde ${primeiroAno}.</p>
            <div class="heroi__acoes">
              <a class="botao" href="#membros">Quero participar</a>
              <a class="botao botao--claro" href="#estante">Ver a estante</a>
            </div>
          </div>
          ${retratoHTML(`@${esc(c.instagram || "canseideserblogger")}`)}
        </div>
      </section>

      <div class="container">
        <div class="numeros-faixa">
          <div><strong>${livros.length}</strong><span>livros lidos juntos</span></div>
          <div><strong>${autores}</strong><span>autoras e autores</span></div>
          <div><strong>${anoDeClube}º</strong><span>ano de clube</span></div>
          ${membros ? `<div><strong>${membros}</strong><span>membros</span></div>` : `<div><strong>1</strong><span>livro por mês</span></div>`}
        </div>
      </div>

      <section class="secao">
        <div class="container">
          <div class="secao__topo">
            <div><span class="sobrancelha">O que é o clube?</span>
              <h2>Uma experiência <em>literária</em> para quem <em>cansou</em> de só pensar em ler</h2></div>
            <p>Tudo acontece por aqui: a escolha do livro, a leitura do mês, o encontro e os mimos dos parceiros.</p>
          </div>
          <div class="passos">
            <a class="passo" href="#votacao"><span class="passo__icone">${icone("voto")}</span><h3>Escolhemos juntos</h3><p>Membros indicam livros e votam na próxima leitura.</p></a>
            <a class="passo" href="#estante"><span class="passo__icone">${icone("livros")}</span><h3>Lemos no mês</h3><p>Um livro por mês, que entra para a estante do clube.</p></a>
            <a class="passo" href="#encontros"><span class="passo__icone">${icone("calendario")}</span><h3>Conversamos</h3><p>No encontro, cada um faz check-in e conta o que achou.</p></a>
            <a class="passo" href="#beneficios"><span class="passo__icone">${icone("presente")}</span><h3>Ganhamos mimos</h3><p>Quem participa libera descontos com os parceiros.</p></a>
          </div>
        </div>
      </section>

      ${destaque ? `
      <section class="secao secao--escura">
        <div class="container livro-do-mes">
          ${capaHTML(destaque.livro)}
          <div>
            <span class="sobrancelha">${destaque.rotulo}</span>
            <h2>${esc(destaque.livro.titulo)}</h2>
            <p class="livro-do-mes__autor">${esc(destaque.livro.autor)}</p>
            <ul class="metadados">
              ${destaque.livro.mes ? `<li><b>Mês</b>${MESES_LONGOS[destaque.livro.mes - 1]} de ${destaque.livro.ano}</li>` : ""}
              <li><b>Leitores</b>${leitoresDe(destaque.livro.id).length}</li>
              <li><b>Nota do clube</b>${mediaNotas(destaque.livro.id) ? mediaNotas(destaque.livro.id).toFixed(1) + " de 5" : "sem notas ainda"}</li>
            </ul>
            <div class="heroi__acoes">
              <button class="botao" type="button" data-livro="${destaque.livro.id}">Ver detalhes</button>
              <a class="botao botao--claro" href="#checkin">Registrar minha leitura</a>
            </div>
          </div>
        </div>
      </section>` : ""}

      ${podioInicio.length ? `
      <section class="secao secao--papel2">
        <div class="container">
          <div class="secao__topo">
            <div><span class="sobrancelha">Ranking ${new Date().getFullYear()}</span><h2>Quem mais foi aos <em>encontros</em></h2></div>
            <p>Cada presença vale 50 pontos, cada livro lido 30. Suba de nível e desbloqueie conquistas. <a href="#ranking">Ver o ranking →</a></p>
          </div>
          <div class="podio podio--compacto">
            ${[podioInicio[1], podioInicio[0], podioInicio[2]].filter(Boolean).map((r) => {
              const pos = podioInicio.indexOf(r) + 1;
              return `<div class="podio__lugar podio__lugar--${pos}">
                <span class="avatar">${esc(iniciais(r.m.nome))}</span><b>${esc(primeiroNome(r.m))}</b>
                <small>${r.presencas} encontros</small><div class="podio__degrau">${pos}º</div></div>`;
            }).join("")}
          </div>
        </div>
      </section>` : ""}

      <section class="secao">
        <div class="container convite-online">
          <div>
            <span class="sobrancelha">Novidade · Clube Online</span>
            <h2>Mora longe? Leia com a gente <em>pela tela</em></h2>
            <p>Encontros ao vivo pela internet, sala exclusiva com gravações e materiais de leitura. A partir de ${dinheiro(Math.min(...(D().online.planos || [{ preco: 0 }]).map((p) => (p.periodo === "ano" ? p.preco / 12 : p.preco))))} por mês.</p>
            <a class="botao" href="#online">Conhecer o Clube Online</a>
          </div>
          <div class="convite-online__tela" aria-hidden="true">${icone("tela")}<span>ao vivo</span></div>
        </div>
      </section>

      <section class="secao">
        <div class="container">
          <div class="secao__topo">
            <div><span class="sobrancelha">Acervo</span><h2>As leituras mais <em>recentes</em></h2></div>
            <p>${livros.length} livros em ${anoDeClube} anos. <a href="#estante">Ver a estante completa →</a></p>
          </div>
          <div class="estante estante--previa">
            <section class="prateleira" aria-label="Leituras recentes">
              <div class="prateleira__livros">${recentes.map(lombadaHTML).join("")}</div>
              <div class="prateleira__tabua"></div>
            </section>
          </div>
        </div>
      </section>

      <section class="secao secao--papel2">
        <div class="container">
          <div class="secao__topo">
            <div><span class="sobrancelha">Clube de vantagens</span><h2>Ler também dá <em>desconto</em></h2></div>
            <p>Cada membro tem uma carteirinha digital. Alguns benefícios liberam conforme a presença nos encontros.</p>
          </div>
          <div class="grade grade--ajustada">
            ${parceiros.map((p) => `<article class="cartao-beneficio">
              <span class="cartao-beneficio__categoria">${esc(p.categoria)}</span>
              <h4>${esc(p.nome)}</h4>
              <p class="cartao-beneficio__oferta">${esc(p.beneficio)}</p>
              ${p.exemplo ? `<span class="selo selo--exemplo">exemplo</span>` : ""}
            </article>`).join("")}
          </div>
          <p style="margin-top:24px"><a class="botao botao--secundario" href="#beneficios">Ver todos os benefícios</a></p>
        </div>
      </section>

      <section class="secao">
        <div class="container criadora">
          ${retratoHTML("")}
          <div>
            <span class="sobrancelha">Quem criou o clube</span>
            <h2>${c.nome ? esc(c.nome) : "Por trás da <em>estante</em>"}</h2>
            <p class="criadora__arroba">@${esc(c.instagram || "canseideserblogger")}</p>
            ${c.apresentacao ? `<p>${esc(c.apresentacao)}</p>` : `<p class="aviso-texto">Texto provisório: aqui entra a sua apresentação — quem você é, como o clube nasceu e o que você ama ler.</p>`}
            <div class="heroi__acoes" style="margin-top:18px">
              <a class="botao botao--secundario" href="https://www.instagram.com/${encodeURIComponent(c.instagram || "canseideserblogger")}/" target="_blank" rel="noopener">${icone("instagram")} Seguir no Instagram</a>
              <a class="botao botao--secundario" href="#criadora">Conhecer mais</a>
            </div>
          </div>
        </div>
      </section>

      <section class="secao secao--papel2">
        <div class="container">
          <div class="secao__topo"><div><span class="sobrancelha">Dúvidas</span><h2>Perguntas <em>frequentes</em></h2></div></div>
          <div class="perguntas">
            <details><summary>Como faço para participar?</summary><p>Preencha a ficha na aba Membros. Você recebe um número de sócio e já pode fazer check-in e ver seus benefícios.</p></details>
            <details><summary>Como funciona o check-in?</summary><p>No dia do encontro, abra a aba Encontros (ou Check-in) e toque em “Fazer check-in”. Na aba Check-in você também marca os livros que leu, dá nota e escreve uma resenha curtinha.</p></details>
            <details><summary>Como uso os benefícios?</summary><p>Na aba Benefícios aparecem sua carteirinha e os cupons dos parceiros. Alguns exigem um número mínimo de presenças nos encontros para liberar.</p></details>
            <details><summary>Posso sugerir o próximo livro?</summary><p>Pode! Na aba Próxima leitura você indica um livro e vota nas indicações dos outros membros.</p></details>
          </div>
        </div>
      </section>

      <section class="secao secao--escura chamada-final">
        <div class="container">
          <h2>Cansou de só <em>pensar</em> em ler?</h2>
          <p>Então vem. O próximo livro já está na estante esperando por você.</p>
          <div class="heroi__acoes"><a class="botao" href="#membros">Quero participar</a></div>
        </div>
      </section>`;

    $$("[data-livro]").forEach((b) => b.addEventListener("click", () => detalheLivro(b.dataset.livro)));
  }

  /* =========================================================
     A CRIADORA
     ========================================================= */
  function telaCriadora() {
    const c = criadora();
    const insta = c.instagram || "canseideserblogger";
    conteudo.innerHTML = `
      <div class="criadora" style="margin-top:8px">
        ${retratoHTML(`@${esc(insta)}`)}
        <div>
          <span class="sobrancelha">A criadora</span>
          <h2 style="font-size:clamp(2.2rem,5vw,3.6rem)">${c.nome ? esc(c.nome) : "Quem está por trás do <em>Cansei!</em>"}</h2>
          <p class="criadora__arroba">@${esc(insta)}</p>
          ${c.apresentacao ? `<p>${esc(c.apresentacao)}</p>` : `<p class="aviso-texto">Texto provisório: aqui entra a sua apresentação — quem você é, como o clube nasceu em 2024, o que você ama ler e o que as pessoas encontram no seu Instagram.</p>`}
          <div class="heroi__acoes" style="margin-top:20px">
            <a class="botao" href="https://www.instagram.com/${encodeURIComponent(insta)}/" target="_blank" rel="noopener">${icone("instagram")} Seguir @${esc(insta)}</a>
            <a class="botao botao--secundario" href="#membros">Entrar para o clube</a>
          </div>
        </div>
      </div>`;
  }

  function abrirMais() {
    const itens = [
      ["ranking", "trofeu", "Ranking"], ["online", "tela", "Clube Online"],
      ["encontros", "calendario", "Encontros"], ["membros", "grupo", "Membros"], ["votacao", "voto", "Próxima leitura"],
      ["citacoes", "aspas", "Citações"], ["painel", "grafico", "Painel"], ["criadora", "pessoa", "A criadora"]
    ];
    abrirModal(`
      <h3>Mais do clube</h3>
      <ul class="lista-mais">
        ${itens.map(([rota, ic, nome]) => `<li><a href="#${rota}">${icone(ic)} ${nome}</a></li>`).join("")}
        <li><a href="#" id="mais-entrar">${icone("pessoa")} ${eu() ? "Sair (" + esc(primeiroNome(eu())) + ")" : "Entrar"}</a></li>
        <li><a href="#" id="mais-curadoria">${icone("chave")} ${emCuradoria() ? "Sair da curadoria" : "Modo curadoria"}</a></li>
      </ul>`);
    $("#mais-entrar").addEventListener("click", (e) => {
      e.preventDefault();
      if (eu()) { fecharModal(); definirEu(null); avisar("Até a próxima leitura!"); renderizar(); } else abrirEntrar();
    });
    $("#mais-curadoria").addEventListener("click", (e) => { e.preventDefault(); fecharModal(); $("#botao-curadoria").click(); });
  }

  function atualizarFaixa() {
    const d = livroDestaque();
    const proximo = [...D().encontros].filter((e) => dataLocal(e.data) >= hoje()).sort((a, b) => a.data.localeCompare(b.data))[0];
    const faixa = $("#faixa");
    faixa.hidden = false;
    if (proximo) {
      faixa.innerHTML = `<b>Próximo encontro</b>${formatarData(proximo.data)}${proximo.local ? " · " + esc(proximo.local) : ""} · <a href="#encontros">confirmar presença</a>`;
    } else if (d) {
      faixa.innerHTML = `<b>${d.rotulo}</b><i>${esc(d.livro.titulo)}</i>, de ${esc(d.livro.autor)}`;
    } else {
      faixa.hidden = true;
    }
  }

  /* =========================================================
     Roteamento
     ========================================================= */
  const ROTAS = {
    inicio: telaInicio,
    estante: telaEstante,
    encontros: telaEncontros,
    checkin: telaCheckin,
    membros: telaMembros,
    beneficios: telaBeneficios,
    votacao: telaVotacao,
    citacoes: telaCitacoes,
    painel: telaPainel,
    criadora: telaCriadora,
    ranking: telaRanking,
    online: telaOnline
  };

  function rotaAtual() {
    const r = location.hash.replace(/^#\/?/, "");
    return ROTAS[r] ? r : "inicio";
  }

  function renderizar() {
    const r = rotaAtual();
    $$(".abas a, .barra-app a").forEach((a) => {
      const ativa = a.dataset.rota === r;
      a.classList.toggle("ativa", ativa);
      if (ativa) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const abaAtiva = $(".abas a.ativa");
    if (abaAtiva) abaAtiva.parentElement.scrollLeft = abaAtiva.offsetLeft - 24;
    conteudo.classList.toggle("pagina", r !== "inicio");
    const perfil = $("#botao-perfil");
    const e = eu();
    perfil.classList.toggle("ativo", !!e);
    perfil.title = e ? `${e.nome} · minha jornada` : "Entrar";
    perfil.setAttribute("aria-label", perfil.title);
    ROTAS[r]();
    atualizarFaixa();
  }

  function aplicarIdentidade() {
    $("#nome-clube").alt = D().clube.nome;
    $("#lema-clube").textContent = D().clube.lema;
    $("#ano-atual").textContent = new Date().getFullYear();
    document.title = D().clube.nome;
  }

  $("#busca-topo").addEventListener("submit", (e) => {
    e.preventDefault();
    filtroEstante.texto = $("#busca-texto").value.trim();
    filtroEstante.prateleira = "";
    if (rotaAtual() === "estante") { telaEstante(); window.scrollTo(0, 0); } else location.hash = "estante";
  });
  $("#botao-mais").addEventListener("click", abrirMais);
  $("#botao-perfil").addEventListener("click", () => { if (eu()) location.hash = "checkin"; else abrirEntrar(); });

  window.addEventListener("hashchange", () => { fecharModal(); renderizar(); window.scrollTo(0, 0); });
  try { if (sessionStorage.getItem(CHAVE_CURADORIA)) aplicarCuradoria(true); } catch (e) {}
  aplicarIdentidade();
  renderizar();
})();
