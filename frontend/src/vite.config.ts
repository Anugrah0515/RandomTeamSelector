import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No proxy needed here — the frontend calls the standalone
// ucl-teams-backend service directly (see VITE_API_BASE_URL in .env),
// which handles CORS and the API key on its own.
export default defineConfig({
  plugins: [react()],
});
