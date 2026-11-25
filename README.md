# Estudos

Repositório central das minhas trilhas de estudo. O progresso fica publicado em
**<https://fernandowrpg.github.io/estudos/>** (GitHub Pages servido da pasta `docs/`).

Os quadros do Trello continuam sendo onde eu planejo e movo cards; este repositório é o lugar
onde o progresso fica visível e onde moram as anotações e o código dos exercícios.

## Trilhas

| Trilha | Situação | Quadro no Trello |
|---|---|---|
| Testes no Angular ([trilha Alura](https://cursos.alura.com.br/app/learning-guide/alura/angular-testes-automatizados-garantir-qualidade-aplicacao)) | em andamento, detalhada aqui | [quadro](https://trello.com/b/eYC0ASUW/testes-no-angular) |
| Java, Cloud e Observabilidade | a fazer | [quadro](https://trello.com/b/6h6fPQHQ/plano-de-estudos-java-cloud-e-observabilidade) |
| Next.js | a fazer | [quadro](https://trello.com/b/iqUiX1H9/trilha-nextjs) |
| Arquitetura de Front-End e System Design | a fazer | [quadro](https://trello.com/b/kBojZ6UB/arquitetura-de-front-end-e-system-design) |

## Estrutura

```
scripts/servidor.mjs  servidor local de edição (sem dependências)
docs/                 site publicado (GitHub Pages, branch main, pasta /docs)
  index.html          painel com todas as trilhas
  trilha.html         detalhe de uma trilha (?id=testes-angular)
  dados/trilhas.json  fonte única de dados do painel
  assets/             estilo e script
notas/<trilha>/       anotações por módulo, em Markdown
projetos/<trilha>/    código dos projetos feitos nos cursos (um diretório por projeto)
```

## Marcar progresso

Suba a página em modo de edição e vá clicando:

```bash
node scripts/servidor.mjs
```

Abra <http://localhost:4321>, entre numa trilha e clique:

- **num item** para marcar/desmarcar como feito;
- **no selo de status** de um módulo ou da trilha para alternar entre
  *A fazer → Em andamento → Concluído*.

Cada clique grava `docs/dados/trilhas.json` na hora — o aviso no rodapé confirma. Depois é só
commitar o arquivo para o progresso aparecer no site publicado.

O status se ajusta sozinho conforme você marca: ao marcar o primeiro item o módulo entra em
*Em andamento*, e ao marcar todos ele vai para *Concluído*. O clique no selo continua valendo
para quando você quiser corrigir à mão.

A porta pode ser trocada com `PORTA=5000 node scripts/servidor.mjs`.

No site publicado no GitHub Pages não existe o servidor local, então a página fica em somente
leitura — ninguém de fora marca nada.

### Editando o JSON direto

Se preferir, dá para editar `docs/dados/trilhas.json` na mão: `"feito": true` num item e
`"status"` em módulos e trilhas, com os valores `a-fazer`, `em-andamento` ou `concluido`.

As anotações em `notas/` têm as mesmas caixinhas em Markdown — marcar `[x]` lá é o registro do que
foi estudado; o JSON é o que alimenta o painel.

## Projetos dos cursos

O código escrito durante os cursos fica em `projetos/<trilha>/<nn-nome>/`, um projeto por
diretório, cada um autocontido com o próprio `package.json`. As convenções e o modelo de README
estão em [`projetos/README.md`](projetos/README.md).

Os módulos que têm projeto linkam para a pasta dele direto no painel.

## Sincronizar com o Trello

Hoje a sincronização é manual (ou feita por uma sessão do Claude Code com acesso ao Trello, que lê
os quadros e reescreve o JSON). Quando uma nova trilha for detalhada, basta preencher `modulos`
dela no JSON com o mesmo formato da trilha de Angular e trocar `"detalhada"` para `true`.

## Rodar o site só para ver (sem editar)

```bash
python3 -m http.server -d docs 8000
```
