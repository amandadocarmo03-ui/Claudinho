# Guia: colocar o clube no ar (hospedagem, banco de dados, e-mails e Mercado Pago)

Para a Amanda estudar antes de fazermos juntas. Escrito em 09/10/2026.
Preços e regras dos serviços mudam — confira sempre na página oficial de cada um antes de decidir.

---

## 1. O que muda quando o site vai "para o ar"

Hoje o site guarda tudo **no navegador de cada pessoa**. Por isso cada membro vê só o que registrou no próprio celular, não há senha e o pagamento é simulado.

No ambiente online, o site passa a ter:

| Peça | Para que serve | Serviço sugerido |
|---|---|---|
| **Hospedagem** | Deixar o site acessível num endereço | **Vercel** ou **Netlify** (plano gratuito) |
| **Domínio** | O endereço do site (ex.: `canseivouler.com.br`) | **Registro.br** (anual) |
| **Banco de dados** | Guardar membros, presenças, leituras, ranking — iguais para todos | **Supabase** (plano gratuito para começar) |
| **Login** | Cada membro entra com o próprio e-mail | **Supabase Auth** — link de acesso enviado por e-mail, sem senha para decorar |
| **Pagamento** | Assinatura do Clube Online | **Mercado Pago** (Assinaturas) |
| **E-mails** | Avisos, lembretes, newsletter, boas-vindas | **Brevo** (newsletter e automações) |

Como as peças se conversam:

```
Membro ──▶ Site (Vercel) ──▶ Supabase (dados + login)
                 │                     ▲
                 ▼                     │ "pagamento aprovado" (webhook)
          Mercado Pago ────────────────┘
                 
Supabase ──▶ Brevo ──▶ e-mails para os membros
```

---

## 2. Mercado Pago

### 2.1 Conta
1. Crie (ou use) sua conta no Mercado Pago. Para receber pelo clube, vale avaliar abrir um **MEI** — ajuda com nota fiscal e impostos. Converse com um(a) contador(a).
2. Ative a conta como **vendedor** e confirme seus dados e conta bancária.

### 2.2 Aplicação (para o site se conectar)
1. Acesse **Mercado Pago Developers → Suas integrações → Criar aplicação**.
2. Tipo de solução: **Pagamentos online**. Produto: **Assinaturas**.
3. A aplicação gera dois pares de credenciais:
   - **Credenciais de teste** — usamos primeiro, com cartões de teste, sem dinheiro real.
   - **Credenciais de produção** — liberadas depois que a conta é homologada.
4. Cada par tem uma **Public Key** (pode ficar no site) e um **Access Token** (é **secreto**).

> ⚠️ **Nunca mande o Access Token por chat, e-mail ou WhatsApp** — nem para mim. Ele dá acesso ao dinheiro da conta. Quando chegar a hora, você mesma vai colá-lo nas configurações secretas do Supabase/Vercel e eu escrevo o código que lê de lá.

### 2.3 Como a assinatura vai funcionar
1. A pessoa entra no site e escolhe o plano.
2. O site pede ao servidor (Supabase) para criar a assinatura no Mercado Pago.
3. Ela paga no **checkout seguro do Mercado Pago** — os dados do cartão nunca passam pelo nosso site.
4. O Mercado Pago avisa o servidor (**webhook**) que o pagamento foi aprovado, e a assinatura fica ativa no banco de dados.
5. Todo mês o Mercado Pago cobra sozinho e avisa de novo. Se o pagamento falhar ou a pessoa cancelar, o acesso ao Clube Online é suspenso automaticamente.

### 2.4 Pontos para você decidir / verificar
- **Valores** dos planos (mensal e anual?).
- **Pix na assinatura:** a cobrança recorrente automática do Mercado Pago é feita principalmente no **cartão de crédito**. Confira na sua conta se há opção de Pix recorrente; se não houver, uma alternativa é oferecer o **plano anual pago uma vez por Pix**.
- **Taxas:** veja a tabela atual de tarifas na sua conta (variam com o prazo de recebimento).
- **Política de cancelamento e reembolso** (vai para o site).

---

## 3. E-mails para os cadastrados

Dois tipos de e-mail, ambos pelo **Brevo**:

| Tipo | Exemplos | Como dispara |
|---|---|---|
| **Automáticos** | boas-vindas ao se cadastrar, link de acesso, lembrete 2 dias antes do encontro, "assinatura confirmada", "pagamento falhou", parabéns de aniversário | sozinhos, pelo site/servidor |
| **Newsletter** | livro do mês, novidades, parceiros | você escreve e agenda no painel do Brevo |

O que fazer:
1. Criar conta no **Brevo** (o plano gratuito tem um limite diário de envios — confira se cobre o tamanho do clube).
2. **Autenticar o domínio** (SPF, DKIM e DMARC — o Brevo mostra o passo a passo e eu ajudo). Sem isso, os e-mails caem no spam. Por isso o **domínio próprio é importante**: o remetente fica algo como `clube@canseivouler.com.br`.
3. Quem se cadastra no site entra automaticamente numa lista do Brevo, já marcada como membro presencial ou assinante online.

**LGPD:** todo e-mail de newsletter precisa ter "descadastrar"; a ficha de inscrição já pede consentimento; vamos publicar uma **política de privacidade** simples no site.

---

## 4. Hospedagem e domínio

1. **Domínio:** registre no **Registro.br** (ex.: `canseivouler.com.br` — veja quais estão livres).
2. **Vercel** (ou Netlify): crie a conta entrando com o GitHub e importe o repositório `claudinho`. Cada atualização que eu fizer no código publica o site sozinha.
3. Aponte o domínio para a Vercel (a Vercel mostra os registros a configurar no Registro.br; leva algumas horas para valer).
4. O site ganha **https** automaticamente e passa a poder ser instalado como app no celular.

---

## 5. Banco de dados e login (Supabase)

1. Crie a conta no **Supabase** e um projeto (região: **São Paulo**).
2. Eu crio as tabelas (membros, encontros, presenças, leituras, citações, votos, parceiros, assinaturas) e as **regras de acesso**: cada membro só altera os próprios registros; só a curadoria cadastra livros, encontros e parceiros.
3. **Login:** a pessoa digita o e-mail e recebe um **link de acesso** — sem senha para esquecer. A curadoria passa a ser um papel dado à sua conta (adeus senha `1234`).
4. Os dados de teste de hoje podem ser importados pelo **backup** do Painel.

---

## 6. Ordem sugerida

| Etapa | Quem | O que |
|---|---|---|
| 1 | Amanda | Registrar o domínio · criar contas: Vercel, Supabase, Brevo, Mercado Pago (vendedor + aplicação) |
| 2 | Juntas | Publicar o site na Vercel com o domínio |
| 3 | Claude | Ligar Supabase: banco de dados, login por e-mail, curadoria |
| 4 | Claude + Amanda | E-mails automáticos e lista de newsletter no Brevo (autenticar domínio) |
| 5 | Claude | Mercado Pago em **modo teste**: assinatura, webhook, liberação do Clube Online |
| 6 | Amanda | Testar tudo com cartões de teste · definir valores e textos |
| 7 | Juntas | Trocar para credenciais de produção · política de privacidade · lançar |

## 7. Custos (estimativa — confira os valores atuais)

| Item | Custo |
|---|---|
| Domínio `.com.br` | anuidade no Registro.br |
| Vercel / Netlify | gratuito no começo |
| Supabase | gratuito no começo (há limites de uso e o projeto "dorme" após dias sem acesso no plano grátis) |
| Brevo | gratuito até o limite diário de envios; pago se o clube crescer |
| Mercado Pago | sem mensalidade; tarifa por pagamento recebido |

## 8. Checklist para a próxima conversa

- [ ] Domínio escolhido/registrado
- [ ] Conta Vercel criada (entrando com o GitHub)
- [ ] Conta e projeto Supabase criados (região São Paulo)
- [ ] Conta Brevo criada
- [ ] Mercado Pago: conta de vendedor ativa + aplicação criada com produto **Assinaturas**
- [ ] Valores dos planos definidos
- [ ] Plataforma dos encontros online (Zoom, Meet…)

**Lembrete:** credenciais secretas (Access Token do Mercado Pago, chaves "service role" do Supabase, chave de API do Brevo) **não vão para o chat**. Você as cola nas configurações secretas e me avisa que estão lá.
