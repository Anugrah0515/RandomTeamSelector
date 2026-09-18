# Face Off

Face Off is a web app that assigns football teams to people in front of a camera. It can use a manually entered team list or load Champions League teams for a selected season, then labels detected faces with unique team assignments.

[View Live Website](https://randomteamselector-frontend.onrender.com)

## Project Structure

```text
RandomTeamSelector/
  frontend/    React + TypeScript + Vite client
  backend/     Express + TypeScript API server
```

### Frontend

The frontend provides:

- Manual team-list entry
- Champions League team lookup by season
- Auto-detect mode, which assigns one team per detected face
- Fixed-count mode, which assigns a chosen number of teams
- Live face detection and simple frame-to-frame face tracking
- Team names or crests rendered over the camera view

Face detection runs in the browser with `face-api.js`. The required model files are already stored in `frontend/public/models/`.

### Backend

The backend keeps the football-data.org API key out of the browser. It exposes a small Express API, calls football-data.org for Champions League teams, and returns the fields used by the frontend.

## Requirements

- Node.js 18 or newer
- npm
- A browser with camera support
- An API token from [football-data.org](https://www.football-data.org/), if using the Champions League lookup

Camera access requires `localhost` or HTTPS.

## Configuration

### Backend environment

Create `backend/.env`:

```env
API_KEY=your_football_data_api_token
FOOTBALL_DATA_API_BASE_URL=https://api.football-data.org/v4
PORT=5000
```

`PORT` defaults to `5000` when it is not set.

### Frontend environment

Create or update `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
PORT=5174
```

- `VITE_API_BASE_URL` is the backend URL used by the browser.
- `PORT` controls the Vite development-server port.

For a deployed backend, set `VITE_API_BASE_URL` to its public URL instead, for example `https://example-backend.onrender.com`.

Environment files may contain secrets and should not be committed.

## Install Dependencies

From the repository root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run Locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:5000` by default.

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The Vite server uses the `PORT` value from `frontend/.env`, normally:

```text
http://localhost:5174
```

Open that URL in a browser and allow camera access when prompted.

## Backend API

### Health check

```http
GET /
```

Returns `Backend is running` when the server is available.

### Load Champions League teams

```http
POST /getTeams
Content-Type: application/json

{"season": 2023}
```

The response has this shape:

```json
{
  "teams": [
    {
      "id": "",
      "name": "",
      "shortName": "",
      "crestUrl": ""
    }
  ]
}
```

The season is the starting year of the competition season, such as `2023` for 2023/24.

## Production Commands

Build the backend and start its compiled output:

```bash
cd backend
npm run build
npm start
```

Build the frontend:

```bash
cd frontend
npm run build
```

Preview the frontend production build locally:

```bash
cd frontend
npm run preview
```

Lint the frontend:

```bash
cd frontend
npm run lint
```

## Face Detection Notes

Detection runs approximately every 200 milliseconds using the Tiny Face Detector. The detector is configured for multiple smaller faces with a larger input size and a lower confidence threshold. Face IDs are kept stable between frames by matching nearby forehead positions, so assignments do not normally flicker as people move.

The browser must be able to load these files from `frontend/public/models/`:

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_tiny_model-weights_manifest.json`
- `face_landmark_68_tiny_model-shard1`
