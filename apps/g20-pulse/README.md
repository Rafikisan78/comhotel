# G20 Pulse — Actualités quotidiennes des pays du G20

Dashboard automatisé qui agrège quotidiennement les 5 actualités les plus importantes de chaque pays du G20.

## Architecture

```
n8n (CRON 06h UTC) → Claude API (web search) → YouTube API → Supabase → Frontend (Vercel)
```

## Setup

### 1. Supabase
La table `g20_news_cache` est déjà créée dans le projet comhotel.

### 2. n8n — Importer le workflow
1. Ouvrir n8n → Settings → Import Workflow
2. Importer `n8n-workflow-g20-pulse.json`
3. Configurer les credentials :
   - **Anthropic API Key** : Header Auth → `x-api-key` = votre clé Anthropic
   - **YouTube API Key** : Clé API Google Cloud (YouTube Data API v3 activée)
   - **Supabase Service Role Key** : Header Auth → `apikey` = clé service_role Supabase
4. Tester manuellement puis activer le CRON

### 3. Frontend — Déployer sur Vercel
```bash
cd apps/g20-pulse
vercel --prod
```

## Coûts estimés
- Claude API : ~$0.30-0.60/jour (20 pays × ~4K tokens)
- YouTube Data API : gratuit (quota 10K/jour)
- Supabase : gratuit (tier free)
