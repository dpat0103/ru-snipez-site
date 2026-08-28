import profile from "../data/profile.json";

export default function About() {
  const resume = profile.resume.value;

  return (
    <section className="section" id="about">
      <div className="wrap">
        <div className="about">
          <div>
            <div className="eyebrow">Who built this</div>
            <h2 className="section-title">{profile.name.value}</h2>
            <div className="about-role">{profile.role.value}</div>
            <p className="about-bio">{profile.bio.value}</p>

            <div className="hero-actions">
              <a className="btn btn-primary" href={`mailto:${profile.email.value}`}>
                Get in touch
              </a>
              {resume && (
                <a className="btn" href={resume}>
                  Resume
                </a>
              )}
              <a className="btn" href={profile.linkedin.value}>
                LinkedIn
              </a>
              <a className="btn" href={profile.github.value}>
                GitHub
              </a>
            </div>
          </div>

          <div className="reticle stack">
            <h3>At a glance</h3>
            <ul>
              <li>
                <span>Built</span>
                <b>December 2023</b>
              </li>
              <li>
                <span>Still running</span>
                <b>Yes</b>
              </li>
              <li>
                <span>Poll interval</span>
                <b>1 second</b>
              </li>
              <li>
                <span>Requests per user</span>
                <b>0</b>
              </li>
              <li>
                <span>Infrastructure</span>
                <b>1 EC2 instance</b>
              </li>
              <li>
                <span>Credentials handled</span>
                <b>None</b>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
