// The "Discover" lists of Crypton 2.1 -> docs/discover.json (GitHub Pages), every 30 min:
//   memecoins     CoinGecko meme-token category, top 50 by market cap (1 call)
//   trending      CoinGecko /search/trending, the most searched coins today (1 call)
//   newOnSolana   GeckoTerminal trending Solana pools, only tokens 1-14 days old with
//                 at least $50k of liquidity (CTO rule, 23 Oct 2026); free, no key
// Top movers come from markets.json in the app, so they cost nothing here.
// A list that fails keeps its last good value from the file already published.
const https = require('https');
const fs = require('fs');

const KEY = process.env.COINGECKO_DEMO_KEY; // optional secret; works without it
const FILE = './docs/discover.json';
const MIN_LIQUIDITY = 50000;
const MIN_AGE_DAYS = 1, MAX_AGE_DAYS = 14;

function get(url, headers = {}, attempt = 1) {
  return new Promise((resolve, reject) => {
    headers = { 'User-Agent': 'Mozilla/5.0 (compatible; CryptonApp/1.0)', Accept: 'application/json', ...headers };
    https.get(url, { headers }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200) return resolve(JSON.parse(d));
        console.error(url.split('?')[0], 'status', res.statusCode, d.slice(0, 120));
        if (attempt >= 3) return reject(new Error('gave up after ' + attempt + ' tries'));
        setTimeout(() => get(url, headers, attempt + 1).then(resolve, reject), attempt * 15000);
      });
    }).on('error', e => attempt >= 3 ? reject(e) : setTimeout(() => get(url, headers, attempt + 1).then(resolve, reject), attempt * 15000));
  });
}
const gecko = (path) => get('https://api.coingecko.com/api/v3' + path, KEY ? { 'x-cg-demo-api-key': KEY } : {});
const sig = (x) => x == null ? null : Number(Number(x).toPrecision(6));

async function memecoins() {
  const list = await gecko('/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=50&price_change_percentage=24h');
  if (!Array.isArray(list) || list.length < 10) throw new Error('memecoins: unexpected answer');
  return list.map(c => ({ id: c.id, symbol: c.symbol, name: c.name, image: c.image, price: sig(c.current_price),
    change24h: sig(c.price_change_percentage_24h), marketCap: c.market_cap, rank: c.market_cap_rank }));
}

async function trending() {
  const res = await gecko('/search/trending');
  const coins = (res.coins || []).map(x => x.item).filter(Boolean);
  if (coins.length < 5) throw new Error('trending: unexpected answer');
  return coins.map(c => ({ id: c.id, symbol: c.symbol, name: c.name, image: c.large || c.thumb,
    price: sig(c.data && c.data.price), change24h: sig(c.data && c.data.price_change_percentage_24h && c.data.price_change_percentage_24h.usd),
    rank: c.market_cap_rank }));
}

async function newOnSolana() {
  const now = Date.now(), seen = new Set(), out = [];
  for (const page of [1, 2, 3]) {
    const res = await get(`https://api.geckoterminal.com/api/v2/networks/solana/trending_pools?page=${page}&include=base_token`);
    const tokens = new Map((res.included || []).map(t => [t.id, t.attributes]));
    for (const pool of res.data || []) {
      const a = pool.attributes, baseId = pool.relationships && pool.relationships.base_token && pool.relationships.base_token.data.id;
      const token = tokens.get(baseId);
      const liquidity = Number(a.reserve_in_usd || 0);
      const ageDays = (now - Date.parse(a.pool_created_at)) / 86400000;
      if (!token || seen.has(token.address) || liquidity < MIN_LIQUIDITY || !(ageDays >= MIN_AGE_DAYS && ageDays <= MAX_AGE_DAYS)) continue;
      seen.add(token.address);
      out.push({ address: token.address, symbol: token.symbol, name: token.name, image: token.image_url && token.image_url !== 'missing.png' ? token.image_url : null,
        price: sig(a.base_token_price_usd), change24h: sig(a.price_change_percentage && a.price_change_percentage.h24),
        liquidity: Math.round(liquidity), ageDays: Math.round(ageDays * 10) / 10,
        url: `https://www.geckoterminal.com/solana/pools/${a.address}` });
    }
  }
  return out.slice(0, 30);
}

(async () => {
  let old = {};
  try { old = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) {}
  const out = { updated: new Date().toISOString(), rules: { minLiquidityUsd: MIN_LIQUIDITY, ageDays: [MIN_AGE_DAYS, MAX_AGE_DAYS] } };
  let fresh = 0;
  for (const [key, fn] of [['memecoins', memecoins], ['trending', trending], ['newOnSolana', newOnSolana]]) {
    try { out[key] = await fn(); fresh++; console.log(key, out[key].length); }
    catch (e) { console.error(key, 'kept the old list:', e.message); out[key] = old[key] || []; }
  }
  if (!fresh) throw new Error('no list could be refreshed');
  fs.mkdirSync('./docs', { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(out));
})().catch(e => { console.error(e.message); process.exit(1); });
