# Diário do projeto — site do clube "Cansei! Vou ler um livro."

Última atualização: 09/10/2026 · versão guardada: **v0.1-teste** (commit `3078bb1`) · visual atual: **v0.2** (aprovado pela Amanda)

## Onde estamos

Primeira versão completa, em fase de **refinamento antes de ir para o ambiente online**.

- Página de teste v0.1 (visual clássico): https://claude.ai/artifact/GQg3tF2GsnAKSpkyCHp5aX
- Página de teste v0.2 (visual novo, aprovado): https://claude.ai/artifact/6oxo64TQvL5BTN6BstDFVJ
- Código: branch `claude/book-club-website-273xna`; a v0.1-teste é o commit `3078bb1` (para voltar a ela: `git checkout 3078bb1`)

### O que já existe
- **Estante** com os 31 livros de jan/2024 a jun/2026 (importados da planilha do clube), em prateleiras por ano.
- **Encontros** com confirmação de presença ("Vou!") e check-in no dia.
- **Check-in**: diário de leituras com nota (1 a 5), resenha e presenças.
- **Membros**: ficha de inscrição e fichário com número de sócio.
- **Benefícios**: carteirinha digital e cupons de parceiros, liberados por número de presenças.
- **Próxima leitura** (indicação e votação), **Citações** e **Painel** (ranking, selos, aniversariantes, backup).
- **Modo curadoria** com senha (inicial `1234`).
- Logo oficial no topo e na carteirinha; ícones do app feitos a partir do livro do logo.

### Visual v0.2 (aprovado)
Referências: Prioli & Karnal (foto em destaque, CTA em pílula, cards com canto assimétrico), TAG Livros (título em duas cores),
Companhia das Letras (fundo creme, serifa forte, busca em pílula, filtros em pílula). Mapa em `docs/referencias/`.
- Paleta: creme `#fbf6ee`, azul-marinho `#172241`, vermelho do logo `#d92d2f`, amarelo do logo `#f6c04f`; estante continua em madeira
- Fontes: Newsreader (títulos), Hanken Grotesk (texto), Barlow Condensed (menus e rótulos)
- Nova aba **Início** (abertura com foto da criadora, números, como funciona, livro do momento, prévia da estante, benefícios, perguntas frequentes)
- Nova aba **A criadora** com link para @canseideserblogger
- Busca no topo (destaca os livros na estante) e filtros por ano; barra de navegação fixa no celular
- Foto da criadora: `img/criadora.jpg` (recortada 4:5 para a moldura em arco) ✓
- Falta: **nome** e **texto de apresentação** da criadora (`criadora` em `js/dados-iniciais.js`)

### Gamificação e ranking (v0.3)
- Pontos: presença em encontro +50 · livro lido +30 · resenha +15 · citação +10 · indicação +10
- Níveis: Página 1 (0) · Capítulo aberto (100) · Leitura em dia (250) · Traça de livro (500) · Bibliófilo(a) (900) · Lenda da estante (1500)
- 13 conquistas (presença, sequência de encontros, leituras, resenhas, citações, indicação, assinatura)
- "Entrar" pelo e-mail ou nome da ficha (sem senha nesta versão) → boas-vindas com pontos, posição e próximo encontro
- Aba **Ranking** com pódio, critérios (pontos, encontros, leituras) e período (este ano / desde sempre); pódio também na Início
- "Minha jornada" (aba Check-in): nível, barra de pontos, posição, sequência e conquistas; comemoração ao subir de nível
- Curadoria → Painel: botão para carregar/remover **dados de demonstração** (membros e encontros fictícios)

### Clube Online (v0.3)
- Aba **Clube Online**: benefícios, planos (mensal e anual — **valores de exemplo**), área do assinante (próximo encontro online com link da sala, materiais e gravações), gerenciar/cancelar assinatura
- Encontros podem ser **presenciais** ou **online**; os online só liberam check-in e sala para assinantes
- Checkout em 3 etapas (plano → Pix ou cartão → confirmação) em **modo de demonstração**: nada é cobrado e nenhum dado de cartão é pedido
- `js/pagamento.js` concentra a integração; para cobrar de verdade é preciso: conta no provedor (Mercado Pago ou Stripe), servidor com as chaves e webhook confirmando o pagamento (ver "Para subir ao ambiente online")
- A definir pela Amanda: valores dos planos, provedor de pagamento, plataforma da sala (Zoom, Meet…)

### Decisões tomadas
- Nome oficial: **"Cansei! Vou ler um livro."** (com ponto final, igual ao logo).
- *Pequena coreografia do adeus* e *Peso do pássaro morto* (Aline Bei, mai/2025) ficam como **dois livros separados**.
- Estética de biblioteca clássica (madeira, pergaminho, lombadas), com vermelho e dourado puxados do logo.

## Pendências e próximos passos

**Funcionalidades novas planejadas**
- [x] **Aba "Clube Online"** — feita em modo demonstração (v0.3); falta ligar o pagamento real
  - Precisa do banco de dados e do login (ver "Para subir ao ambiente online")
  - Pagamento recorrente no Brasil: Mercado Pago, Asaas, Pagar.me ou Stripe (comparar taxas, Pix/cartão/boleto)
  - Caminho sugerido: 1º link de assinatura do próprio provedor (sem servidor); 2º confirmação automática do pagamento (webhook) liberando o acesso do membro
  - A definir: valor, o que o membro online recebe, se presenciais também pagam, forma de pagamento preferida
- [ ] **Link de afiliado da Amazon em cada livro** — botão "Comprar na Amazon" no detalhe do livro
  - Pode ser feito já (sem servidor). Precisa do **ID de associado** (ex.: `nome-20`)
  - Link por busca (título + autor) funciona para todos; link direto por ASIN é mais certeiro (pode ser preenchido aos poucos)
  - Exigência do Programa de Associados: aviso visível "Como associada da Amazon, recebo por compras qualificadas"
- [ ] **Aba da criadora** — apresentação de quem criou o clube + link para o Instagram **@canseideserblogger**
  - Pode ser feito já. Precisa de: foto, texto de apresentação e outros links (se houver)
- [ ] **WhatsApp**
  - Simples (já dá): botões "Falar no WhatsApp" e "Entrar no grupo" com links `wa.me` / convite do grupo
  - Automático (envio de mensagens pelo site): WhatsApp Business API (Meta, ou provedores como Twilio/Z-API) — pago, precisa de servidor e de modelos de mensagem aprovados
- [ ] **Newsletter e avisos por e-mail automáticos** (novo livro do mês, lembrete de encontro, aniversário)
  - Serviços: Brevo, MailerLite, Mailchimp ou Resend
  - Novo membro entra na lista automaticamente ao se cadastrar; lembretes agendados precisam do ambiente online
- [ ] **Incluir automaticamente no grupo quem se cadastra**
  - O WhatsApp não permite adicionar pessoas a grupos automaticamente por vias oficiais (e as não oficiais podem banir o número)
  - Alternativa: ao concluir o cadastro, mostrar o convite do grupo e enviá-lo também por e-mail/WhatsApp — a pessoa entra com um toque
  - Confirmar: o "grupo" é do WhatsApp?

**Informações que faltam**
- [ ] Livros de jul, ago e set/2026 e o livro atual
- [ ] Parceiros reais do clube de benefícios (nome, benefício, cupom, presenças mínimas) — hoje há 2 de exemplo
- [ ] Datas dos encontros (passados e próximos)

**Refinamentos** (anotar aqui o que surgir nos testes)
- [ ] Aprimorar estética, fontes e navegação com base nas referências:
  - https://literaturaclassica.com.br/catalogo — **fontes, cores e navegabilidade**
  - https://clubedolivropriolikarnal.com.br/lista-de-espera/ — **clareza dos dados e estética mais moderna** → mapa em `docs/referencias/prioli-karnal.md`
  - (Os sites não abrem no ambiente do Claude: rede bloqueada. Falta o mapa do Literatura Clássica.)

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
