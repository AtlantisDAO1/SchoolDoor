# Environment Variables Setup

## Required for Chatbot (Alfred)

The chatbot requires `ALFRED_CHAT_API_KEY` to function. Without it, users will see "Chat service is unavailable".

### Local Development

Add to `.env.local`:
```
ALFRED_CHAT_API_KEY=your_api_key_here
ALFRED_CHAT_API_URL=https://api.dropchain.ai/gemini/chat  # optional, has default
```

### Production (Docker)

Set the environment variable before starting the container:

```bash
export ALFRED_CHAT_API_KEY=your_api_key_here
cd frontend-nextjs
make prod
```

Or create a `.env.prod` file and source it:
```bash
source .env.prod
make prod
```

### Verification

After setting the key, you can verify it's loaded by checking the container:
```bash
docker exec schooldoor-frontend-prod env | grep ALFRED
```

If the key is missing, the `/api/alfred` endpoint will return:
- Status: 500
- Error: "Chat service is unavailable"

