# Módulo 1 — Jasmine e Karma (fundamentos)

**Prazo:** 28/11/2026 · **Card:** [Testes Angular 1](https://trello.com/c/Aa8Sl1WK/1-testes-angular-1-jasmine-e-karma-fundamentos)

**Objetivo:** dominar TestBed, a sintaxe `describe/it/expect`, spies e mocks; entender o papel do
Karma como runner legado (depreciado a partir do Angular 21).

## Sessão 1 — Ambiente e primeiros specs

- [ ] Criar/abrir um projeto de treino e rodar `ng test`
- [ ] Anatomia de um `.spec.ts`: `describe`, `it`, `beforeEach`
- [ ] Matchers: `toBe`, `toEqual`, `toContain`, `toThrow`
- [ ] Testar uma função/classe pura sem TestBed

Anotações:

## Sessão 2 — TestBed e componentes

- [ ] `TestBed.configureTestingModule` e `createComponent`
- [ ] `fixture`, `detectChanges()` e o ciclo de vida dentro do teste
- [ ] Consultar o DOM com `DebugElement` e `By.css`
- [ ] Testar `@Input`, `@Output` e emissão de eventos

Anotações:

## Sessão 3 — Spies, mocks e assincronia

- [ ] `jasmine.createSpy` e `jasmine.createSpyObj`
- [ ] Substituir dependências por provedores fake no TestBed
- [ ] `fakeAsync` + `tick()` e `waitForAsync` + `whenStable()`
- [ ] Anotar por que o Karma foi depreciado e o que muda com Vitest

Anotações:

## Para lembrar depois

-
