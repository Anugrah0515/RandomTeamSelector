import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

// Model weight files must be copied into public/models — see the README.
const MODEL_URL = '/models';

let modelsPromise: Promise<void> | null = null;

function loadModels(): Promise<void> {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    ]).then(() => undefined).catch((error) => {
      modelsPromise = null;
      throw new Error(
        `Face detection models could not be loaded from ${MODEL_URL}. ` +
          'Add the face-api model manifest and weight files to frontend/public/models.',
        { cause: error },
      );
    });
  }
  return modelsPromise;
}

/** Loads the tiny face detector + landmark models once, app-wide. */
export function useFaceApiModels() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadModels()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load face detection models.'
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error };
}
