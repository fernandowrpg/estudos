const FONTE = 'dados/trilhas.json';
const CICLO = ['a-fazer', 'em-andamento', 'concluido'];

const STATUS = {
  'a-fazer':      { rotulo: 'A fazer',      classe: '' },
  'em-andamento': { rotulo: 'Em andamento', classe: 'doing' },
  'concluido':    { rotulo: 'Concluído',    classe: 'done' }
};

let dados = null;
let editavel = false;

/* ---------- utilidades ---------- */

function el(tag, props = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'onclick') n.addEventListener('click', v);
    else if (v != null) n.setAttribute(k, v);
  }
  n.append(...filhos.filter(Boolean));
  return n;
}

const fmtData = iso => {
  if (!iso) return null;
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

const hoje = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD local

/* texto com `trechos de codigo` entre crases */
function textoRico(txt) {
  const frag = document.createDocumentFragment();
  txt.split(/`([^`]+)`/).forEach((parte, i) => {
    if (!parte) return;
    frag.append(i % 2 ? el('code', { text: parte }) : document.createTextNode(parte));
  });
  return frag;
}

function progressoModulo(mod) {
  const itens = (mod.sessoes || []).flatMap(s => s.itens || []);
  return { feitos: itens.filter(i => i.feito).length, total: itens.length };
}

function progressoTrilha(trilha) {
  return (trilha.modulos || []).reduce((acc, m) => {
    const p = progressoModulo(m);
    return { feitos: acc.feitos + p.feitos, total: acc.total + p.total };
  }, { feitos: 0, total: 0 });
}

const pct = ({ feitos, total }) => total ? Math.round((feitos / total) * 100) : 0;

function barra(p) {
  const v = pct(p);
  const el_ = el('div', {
    class: 'bar' + (v === 100 ? ' full' : ''),
    role: 'progressbar', 'aria-valuenow': String(v),
    'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': `${v}% concluído`
  }, el('i'));
  el_.firstChild.style.width = v + '%';
  return el_;
}

function badge(status, aoClicar) {
  const s = STATUS[status] || STATUS['a-fazer'];
  if (!aoClicar || !editavel) return el('span', { class: 'badge ' + s.classe, text: s.rotulo });
  return el('button', {
    type: 'button', class: 'badge editavel ' + s.classe, text: s.rotulo,
    title: 'Clique para mudar o status', onclick: aoClicar
  });
}

/* ---------- carregar e salvar ---------- */

async function carregar() {
  const r = await fetch(FONTE, { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function verificarEdicao() {
  try {
    const r = await fetch('api/modo', { cache: 'no-store' });
    return r.ok && (await r.json()).editavel === true;
  } catch { return false; }
}

let salvando = null;
async function salvar() {
  dados.atualizadoEm = hoje();
  avisar('salvando…');
  try {
    salvando = fetch('api/trilhas', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const r = await salvando;
    if (!r.ok) throw new Error('HTTP ' + r.status);
    avisar('salvo em docs/dados/trilhas.json', 'ok');
  } catch {
    avisar('não foi possível salvar — o servidor local está rodando?', 'erro');
  }
}

let timerAviso;
function avisar(texto, tipo = '') {
  let caixa = document.getElementById('aviso');
  if (!caixa) {
    caixa = el('div', { id: 'aviso', class: 'aviso', role: 'status', 'aria-live': 'polite' });
    document.body.append(caixa);
  }
  caixa.textContent = texto;
  caixa.className = 'aviso visivel ' + tipo;
  clearTimeout(timerAviso);
  if (tipo) timerAviso = setTimeout(() => caixa.classList.remove('visivel'), 2600);
}

/* ---------- mudanças de estado ---------- */

// Ao marcar o primeiro item, o módulo entra em andamento; ao marcar todos, conclui.
// O status continua editável no clique do selo.
function ajustarStatusAutomatico(trilha, mod) {
  const p = progressoModulo(mod);
  if (p.total) {
    if (p.feitos === p.total) mod.status = 'concluido';
    else if (p.feitos > 0) mod.status = 'em-andamento';
    else mod.status = 'a-fazer';
  }
  const pt = progressoTrilha(trilha);
  const todosConcluidos = (trilha.modulos || []).every(m => m.status === 'concluido');
  if (todosConcluidos && trilha.modulos.length) trilha.status = 'concluido';
  else if (pt.feitos > 0) trilha.status = 'em-andamento';
}

function alternarItem(trilha, mod, item) {
  item.feito = !item.feito;
  ajustarStatusAutomatico(trilha, mod);
  renderTrilha();
  salvar();
}

function ciclarStatus(alvo, trilha) {
  alvo.status = CICLO[(CICLO.indexOf(alvo.status) + 1) % CICLO.length];
  if (alvo !== trilha) {
    const pt = progressoTrilha(trilha);
    if (trilha.status === 'a-fazer' && (pt.feitos || alvo.status !== 'a-fazer')) trilha.status = 'em-andamento';
  }
  renderTrilha();
  salvar();
}

/* ---------- painel ---------- */

function renderPainel() {
  const alvo = document.getElementById('conteudo');
  const trilhas = dados.trilhas || [];
  const geral = trilhas.reduce((acc, t) => {
    const p = progressoTrilha(t);
    return { feitos: acc.feitos + p.feitos, total: acc.total + p.total };
  }, { feitos: 0, total: 0 });

  const stat = (num, lbl) => el('div', { class: 'stat' },
    el('span', { class: 'num', text: num }), el('span', { class: 'lbl', text: lbl }));

  const stats = el('section', { class: 'overview' },
    stat(String(trilhas.length), 'trilhas'),
    stat(String(trilhas.filter(t => t.status === 'em-andamento').length), 'em andamento'),
    stat(`${geral.feitos}/${geral.total}`, 'itens feitos'),
    stat(pct(geral) + '%', 'progresso'));

  const lista = el('section');
  for (const t of trilhas) {
    const p = progressoTrilha(t);
    const topo = el('div', { class: 'row' }, el('h3', { text: t.nome }), badge(t.status));
    if (t.detalhada) topo.append(el('span', { class: 'pct', text: `${p.feitos}/${p.total} · ${pct(p)}%` }));

    const meta = el('div', { class: 'meta' });
    if (t.cargaSemanal) meta.append(el('span', { text: t.cargaSemanal }));
    if (t.inicio || t.fim) meta.append(el('span', { text: [fmtData(t.inicio), fmtData(t.fim)].filter(Boolean).join(' → ') }));
    meta.append(el('span', { text: t.detalhada ? `${(t.modulos || []).length} módulos` : 'ainda não detalhada' }));

    const corpo = [topo, el('p', { class: 'desc', text: t.resumo }), t.detalhada ? barra(p) : null, meta];
    lista.append(t.detalhada
      ? el('a', { class: 'card', href: `trilha.html?id=${encodeURIComponent(t.id)}` }, ...corpo)
      : el('div', { class: 'card' }, ...corpo));
  }

  alvo.replaceChildren(stats, el('h2', { text: 'Trilhas' }), lista);
  rodape();
}

/* ---------- detalhe da trilha ---------- */

function renderTrilha() {
  const id = new URLSearchParams(location.search).get('id');
  const t = (dados.trilhas || []).find(x => x.id === id);
  if (!t) return erro('Trilha não encontrada. Volte ao painel.');

  document.title = `${t.nome} · Estudos`;
  const p = progressoTrilha(t);

  const cab = el('section', {},
    el('div', { class: 'row' }, el('h2', { text: t.nome }), badge(t.status, () => ciclarStatus(t, t))),
    el('p', { class: 'lead', text: t.resumo }),
    barra(p),
    el('div', { class: 'meta' },
      el('span', { text: `${p.feitos}/${p.total} itens · ${pct(p)}%` }),
      t.cargaSemanal ? el('span', { text: t.cargaSemanal }) : null,
      (t.inicio || t.fim) ? el('span', { text: [fmtData(t.inicio), fmtData(t.fim)].filter(Boolean).join(' → ') }) : null,
      t.trelloUrl ? el('a', { href: t.trelloUrl, rel: 'noopener' }, document.createTextNode('quadro no Trello ↗')) : null));

  const mods = el('section');
  for (const m of t.modulos || []) {
    const pm = progressoModulo(m);
    const box = el('article', { class: 'module' },
      el('div', { class: 'head' },
        el('h3', { text: m.titulo }),
        badge(m.status, () => ciclarStatus(m, t)),
        el('span', { class: 'pct', text: `${pm.feitos}/${pm.total}` })),
      barra(pm));

    if (m.objetivo) box.append(el('p', { class: 'obj', text: m.objetivo }));

    for (const s of m.sessoes || []) {
      const ul = el('ul', { class: 'items' });
      for (const it of s.itens || []) {
        const marca = el('span', { class: 'box', 'aria-hidden': 'true', text: it.feito ? '✔' : '○' });
        const texto = el('span', { class: 'txt' }, textoRico(it.texto));
        ul.append(el('li', { class: it.feito ? 'done' : '' },
          editavel
            ? el('button', {
                type: 'button', class: 'item', 'aria-pressed': String(!!it.feito),
                onclick: () => alternarItem(t, m, it)
              }, marca, texto)
            : el('span', { class: 'item' }, marca, texto)));
      }
      box.append(el('div', { class: 'session' }, el('h4', { text: s.titulo }), ul));
    }

    const extras = el('ul', { class: 'links' });
    for (const r of m.recursos || []) {
      extras.append(el('li', {}, el('a', { href: r.url, rel: 'noopener' }, document.createTextNode(r.titulo))));
    }
    if (m.notas) extras.append(el('li', {}, el('a', {
      href: `https://github.com/fernandowrpg/estudos/blob/main/${m.notas}`, rel: 'noopener'
    }, document.createTextNode('minhas anotações'))));
    if (m.projeto) extras.append(el('li', {}, el('a', {
      href: `https://github.com/fernandowrpg/estudos/tree/main/${m.projeto}`, rel: 'noopener'
    }, document.createTextNode('código do projeto'))));
    if (m.trelloUrl) extras.append(el('li', {}, el('a', {
      href: m.trelloUrl, rel: 'noopener'
    }, document.createTextNode('card no Trello'))));
    if (extras.childElementCount) box.append(extras);

    if (m.prazo) box.append(el('div', { class: 'meta' }, el('span', { text: 'prazo: ' + fmtData(m.prazo) })));
    mods.append(box);
  }

  document.getElementById('conteudo').replaceChildren(cab, el('h2', { text: 'Módulos' }), mods);
  rodape();
}

function rodape() {
  const f = document.getElementById('rodape');
  if (f) f.textContent = `Dados atualizados em ${fmtData(dados.atualizadoEm)}.`;
}

function erro(msg) {
  document.getElementById('conteudo').replaceChildren(el('p', { class: 'empty', text: msg }));
}

/* ---------- tema ---------- */

(function tema() {
  const salvo = (() => { try { return localStorage.getItem('tema'); } catch { return null; } })();
  if (salvo) document.documentElement.dataset.theme = salvo;
  document.addEventListener('click', e => {
    if (!e.target.closest('button.theme')) return;
    const atual = document.documentElement.dataset.theme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const novo = atual === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem('tema', novo); } catch {}
  });
})();

/* ---------- início ---------- */

const modo = document.body.dataset.pagina;

(async () => {
  try {
    [dados, editavel] = await Promise.all([carregar(), verificarEdicao()]);
  } catch {
    return erro('Não foi possível carregar dados/trilhas.json.');
  }
  if (editavel) {
    document.body.classList.add('edicao');
    const faixa = document.getElementById('faixa-modo');
    if (faixa) faixa.textContent = modo === 'trilha'
      ? 'modo de edição · clique nos itens e nos selos de status'
      : 'modo de edição · abra uma trilha para marcar itens';
  }
  modo === 'trilha' ? renderTrilha() : renderPainel();
})();
