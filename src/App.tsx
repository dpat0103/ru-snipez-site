import Hero from "./components/Hero";
import StatBand from "./components/StatBand";
import Analytics from "./components/Analytics";
import Flow from "./components/Flow";
import Architecture from "./components/Architecture";
import CourseApi from "./components/CourseApi";
import About from "./components/About";
import stats from "./data/stats.json";
import profile from "./data/profile.json";

/* Walks the stats file for anything still marked as placeholder. The banner
   only clears once build_stats.py has written real values, which makes it
   impossible to publish invented numbers without noticing. */

export default function App() {
  return (
    <>
      <nav className="nav">
        <a className="nav-brand" href="#top">
          <img src="/logo.png" alt="" />
          <span>RU SnipeZ</span>
        </a>
        <div className="nav-links">
          <a href="#numbers">Numbers</a>
          <a href="#data">Data</a>
          <a href="#how">How it works</a>
          <a href="#build">Engineering</a>
          <a href="#about">About</a>
          <a href={profile.repos.bot.value}>GitHub</a>
        </div>
      </nav>

      <main id="top">
        <Hero />
        <StatBand />
        <Analytics />
        <Flow />
        <Architecture />
        <CourseApi />
        <About />
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-top">
            <img src="/logo.png" alt="" />
            <div>
              <div
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--paper)",
                  lineHeight: 1,
                }}
              >
                RU SnipeZ
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.719rem",
                  letterSpacing: "0.08em",
                  marginTop: "0.35rem",
                }}
              >
                Built for Rutgers students, by a Rutgers student
              </div>
            </div>
            <div className="foot-links">
              <a href={profile.repos.bot.value}>GitHub</a>
              <a href="#about">About</a>
            </div>
          </div>
          <p className="disclaimer">
            RU SnipeZ is an independent project and is not affiliated with,
            endorsed by, or officially connected to Rutgers University. It does
            not register you for courses and never handles your NetID. Use it in
            accordance with Rutgers academic policy.
          </p>
          <p className="disclaimer" style={{ marginTop: "0.75rem" }}>
            Statistics on this page cover {stats.generatedOn} and reflect data
            through {stats.dataThrough}.
          </p>
        </div>
      </footer>
    </>
  );
}
