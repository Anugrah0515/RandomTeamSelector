# Face Off — random team picker

React + TypeScript frontend that:

1. Takes a list of teams (typed in by hand, or fetched for a given
   Champions League season).
2. Opens the camera and, in **auto-detect** mode, counts the faces in
   frame and hands out that many unique teams.
3. In **fixed-count** mode, you set the number of teams yourself up
   front, and the camera skips face-counting — it just labels each
   face's forehead with its assigned team.
4. Draws the team name right on each detected forehead, tracked live as
   people move.

## Project layout

```
src/
  types.ts                     shared TypeScript types
  utils/random.ts               shuffle + pick-unique-teams helpers
  api/uclApi.ts                 fetches UCL teams for a season
  hooks/useFaceApiModels.ts     loads the face-api.js models once
  hooks/useFaceDetection.ts     detection loop + simple frame-to-frame tracking
  components/TeamSourceForm.tsx manual list vs. UCL season picker
  components/ModeSelector.tsx   auto-detect vs. fixed-count toggle
  components/CameraStage.tsx    video feed, overlay, and assignment logic
  App.tsx                       wires the three steps together
  App.css                       styling
```

## Setup

1. Scaffold a project if you don't have one yet:
   ```
   npm create vite@latest face-off -- --template react-ts
   cd face-off
   ```
2. Copy everything in `src/` from this download into your project's
   `src/`, overwriting the default files.
3. Install the one runtime dependency this uses for face detection:
   ```
   npm install face-api.js
   ```
4. Download the model weights and place them in `public/models/`. The
   quickest way is to grab the `weights` folder from the face-api.js repo:
   `https://github.com/justadudewhohacks/face-api.js/tree/master/weights` —
   you need at minimum `tiny_face_detector_model-*` and
   `face_landmark_68_tiny_model-*`.
5. Run it:
   ```
   npm run dev
   ```
   Camera access requires either `localhost` or HTTPS — browsers block
   `getUserMedia` on plain HTTP for any other host.

## Champions League team lookup

The "Champions League season" tab gets its data from a separate,
standalone service — **`ucl-teams-backend`** — not from football-data.org
directly. That service holds the API key and handles CORS server-side;
this frontend just calls it like any other JSON API.

1. Set up and run `ucl-teams-backend` (see its own README) — by default
   it listens on `http://localhost:4000`.
2. Copy `.env.example` to `.env` here and point `VITE_API_BASE_URL` at
   wherever that service is running.
3. That's it — `TeamSourceForm` → `fetchUclTeamsBySeason` in
   `src/api/uclApi.ts` calls `${VITE_API_BASE_URL}/api/ucl-teams?season=...`.

When you deploy this frontend, set `VITE_API_BASE_URL` to the deployed
backend's real URL, and make sure that backend's `FRONTEND_ORIGIN` env
var matches this app's deployed origin (so its CORS allowlist lets it
through).

## Notes on the face tracking

Detection re-runs every 200ms and matches each new face to the closest
one from the previous frame (by forehead position) so a person keeps
the same team label as they move, rather than getting reassigned every
frame. It's deliberately simple — good for a few people standing loosely
still in frame, not built for fast motion or crowds.
