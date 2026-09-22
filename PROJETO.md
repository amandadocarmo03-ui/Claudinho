# Diário do projeto — site do clube "Cansei! Vou ler um livro."

Última atualização: 22/09/2026 · versão guardada: **v0.1-teste** (commit `3078bb1`)

## Onde estamos

Primeira versão completa, em fase de **refinamento antes de ir para o ambiente online**.

- Página de teste (privada, no claude.ai): https://claude.ai/artifact/GQg3tF2GsnAKSpkyCHp5aX
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

### Decisões tomadas
- Nome oficial: **"Cansei! Vou ler um livro."** (com ponto final, igual ao logo).
- *Pequena coreografia do adeus* e *Peso do pássaro morto* (Aline Bei, mai/2025) ficam como **dois livros separados**.
- Estética de biblioteca clássica (madeira, pergaminho, lombadas), com vermelho e dourado puxados do logo.

## Pendências e próximos passos

**Funcionalidades novas planejadas**
- [ ] **Aba "Clube Online"** — área separada para os membros da modalidade online, com **assinatura mensal e pagamento integrado**
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
