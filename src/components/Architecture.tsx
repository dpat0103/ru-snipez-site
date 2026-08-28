import Diagram from "./Diagram";

const NOTES = [
  {
    h: "One request per second, regardless of how many students are watching",
    p: (
      <>
        The naive version of this checks each watched section individually,
        which means request volume climbs with every user and falls over well
        before 500 of them. Instead the bot pulls the entire set of open indexes
        in a single call, then intersects that set against each watch list in
        memory. Network cost is fixed at one request per second whether one
        student is watching or a thousand. The 501st user adds a set operation,
        not a request.
      </>
    ),
  },
  {
    h: "There is no push, so you poll",
    p: (
      <>
        Rutgers exposes section status as a read-only endpoint with no
        subscriptions and no webhooks. The only way to know a seat opened is to
        have asked a moment earlier. The bot polls the Schedule of Classes
        continuously and diffs the result against the previous pass, which turns
        the whole problem into keeping that loop tight and never letting it
        silently die.
      </>
    ),
  },
  {
    h: "The API has no memory, so the bot grew one",
    p: (
      <>
        Rutgers reports whether a section is open right now and nothing else. A
        student deciding whether to keep waiting wants the thing the API cannot
        answer: has this section ever opened before, and how recently.{" "}
        <code>last_opened.py</code> records every open and close transition it
        observes, which turned a notification service into a dataset that does
        not otherwise exist.
      </>
    ),
  },
  {
    h: "Course data drifts every semester",
    p: (
      <>
        Index numbers are reassigned each term, so hardcoding the catalog would
        break the bot roughly twice a year. Instead{" "}
        <code>course_info_generation.py</code> rebuilds it from the Schedule of
        Classes with Selenium and BeautifulSoup, so a new semester is a script
        run rather than a rewrite.
      </>
    ),
  },
  {
    h: "Known limits",
    p: (
      <>
        Watch lists persist as JSON on a single instance, which is fine at this
        scale but would need a real database and locking before it grew much
        further. The bot can prove a notification was delivered, never that the
        student got the seat, because registration happens on WebReg outside the
        system. Every number on this page respects that distinction.
      </>
    ),
  },
];

const STACK = [
  ["Language", "Python 3.10+"],
  ["Bot framework", "discord.py 2.x"],
  ["Catalog scraping", "BeautifulSoup4 · Selenium"],
  ["Persistence", "JSON, per Discord user ID"],
  ["Hosting", "AWS EC2"],
  ["Uptime", "Continuous since Dec 2023"],
];

export default function Architecture() {
  return (
    <section className="section" id="build">
      <div className="wrap">
        <div className="eyebrow">Engineering notes</div>
        <h2 className="section-title">The parts that were hard</h2>
        <p className="section-lede">
          Most of the work in this project was not the Discord integration. It
          was everything the Rutgers API declines to do.
        </p>

        <figure className="reticle diagram">
          <Diagram />
          <figcaption>
            Two lanes. The loop on top runs every second. The data layer
            underneath is rebuilt once a semester and is what lets a bare index
            number mean anything.
          </figcaption>
        </figure>

        <div className="arch">
          <div>
            {NOTES.map((n) => (
              <div className="arch-item" key={n.h}>
                <h3>{n.h}</h3>
                <p>{n.p}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="reticle stack">
              <h3>Stack</h3>
              <ul>
                {STACK.map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </li>
                ))}
              </ul>
            </div>

            <div className="privacy">
              <b>On the data shown here</b>
              Every figure on this page is a total or an average computed from
              the bot's own logs. Nothing user-identifiable leaves the server.
              Discord IDs, watch lists, and per-student activity are never
              published, and no NetID or Rutgers credential ever touches the
              system.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
