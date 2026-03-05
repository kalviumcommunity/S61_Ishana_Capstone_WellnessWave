# WellnessWave Client

Frontend app for WellnessWave built with React + Vite.

## Setup

```bash
cd client
npm install
npm run dev
```

Default local URL: `http://localhost:5173`

## Environment Variables

Create a `.env` file inside `client/`:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

`VITE_GOOGLE_CLIENT_ID` must match the backend `GOOGLE_CLIENT_ID` value.
