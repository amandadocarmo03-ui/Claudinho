"""Gera um único arquivo HTML (CSS, JS e imagens embutidos) para a página de teste.

Uso:  python3 ferramentas/gerar-versao-teste.py [saida.html]
"""
import base64
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
saida = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "versao-teste.html"


def data_uri(caminho, tipo):
    return f"data:{tipo};base64," + base64.b64encode((RAIZ / caminho).read_bytes()).decode()


logo = data_uri("img/logo.png", "image/png")
html = (RAIZ / "index.html").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="css/style.css">',
                    "<style>\n" + (RAIZ / "css/style.css").read_text(encoding="utf-8") + "\n</style>")
for js in ["js/dados-iniciais.js", "js/armazenamento.js", "js/app.js"]:
    codigo = (RAIZ / js).read_text(encoding="utf-8")
    html = html.replace(f'<script src="{js}"></script>', "<script>\n" + codigo + "\n</script>")
html = html.replace('src="img/logo.png"', f'src="{logo}"')
# A página de teste não usa manifesto, ícones nem service worker.
html = re.sub(r'\s*<link rel="(manifest|icon|apple-touch-icon)"[^>]*>', "", html)
html = re.sub(r"\s*<script>\s*if \('serviceWorker'.*?</script>", "", html, flags=re.S)
# O ambiente de teste já fornece doctype, head, body, charset e viewport.
html = re.sub(r"<!DOCTYPE html>\s*<html[^>]*>\s*<head>", "", html)
html = re.sub(r'<meta charset[^>]*>|<meta name="viewport"[^>]*>', "", html)
for tag in ["</head>", "<body>", "</body>", "</html>"]:
    html = html.replace(tag, "")
saida.write_text(html.strip() + "\n", encoding="utf-8")
print(f"Gerado: {saida} ({saida.stat().st_size // 1024} KB)")
