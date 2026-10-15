// Top 250 from CoinGecko in ONE call -> three files served by GitHub Pages (docs/):
//   crypto-data.json  old format, no sparkline (Crypton 2.0.6 and older read this one)
//   markets.json      price, 24h %, 7d % and a 7-day mini chart per coin (Crypton 2.0.7 app)
//   prices.json       light: only prices for the widget: {"t":unix,"p":{"bitcoin":[price,24h%,rank]}}
// If CoinGecko says no (429 from a shared GitHub IP), it retries, then leaves the old files alone.
const https = require('https');
const fs = require('fs');

const KEY = process.env.COINGECKO_DEMO_KEY; // optional secret; works without it
const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250'
  + '&sparkline=true&price_change_percentage=24h,7d&precision=full';

function get(attempt = 1) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; CryptonApp/1.0)' };
    if (KEY) headers['x-cg-demo-api-key'] = KEY;
    https.get(url, { headers }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200) return resolve(JSON.parse(d));
        console.error('CoinGecko status', res.statusCode, d.slice(0, 120));
        if (attempt >= 4) return reject(new Error('gave up after ' + attempt + ' tries'));
        setTimeout(() => get(attempt + 1).then(resolve, reject), attempt * 20000);
      });
    }).on('error', e => attempt >= 4 ? reject(e) : setTimeout(() => get(attempt + 1).then(resolve, reject), attempt * 20000));
  });
}

const unwantedIds = ['weth', 'wbtc', 'steth', 'reth', 'wsteth', 'cbeth', 'meth', 'staked-ether', 'etherfi-ether',
  'usdp', 'fei-usd', 'frax', 'lusd', 'synthetix-network-token', 'thorchain-erc20', 'thorchain-rune',
  'terra-luna-classic', 'luna-classic', 'test-coin', 'fake-usdt'];
const unwantedKeywords = ['leveraged-', 'inverse-', 'bear-', 'bull-', '-2x', '-3x', '-5x', '-10x', 'test', 'fake',
  'old coin', 'deprecated', 'wrapped-', 'staked-'];
const keep = (c) => {
  const name = (c.name || '').toLowerCase(), symbol = (c.symbol || '').toLowerCase(), id = (c.id || '').toLowerCase();
  if (unwantedIds.includes(id)) return false;
  if (unwantedKeywords.some(k => name.includes(k) || symbol.includes(k))) return false;
  if (/\d+x\s/i.test(name) || /\d+x\s/i.test(symbol)) return false;
  return true;
};

// 168 hourly points -> 56 (one every 3 h), 5 significant digits, enough for a 70 px line.
const sig = (x) => Number(Number(x).toPrecision(5));
function sparkline(arr) {
  if (!Array.isArray(arr) || arr.length < 8) return [];
  const step = arr.length / 56, out = [];
  for (let i = 0; i < 56; i++) out.push(sig(arr[Math.min(arr.length - 1, Math.floor(i * step))]));
  out[55] = sig(arr[arr.length - 1]);
  return out;
}

(async () => {
  const coins = await get();
  if (!Array.isArray(coins) || coins.length < 100) throw new Error('unexpected answer');
  const list = coins.filter(keep);
  const ts = new Date().toISOString();
  fs.mkdirSync('./docs', { recursive: true });

  fs.writeFileSync('./docs/crypto-data.json', JSON.stringify({
    success: true, timestamp: ts, count: list.length,
    data: list.map((c, i) => ({
      symbol: c.symbol.toUpperCase(), name: c.name, id: c.id, current_price: Number((c.current_price || 0).toPrecision(8)),
      price_change_percentage_24h: c.price_change_percentage_24h, market_cap_rank: i + 1
    }))
  }, null, 2));

  fs.writeFileSync('./docs/markets.json', JSON.stringify({
    success: true, timestamp: ts, count: list.length,
    data: list.map((c, i) => ({
      symbol: c.symbol.toUpperCase(), name: c.name, id: c.id,
      current_price: Number((c.current_price || 0).toPrecision(8)),
      price_change_percentage_24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? null,
      price_change_percentage_7d: c.price_change_percentage_7d_in_currency ?? null,
      market_cap_rank: i + 1,
      sparkline_7d: sparkline(c.sparkline_in_7d && c.sparkline_in_7d.price)
    }))
  }));

  const p = {};
  list.forEach((c, i) => { p[c.id] = [Number((c.current_price || 0).toPrecision(8)),
    Number((c.price_change_percentage_24h ?? 0).toFixed(2)), i + 1]; });
  fs.writeFileSync('./docs/prices.json', JSON.stringify({ t: Math.floor(Date.now() / 1000), p }));
  console.log('OK', list.length, 'coins');
})().catch(e => { console.error('FAILED, old files kept:', e.message); process.exit(1); });
