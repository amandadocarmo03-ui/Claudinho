# Cansei de Ser! Vou Ler um Livro 📚

Site do clube do livro **Cansei de Ser! Vou Ler um Livro** com estética de biblioteca clássica: estante de madeira, lombadas douradas e páginas de pergaminho.
Ele pode ser **instalado no celular como aplicativo** (PWA): no navegador, use "Adicionar à tela inicial".

## Abas

| Aba | O que faz |
|---|---|
| **Estante** | Livros lidos, organizados em prateleiras (2024, 2025, 2026 · 1º semestre…). A lista oficial vem da planilha do clube e está em `js/dados-iniciais.js`. Toque numa lombada para ver notas, leitores e resenhas. |
| **Encontros** | Calendário de encontros. Antes da data o membro confirma "Vou!". No dia (ou depois), faz o check-in. |
| **Check-in** | Diário pessoal: marcar os livros lidos (com nota de 1 a 5 e resenha) e os encontros em que esteve. |
| **Membros** | Ficha de inscrição (contato, aniversário, gêneros favoritos, livro favorito) e fichário dos membros. |
| **Benefícios** | Carteirinha digital + cupons dos parceiros. Cada benefício pode exigir um número mínimo de presenças. |
| **Próxima leitura** | Indicações e votação do próximo livro. A curadoria elege o vencedor e ele vai direto para a estante. |
| **Citações** | Mural com trechos sublinhados pelos membros. |
| **Painel** | Números do clube, aniversariantes do mês, quadro de honra com selos, livros mais bem avaliados, autores mais lidos, backup. |

## Modo curadoria (organização)

O botão **🗝 Curadoria** (senha inicial `1234`, troque no Painel) libera:
- adicionar livros um a um ou **colar a lista inteira** (um por linha, `Título — Autor`);
- criar prateleiras, marcar/excluir encontros, fazer lista de presença;
- cadastrar parceiros e benefícios;
- ver contatos dos membros e baixar a lista em CSV;
- backup / importação de todos os dados.

## Como rodar

É um site estático (HTML + CSS + JavaScript, sem dependências). Qualquer hospedagem estática serve
(GitHub Pages, Netlify, Vercel). Para testar localmente:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Importante: onde ficam os dados

Nesta primeira versão os dados ficam salvos **no navegador de cada aparelho** (localStorage).
Isso é ótimo para testar o visual e o fluxo, mas cada pessoa vê apenas o que foi registrado no próprio aparelho.
Para o clube inteiro compartilhar os mesmos dados (e ter login de verdade), o próximo passo é ligar um banco online
como Firebase ou Supabase. Toda a leitura e gravação está concentrada em `js/armazenamento.js` para facilitar essa troca.

## Estrutura

```
index.html              página única com as abas
css/style.css           visual (madeira, pergaminho, lombadas)
js/dados-iniciais.js    lista oficial de livros, prateleiras e parceiros ← edite aqui
js/armazenamento.js     camada de dados
js/app.js               telas e regras
manifest.webmanifest    instalação como aplicativo
sw.js                   funcionamento offline
```
