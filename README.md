# Crypto Data

Public cryptocurrency data cache for [Crypton App](https://github.com/martaGonz/CryptonApp).

## Overview

This repository provides a public, cached data source for cryptocurrency market data. It aggregates data from CoinGecko and serves it via GitHub Pages for fast, reliable access.

### How it works

- **GitHub Actions** runs every 10 minutes (GitHub may delay scheduled runs; real cadence is measured in the commit log)
- Fetches top 250 cryptocurrencies by market cap from CoinGecko
- Filters to include only primary cryptocurrencies (excludes wrapped tokens and derivatives)
- Updates `crypto-data.json` with clean, formatted data
- Data is served via **GitHub Pages** at no cost, with no authentication required

### Files (docs/, served by GitHub Pages)

- `crypto-data.json`: top list, old format (Crypton 2.0.6 and older).
- `markets.json`: same list plus `price_change_percentage_7d` and `sparkline_7d` (56 points, one every 3 h) for the app's mini charts.
- `prices.json`: light file for the widget: `{"t":unix,"p":{"bitcoin":[price,24h%,rank]}}`.
- Made by `scripts/update-markets.js`, one CoinGecko call per run. Optional secret `COINGECKO_DEMO_KEY` (Demo key) avoids 429 from shared GitHub IPs; it works without it.

### URLs

- **API Data**: https://martaGonz.github.io/crypto-data/crypto-data.json
- **Web Dashboard**: https://martaGonz.github.io/crypto-data/

### Data Format

```json
{
  "success": true,
  "timestamp": "2025-10-19T00:00:00Z",
  "count": 100,
  "data": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "id": "bitcoin",
      "current_price": 107400,
      "price_change_percentage_24h": 0.42,
      "market_cap_rank": 1
    }
  ]
}
```

### Features

- ✅ Updated every 5 minutes for fresh data
- ✅ Top 250 cryptocurrencies by market cap
- ✅ Primary coins only (filtered clean data)
- ✅ Real-time prices from CoinGecko
- ✅ 24-hour price changes included
- ✅ Includes web dashboard for viewing data
- ✅ Completely free and open source
- ✅ No authentication or API keys required
- ✅ Globally distributed via GitHub CDN

### License

Public domain - feel free to use this data source!
