/*
 * Pagamento das assinaturas do Clube Online.
 * ------------------------------------------------------------
 * Nesta versão o provedor é "demo": o fluxo inteiro funciona, mas
 * NENHUMA cobrança é feita e nenhum dado de cartão é pedido.
 *
 * Para cobrar de verdade (ambiente online), troque o provedor:
 *  - Mercado Pago: assinaturas (Preapproval) com Pix e cartão. O site
 *    pede ao servidor um link/ID de checkout, abre o checkout seguro do
 *    Mercado Pago (Checkout Bricks) e o servidor recebe a confirmação
 *    por webhook, ativando a assinatura no banco de dados.
 *  - Stripe: Checkout Session em modo "subscription" + webhook.
 * Em ambos os casos os dados do cartão ficam só no provedor; o site
 * nunca os vê. As chaves secretas ficam no servidor, nunca aqui.
 */
(function () {
  const PROVEDOR = "demo";

  window.Pagamento = {
    provedor: PROVEDOR,
    ehDemo: PROVEDOR === "demo",

    // Inicia a cobrança. Retorna uma Promise com { aprovado, referencia }.
    // No modo demo, a aprovação acontece quando a pessoa toca em
    // "Simular pagamento aprovado" na tela de pagamento.
    iniciar({ plano, membro, metodo }) {
      if (PROVEDOR !== "demo") {
        return Promise.reject(new Error("Provedor de pagamento ainda não configurado"));
      }
      return Promise.resolve({
        aprovado: true,
        referencia: "demo-" + Date.now().toString(36),
        plano: plano.id,
        membro: membro.id,
        metodo
      });
    }
  };
})();
