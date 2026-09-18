import { useEffect, useRef, useState } from 'react';
import { useFaceApiModels } from '../hooks/useFaceApiModels';
import { useFaceDetection } from '../hooks/useFaceDetection';
import type { Team, SelectionMode, Assignment } from '../types';
import { pickUnique } from '../utils/random';

interface Props {
  teams: Team[];
  mode: SelectionMode;
  fixedCount: number;
}

export function CameraStage({ teams, mode, fixedCount }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 });
  const { ready: modelsReady, error: modelError } = useFaceApiModels();
  const faces = useFaceDetection(videoRef, streaming && modelsReady);

  // faceId -> Team. Decided once per "round" and kept stable while a face
  // keeps tracking, so labels don't flicker or swap between people.
  const [assignedTeams, setAssignedTeams] = useState<Map<number, Team>>(new Map());
  const preassigned = useRef<Team[]>([]);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | undefined;

    async function start() {
      try {
        const nextStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        if (cancelled || !videoRef.current) {
          nextStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = nextStream;
        videoRef.current.srcObject = nextStream;
        await videoRef.current.play();
        if (!cancelled) setStreaming(true);
      } catch (err) {
        if (!cancelled) {
          setCameraError(err instanceof Error ? err.message : 'Could not access the camera.');
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      setStreaming(false);
      videoRef.current?.pause();
      videoRef.current?.removeAttribute('src');
      videoRef.current?.load();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Fixed-count mode: draw the N teams once up front, then hand them out to
  // faces in the order those faces first appear on camera.
  useEffect(() => {
    if (mode === 'fixed-count') {
      preassigned.current = pickUnique(teams, fixedCount);
      setAssignedTeams(new Map());
    }
  }, [mode, fixedCount, teams]);

  useEffect(() => {
    if (mode !== 'fixed-count') return;
    setAssignedTeams((current) => {
      const next = new Map(current);
      let cursor = next.size;
      for (const face of faces) {
        if (next.has(face.id)) continue;
        if (cursor >= preassigned.current.length) break;
        next.set(face.id, preassigned.current[cursor]);
        cursor += 1;
      }
      return next;
    });
  }, [faces, mode]);

  // Auto-detect mode: on demand, count the faces currently in frame and
  // deal out that many unique teams.
  const captureAutoDetect = () => {
    const picks = pickUnique(teams, faces.length);
    const next = new Map<number, Team>();
    faces.forEach((face, index) => next.set(face.id, picks[index]));
    setAssignedTeams(next);
  };

  const assignments: Assignment[] = faces
    .map((face) => {
      const team = assignedTeams.get(face.id);
      return team ? { face, team } : null;
    })
    .filter((a): a is Assignment => a !== null);

  return (
    <div className="camera-stage">
      <div className="camera-stage__frame">
        <video
          ref={videoRef}
          className="camera-stage__video"
          playsInline
          muted
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setVideoSize({
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight,
              });
            }
          }}
        />
        <svg
          className="camera-stage__overlay"
          viewBox={`0 0 ${videoSize.width} ${videoSize.height}`}
          preserveAspectRatio="xMidYMid slice"
        >
          {assignments.map(({ face, team }) => (
            team.crestUrl ? (
              <image
                key={face.id}
                href={team.crestUrl}
                x={face.foreheadX - 28}
                y={face.foreheadY - 56}
                width="200"
                height="200"
                className="camera-stage__crest"
                preserveAspectRatio="xMidYMid meet"
                transform={`translate(${2 * face.foreheadX} 0) scale(-1 1)`}
                role="img"
                aria-label={team.name}
              />
            ) : (
              <text
                key={face.id}
                x={face.foreheadX}
                y={face.foreheadY}
                className="camera-stage__label"
                textAnchor="middle"
                transform={`translate(${2 * face.foreheadX} 0) scale(-1 1)`}
              >
                {team.shortName ?? team.name}
              </text>
            )
          ))}
        </svg>
      </div>

      {cameraError && <p className="camera-stage__error">{cameraError}</p>}
      {modelError && <p className="camera-stage__error">{modelError}</p>}
      {!modelsReady && !modelError && (
        <p className="camera-stage__status">Loading face detection…</p>
      )}

      {mode === 'auto-detect' && (
        <button type="button" className="primary" onClick={captureAutoDetect} disabled={faces.length === 0}>
          {faces.length === 0
            ? 'Waiting for faces…'
            : `Assign ${faces.length} team${faces.length === 1 ? '' : 's'}`}
        </button>
      )}

      {mode === 'fixed-count' && (
        <p className="camera-stage__status">
          {assignedTeams.size} of {fixedCount} teams assigned
        </p>
      )}
    </div>
  );
}
