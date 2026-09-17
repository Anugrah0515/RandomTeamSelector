import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import type { TrackedFace } from '../types';

const DETECT_INTERVAL_MS = 200;
const MATCH_DISTANCE_PX = 80;

/**
 * Runs face detection + landmark extraction against a <video> element on an
 * interval, and keeps a stable id per face by matching each new detection to
 * the closest tracked face from the previous frame. This is simple
 * nearest-centroid tracking — good enough for a handful of mostly-still
 * faces in frame, which is the target use case here.
 */
export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean
) {
  const [faces, setFaces] = useState<TrackedFace[]>([]);
  const nextId = useRef(0);
  const previous = useRef<TrackedFace[]>([]);

  useEffect(() => {
    if (!active) {
      previous.current = [];
      nextId.current = 0;
      setFaces([]);
      return;
    }

    let cancelled = false;
    let timeoutId = 0;
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320 });

    const tick = async () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        const detections = await faceapi
          .detectAllFaces(video, options)
          .withFaceLandmarks(true);

        const detected: TrackedFace[] = detections.map((d) => {
          const box = d.detection.box;
          const points = d.landmarks.positions;
          // Landmarks 17-26 trace the eyebrows; their average sits just
          // below the forehead, which is the point we want to label.
          const browPoints = points.slice(17, 27);
          const browX =
            browPoints.reduce((sum, p) => sum + p.x, 0) / browPoints.length;
          const browY =
            browPoints.reduce((sum, p) => sum + p.y, 0) / browPoints.length;
          const foreheadY = browY - box.height * 0.25;

          return {
            id: -1,
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            foreheadX: browX,
            foreheadY,
          };
        });

        const matched = matchFaces(detected, previous.current, nextId);
        previous.current = matched;
        if (!cancelled) setFaces(matched);
      }
      if (!cancelled) timeoutId = window.setTimeout(tick, DETECT_INTERVAL_MS);
    };

    timeoutId = window.setTimeout(tick, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [active, videoRef]);

  return faces;
}

function matchFaces(
  detected: TrackedFace[],
  previous: TrackedFace[],
  nextId: React.MutableRefObject<number>
): TrackedFace[] {
  const remaining = [...previous];

  return detected.map((face) => {
    let bestIndex = -1;
    let bestDistance = MATCH_DISTANCE_PX;

    remaining.forEach((candidate, index) => {
      const distance = Math.hypot(
        candidate.foreheadX - face.foreheadX,
        candidate.foreheadY - face.foreheadY
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    if (bestIndex >= 0) {
      const [match] = remaining.splice(bestIndex, 1);
      return { ...face, id: match.id };
    }

    const id = nextId.current++;
    return { ...face, id };
  });
}
