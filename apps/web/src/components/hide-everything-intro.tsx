import { useEffect, useState } from "react";
import { m } from "../paraglide/messages.js";

const HOLDS = [3000, 2700, 2100];
const FADE = 430;

type Props = {
  onDone: () => void;
  onRelax: () => void;
};

export function HideEverythingIntro({ onDone, onRelax }: Props) {
  const [phase, setPhase] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (phase === HOLDS.length - 1) {
      onRelax();
    }
    const hold = HOLDS[phase];
    const hide = window.setTimeout(() => setShown(false), hold);
    const next = window.setTimeout(() => {
      if (phase + 1 < HOLDS.length) {
        setShown(true);
        setPhase(phase + 1);
      } else {
        onDone();
      }
    }, hold + FADE);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(next);
    };
  }, [phase, onDone, onRelax]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black px-6 text-center">
      <div
        key={phase}
        className={`transition-opacity duration-[430ms] ${shown ? "opacity-100" : "opacity-0"}`}
      >
        {phase === 0 && (
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <span className="pixel-intro-drop block font-black text-7xl text-white uppercase tracking-tight sm:text-9xl">
              {m.ui_fine()}
            </span>
            <span className="pixel-intro-fade-late block font-bold text-white/85 text-xl uppercase tracking-[0.22em] sm:text-3xl">
              {m.ui_you_want_to_hide_everything()}
            </span>
          </div>
        )}
        {phase === 1 && (
          <span className="pixel-intro-fade block max-w-3xl font-black text-3xl text-white uppercase leading-tight tracking-tight sm:text-5xl">
            {m.ui_do_you_know_how_much_time_i_spent_building_all_of_this()}
          </span>
        )}
        {phase === 2 && (
          <span className="pixel-intro-fade block font-black text-5xl text-white uppercase tracking-[0.18em] sm:text-7xl">
            {m.ui_go_and_relax()}
          </span>
        )}
      </div>
    </div>
  );
}
