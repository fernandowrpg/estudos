# Módulo 2 — Jest

**Prazo:** 05/12/2026 · **Card:** [Testes Angular 2](https://trello.com/c/BPsgQXJO/2-testes-angular-2-jest)

**Objetivo:** configurar Jest num projeto Angular e testar serviços, componentes e interceptors.

## Sessão 1 — Trocar Karma por Jest

- [ ] Instalar `jest`, `jest-preset-angular` e os tipos
- [ ] `setup-jest.ts`, `jest.config.ts` e ajustes no `tsconfig.spec.json`
- [ ] Remover Karma/`karma.conf` e ajustar os scripts do `package.json`
- [ ] Rodar a suíte existente no Jest e corrigir o que quebrar

Anotações:

## Sessão 2 — Serviços, HTTP e interceptors

- [ ] Serviço com `provideHttpClientTesting` + `HttpTestingController`
- [ ] `expectOne`, `flush`, `verify` e cenários de erro (500, timeout)
- [ ] Testar um interceptor funcional (token, retry, erro)

Anotações:

## Sessão 3 — Componentes no Jest e comparação

- [ ] `jest.fn()`, `jest.spyOn()` e módulos mockados
- [ ] Snapshots: quando ajudam e quando viram ruído
- [ ] Tabela Jasmine/Karma × Jest × Vitest

| | Jasmine + Karma | Jest | Vitest |
|---|---|---|---|
| Onde roda | navegador real | jsdom | jsdom / navegador |
| Velocidade | | | |
| Status no Angular | legado (dep. no 21+) | comunidade | padrão no 21+ |
| Observação | | | |

Anotações:
