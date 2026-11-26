# Jay 2.5

Personal AI assistant. Node 18+, no dependencies.

## Run locally
```bash
API_KEY=sk-... node server.js
# then open http://localhost:3000
```

Or copy `.env.example` to `.env` and fill in `API_KEY`.

## Free API — no card needed
Jay 2.5 accepts any OpenAI-compatible API, so it can run free on OpenRouter:
1. Sign up at https://openrouter.ai (Google, GitHub or email — no credit card asked).
2. Create a key at https://openrouter.ai/keys.
3. In `.env` set `BASE_URL=https://openrouter.ai/api/v1` and `MODEL=openrouter/free`
   (auto-picks a free model; free tier is 50 requests/day, 20/minute).
4. Run `node server.js` and open http://localhost:3000 — then paste the key to Muse
   (secure storage) and Muse will test a real chat reply.
Note: free models may log prompts per the provider's policy, so don't send
private data through them. The paid OpenAI route is `BASE_URL=https://api.openai.com/v1`,
`MODEL=gpt-4o-mini`, key from https://platform.openai.com/api-keys (needs a card).

## Deploy to Vercel — get a link
Yes, it can live on Vercel and be used as a link. The project is already Vercel-ready (`vercel.json`, `api/index.js`, `public/index.html` — tested locally: page 200, /memory 200, /chat reaches the model API).
1. Push `workspace/jay-2-5/` to a GitHub repo, or run `vercel` in that folder and import it at vercel.com.
2. In Vercel, Project Settings → Environment Variables, add:
   - `API_KEY` = your OpenRouter key (starts `sk-or-`, from openrouter.ai/keys)
   - `BASE_URL` = `https://openrouter.ai/api/v1`
   - `MODEL` = `openrouter/free`
3. Deploy. You get a link like `https://jay-2-5.vercel.app` — open it on your phone, chat, done. No card needed for the free OpenRouter tier (50 requests/day).
Note: memory on Vercel is stored in `/tmp`, so saved memories do not last between deploys. Chat itself works fine. Muse's Vercel connection is not linked here yet, so I cannot deploy it for you from here — you deploy it from your Vercel account, or connect Vercel and tell me.

## Deploy
- Vercel / Railway / Render: set env vars `API_KEY`, `BASE_URL` (optional), `MODEL` (optional, default `gpt-4o-mini`), `PORT`.
- The API key is only used server-side to call the model. Never put it in index.html.

## Endpoints
- `GET /` — chat UI
- `POST /chat` — `{ history: [{role, content}] }` → `{ reply }`
- `GET /memory` — saved memory notes (memory.json)
