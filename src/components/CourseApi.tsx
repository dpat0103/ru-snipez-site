import profile from "../data/profile.json";

/*
  Renders nothing until profile.repos.api.value is filled in and
  profile.api.enabled is true. Edit the copy below so it describes what your
  API actually returns. Do not ship a claim a reviewer cannot click through to.
*/
export default function CourseApi() {
  const url = profile.repos.api.value;
  if (!profile.api.enabled || !url) return null;

  return (
    <section className="section" id="api">
      <div className="wrap">
        <div className="eyebrow">Spun out of the bot</div>
        <h2 className="section-title">A course API Rutgers doesn't offer</h2>
        <p className="section-lede">
          The open-sections feed returns bare five-digit index numbers and
          nothing else. No title, no section, no course code. Resolving those
          numbers into something a human can read was a prerequisite for the
          bot, so that resolution layer became its own service, and it is now
          available to other developers building against the Schedule of
          Classes.
        </p>

        <div className="api-grid">
          <div className="reticle card">
            <div className="card-title">What Rutgers returns</div>
            <pre className="code">{`[
  "06812",
  "08524",
  "06843"
]`}</pre>
            <div className="card-foot">An index and nothing more.</div>
          </div>

          <div className="reticle card">
            <div className="card-title">What this returns</div>
            <pre className="code">{`{
  "index": "06812",
  "title": "Principles of
     Programming Languages",
  "courseCode": "01:198:314",
  "section": "04"
}`}</pre>
            <div className="card-foot">
              Built from the catalog ETL, rebuilt every semester.
            </div>
          </div>
        </div>

        <div className="hero-actions" style={{ marginTop: "1.75rem" }}>
          <a className="btn btn-primary" href={url}>
            API source and docs
          </a>
        </div>
      </div>
    </section>
  );
}
