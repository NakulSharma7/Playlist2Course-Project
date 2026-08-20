export default function HowItWorks() {
  return (
    <section className="section" id="how-it-works" data-od-id="how-it-works-section">
      <div className="shell">
        <div className="section-header">
          <p className="eyebrow">01 / The flow</p>
          <div>
            <h2 className="display" data-od-id="how-it-works-heading">
              From playlist to course in <em>three</em> steps<span className="dot">.</span>
            </h2>
            <p className="section-intro">
              One simple input gives your learning a useful shape—without adding another system to manage.
            </p>
          </div>
        </div>
        <div className="steps">
          <article className="step" data-od-id="step-card-paste">
            <span className="step-no">01 — PASTE</span>
            <svg className="step-icon" viewBox="0 0 38 38" fill="none">
              <rect x="4" y="7" width="30" height="24" stroke="currentColor" />
              <path d="M11 15h16M11 21h12" stroke="currentColor" />
            </svg>
            <h3>Paste</h3>
            <p>Paste any supported educational playlist URL.</p>
          </article>
          <article className="step" data-od-id="step-card-process">
            <span className="step-no">02 — PROCESS</span>
            <svg className="step-icon" viewBox="0 0 38 38" fill="none">
              <circle cx="19" cy="19" r="14" stroke="currentColor" />
              <path d="M19 11v8l6 4" stroke="currentColor" />
            </svg>
            <h3>Process</h3>
            <p>Playlist2Course analyzes and organizes the playlist content.</p>
          </article>
          <article className="step" data-od-id="step-card-learn">
            <span className="step-no">03 — LEARN</span>
            <svg className="step-icon" viewBox="0 0 38 38" fill="none">
              <path d="M6 8h11c3 0 5 2 5 5v17c0-3-2-5-5-5H6V8Z" stroke="currentColor" />
              <path d="M32 8H21c-3 0-5 2-5 5v17c0-3 2-5 5-5h11V8Z" stroke="currentColor" />
            </svg>
            <h3>Learn</h3>
            <p>Get a structured course with modules and progress tracking.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
