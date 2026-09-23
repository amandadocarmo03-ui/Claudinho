# Referência visual — Clube do Livro Prioli & Karnal

Fonte: https://clubedolivropriolikarnal.com.br/lista-de-espera/
O que aproveitar (pedido da Amanda): **clareza na apresentação dos dados e estética mais moderna**.
Uso: referência de estilo (ritmo, componentes, tipografia). Não copiar logo, fotos, ilustrações nem textos.
Mapa levantado pela Amanda com ajuda de outro assistente (o site não abre no ambiente do Claude).

## Paleta do site de referência
| Token | Hex | Uso |
|---|---|---|
| roxo profundo | `#4200A3` | hero, cards, blocos escuros |
| roxo vibrante | `#5E00E9` | títulos sobre fundo claro |
| lilás claro | `#EFEFFF` | seções claras, texto sobre roxo |
| amarelo neon | `#FFFF00` | destaques pontuais |
| rosa CTA | `#FF1A88` | só o botão principal |
| texto escuro | `#1E1E1E` | corpo |

Lógica: alternância seção escura ↔ seção clara; amarelo só como destaque; uma cor reservada ao CTA.

## Tipografia
Família única sans-serif (Open Sauce Sans; alternativas Google: Plus Jakarta Sans, DM Sans).
H1 42/600 · subtítulo 24/600 · H2 32/700 · títulos de card 18–22/700 · corpo 17/400 lh 1.5 · botão 18/700.
Negrito dentro do parágrafo para frases-chave.

## Assinatura visual
- Cantos assimétricos: benefício `20px 0 20px 0`; livro `0 60px 0 60px`; bloco `25px 60px 0 25px`; retrato em arco `26px 26px 300px 300px`.
- Imagem (capa/foto) vazando o topo do card com margem negativa.
- Pequeno ícone divisor entre blocos; textura no fundo de algumas seções.

## Componentes
- CTA em pílula (`border-radius: 100px`, padding `1.5em 2em`), repetido ao fim das seções.
- 3 cards de benefício lado a lado (título destaque + texto).
- Carrossel de livros por edição (2 visíveis no desktop, setas e pontos).
- Lista com ícones; formulário curto (nome + e-mail) no hero; FAQ em acordeão.

## Estrutura da página
Hero com formulário → por que participar → 3 benefícios → "para você que deseja" + CTA → como funciona → acervo por edição → depoimentos → quem conduz (fotos em arco) → FAQ + CTA → rodapé.

## Ritmo
Seções com padding vertical 5em; gaps 2em (blocos) e 1em (cards); colunas 48/48 ou 64% centralizado; mobile empilha tudo.
Movimento discreto: transições de 0.3s, sem animações chamativas.
