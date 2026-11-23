# Estudos

Repositório central das minhas trilhas de estudo. O progresso fica publicado em
**<https://fernandowrpg.github.io/estudos/>** (GitHub Pages servido da pasta `docs/`).

Os quadros do Trello continuam sendo onde eu planejo e movo cards; este repositório é o lugar
onde o progresso fica visível e onde moram as anotações e o código dos exercícios.

## Trilhas

| Trilha | Situação | Quadro no Trello |
|---|---|---|
| Testes no Angular | em andamento, detalhada aqui | [quadro](https://trello.com/b/eYC0ASUW/testes-no-angular) |
| Java, Cloud e Observabilidade | a fazer | [quadro](https://trello.com/b/6h6fPQHQ/plano-de-estudos-java-cloud-e-observabilidade) |
| Next.js | a fazer | [quadro](https://trello.com/b/iqUiX1H9/trilha-nextjs) |
| Arquitetura de Front-End e System Design | a fazer | [quadro](https://trello.com/b/kBojZ6UB/arquitetura-de-front-end-e-system-design) |

## Estrutura

```
docs/                 site publicado (GitHub Pages, branch main, pasta /docs)
  index.html          painel com todas as trilhas
  trilha.html         detalhe de uma trilha (?id=testes-angular)
  dados/trilhas.json  fonte única de dados do painel
  assets/             estilo e script
notas/<trilha>/       anotações por módulo, em Markdown
exercicios/<trilha>/  código dos exercícios (criar quando começar)
```

## Como marcar progresso

Tudo vive em `docs/dados/trilhas.json`.

1. **Concluí um item de sessão:** mude `"feito": false` para `true`.
2. **Comecei um módulo:** mude o `"status"` dele para `"em-andamento"`; ao terminar, `"concluido"`.
3. **Comecei/terminei uma trilha:** mesmo campo `"status"` no nível da trilha.
4. Atualize `"atualizadoEm"` com a data da mudança e faça commit. O site recalcula as barras sozinho.

Status válidos: `a-fazer`, `em-andamento`, `concluido`.

As anotações em `notas/` têm as mesmas caixinhas em Markdown — marcar `[x]` lá é o registro do que
foi estudado; o JSON é o que alimenta o painel.

## Sincronizar com o Trello

Hoje a sincronização é manual (ou feita por uma sessão do Claude Code com acesso ao Trello, que lê
os quadros e reescreve o JSON). Quando uma nova trilha for detalhada, basta preencher `modulos`
dela no JSON com o mesmo formato da trilha de Angular e trocar `"detalhada"` para `true`.

## Rodar o site localmente

```bash
python3 -m http.server -d docs 8000
```

Depois abra <http://localhost:8000>.
