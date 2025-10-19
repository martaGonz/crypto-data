# Crypto Data

Public cryptocurrency data cache for [Crypton App](https://github.com/martaGonz/CryptonApp).

## Overview

This repository provides a public, cached data source for cryptocurrency market data. It aggregates data from CoinGecko and serves it via GitHub Pages for fast, reliable access.

### How it works

- **GitHub Actions** runs every 5 minutes
- Fetches top 250 cryptocurrencies by market cap from CoinGecko
- Filters to include only primary cryptocurrencies (excludes wrapped tokens and derivatives)
- Updates `crypto-data.json` with clean, formatted data
- Data is served via **GitHub Pages** at no cost, with no authentication required

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
