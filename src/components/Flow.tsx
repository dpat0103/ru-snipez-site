import stats from "../data/stats.json";

const USAGE = new Map(
  stats.commandUsage.data.map((c) => [c.command, c.count])
);

const STEPS = [
  {
    n: "Step 01",
    h: "Add a section",
    p: "Run /snipe with the index number from the Schedule of Classes. The bot confirms the course and section it matched, so a mistyped index gets caught immediately.",
  },
  {
    n: "Step 02",
    h: "The bot watches",
    p: "Every section in the catalog is polled continuously against the Rutgers API. Your list is stored against your Discord account and survives restarts.",
  },
  {
    n: "Step 03",
    h: "A seat frees up",
    p: "The moment a section flips from closed to open, the change is detected and a direct message goes out. No server channel, no @everyone, just you.",
  },
  {
    n: "Step 04",
    h: "You register",
    p: "The message carries a WebReg link with the index already filled in, plus how long it has been since that section last opened. Sign in and confirm.",
  },
];

const CMDS = [
  {
    name: "/snipe",
    desc: "Add a section to your watch list by index number.",
    img: "/screenshots/snipe.png",
    alt: "Discord embed confirming a snipe was set for Principles of Programming Languages Section 04",
  },
  {
    name: "/check",
    desc: "See every section you are currently watching.",
    img: "/screenshots/check.png",
    alt: "Discord embed listing all currently sniped classes with index numbers and section titles",
  },
  {
    name: "/remove",
    desc: "Drop a section once you no longer need it.",
    img: "/screenshots/remove.png",
    alt: "Discord embed confirming a section was removed from the watch list",
  },
];

export default function Flow() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <div className="eyebrow">How it works</div>
        <h2 className="section-title">Four steps, one of them yours</h2>
        <p className="section-lede">
          Registration itself still happens on WebReg with your NetID. RU SnipeZ
          handles everything up to the moment you click confirm.
        </p>

        <div className="flow">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <div className="step-n">{s.n}</div>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>

        <div className="cmds">
          {CMDS.map((c) => (
            <div className="reticle cmd" key={c.name}>
              <div className="cmd-row">
                <span className="cmd-name">{c.name}</span>
                <span className="cmd-count">
                  {(USAGE.get(c.name) ?? 0).toLocaleString()} runs
                </span>
              </div>
              <p className="cmd-desc">{c.desc}</p>
              <img src={c.img} alt={c.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
