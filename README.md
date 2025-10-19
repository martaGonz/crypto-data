# Crypto Data

Public cryptocurrency data cache for [Crypton App](https://github.com/martaGonz/CryptonApp).

## Overview

This repository serves as a public data source for the Crypton iOS app, bypassing CoinGecko API rate limits.

### How it works

- **GitHub Actions** runs every 5 minutes
- Fetches top 100 cryptocurrencies from CoinGecko API
- Updates `crypto-data.json` with clean, formatted data
- Data is served via **GitHub Pages** (public, no authentication needed)

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

- ✅ Updated every 5 minutes
- ✅ Top 100 cryptocurrencies by market cap
- ✅ Real-time prices from CoinGecko
- ✅ 24-hour price changes
- ✅ Web dashboard included
- ✅ Zero cost (GitHub Pages + Actions)
- ✅ No authentication required

### License

Public domain - feel free to use this data source!
