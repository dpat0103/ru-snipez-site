import { useCallback, useEffect, useRef, useState } from "react";
import stats from "../data/stats.json";
import profile from "../data/profile.json";

type Section = { idx: string; name: string; sec: string };

/* Real sections, taken from the bot's own command screenshots. */
const BOARD: Section[] = [
  { idx: "06843", name: "Introduction to Data Science", sec: "01" },
  { idx: "08524", name: "Minds, Machines, and Persons", sec: "90" },
  { idx: "06812", name: "Principles of Programming Languages", sec: "04" },
  { idx: "06847", name: "Introduction to Artificial Intelligence", sec: "01" },
  { idx: "06845", name: "Introduction to Data Science", sec: "03" },
  { idx: "08525", name: "Minds, Machines, and Persons", sec: "91" },
];

const TARGET = 2; // the row that opens

type Phase = "scan" | "lock" | "hit";

export default function Hero() {
  const [phase, setPhase] = useState<Phase>("scan");
  const [polls, setPolls] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = useCallback(() => {
    clearTimers();
    setPhase("scan");
    timers.current.push(
      window.setTimeout(() => setPhase("lock"), 2600),
      window.setTimeout(() => setPhase("hit"), 3400),
    );
  }, []);

  useEffect(() => {
    run();
    return clearTimers;
  }, [run]);

  /* A poll counter that ticks while scanning. It is the honest visual for
     what the bot spends nearly all of its time doing: finding nothing. */
  useEffect(() => {
    if (phase === "hit") return;
    const id = window.setInterval(
      () => setPolls((n) => n + Math.floor(Math.random() * 40) + 25),
      140,
    );
    return () => clearInterval(id);
  }, [phase]);

  return (
    <header className="hero wrap">
      <div className="hero-grid">
        <div>
          <div className="eyebrow">In production since Dec 2023</div>
          <h1>
            Rutgers won't tell you
            <br />
            when a seat <em>opens.</em>
          </h1>
          <p className="hero-sub">
            RU SnipeZ watches every one of the {stats.headline.sections.display}{" "}
            sections in the Schedule of Classes and messages you the second one
            frees up, with the WebReg link already filled in. Over{" "}
            {stats.headline.students.display} students have used it to build
            their schedules.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={profile.repos.bot.value}>
              View the source
            </a>
            <a className="btn" href="#numbers">
              See the numbers
            </a>
          </div>
          <div className="hero-meta">
            <span>
              <b>Python</b> · discord.py
            </span>
            <span>
              <b>AWS EC2</b> · always on
            </span>
            <span>
              <b>6 semesters</b> · maintained
            </span>
          </div>
        </div>

        <div className="reticle optic">
          <div className="optic-head">
            <span className="dot" />
            <span>Live poll</span>
            <span className="spacer" />
            <span>{polls.toLocaleString()} checks</span>
          </div>

          {BOARD.map((s, i) => {
            const isTarget = i === TARGET && phase !== "scan";
            const isHit = i === TARGET && phase === "hit";
            return (
              <div
                key={s.idx}
                className={`row ${isHit ? "is-hit" : isTarget ? "is-target" : ""}`}
              >
                <span className="bracket l" />
                <span className="idx">{s.idx}</span>
                <span className="name">
                  {s.name} · {s.sec}
                </span>
                <span className={`stat ${isHit ? "stat-open" : "stat-closed"}`}>
                  {isHit ? "OPEN" : "CLOSED"}
                </span>
                <span className="bracket r" />
              </div>
            );
          })}

          <div className="optic-out" aria-live="polite">
            {phase === "hit" ? (
              <div className="dm">
                <div className="dm-top">
                  <span>◆</span> Direct message · RU SnipeZ
                </div>
                <div className="dm-title">
                  Principles of Programming Languages 04 is open
                </div>
                <div className="dm-line">
                  Index 06812 · last open 4 days ago · detected in 0.4s
                </div>
                <span className="dm-link">Open WebReg with index 06812 →</span>
              </div>
            ) : (
              <div className="optic-idle">
                {phase === "lock"
                  ? "Change detected on index 06812…"
                  : "No openings. Polling."}
              </div>
            )}
          </div>

          <button className="replay" onClick={run}>
            ↻ Replay
          </button>
        </div>
      </div>
    </header>
  );
}
