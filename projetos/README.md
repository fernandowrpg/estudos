# Projetos

O código que eu escrevo durante os cursos mora aqui, um diretório por trilha e um subdiretório
por projeto:

```
projetos/<trilha>/<nn-nome-do-projeto>/
```

O número da frente é o módulo da trilha a que o projeto pertence, para a pasta ficar na mesma
ordem do painel.

## Convenções

- Cada projeto é **autocontido**: tem o próprio `package.json` e roda sozinho, sem workspace
  nem ferramenta de monorepo. Nada no raiz do repositório instala dependências.
- Cada projeto começa com um `README.md` que diz o que ele é, como rodar e o que eu aprendi ali.
  Há um modelo em `MODELO.md`.
- `node_modules/`, `dist/`, `coverage/` e `.angular/` já estão no `.gitignore` do repositório —
  não precisa de `.gitignore` por projeto.
- Código de trabalho não entra aqui. Projetos que aplicam o estudo em sistemas internos ficam
  nos repositórios deles; aqui fica só a anotação do que foi feito.

## Começar um projeto novo

```bash
cd projetos/testes-angular/01-jasmine-karma
ng new app --directory . --skip-git
cp ../../MODELO.md README.md
```

O `--skip-git` importa: sem ele o Angular CLI cria um repositório git aninhado e o conteúdo
não é versionado junto com este repositório.
