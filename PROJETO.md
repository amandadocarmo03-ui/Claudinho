# Diário do projeto — site do clube "Cansei! Vou ler um livro."

Última atualização: 22/09/2026 · versão guardada: **v0.1-teste**

## Onde estamos

Primeira versão completa, em fase de **refinamento antes de ir para o ambiente online**.

- Página de teste (privada, no claude.ai): https://claude.ai/artifact/GQg3tF2GsnAKSpkyCHp5aX
- Código: branch `claude/book-club-website-273xna`, etiqueta `v0.1-teste`

### O que já existe
- **Estante** com os 31 livros de jan/2024 a jun/2026 (importados da planilha do clube), em prateleiras por ano.
- **Encontros** com confirmação de presença ("Vou!") e check-in no dia.
- **Check-in**: diário de leituras com nota (1 a 5), resenha e presenças.
- **Membros**: ficha de inscrição e fichário com número de sócio.
- **Benefícios**: carteirinha digital e cupons de parceiros, liberados por número de presenças.
- **Próxima leitura** (indicação e votação), **Citações** e **Painel** (ranking, selos, aniversariantes, backup).
- **Modo curadoria** com senha (inicial `1234`).
- Logo oficial no topo e na carteirinha; ícones do app feitos a partir do livro do logo.

### Decisões tomadas
- Nome oficial: **"Cansei! Vou ler um livro."** (com ponto final, igual ao logo).
- *Pequena coreografia do adeus* e *Peso do pássaro morto* (Aline Bei, mai/2025) ficam como **dois livros separados**.
- Estética de biblioteca clássica (madeira, pergaminho, lombadas), com vermelho e dourado puxados do logo.

## Pendências e próximos passos

**Informações que faltam**
- [ ] Livros de jul, ago e set/2026 e o livro atual
- [ ] Parceiros reais do clube de benefícios (nome, benefício, cupom, presenças mínimas) — hoje há 2 de exemplo
- [ ] Datas dos encontros (passados e próximos)

**Refinamentos** (anotar aqui o que surgir nos testes)
- [ ] …

**Para subir ao ambiente online**
- [ ] Banco de dados compartilhado (Firebase ou Supabase) — hoje os dados ficam só no navegador de cada pessoa; trocar apenas `js/armazenamento.js`
- [ ] Login dos membros (hoje cada pessoa escolhe o próprio nome numa lista)
- [ ] Hospedagem (GitHub Pages, Netlify ou Vercel) e, se quiser, domínio próprio
- [ ] Trocar a senha de curadoria padrão

**Ideias sugeridas, ainda não feitas**
- Controle de mensalidade · mapa dos locais dos encontros · lembrete de encontro por WhatsApp/e-mail

## Como atualizar a página de teste

```bash
python3 ferramentas/gerar-versao-teste.py
```

Isso gera `versao-teste.html` (um arquivo só, com tudo embutido), que é republicado no mesmo link de teste.
