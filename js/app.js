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
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-fechar]")) fecharModal();
  });
  function dadosDoFormulario(form) {
    const obj = {};
    new FormData(form).forEach((v, k) => { obj[k] = typeof v === "string" ? v.trim() : v; });
    return obj;
  }
  function cabecalho(titulo, subtitulo) {
    return `<div class="cabecalho-secao"><span class="vinheta" aria-hidden="true">❧ ❦ ❧</span><h2>${titulo}</h2><p>${subtitulo}</p></div>`;
  }

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
      return `<div class="caixa-destaque">Nenhum membro cadastrado ainda. <a href="#/membros">Faça seu cadastro</a> para fazer check-in e ver seus benefícios.</div>`;
    }
    return `<div class="caixa-destaque">
      <label>Quem está lendo?
        <select id="seletor-eu">
          <option value="">— escolha seu nome —</option>
          ${membros.map((m) => `<option value="${m.id}" ${m.id === euId() ? "selected" : ""}>${esc(m.nome)}</option>`).join("")}
        </select>
      </label>
    </div>`;
  }
  function ligarSeletorMembro() {
    const sel = $("#seletor-eu");
    if (sel) sel.addEventListener("change", () => { definirEu(sel.value); renderizar(); });
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
  function selosDe(membroId) {
    const lidos = leiturasDe(membroId).length;
    const pres = presencasDe(membroId).length;
    const resenhas = leiturasDe(membroId).filter((l) => l.resenha).length;
    const cits = D().citacoes.filter((c) => c.membroId === membroId).length;
    const selos = [];
    if (lidos >= 1) selos.push("📖 Primeiro capítulo");
    if (lidos >= 5) selos.push("📚 Leitura assídua");
    if (lidos >= 10) selos.push("🐛 Traça de biblioteca");
    if (lidos >= 20) selos.push("🏛 Acervo vivo");
    if (pres >= 5) selos.push("🪑 Cadeira cativa");
    if (pres >= 12) selos.push("🕯 Guardiã(o) do sarau");
    if (resenhas >= 3) selos.push("🪶 Pena afiada");
    if (cits >= 3) selos.push("✒️ Colecionador(a) de frases");
    return selos;
  }

  /* =========================================================
     ESTANTE
     ========================================================= */
  function lombadaHTML(l) {
    const h = hash(l.titulo + l.autor);
    const cor = l.cor || CORES_LOMBADA[h % CORES_LOMBADA.length];
    const altura = 172 + (h % 5) * 10;
    const largura = l.titulo.length > 22 ? 58 : l.titulo.length > 12 ? 48 : 40;
    const lido = euId() && D().leituras.some((x) => x.livroId === l.id && x.membroId === euId());
    return `<button class="lombada ${lido ? "lombada--lido" : ""}" type="button" data-livro="${l.id}"
        style="--cor:${cor};--altura:${altura}px;--largura:${largura}px"
        title="${esc(l.titulo)} — ${esc(l.autor)}${l.exemplo ? " (exemplo)" : ""}">
        ${lido ? `<span class="lombada__selo" aria-label="lido">✦</span>` : ""}
        <span class="lombada__texto"><span class="lombada__titulo">${esc(l.titulo)}</span><span class="lombada__autor">${esc(l.autor.split(" ").slice(-1)[0])}</span></span>
      </button>`;
  }

  function telaEstante() {
    const { prateleiras, livros } = D();
    const temExemplo = livros.some((l) => l.exemplo);
    conteudo.innerHTML = `
      ${cabecalho("A Estante do Clube", `${livros.filter((l) => !l.exemplo).length} livros lidos juntos até aqui`)}
      ${temExemplo ? `<p class="legenda-estante">Os livros marcados como exemplo são só demonstração — entre na curadoria e cole a lista real do clube.</p>` : ""}
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
      <p class="legenda-estante">Toque numa lombada para ver detalhes, notas e resenhas. ✦ = você já leu.</p>

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
          <h3 style="color:var(--vinho);font-size:1.6rem;margin-bottom:0">${esc(l.titulo)}</h3>
          <p><i>${esc(l.autor)}</i></p>
          <p>${pratel ? esc(pratel.rotulo) : ""}${l.mes ? ` · ${MESES_LONGOS[l.mes - 1]}` : ""}${l.ano ? ` de ${l.ano}` : ""}
            ${l.exemplo ? ` <span class="selo selo--exemplo">exemplo</span>` : ""}</p>
          <p>${media ? `${estrelasFixas(media)} ${media.toFixed(1)} ` : "Ainda sem notas "}· ${leitores.length} leitor(es)</p>
          ${eu_ ? (jaLi
            ? `<p>✦ Você já leu este livro.</p>`
            : `<a class="botao botao--verde" href="#/checkin" data-fechar>Registrar minha leitura</a>`) : ""}
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
      if (!confirm(`Tirar "${l.titulo}" da estante?`)) return;
      D().livros = D().livros.filter((x) => x.id !== id);
      D().leituras = D().leituras.filter((x) => x.livroId !== id);
      Dados.salvar(); fecharModal(); avisar("Livro removido"); renderizar();
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
      return `<article class="encontro ${passado ? "encontro--passado" : ""}">
        <div class="encontro__data"><strong>${d.getDate()}</strong><span>${MESES[d.getMonth()]} ${d.getFullYear()}</span></div>
        <div>
          <h4>${l ? esc(l.titulo) : esc(e.titulo || "Encontro do clube")}</h4>
          <p>${e.hora ? esc(e.hora) + " · " : ""}${esc(e.local || "Local a definir")}</p>
          ${e.obs ? `<p><i>${esc(e.obs)}</i></p>` : ""}
          <p>${passado || ehHoje ? `${presentes.length} presença(s) registrada(s)` : `${confirmados.length} confirmação(ões)`}</p>
        </div>
        <div class="encontro__acoes">
          ${eu_ ? (passado || ehHoje
            ? `<button class="botao botao--pequeno ${fiz ? "botao--secundario" : "botao--verde"}" data-checkin="${e.id}">${fiz ? "✓ Estive lá" : "Fazer check-in"}</button>`
            : `<button class="botao botao--pequeno ${vou ? "botao--secundario" : ""}" data-confirmar="${e.id}">${vou ? "✓ Presença confirmada" : "Vou!"}</button>`) : ""}
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
            <label>Local <input name="local" placeholder="Café, livraria, online…"></label>
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
      if (!confirm("Excluir este encontro e suas presenças?")) return;
      const id = b.dataset.excluirEncontro;
      D().encontros = D().encontros.filter((x) => x.id !== id);
      D().presencas = D().presencas.filter((x) => x.encontroId !== id);
      Dados.salvar(); telaEncontros();
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
    if (idx >= 0) { D().presencas.splice(idx, 1); avisar("Check-in desfeito"); }
    else { D().presencas.push({ membroId, encontroId, em: new Date().toISOString() }); avisar("Check-in feito! Bom encontro ❦"); }
    Dados.salvar();
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
      const selos = selosDe(eu_.id);
      corpo = `
        <div class="numeros">
          <div class="numero"><strong>${minhasLeituras.length}</strong><span>livros lidos</span></div>
          <div class="numero"><strong>${minhasPresencas.length}</strong><span>encontros</span></div>
          <div class="numero"><strong>${D().livros.length ? Math.round((minhasLeituras.length / D().livros.length) * 100) : 0}%</strong><span>da estante</span></div>
        </div>
        ${selos.length ? `<div class="selos" style="justify-content:center;margin-bottom:10px">${selos.map((s) => `<span class="selo">${s}</span>`).join("")}</div>` : ""}

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
          return `<li class="${fui ? "feito" : ""}"><span><b>${formatarData(e.data)}</b>
            <small>${esc(livro(e.livroId)?.titulo || e.titulo || "Encontro")} · ${esc(e.local || "")}</small></span>
            <button class="botao botao--pequeno ${fui ? "botao--secundario" : "botao--verde"}" data-presenca="${e.id}">${fui ? "✓ Estive lá" : "Check-in"}</button></li>`;
        }).join("")}</ul>` : `<p class="vazio">Nenhum encontro realizado ainda. Os encontros são cadastrados na aba Encontros.</p>`}`;
    }

    conteudo.innerHTML = `
      ${cabecalho("Check-in", "Seu diário de leituras e de encontros")}
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
      if (existente) Object.assign(existente, { nota, resenha: f.resenha });
      else D().leituras.push({ membroId: eu_.id, livroId, nota, resenha: f.resenha, em: new Date().toISOString() });
      Dados.salvar(); fecharModal(); avisar("Leitura registrada ✦"); renderizar();
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
        <summary style="cursor:pointer;font-family:var(--fonte-titulo);font-size:1.2rem;color:var(--vinho)">Ficha de inscrição</summary>
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
          <fieldset style="border:1px solid var(--pergaminho-escuro);border-radius:4px">
            <legend style="font-variant:small-caps;color:var(--tinta-suave)">Gêneros favoritos</legend>
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
      Dados.salvar(); avisar(`Bem-vindo(a), ${novo.apelido || novo.nome.split(" ")[0]}!`); telaMembros();
    });
    $("#busca-membro").addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      $$("#lista-membros .ficha").forEach((f) => { f.style.display = f.dataset.nome.includes(q) ? "" : "none"; });
    });
    $$("[data-excluir-membro]").forEach((b) => b.addEventListener("click", () => {
      const m = membro(b.dataset.excluirMembro);
      if (!confirm(`Remover ${m.nome} do clube? As leituras e presenças dele(a) também serão apagadas.`)) return;
      D().membros = D().membros.filter((x) => x.id !== m.id);
      D().leituras = D().leituras.filter((x) => x.membroId !== m.id);
      D().presencas = D().presencas.filter((x) => x.membroId !== m.id);
      if (euId() === m.id) definirEu(null);
      Dados.salvar(); telaMembros();
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
        <div class="cartao-beneficio" style="max-width:420px;margin:0 auto 30px;text-align:left">
          <span class="lacre">EX<br>LIBRIS</span>
          <span class="cartao-beneficio__categoria">Carteirinha de membro</span>
          <h4 style="margin-top:6px">${esc(D().clube.nome)}</h4>
          <p style="font-family:var(--fonte-destaque);font-size:1.4rem;margin:6px 0 2px">${esc(eu_.nome)}</p>
          <p class="cartao-beneficio__meta">Sócio(a) nº ${String(eu_.numero || 0).padStart(3, "0")}${eu_.desde ? ` · desde ${esc(eu_.desde.split("-").reverse().join("/"))}` : ""}</p>
          <p class="cartao-beneficio__meta">${leiturasDe(eu_.id).length} livros lidos · ${minhasPresencas} encontros</p>
        </div>` : ""}

      ${categorias.length > 1 ? `<div class="filtros" style="justify-content:center;margin-bottom:18px">
        <button class="botao botao--pequeno" data-cat="">Todos</button>
        ${categorias.map((c) => `<button class="botao botao--pequeno botao--secundario" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
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
            <div class="ficha__acoes somente-curadoria" style="justify-content:center">
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
      $$("[data-cat]").forEach((x) => x.classList.toggle("botao--secundario", x !== b));
      $$("#grade-parceiros [data-categoria]").forEach((c) => { c.style.display = !b.dataset.cat || c.dataset.categoria === b.dataset.cat ? "" : "none"; });
    }));
    $$("[data-excluir-parceiro]").forEach((b) => b.addEventListener("click", () => {
      if (!confirm("Remover este parceiro?")) return;
      D().parceiros = D().parceiros.filter((p) => p.id !== b.dataset.excluirParceiro);
      Dados.salvar(); telaBeneficios();
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
      if (!confirm("Apagar todas as indicações e votos?")) return;
      D().candidatos = []; D().votos = {};
      Dados.salvar(); telaVotacao();
    });
    const fi = $("#form-indicacao");
    if (fi) fi.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = dadosDoFormulario(fi);
      candidatos.push({ id: Dados.novoId("c"), ...f, indicadoPor: eu_.id, em: new Date().toISOString() });
      Dados.salvar(); avisar("Indicação registrada"); telaVotacao();
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
      D().citacoes.push({ id: Dados.novoId("q"), ...dadosDoFormulario(fc), membroId: eu_.id, em: new Date().toISOString() });
      Dados.salvar(); avisar("Citação no mural"); telaCitacoes();
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
    const ranking = membros.map((m) => ({ m, lidos: leiturasDe(m.id).length, pres: presencasDe(m.id).length }))
      .sort((a, b) => (b.lidos + b.pres) - (a.lidos + a.pres));
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
      ${ranking.length ? `<div class="rolagem-tabela"><table class="tabela">
        <thead><tr><th>Membro</th><th>Livros</th><th>Encontros</th><th>Selos</th></tr></thead>
        <tbody>${ranking.map((r) => `<tr><td>${esc(r.m.apelido || r.m.nome)}</td><td>${r.lidos}</td><td>${r.pres}</td>
          <td><div class="selos">${selosDe(r.m.id).map((s) => `<span class="selo">${s}</span>`).join("")}</div></td></tr>`).join("")}</tbody>
      </table></div>` : `<p class="vazio">O ranking aparece quando houver membros.</p>`}

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
    $("#backup-zerar").addEventListener("click", () => {
      if (!confirm("Apagar TODOS os dados do clube neste aparelho? Baixe um backup antes.")) return;
      Dados.reiniciar(); definirEu(null); aplicarIdentidade(); renderizar();
    });
  }

  /* =========================================================
     Roteamento
     ========================================================= */
  const ROTAS = {
    estante: telaEstante,
    encontros: telaEncontros,
    checkin: telaCheckin,
    membros: telaMembros,
    beneficios: telaBeneficios,
    votacao: telaVotacao,
    citacoes: telaCitacoes,
    painel: telaPainel
  };

  function rotaAtual() {
    const r = location.hash.replace(/^#\/?/, "");
    return ROTAS[r] ? r : "estante";
  }

  function renderizar() {
    const r = rotaAtual();
    $$(".abas a").forEach((a) => {
      const ativa = a.dataset.rota === r;
      a.classList.toggle("ativa", ativa);
      if (ativa) { a.setAttribute("aria-current", "page"); a.scrollIntoView({ block: "nearest", inline: "nearest" }); }
      else a.removeAttribute("aria-current");
    });
    ROTAS[r]();
  }

  function aplicarIdentidade() {
    $("#nome-clube").textContent = D().clube.nome;
    $("#lema-clube").textContent = D().clube.lema;
    document.title = D().clube.nome;
  }

  window.addEventListener("hashchange", () => { fecharModal(); renderizar(); window.scrollTo(0, 0); });
  try { if (sessionStorage.getItem(CHAVE_CURADORIA)) aplicarCuradoria(true); } catch (e) {}
  aplicarIdentidade();
  renderizar();
})();
