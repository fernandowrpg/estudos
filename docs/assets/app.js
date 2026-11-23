const FONTE = 'dados/trilhas.json';

const STATUS = {
  'a-fazer':     { rotulo: 'A fazer',     classe: '' },
  'em-andamento':{ rotulo: 'Em andamento', classe: 'doing' },
  'concluido':   { rotulo: 'Concluído',   classe: 'done' }
};

const fmtData = iso => {
  if (!iso) return null;
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

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
  const el = document.createElement('div');
  el.className = 'bar' + (v === 100 ? ' full' : '');
  el.setAttribute('role', 'progressbar');
  el.setAttribute('aria-valuenow', String(v));
  el.setAttribute('aria-valuemin', '0');
  el.setAttribute('aria-valuemax', '100');
  el.setAttribute('aria-label', `${v}% concluído`);
  const i = document.createElement('i');
  i.style.width = v + '%';
  el.append(i);
  return el;
}

function badge(status) {
  const s = STATUS[status] || STATUS['a-fazer'];
  const el = document.createElement('span');
  el.className = 'badge ' + s.classe;
  el.textContent = s.rotulo;
  return el;
}

function el(tag, props = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (v != null) n.setAttribute(k, v);
  }
  n.append(...filhos.filter(Boolean));
  return n;
}

/* texto com `trechos de codigo` entre crases */
function textoRico(txt) {
  const frag = document.createDocumentFragment();
  txt.split(/`([^`]+)`/).forEach((parte, i) => {
    if (!parte) return;
    frag.append(i % 2 ? el('code', { text: parte }) : document.createTextNode(parte));
  });
  return frag;
}

function erro(msg) {
  document.getElementById('conteudo').replaceChildren(el('p', { class: 'empty', text: msg }));
}

async function carregar() {
  const r = await fetch(FONTE, { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

/* ---------- painel (index) ---------- */

function renderPainel(dados) {
  const alvo = document.getElementById('conteudo');
  const trilhas = dados.trilhas || [];
  const geral = trilhas.reduce((acc, t) => {
    const p = progressoTrilha(t);
    return { feitos: acc.feitos + p.feitos, total: acc.total + p.total };
  }, { feitos: 0, total: 0 });

  const stats = el('section', { class: 'overview' },
    el('div', { class: 'stat' }, el('span', { class: 'num', text: String(trilhas.length) }), el('span', { class: 'lbl', text: 'trilhas' })),
    el('div', { class: 'stat' }, el('span', { class: 'num', text: String(trilhas.filter(t => t.status === 'em-andamento').length) }), el('span', { class: 'lbl', text: 'em andamento' })),
    el('div', { class: 'stat' }, el('span', { class: 'num', text: `${geral.feitos}/${geral.total}` }), el('span', { class: 'lbl', text: 'itens feitos' })),
    el('div', { class: 'stat' }, el('span', { class: 'num', text: pct(geral) + '%' }), el('span', { class: 'lbl', text: 'progresso' }))
  );

  const lista = el('section');
  for (const t of trilhas) {
    const p = progressoTrilha(t);
    const topo = el('div', { class: 'row' }, el('h3', { text: t.nome }), badge(t.status));
    if (t.detalhada) topo.append(el('span', { class: 'pct', text: `${p.feitos}/${p.total} · ${pct(p)}%` }));

    const meta = el('div', { class: 'meta' });
    if (t.cargaSemanal) meta.append(el('span', { text: t.cargaSemanal }));
    if (t.inicio || t.fim) meta.append(el('span', { text: [fmtData(t.inicio), fmtData(t.fim)].filter(Boolean).join(' → ') }));
    meta.append(el('span', { text: t.detalhada ? `${(t.modulos || []).length} módulos` : 'ainda não detalhada' }));

    const corpo = [
      topo,
      el('p', { class: 'desc', text: t.resumo }),
      t.detalhada ? barra(p) : null,
      meta
    ];

    lista.append(t.detalhada
      ? el('a', { class: 'card', href: `trilha.html?id=${encodeURIComponent(t.id)}` }, ...corpo)
      : el('div', { class: 'card' }, ...corpo));
  }

  alvo.replaceChildren(stats, el('h2', { text: 'Trilhas' }), lista);
  rodape(dados);
}

/* ---------- detalhe da trilha ---------- */

function renderTrilha(dados) {
  const id = new URLSearchParams(location.search).get('id');
  const t = (dados.trilhas || []).find(x => x.id === id);
  if (!t) return erro('Trilha não encontrada. Volte ao painel.');

  document.title = `${t.nome} · Estudos`;
  const p = progressoTrilha(t);

  const cab = el('section', {},
    el('div', { class: 'row' }, el('h2', { text: t.nome }), badge(t.status)),
    el('p', { class: 'lead', text: t.resumo }),
    barra(p),
    el('div', { class: 'meta' },
      el('span', { text: `${p.feitos}/${p.total} itens · ${pct(p)}%` }),
      t.cargaSemanal ? el('span', { text: t.cargaSemanal }) : null,
      (t.inicio || t.fim) ? el('span', { text: [fmtData(t.inicio), fmtData(t.fim)].filter(Boolean).join(' → ') }) : null,
      t.trelloUrl ? el('a', { href: t.trelloUrl, rel: 'noopener' }, document.createTextNode('quadro no Trello ↗')) : null
    )
  );

  const mods = el('section');
  for (const m of t.modulos || []) {
    const pm = progressoModulo(m);
    const head = el('div', { class: 'head' }, el('h3', { text: m.titulo }), badge(m.status),
      el('span', { class: 'pct', text: `${pm.feitos}/${pm.total}` }));

    const box = el('article', { class: 'module' }, head, barra(pm));
    if (m.objetivo) box.append(el('p', { class: 'obj', text: m.objetivo }));

    for (const s of m.sessoes || []) {
      const ul = el('ul', { class: 'items' });
      for (const it of s.itens || []) {
        ul.append(el('li', { class: it.feito ? 'done' : '' },
          el('span', { class: 'box', 'aria-hidden': 'true', text: it.feito ? '✔' : '○' }),
          el('span', { class: 'txt' }, textoRico(it.texto))));
      }
      box.append(el('div', { class: 'session' }, el('h4', { text: s.titulo }), ul));
    }

    const extras = el('ul', { class: 'links' });
    for (const r of m.recursos || []) {
      extras.append(el('li', {}, el('a', { href: r.url, rel: 'noopener' }, document.createTextNode(r.titulo))));
    }
    if (m.notas) {
      extras.append(el('li', {}, el('a', { href: `https://github.com/fernandowrpg/estudos/blob/main/${m.notas}`, rel: 'noopener' }, document.createTextNode('minhas anotações'))));
    }
    if (m.trelloUrl) {
      extras.append(el('li', {}, el('a', { href: m.trelloUrl, rel: 'noopener' }, document.createTextNode('card no Trello'))));
    }
    if (extras.childElementCount) box.append(extras);

    const meta = el('div', { class: 'meta' });
    if (m.prazo) meta.append(el('span', { text: 'prazo: ' + fmtData(m.prazo) }));
    if (meta.childElementCount) box.append(meta);

    mods.append(box);
  }

  document.getElementById('conteudo').replaceChildren(cab, el('h2', { text: 'Módulos' }), mods);
  rodape(dados);
}

function rodape(dados) {
  const f = document.getElementById('rodape');
  if (f) f.textContent = `Dados sincronizados do Trello em ${fmtData(dados.atualizadoEm)}.`;
}

/* ---------- tema ---------- */

(function tema() {
  const salvo = (() => { try { return localStorage.getItem('tema'); } catch { return null; } })();
  if (salvo) document.documentElement.dataset.theme = salvo;
  document.addEventListener('click', e => {
    const btn = e.target.closest('button.theme');
    if (!btn) return;
    const atual = document.documentElement.dataset.theme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const novo = atual === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem('tema', novo); } catch {}
  });
})();

const modo = document.body.dataset.pagina;
carregar()
  .then(d => modo === 'trilha' ? renderTrilha(d) : renderPainel(d))
  .catch(() => erro('Não foi possível carregar dados/trilhas.json.'));
