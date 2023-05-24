import { useControls } from "leva";
import { useEffect, useMemo, useState } from "react";

const MAJOR_NOTES = [
  { note: "C", color: "#845EC2" },
  { note: "D", color: "#2C73D2" },
  { note: "E", color: "#0081CF" },
  { note: "F", color: "#0089BA" },
  { note: "G", color: "#008E9B" },
  { note: "A", color: "#008F7A" },
  { note: "B", color: "#00C9A7" },
] as const;

const MINOR_NOTES = [
  { note: "C#", color: "#845EC2" },
  { note: "D#", color: "#4B4453" },
  { note: "F#", color: "#C34A36" },
  { note: "G#", color: "#FF8066" },
  { note: "A#", color: "#B0A8B9" },
] as const;

type UseTimerProps = {
  bpm: number;
  start: boolean;
};

function useTimer({ bpm, start }: UseTimerProps) {
  const interval = (60 / bpm) * 1000;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      setCount(-1);
      return;
    }
    const id = setInterval(() => {
      setCount((count) => count + 1);
    }, interval);
    return () => clearInterval(id);
  }, [interval, start]);

  return { count };
}

type UseNextNoteProps = {
  scale?: string;
  count: number;
};

function useNextNote({ scale = "major", count }: UseNextNoteProps) {
  const nextNote = useMemo(() => {
    const _getNextNote = () => {
      const notes = scale === "major" ? MAJOR_NOTES : MINOR_NOTES;
      const randomIndex = Math.floor(Math.random() * (notes.length + count));

      return notes[randomIndex % notes.length];
    };

    return _getNextNote();
  }, [count, scale]);

  return nextNote;
}

function useSound({ started, count }: { started: boolean; count: number }) {
  useEffect(() => {
    if (started && count !== -1) {
      const audio = new Audio("/tick.mp3");
      audio.play();
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [started, count]);
}

export function App() {
  const [started, setStarted] = useState(false);

  const { bpm, scale } = useControls({
    bpm: { value: 40, min: 40, max: 180, step: 1 },
    scale: { options: ["major", "minor"] },
  });

  const { count } = useTimer({ bpm, start: started });

  const nextNote = useNextNote({ scale, count });

  useSound({ started, count });

  return (
    <div className="grid h-screen w-screen place-items-center">
      {started && nextNote ? (
        <div className="flex flex-col items-center">
          <div style={{ color: nextNote.color }} className="text-9xl text-blue-600">
            {nextNote.note}
          </div>
          <button
            className="rounded-lg border-2 border-blue-200 p-2 text-blue-400"
            onClick={() => {
              setStarted(false);
            }}
          >
            Stop
          </button>
        </div>
      ) : (
        <button
          className="rounded-lg border-2 border-blue-200 p-2 text-blue-400"
          onClick={() => {
            setStarted(true);
          }}
        >
          Start
        </button>
      )}
    </div>
  );
}
