#!/usr/bin/env node
// Servidor local de edição: serve docs/ e grava docs/dados/trilhas.json
// quando a página salva. Sem dependências — node scripts/servidor.mjs
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DOCS = join(RAIZ, 'docs');
const DADOS = join(DOCS, 'dados', 'trilhas.json');
const PORTA = Number(process.env.PORTA || 4321);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const json = (res, codigo, corpo) => {
  const texto = JSON.stringify(corpo);
  res.writeHead(codigo, { 'content-type': TIPOS['.json'], 'content-length': Buffer.byteLength(texto) });
  res.end(texto);
};

async function corpoDaRequisicao(req, limite = 5_000_000) {
  const partes = [];
  let total = 0;
  for await (const parte of req) {
    total += parte.length;
    if (total > limite) throw new Error('corpo grande demais');
    partes.push(parte);
  }
  return Buffer.concat(partes).toString('utf8');
}

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const caminho = decodeURIComponent(url.pathname);

  // a página pergunta se pode salvar
  if (caminho === '/api/modo') return json(res, 200, { editavel: true });

  // a página salva o estado
  if (caminho === '/api/trilhas' && req.method === 'PUT') {
    try {
      const dados = JSON.parse(await corpoDaRequisicao(req));
      if (!Array.isArray(dados.trilhas)) throw new Error('formato inesperado');
      await writeFile(DADOS, JSON.stringify(dados, null, 2) + '\n', 'utf8');
      console.log(`salvo ${new Date().toLocaleTimeString('pt-BR')} — docs/dados/trilhas.json`);
      return json(res, 200, { ok: true });
    } catch (e) {
      return json(res, 400, { ok: false, erro: String(e.message || e) });
    }
  }

  // arquivos estáticos de docs/
  const relativo = normalize(caminho === '/' ? '/index.html' : caminho).replace(/^(\.\.[/\\])+/, '');
  const arquivo = join(DOCS, relativo);
  if (!arquivo.startsWith(DOCS)) return json(res, 403, { erro: 'fora de docs/' });

  try {
    const conteudo = await readFile(arquivo);
    res.writeHead(200, {
      'content-type': TIPOS[extname(arquivo)] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    res.end(conteudo);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('não encontrado');
  }
});

servidor.listen(PORTA, '127.0.0.1', () => {
  console.log(`\n  Estudos em modo de edição\n  http://localhost:${PORTA}\n`);
  console.log('  Clique nos itens para marcar. Cada clique grava o JSON.');
  console.log('  Ctrl+C para sair.\n');
});
