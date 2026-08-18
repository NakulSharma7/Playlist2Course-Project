export default function Cta() {
  return (
    <section className="cta-section" data-od-id="final-cta-section">
      <div className="shell cta-grid">
        <div>
          <p className="eyebrow">Your saved time starts here</p>
          <h2 className="display" data-od-id="final-cta-heading">
            Stop searching. Start <em>learning</em><span className="dot">.</span>
          </h2>
          <p style={{ maxWidth: '520px', margin: '22px 0 0', color: 'oklch(0.97 0.009 88 / .68)', lineHeight: 1.6 }}>
            Turn the playlists you already watch into courses you can actually finish.
          </p>
        </div>
        <a href="#playlist" className="button" data-od-id="final-cta-button">
          Create your first course <span>↗</span>
        </a>
      </div>
    </section>
  );
}
