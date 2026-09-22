# Contexto para o Claude

Site do clube do livro "Cansei! Vou ler um livro." — HTML/CSS/JS puro, sem build, textos em português.
Leia `PROJETO.md` antes de começar: tem o estado atual, as decisões tomadas e as pendências. Atualize-o ao fim de cada rodada de mudanças.

- Lista oficial de livros: `js/dados-iniciais.js`. Ao mudá-la, suba `versao` e trate a migração em `js/armazenamento.js`.
- Não use `alert`/`confirm`/`prompt` (bloqueados na página de teste); use `confirmar()` de `js/app.js`.
- Página de teste: gere com `python3 ferramentas/gerar-versao-teste.py` e republique no artifact https://claude.ai/artifact/GQg3tF2GsnAKSpkyCHp5aX (passar a URL ao publicar).
